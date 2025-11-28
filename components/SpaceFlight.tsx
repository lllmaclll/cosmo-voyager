import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CelestialBody, Particle, Mission } from '../types';
import { PLANETS, INITIAL_ROCKET_POS } from '../constants';
import Hud from './Hud';
import { Scan } from 'lucide-react';
import { audioService } from '../services/audioService';

interface SpaceFlightProps {
  onScan: (planet: CelestialBody) => void;
  currentMission: Mission | null;
  onExit: () => void;
  onOpenDatabase: () => void;
  isPaused?: boolean;
}

// Custom hook for a throttled interval
const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
};

// Helper to normalize angle to 0-360
const normalizeAngle = (angle: number) => {
    let a = angle % 360;
    if (a < 0) a += 360;
    return a;
};

const SpaceFlight: React.FC<SpaceFlightProps> = ({ onScan, currentMission, onExit, onOpenDatabase, isPaused = false }) => {
  // Low-frequency state for React/HUD updates
  const [hudState, setHudState] = useState({
    velocity: { x: 0, y: 0 },
    rocketPos: { ...INITIAL_ROCKET_POS }, // Initial state only
    nearestPlanet: null as CelestialBody | null,
    distanceToNearest: 99999,
    zoom: 1,
    autopilotTarget: null as CelestialBody | null,
    visitedIds: [] as string[],
    isThrusting: false,
    isWarping: false, // Visual switch
    warpFactor: 0,    // Smooth transition factor 0-1
  });
  
  // High-frequency state managed outside of React
  const particlesRef = useRef<Particle[]>([]);
  const [visibleParticles, setVisibleParticles] = useState<Particle[]>([]);
  
  // Physics Refs for 60fps loop - Clone initial pos to avoid mutation
  const posRef = useRef({ ...INITIAL_ROCKET_POS });
  
  // Velocity is now just a magnitude/speed ref for strict arcade physics
  const speedRef = useRef(0); 
  const rotRef = useRef(0);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const particleIdCounter = useRef(0);
  const zoomRef = useRef(1);
  const autopilotTargetRef = useRef<CelestialBody | null>(null);
  const visitedIdsRef = useRef<Set<string>>(new Set());
  const rafRef = useRef<number>(0); 
  const mounted = useRef(true);
  const frameCountRef = useRef(0);
  const isAutopilotThrustingRef = useRef(false);

  // DOM element refs for direct manipulation
  const worldRef = useRef<HTMLDivElement>(null);
  const rocketRef = useRef<HTMLDivElement>(null);

  // Scan Data Ref
  const scanDataRef = useRef({
      nearestPlanet: null as CelestialBody | null,
      distanceToNearest: 99999
  });
  
  const [visibleBodies, setVisibleBodies] = useState<CelestialBody[]>([]);
  const celestialBodiesRef = useRef<CelestialBody[]>(JSON.parse(JSON.stringify(PLANETS)));

  // Mobile Controls Refs
  const joystickRef = useRef({ active: false, x: 0, y: 0, originX: 0, originY: 0 });
  const [joystickVisual, setJoystickVisual] = useState({ x: 0, y: 0, active: false });

  // Physics constants - REALISTIC + WARP
  const ACCELERATION_MANUAL = 4.0; 
  const ACCELERATION_WARP = 80.0; // Fast acceleration
  const FRICTION = 0.98;           
  const ROTATION_SPEED = 5.0;      
  const SCAN_DISTANCE = 600; 

  // Warp Thresholds & Speed Limits
  // WARP VISUAL begins at 300, transitions fully by 1500
  const WARP_SPEED_THRESHOLD = 400; 
  
  const MANUAL_MAX_SPEED = 600;    // Manual flight limit
  const WARP_MAX_SPEED = 5000;     // Autopilot Light Speed limit

  const handleKeyDown = (e: KeyboardEvent) => { 
      // Do not block keydown if paused, to allow holding keys through transitions
      keysRef.current[e.code] = true; 
      if (!isPaused) audioService.init();
  };
  const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.code] = false; };

  useEffect(() => {
    if (isPaused) {
      // Reset joystick visual only
      joystickRef.current.active = false;
      setJoystickVisual({ x: 0, y: 0, active: false });
      
      // Stop engine sound
      audioService.setEngineThrust(false);
      audioService.setWarpSound(false);
      isAutopilotThrustingRef.current = false;
    }
  }, [isPaused]);

  const handleTouchStart = (e: React.TouchEvent) => {
      if (isPaused) return;
      audioService.init();
      const t = e.changedTouches[0];
      const x = t.clientX;
      const y = t.clientY;
      if (x < window.innerWidth / 2 && y > window.innerHeight / 2) {
          joystickRef.current = { active: true, x: 0, y: 0, originX: x, originY: y };
          setJoystickVisual({ x: 0, y: 0, active: true });
      }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      if (isPaused || !joystickRef.current.active) return;
      const t = e.changedTouches[0];
      const maxDist = 50;
      const dx = t.clientX - joystickRef.current.originX;
      const dy = t.clientY - joystickRef.current.originY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const clampedDist = Math.min(dist, maxDist);
      const angle = Math.atan2(dy, dx);
      const finalX = Math.cos(angle) * clampedDist;
      const finalY = Math.sin(angle) * clampedDist;
      joystickRef.current.x = finalX / maxDist; 
      joystickRef.current.y = finalY / maxDist; 
      setJoystickVisual({ x: finalX, y: finalY, active: true });
  };

  const handleTouchEnd = () => {
       joystickRef.current.active = false;
       joystickRef.current.x = 0;
       joystickRef.current.y = 0;
       setJoystickVisual({ x: 0, y: 0, active: false });
  };

  const handleZoomIn = () => { zoomRef.current = Math.min(zoomRef.current * 1.2, 3.0); };
  const handleZoomOut = () => { zoomRef.current = Math.max(zoomRef.current / 1.2, 0.05); }; 
  const handleZoomSet = (val: number) => { zoomRef.current = Math.max(0.05, Math.min(3.0, val)); };
  
  const handleNavigate = (target: CelestialBody) => {
      if (autopilotTargetRef.current?.id === target.id) return;
      autopilotTargetRef.current = target;
  };

  const handleAbortAutopilot = () => {
      if (!autopilotTargetRef.current) return;
      autopilotTargetRef.current = null;
      isAutopilotThrustingRef.current = false;
      // If we were warping, slow down to manageable speed for manual control
      if (speedRef.current > MANUAL_MAX_SPEED) speedRef.current = MANUAL_MAX_SPEED;
  };

  const handleScanAction = (planet: CelestialBody) => {
      audioService.playScanSound();
      visitedIdsRef.current.add(planet.id); 
      onScan(planet);
  };

  const spawnParticles = (x: number, y: number, angle: number, warpFactor: number) => {
     // Particle angle is strictly opposite to movement (Inverse of angle)
     const rad = angle * (Math.PI / 180);
     const movementVx = Math.cos(rad);
     const movementVy = Math.sin(rad);

     // Warp Streaks (Lines that stream past)
     if (warpFactor > 0.05) {
         const spread = 200 + (warpFactor * 400); // Wider spread at high speeds
         
         // Spawn ahead of the rocket if warping to create "passing stars" effect
         const px = x + (Math.random() - 0.5) * spread;
         const py = y + (Math.random() - 0.5) * spread;
         
         const streakSpeed = 20 + (warpFactor * 60); 
         
         // Strictly opposite to rocket direction
         const vx = -movementVx * streakSpeed;
         const vy = -movementVy * streakSpeed;
         
         particlesRef.current.push({
             id: particleIdCounter.current++, 
             x: px, 
             y: py, 
             vx, vy, 
             life: 0.1 + (Math.random() * 0.3), 
             color: Math.random() > 0.7 ? '#a5f3fc' : '#ffffff', // Cyan/White streaks
             size: Math.random() * 2 + 1
         });
     } else {
         // Standard Engine Exhaust (Behind rocket)
         const offset = { x: -movementVx * 40, y: -movementVy * 40 };
         
         const speed = Math.random() * 5 + 5;
         const spread = (Math.random() - 0.5) * 0.4;
         
         // Exhaust goes opposite to rotation + spread
         const exhaustRad = rad + Math.PI + spread;
         
         const vx = Math.cos(exhaustRad) * speed;
         const vy = Math.sin(exhaustRad) * speed;
         
         particlesRef.current.push({id: particleIdCounter.current++, x: x + offset.x, y: y + offset.y, vx, vy, life: 0.5, color: Math.random() > 0.4 ? '#f59e0b' : '#ef4444', size: Math.random() * 6 + 4});
     }
  };

  const gameLoop = useCallback(() => {
    if (!mounted.current) return;
    frameCountRef.current++;

    if (!isPaused) {
        let thrusting = false;
        let currentTarget = autopilotTargetRef.current;
        let isManualInput = false;

        const keys = keysRef.current;
        const joy = joystickRef.current;
        isManualInput = keys['ArrowLeft'] || keys['KeyA'] || keys['ArrowRight'] || keys['KeyD'] || keys['ArrowUp'] || keys['KeyW'] || joy.active;

        if (isManualInput && currentTarget) {
            handleAbortAutopilot();
            currentTarget = null;
        }

        if (currentTarget) {
            // --- AUTOPILOT LOGIC ---
            const dx = currentTarget.position.x - posRef.current.x;
            const dy = currentTarget.position.y - posRef.current.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            // 1. Calculate desired angle
            const angleToTarget = Math.atan2(dy, dx);
            const targetDeg = normalizeAngle(angleToTarget * 180 / Math.PI);
            
            // Smooth rotation towards target
            rotRef.current = targetDeg;

            // 2. PARKING LOGIC (Smooth Linear Damping)
            // If distance is extremely small, snap and stop.
            if (dist < 5) {
                posRef.current.x = currentTarget.position.x;
                posRef.current.y = currentTarget.position.y;
                speedRef.current = 0;
                autopilotTargetRef.current = null;
                isAutopilotThrustingRef.current = false;
                thrusting = false;
            } else {
                thrusting = true;
                isAutopilotThrustingRef.current = true;
                
                // 3. BRAKING CURVE
                // Start braking phase earlier (1000px out)
                const BRAKING_RADIUS = 1500;
                const SLOW_RADIUS = 300;
                
                let targetSpeed;
                
                if (dist > BRAKING_RADIUS) {
                    // Far away: Full Warp Speed
                    targetSpeed = WARP_MAX_SPEED;
                } else if (dist > SLOW_RADIUS) {
                    // Mid range: Physics based deceleration (v^2 = 2as)
                    // Lower 'deceleration' constant = softer braking
                    const deceleration = 15; 
                    targetSpeed = Math.sqrt(2 * deceleration * dist);
                } else {
                    // Close range: Linear "Creep" for smooth parking
                    // Speed becomes proportional to distance directly
                    // This ensures we ease in gently instead of stopping hard
                    targetSpeed = dist * 0.8; 
                }

                // Smoothly adjust current speed towards target speed
                if (speedRef.current < targetSpeed) {
                    speedRef.current += ACCELERATION_WARP; // Accelerate
                } else {
                    // Decelerate (apply brakes)
                    // If in slow radius, brake harder to match the curve
                    const brakeForce = dist < SLOW_RADIUS ? 0.9 : 0.98;
                    speedRef.current = Math.min(speedRef.current * brakeForce, targetSpeed);
                }

                // 4. CRITICAL: NEVER MOVE MORE THAN DISTANCE REMAINING
                // This prevents the "bounce" / overshoot
                if (speedRef.current > dist) {
                    speedRef.current = dist;
                }
            }
        } else {
            // --- MANUAL CONTROL ---
            isAutopilotThrustingRef.current = false;
            
            // Rotation
            if (keys['ArrowLeft'] || keys['KeyA']) { rotRef.current -= ROTATION_SPEED; }
            if (keys['ArrowRight'] || keys['KeyD']) { rotRef.current += ROTATION_SPEED; }
            if (joy.active && Math.abs(joy.x) > 0.2) { rotRef.current += joy.x * ROTATION_SPEED; }
            rotRef.current = normalizeAngle(rotRef.current);
            
            // Thrust
            if (keys['ArrowUp'] || keys['KeyW'] || (joy.active && joy.y < -0.3)) {
                thrusting = true;
                if (speedRef.current < MANUAL_MAX_SPEED) {
                    speedRef.current += ACCELERATION_MANUAL;
                }
            }
        }
    
        // Physics Calculation
        if (!thrusting) {
            speedRef.current *= FRICTION;
            if (speedRef.current < 0.1) speedRef.current = 0;
        } else {
            // Add dynamic drag at high speeds to prevent infinite sliding for manual control
            if (!currentTarget && speedRef.current > 400) {
                speedRef.current *= 0.98; // High speed drag
            }
        }
        
        const rad = rotRef.current * (Math.PI / 180);
        const vx = Math.cos(rad) * speedRef.current;
        const vy = Math.sin(rad) * speedRef.current;
        
        posRef.current.x += vx;
        posRef.current.y += vy;
        
        // Calculate Warp Intensity (0 to 1) for visuals
        const warpRatio = Math.max(0, Math.min(1, (speedRef.current - WARP_SPEED_THRESHOLD) / (2000 - WARP_SPEED_THRESHOLD)));
        const isWarping = speedRef.current > WARP_SPEED_THRESHOLD;

        // Audio
        audioService.setEngineThrust(thrusting && warpRatio < 0.5); 
        audioService.setWarpSound(isWarping);

        // Particle Spawning
        if (thrusting || isWarping) {
            // Spawn more particles as warp increases
            const density = isWarping ? Math.ceil(warpRatio * 5) + 1 : 1;
            for(let i=0; i<density; i++) {
                spawnParticles(posRef.current.x, posRef.current.y, rotRef.current, warpRatio);
            }
        }
        
        // Celestial Mechanics
        celestialBodiesRef.current.forEach(body => {
            if ((body.type === 'ASTEROID' || body.type === 'COMET') && body.angle !== undefined && body.distanceFromSun > 0) {
                body.angle += body.orbitSpeed;
                if (body.type === 'COMET') {
                    const a = body.distanceFromSun, b = body.distanceFromSun * 0.4; 
                    body.position.x = Math.cos(body.angle) * a;
                    body.position.y = Math.sin(body.angle) * b;
                } else {
                    body.position.x = Math.cos(body.angle) * body.distanceFromSun;
                    body.position.y = Math.sin(body.angle) * body.distanceFromSun;
                }
            }
        });

        // Update Particles
        particlesRef.current = particlesRef.current.map(p => ({
            ...p, 
            x: p.x + p.vx, 
            y: p.y + p.vy, 
            life: p.life - (isWarping ? 0.08 : 0.04)
        })).filter(p => p.life > 0);
        
        const maxParticles = isWarping ? 200 : 100;
        if (particlesRef.current.length > maxParticles) particlesRef.current.splice(0, particlesRef.current.length - maxParticles);
    } // End isPaused check

    // Collision/Distance Check
    let closest = null, minDist = Infinity;
    const allBodies = celestialBodiesRef.current;
    for (const b of allBodies) {
        if (b.type !== 'ASTEROID') {
            const dx = posRef.current.x - b.position.x;
            const dy = posRef.current.y - b.position.y;
            const dist = Math.sqrt(dx*dx + dy*dy) - b.size;
            if (dist < minDist) {
                minDist = dist;
                closest = b;
            }
        }
    }
    scanDataRef.current = { nearestPlanet: closest, distanceToNearest: Math.max(0, minDist) };
    
    // Calculate current Warp Ratio for rendering
    const warpRatio = Math.max(0, Math.min(1, (speedRef.current - WARP_SPEED_THRESHOLD) / (2000 - WARP_SPEED_THRESHOLD)));

    // DIRECT DOM RENDER
    if (worldRef.current) {
        // Dynamic FOV: Zoom out slightly as speed increases
        const dynamicZoom = zoomRef.current * (1 - (warpRatio * 0.4));
        const offsetX = (window.innerWidth / 2) - (posRef.current.x * dynamicZoom);
        const offsetY = (window.innerHeight / 2) - (posRef.current.y * dynamicZoom);
        worldRef.current.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${dynamicZoom})`;
    }
    if (rocketRef.current) {
        // Rocket Sprite Visual Rotation
        // NOTE: The tail is INSIDE this div, so it rotates with the rocket.
        rocketRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0) translate(-50%, -50%) rotate(${rotRef.current + 90}deg)`;
        
        // Color Shift Logic
        const hueShift = warpRatio * 180; 
        const brightness = 1 + (warpRatio * 1.5);
        const dropShadow = warpRatio * 20;
        
        rocketRef.current.style.filter = `hue-rotate(${hueShift}deg) brightness(${brightness}) drop-shadow(0 0 ${dropShadow}px rgba(0,255,255,${warpRatio}))`;
    }

    rafRef.current = requestAnimationFrame(gameLoop);
  }, [isPaused]); 

  // Low-frequency React State Sync
  useInterval(() => {
    if (!mounted.current || isPaused) return;

    const windowW = window.innerWidth, windowH = window.innerHeight;
    const viewX = posRef.current.x, viewY = posRef.current.y;
    const zoom = zoomRef.current;
    const margin = 2000 / zoom; 
    const left = viewX - (windowW / 2 / zoom) - margin, right = viewX + (windowW / 2 / zoom) + margin;
    const top = viewY - (windowH / 2 / zoom) - margin, bottom = viewY + (windowH / 2 / zoom) + margin;

    setVisibleBodies(celestialBodiesRef.current.filter(b => 
        b.position.x > left && b.position.x < right && b.position.y > top && b.position.y < bottom
    ));
    
    setVisibleParticles([...particlesRef.current]);
    
    const rad = rotRef.current * (Math.PI / 180);
    const hudVel = { x: Math.cos(rad) * speedRef.current, y: Math.sin(rad) * speedRef.current };
    
    const warpRatio = Math.max(0, Math.min(1, (speedRef.current - WARP_SPEED_THRESHOLD) / (2000 - WARP_SPEED_THRESHOLD)));

    setHudState({
        rocketPos: { ...posRef.current },
        velocity: hudVel,
        nearestPlanet: scanDataRef.current.nearestPlanet,
        distanceToNearest: scanDataRef.current.distanceToNearest,
        zoom: zoomRef.current,
        autopilotTarget: autopilotTargetRef.current,
        visitedIds: Array.from(visitedIdsRef.current),
        isThrusting: keysRef.current['ArrowUp'] || keysRef.current['KeyW'] || (joystickRef.current.active && joystickRef.current.y < -0.3) || isAutopilotThrustingRef.current,
        isWarping: speedRef.current > WARP_SPEED_THRESHOLD,
        warpFactor: warpRatio
    });
  }, 30); 

  useEffect(() => {
    mounted.current = true;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    rafRef.current = requestAnimationFrame(gameLoop);
    return () => {
      mounted.current = false;
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(rafRef.current);
    };
  }, [gameLoop]);

  useEffect(() => {
    const handleScanKey = (e: KeyboardEvent) => {
        if (e.code === 'KeyE' && !isPaused) {
            const { nearestPlanet, distanceToNearest } = scanDataRef.current;
            if (nearestPlanet && distanceToNearest < SCAN_DISTANCE) {
                handleScanAction(nearestPlanet);
            }
        }
    };
    window.addEventListener('keydown', handleScanKey);
    return () => window.removeEventListener('keydown', handleScanKey);
  }, [onScan, isPaused]);
  
  return (
    <div 
        className="relative w-full h-screen overflow-hidden bg-transparent select-none cursor-crosshair touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
    >
       <Hud 
         velocity={hudState.velocity} 
         position={hudState.rocketPos} 
         nearestPlanet={hudState.nearestPlanet} 
         distanceToNearest={hudState.distanceToNearest}
         zoom={hudState.zoom}
         autopilotTarget={hudState.autopilotTarget}
         visitedIds={hudState.visitedIds}
         currentMission={currentMission}
         onZoomIn={handleZoomIn}
         onZoomOut={handleZoomOut}
         onZoomSet={handleZoomSet}
         onNavigate={handleNavigate}
         onAbortAutopilot={handleAbortAutopilot}
         onExit={onExit}
         onOpenDatabase={onOpenDatabase}
       />

       {/* Mobile Joystick Controls Overlay */}
       <div className={`absolute bottom-6 left-6 z-50 pointer-events-none md:hidden transition-opacity ${isPaused ? 'opacity-0' : 'opacity-70'}`}>
           <div className="w-32 h-32 rounded-full border-2 border-cyan-500/50 bg-slate-900/50 relative">
                <div 
                    className="w-12 h-12 rounded-full bg-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_cyan]"
                    style={{ transform: `translate(calc(-50% + ${joystickVisual.x}px), calc(-50% + ${joystickVisual.y}px))` }}
                ></div>
           </div>
           <div className="text-center text-cyan-500/80 text-[10px] mt-2 font-mono">STEER & THRUST</div>
       </div>

       {/* Mobile Scan Button Overlay */}
       {hudState.nearestPlanet && hudState.distanceToNearest < SCAN_DISTANCE && !isPaused && (
          <div className="absolute bottom-20 right-6 z-50 md:hidden animate-bounce">
              <button 
                onClick={() => handleScanAction(hudState.nearestPlanet!)}
                className="w-24 h-24 rounded-full bg-cyan-500/20 border-2 border-cyan-400 backdrop-blur-md flex flex-col items-center justify-center active:scale-95 transition-all shadow-[0_0_20px_rgba(34,211,238,0.5)]"
              >
                 <Scan size={32} className="text-cyan-100" />
                 <span className="text-cyan-100 font-bold text-xs mt-1">SCAN</span>
              </button>
          </div>
       )}

       {/* Autopilot Status */}
       {hudState.autopilotTarget && (
           <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                <div className={`border px-6 py-2 rounded-full backdrop-blur flex items-center gap-3 shadow-lg transition-all duration-300 ${hudState.isWarping ? 'bg-cyan-900/80 border-cyan-400 shadow-[0_0_30px_cyan]' : 'bg-purple-900/80 border-purple-500/50'}`}>
                    {hudState.isWarping ? (
                         <>
                            <div className="w-3 h-3 bg-cyan-300 rounded-full animate-ping"></div>
                            <span className="font-sci-fi text-cyan-100 tracking-widest text-sm font-bold animate-pulse">WARP SPEED ENGAGED</span>
                         </>
                    ) : (
                         <>
                            <div className="w-3 h-3 bg-purple-400 rounded-full animate-ping"></div>
                            <span className="font-sci-fi text-purple-100 tracking-widest text-sm">AUTOPILOT ENGAGED: {hudState.autopilotTarget.thaiName}</span>
                         </>
                    )}
                </div>
           </div>
       )}

       {/* PC Scan Prompt */}
       {hudState.distanceToNearest < SCAN_DISTANCE && hudState.nearestPlanet && !isPaused && (
           <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-30 animate-bounce hidden md:block">
                <div className="bg-cyan-950/90 backdrop-blur-xl border border-cyan-400 text-cyan-50 px-8 py-4 rounded-xl font-bold shadow-[0_0_30px_rgba(34,211,238,0.6)] flex flex-col items-center group cursor-pointer hover:bg-cyan-900 transition-colors" onClick={() => handleScanAction(hudState.nearestPlanet!)}>
                    <span className="text-xs uppercase tracking-widest text-cyan-300 mb-1 group-hover:text-white">Analysis Ready</span>
                    <span className="text-xl font-sci-fi tracking-wider">PRESS 'E' TO SCAN</span>
                </div>
           </div>
       )}

       {/* World Container */}
       <div 
         ref={worldRef}
         className="absolute top-0 left-0 w-px h-px will-change-transform"
       >
            {/* Grid */}
            <div 
                className="absolute opacity-[0.1]"
                style={{ 
                    width: '80000px', height: '80000px', 
                    top: '-40000px', left: '-40000px',
                    backgroundImage: 'linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)',
                    backgroundSize: '200px 200px'
                }} 
            />
            
            {/* Render items inside the world */}
            {visibleBodies.map(body => (
                <div 
                    key={body.id}
                    className="absolute"
                    style={{
                        transform: `translate(${body.position.x}px, ${body.position.y}px)`,
                        width: 0,
                        height: 0,
                        zIndex: body.type === 'ASTEROID' ? 5 : 10
                    }}
                >
                    {/* Fixed Scanning Ring */}
                    {hudState.nearestPlanet?.id === body.id && hudState.distanceToNearest < SCAN_DISTANCE && (
                        <div className="absolute top-0 left-0 pointer-events-none transform -translate-x-1/2 -translate-y-1/2">
                            <div className="animate-[spin_10s_linear_infinite] border border-cyan-400/30 rounded-full" 
                                 style={{width: body.size * 3, height: body.size * 3, borderStyle: 'dashed'}} 
                            />
                        </div>
                    )}
                    
                    {/* MISSION TARGET LABEL */}
                    {currentMission?.targetBodyId === body.id && (
                        <div 
                            className="absolute z-30 flex flex-col items-center pointer-events-none w-max"
                            style={{ 
                                left: '50%',
                                top: '50%', 
                                transform: `translate(-50%, calc(-100% - ${body.type === 'STAR' || body.type === 'BLACK_HOLE' ? body.size * 3 + 20 : body.size + 20}px))` 
                            }}
                        >
                            <div className="bg-yellow-500/90 backdrop-blur text-black font-bold text-[10px] px-2 py-0.5 rounded shadow-lg whitespace-nowrap border border-yellow-300">
                                TARGET ({Math.round(Math.sqrt((posRef.current.x - body.position.x)**2 + (posRef.current.y - body.position.y)**2))} km)
                            </div>
                            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-yellow-500"></div>
                            <div className="w-[1px] bg-yellow-500/50 h-4 mx-auto"></div>
                        </div>
                    )}
                    
                    {/* QUASAR RENDERING (Moved out of generic wrapper for strict centering) */}
                    {body.type === 'QUASAR' && (
                        <div className="absolute top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                            {/* Container for alignment */}
                            <div className="relative flex items-center justify-center" style={{ width: body.size * 4, height: body.size * 4 }}>
                                 {/* Jets */}
                                 <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-[3000px] bg-white opacity-80 blur-sm rotate-45" style={{boxShadow: '0 0 20px white'}} />
                                 <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[3000px] h-[2px] bg-white opacity-80 blur-sm rotate-45" style={{boxShadow: '0 0 20px white'}} />
                                 
                                 {/* Core */}
                                 <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_100px_white] animate-pulse z-20" style={{width: body.size * 0.8, height: body.size * 0.8}} />
                                 
                                 {/* Accretion Disk */}
                                 <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                                      style={{
                                          width: body.size * 2.5, 
                                          height: body.size * 2.5
                                      }}
                                 >
                                     <div className="w-full h-full rounded-full border-[20px] border-orange-500/80 blur-md animate-[spin_10s_linear_infinite]" 
                                          style={{boxSizing: 'border-box'}}
                                     />
                                 </div>
                            </div>
                        </div>
                    )}

                    {/* Body Visual Wrapper */}
                    <div className="absolute top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                      
                      {body.type === 'STAR' && (
                          <div className="absolute rounded-full pointer-events-none" 
                               style={{
                                   width: body.size * 6, 
                                   height: body.size * 6,
                                   // DYNAMIC STAR GLOW based on color
                                   background: `radial-gradient(circle, ${body.color}33 0%, ${body.color}11 40%, transparent 70%)`,
                                   zIndex: -1
                               }}
                          />
                      )}
                      
                      {/* SUPERNOVA RENDERING */}
                      {body.type === 'SUPERNOVA' && (
                          <div className="absolute pointer-events-none" style={{width: body.size*4, height: body.size*4}}>
                                <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full animate-pulse"></div>
                                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,200,0,0.5)_0%,transparent_70%)]"></div>
                                {/* Debris ring */}
                                <div className="absolute inset-0 border-4 border-dashed border-red-500/30 rounded-full animate-[spin_20s_linear_infinite]"></div>
                                <div className="absolute inset-4 border-2 border-dotted border-orange-400/40 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                          </div>
                      )}

                      {/* NEBULA RENDERING */}
                      {body.type === 'NEBULA' && (
                        <>
                        {body.id === 'pillar_of_creation' ? (
                            // PILLARS OF CREATION - UPDATED CENTER
                            // Used top-1/2 left-1/2 inside wrapper to ensure center alignment with body coordinate
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" 
                                style={{ width: body.size * 2, height: body.size * 2, transform: 'translate(-50%, -50%) rotate(-25deg)', filter: 'blur(3px)' }}>
                                {/* Overall Glow */}
                                <div className="absolute inset-0 bg-amber-900/30 blur-3xl rounded-full"></div>
                                
                                {/* Background Gas */}
                                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-sky-900/20 to-transparent blur-xl"></div>

                                {/* Pillar 1 (Largest - Left) */}
                                <div className="absolute bottom-[5%] left-[25%] w-[18%] h-[85%] origin-bottom" style={{transform: 'rotate(-5deg)'}}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-amber-900 to-amber-600 rounded-t-3xl opacity-90 blur-[2px]"></div>
                                    <div className="absolute top-0 w-full h-1/4 bg-amber-500/50 blur-md rounded-full"></div>
                                    <div className="absolute -top-2 left-1/2 w-1 h-1 bg-white shadow-[0_0_5px_white] animate-pulse"></div>
                                </div>
                                
                                {/* Pillar 2 (Middle) */}
                                <div className="absolute bottom-[-2%] left-[45%] w-[14%] h-[65%] origin-bottom" style={{transform: 'rotate(2deg)'}}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-amber-900 to-amber-600 rounded-t-3xl opacity-90 blur-[2px]"></div>
                                    <div className="absolute top-0 w-full h-1/4 bg-amber-500/50 blur-md rounded-full"></div>
                                    <div className="absolute -top-1 left-1/3 w-1 h-1 bg-white shadow-[0_0_5px_white] animate-pulse" style={{animationDelay: '1s'}}></div>
                                </div>

                                {/* Pillar 3 (Right) */}
                                <div className="absolute bottom-[-5%] left-[62%] w-[10%] h-[45%] origin-bottom" style={{transform: 'rotate(8deg)'}}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-amber-900 to-amber-600 rounded-t-3xl opacity-90 blur-[2px]"></div>
                                    <div className="absolute top-0 w-full h-1/4 bg-amber-500/50 blur-md rounded-full"></div>
                                </div>

                                {/* Scattered Star Births */}
                                <div className="absolute top-[20%] left-[30%] w-1 h-1 bg-cyan-200 shadow-[0_0_8px_cyan] animate-ping"></div>
                                <div className="absolute top-[30%] left-[50%] w-[2px] h-[2px] bg-white shadow-[0_0_4px_white]"></div>
                            </div>
                        ) : (
                            // GENERIC NEBULA
                            <div className={`absolute pointer-events-none`}
                                style={{
                                    width: body.size * 3, 
                                    height: body.size * 3,
                                    borderRadius: '50%', // Ensure roundness
                                    background: `radial-gradient(circle at center, ${body.color} 0%, ${body.color}00 70%)`, // Fade to transparent
                                    filter: 'blur(30px)', // Softer blur
                                    transform: 'rotate(0deg)',
                                    opacity: 0.6,
                                    zIndex: -1
                                }}>
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(255,255,255,0.1),transparent)]" />
                            </div>
                        )}
                        </>
                      )}

                      <div style={{width: body.size * 2, height: body.size * 2, position: 'relative'}}>
                        {/* SATURN RINGS */}
                        {body.id === 'saturn' && (
                            <>
                                <div 
                                    className="absolute top-1/2 left-1/2 pointer-events-none rounded-[50%]" 
                                    style={{
                                        width: body.size * 4.5, 
                                        height: body.size * 1.2, 
                                        background: 'radial-gradient(transparent 55%, rgba(180, 160, 120, 0.6) 56%, rgba(200, 180, 140, 0.8) 70%, rgba(180, 160, 120, 0.6) 80%, transparent 80%)', 
                                        transform: 'translate(-50%, -50%) rotate(25deg)',
                                        zIndex: -1
                                    }}
                                />
                            </>
                        )}
                        
                        {body.type === 'ASTEROID' && <div className="rounded-full bg-slate-600 opacity-60 w-full h-full" style={{width: body.size, height: body.size, boxShadow: '1px 1px 0px rgba(0,0,0,0.5)'}}/>}
                        {body.type === 'COMET' && (
                            <div className="relative w-full h-full flex items-center justify-center">
                                {/* Tail */}
                                <div 
                                    className="absolute left-1/2 top-1/2 w-64 h-12 origin-left pointer-events-none"
                                    style={{
                                        transform: `translateY(-50%) rotate(${Math.atan2(body.position.y, body.position.x) + Math.PI}rad)`, 
                                        background: 'linear-gradient(90deg, rgba(165, 243, 252, 0.4) 0%, rgba(34, 211, 238, 0.1) 50%, transparent 100%)', 
                                        filter: 'blur(8px)', 
                                        zIndex: -1
                                    }}
                                />
                                <div className="absolute rounded-full bg-cyan-400 blur-md opacity-50 animate-pulse" style={{ width: body.size * 3, height: body.size * 3 }} />
                                <div className="rounded-full bg-white shadow-[0_0_25px_cyan] relative z-10" style={{ width: body.size, height: body.size }} />
                            </div>
                        )}
                        {body.type === 'BLACK_HOLE' && <div className="absolute rounded-full bg-black" style={{width: body.size * 2, height: body.size*2, boxShadow: '0 0 20px #f59e0b, inset 0 0 40px #000'}}/>}
                        {body.type === 'GALAXY' && <div className="relative w-full h-full rounded-full animate-[spin_60s_linear_infinite]" style={{background: `radial-gradient(ellipse at center, #fff 0%, ${body.color} 30%, transparent 70%)`, filter: 'blur(3px)', opacity: 0.9}}/>}
                        {['STAR', 'PLANET', 'MOON', 'DWARF_PLANET'].includes(body.type) && (
                            <div className="w-full h-full rounded-full" 
                                 style={{
                                     background: body.gradient || body.color, 
                                     boxShadow: body.type === 'STAR' ? 'none' : `inset -8px -8px 20px rgba(0,0,0,0.8), inset 4px 4px 10px rgba(255,255,255,0.2)`
                                 }}
                            />
                        )}
                        
                        {/* SATURN FRONT RING */}
                        {body.id === 'saturn' && (
                             <div 
                                 className="absolute top-1/2 left-1/2 pointer-events-none rounded-[50%]" 
                                 style={{
                                     width: body.size * 4.5, 
                                     height: body.size * 1.2, 
                                     background: 'radial-gradient(transparent 55%, rgba(180, 160, 120, 0.6) 56%, rgba(200, 180, 140, 0.8) 70%, rgba(180, 160, 120, 0.6) 80%, transparent 80%)', 
                                     transform: 'translate(-50%, -50%) rotate(25deg)',
                                     zIndex: 5,
                                     clipPath: 'polygon(0% 50%, 100% 50%, 100% 100%, 0% 100%)'
                                 }}
                             />
                        )}
                      </div>
                    </div>
                </div>
            ))}

            {visibleParticles.map(p => {
                // Warp streak visuals
                const length = p.size * (hudState.warpFactor > 0.1 ? (hudState.warpFactor * 40 + 5) : 1);
                
                return (
                    <div key={p.id} className="absolute rounded-full" style={{
                        transform: `translate(${p.x}px, ${p.y}px) rotate(${Math.atan2(p.vy, p.vx)}rad)`,
                        width: `${length}px`, 
                        height: `${p.size}px`, 
                        backgroundColor: p.color, opacity: p.life,
                        boxShadow: `0 0 ${p.size}px ${p.color}`,
                    }}/>
                )
            })}

            {/* PLAYER ROCKET */}
            <div ref={rocketRef} className="absolute top-0 left-0 z-20 will-change-transform transition-colors duration-100">
                 
                 {/* NEW WARP VISUALS (Comet Style) - INSIDE ROTATION */}
                 <div 
                    className="absolute top-1/2 left-1/2 pointer-events-none transition-opacity duration-300" 
                    style={{ 
                        opacity: hudState.warpFactor,
                        transform: 'translate(-50%, -50%)', // Center it
                        width: '0', 
                        height: '0' 
                    }}
                 >
                     {/* The Comet Tail (Streaks behind) - Moves DOWN relative to rocket (which points UP/RIGHT) */}
                     {/* Based on SVG: Engine is at y=95 (approx bottom). Rocket center is 50,50. */}
                     {/* So tail should start at y ~ 30px (relative to center 0) and go down */}
                     <div 
                        className="absolute"
                        style={{
                            top: '25px', // Start at engine nozzle
                            left: '-20px', // Centered horizontally (width 40 / 2)
                            width: '40px',
                            height: '500px', // Long tail
                            background: 'linear-gradient(to bottom, rgba(34,211,238,0.9) 0%, rgba(255,255,255,0.8) 10%, rgba(34,211,238,0.0) 100%)',
                            filter: 'blur(4px)',
                            transformOrigin: 'top center',
                        }}
                     />
                     
                     {/* The Round Head Aura */}
                     <div className="absolute rounded-full bg-cyan-300 blur-xl"
                          style={{
                              width: '120px', height: '120px',
                              top: '-60px', left: '-60px', // Center
                              opacity: 0.9 // Increased Opacity to match tail intensity
                          }}
                     />
                 </div>

                 <svg width="60" height="60" viewBox="0 0 100 100" className="drop-shadow-lg overflow-visible relative z-10">
                     <defs><radialGradient id="plasmaCore"><stop offset="0%" stopColor="#fff"/><stop offset="100%" stopColor="#a5f3fc"/></radialGradient></defs>
                     {hudState.isThrusting && (
                         <g transform="translate(50, 100)">
                             <ellipse cx="0" cy="10" rx="15" ry="40" fill="#7c3aed" opacity="0.4" filter="blur(8px)"><animate attributeName="ry" values="40; 50; 40" dur="0.1s" repeatCount="indefinite" /></ellipse>
                             <ellipse cx="0" cy="5" rx="10" ry="30" fill="#0ea5e9" opacity="0.6"><animate attributeName="ry" values="30; 45; 30" dur="0.08s" repeatCount="indefinite" /></ellipse>
                             <ellipse cx="0" cy="0" rx="6" ry="20" fill="url(#plasmaCore)"><animate attributeName="ry" values="20; 35; 20" dur="0.05s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.9; 1; 0.9" dur="0.05s" repeatCount="indefinite" /></ellipse>
                         </g>
                    )}
                    <path d="M20 70 Q10 90 20 95 L30 80 Z" fill="#dc2626" />
                    <path d="M80 70 Q90 90 80 95 L70 80 Z" fill="#dc2626" />
                    <path d="M50 70 L50 95" stroke="#dc2626" strokeWidth="8" strokeLinecap="round" />
                    <ellipse cx="50" cy="50" rx="20" ry="45" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
                    <path d="M36 20 Q50 0 64 20" fill="#dc2626" />
                    <path d="M30 30 Q50 5 70 30 L64 20 Q50 0 36 20 Z" fill="#dc2626" />
                    <circle cx="50" cy="40" r="8" fill="#38bdf8" stroke="#0ea5e9" strokeWidth="2" />
                    <circle cx="53" cy="38" r="2" fill="white" opacity="0.6" />
                </svg>
            </div>
       </div>
    </div>
  );
};

export default SpaceFlight;