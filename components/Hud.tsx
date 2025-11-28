
import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, ZoomIn, ZoomOut, CheckCircle2, Target, LogOut, Database, AlertTriangle, Zap } from 'lucide-react';
import { Vector2, CelestialBody, Mission } from '../types';
import { PLANETS } from '../constants';
import { audioService } from '../services/audioService';

interface HudProps {
  velocity: Vector2;
  position: Vector2;
  nearestPlanet: CelestialBody | null;
  distanceToNearest: number;
  zoom: number;
  autopilotTarget: CelestialBody | null;
  visitedIds: string[];
  currentMission: Mission | null;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomSet: (value: number) => void;
  onNavigate: (body: CelestialBody) => void;
  onAbortAutopilot: () => void;
  onExit: () => void;
  onOpenDatabase: () => void;
}

const Hud: React.FC<HudProps> = ({ 
  velocity, 
  position, 
  nearestPlanet, 
  distanceToNearest,
  zoom,
  autopilotTarget,
  visitedIds,
  currentMission,
  onZoomIn,
  onZoomOut,
  onZoomSet,
  onNavigate,
  onAbortAutopilot,
  onExit,
  onOpenDatabase
}) => {
  const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2) * 100;
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [zoomInput, setZoomInput] = useState(Math.round(zoom * 100).toString());

  useEffect(() => {
    setZoomInput(Math.round(zoom * 100).toString());
  }, [zoom]);

  const handleZoomSubmit = () => {
    let val = parseFloat(zoomInput);
    if (isNaN(val)) val = 100;
    val = Math.max(10, Math.min(300, val));
    onZoomSet(val / 100);
    setZoomInput(val.toString());
  };

  // Speedometer Calculation
  const maxSpeed = 100;
  const speedPct = Math.min(speed, maxSpeed) / maxSpeed;
  const needleRotation = -90 + (speedPct * 180); // -90deg to 90deg

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-40">
      {/* Top Bar */}
      <div className="flex justify-between items-start pointer-events-auto w-full">
        {/* Left: Exit & Database */}
        <div className="flex gap-2">
            <button 
                onClick={onExit}
                className="bg-red-900/20 border border-red-500/30 p-3 rounded-lg backdrop-blur-md text-red-400 flex items-center gap-2 hover:bg-red-900/40 transition-all w-max group"
            >
                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="font-sci-fi font-bold text-xs">MAIN MENU</span>
            </button>
            <button 
                onClick={onOpenDatabase}
                className="bg-purple-900/20 border border-purple-500/30 p-3 rounded-lg backdrop-blur-md text-purple-300 flex items-center gap-2 hover:bg-purple-900/40 transition-all w-max group"
            >
                <Database className="w-4 h-4 group-hover:animate-pulse" />
                <span className="font-sci-fi font-bold text-xs">DATABASE</span>
            </button>
        </div>
        
        {/* Right: Current Mission & Navigation */}
        <div className="flex flex-col items-end gap-2">
            
            {/* CURRENT MISSION WIDGET - Only show if there is an active mission */}
            {currentMission && (
                 <div className="bg-slate-900/80 border border-yellow-500/30 p-4 rounded-lg backdrop-blur-md shadow-lg w-80 animate-in slide-in-from-right-5 duration-500">
                     <div className="flex items-center gap-2 text-yellow-400 font-bold font-sci-fi text-xs mb-2">
                         <Target size={14} className="animate-pulse" />
                         CURRENT MISSION
                     </div>
                     <h3 className="text-yellow-100 font-bold text-sm mb-1">{currentMission.title}</h3>
                     <p className="text-yellow-200/70 text-xs">{currentMission.description}</p>
                 </div>
            )}

            <div className="flex gap-2 items-start mt-2">
            {autopilotTarget && (
                <button 
                    onClick={() => { onAbortAutopilot(); audioService.playClickSound(); }}
                    className="bg-red-900/90 border border-red-500 p-3 rounded-lg backdrop-blur-md text-red-100 flex items-center gap-2 hover:bg-red-800 transition-all animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                >
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-sci-fi font-bold">ABORT</span>
                </button>
            )}

            <div className="relative">
                <button 
                    onClick={() => { setIsNavOpen(!isNavOpen); audioService.playClickSound(); }}
                    className="bg-slate-900/90 border border-cyan-500/50 p-3 rounded-lg backdrop-blur-md text-cyan-100 flex items-center gap-2 hover:bg-cyan-900/50 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                    <Navigation className="w-5 h-5" />
                    <span className="font-sci-fi font-bold hidden md:inline">NAVIGATE</span>
                </button>
                
                {isNavOpen && (
                    <div className="absolute top-full right-0 mt-2 bg-slate-950/95 border border-cyan-500/30 rounded-lg backdrop-blur-xl p-2 w-64 max-h-[60vh] overflow-y-auto custom-scrollbar shadow-2xl animate-in slide-in-from-top-5 duration-200 z-50">
                        <div className="text-xs text-cyan-500 font-bold mb-2 uppercase tracking-widest px-2">Select Destination</div>
                        <div className="space-y-1">
                        {PLANETS.map(p => {
                            const isVisited = visitedIds.includes(p.id);
                            const isMissionTarget = currentMission?.targetBodyId === p.id;
                            const isAutopilotActive = autopilotTarget?.id === p.id;
                            const isNearby = nearestPlanet?.id === p.id && distanceToNearest < 2000;

                            return (
                                <button
                                    key={p.id}
                                    onClick={() => {
                                        onNavigate(p);
                                        setIsNavOpen(false);
                                        audioService.playClickSound();
                                    }}
                                    className={`w-full text-left p-2 rounded hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-200 transition-colors flex justify-between items-center group ${isAutopilotActive ? 'bg-cyan-900/30 border border-cyan-500/30' : ''} ${isNearby ? 'bg-green-900/20 border border-green-500/30' : ''}`}
                                >
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${isVisited ? 'bg-green-400' : isMissionTarget ? 'bg-yellow-400 animate-pulse' : 'bg-slate-600'}`}></span>
                                            <span className="group-hover:translate-x-1 transition-transform">{p.thaiName}</span>
                                        </div>
                                        {isAutopilotActive && (
                                            <div className="flex items-center gap-1 text-[9px] text-cyan-400 font-mono mt-1 animate-pulse">
                                                <Zap size={8} /> AUTOPILOT ACTIVE
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[10px] uppercase text-slate-500">{p.type.replace('_', ' ')}</span>
                                </button>
                            );
                        })}
                        </div>
                    </div>
                )}
            </div>
            </div>
        </div>
      </div>

      {/* Target Indicator */}
      {nearestPlanet && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-32 pointer-events-none">
           <div className={`flex flex-col items-center transition-opacity duration-300 ${distanceToNearest < 1500 ? 'opacity-100' : 'opacity-30'}`}>
              <MapPin className="w-6 h-6 text-yellow-400 mb-1 animate-bounce" />
              <div className="bg-black/60 px-3 py-1 rounded text-yellow-400 text-xs font-bold border border-yellow-400/50 backdrop-blur flex items-center gap-2">
                {visitedIds.includes(nearestPlanet.id) && <CheckCircle2 size={12} className="text-green-400"/>}
                {nearestPlanet.thaiName} ({Math.round(distanceToNearest)} km)
              </div>
           </div>
        </div>
      )}

      {/* Bottom Bar Container */}
      <div className="flex justify-between items-end pointer-events-auto w-full relative">
        
        {/* Left: Speed Gauge & Zoom */}
        <div className="flex flex-col gap-4 items-start">
            
            {/* Speedometer Gauge */}
            <div className="relative w-48 h-24 overflow-hidden bg-slate-900/80 border-t border-l border-r border-cyan-500/30 rounded-t-full backdrop-blur-md shadow-lg flex items-end justify-center pb-2">
                 {/* Gauge Background */}
                 <div className="absolute bottom-0 w-40 h-20 rounded-t-full border-[10px] border-slate-700/50"></div>
                 {/* Needle Container - Rotates */}
                 <div className="absolute bottom-2 left-1/2 w-0 h-0 origin-bottom" 
                      style={{ transform: `translateX(-50%) rotate(${needleRotation}deg)`, transition: 'transform 0.1s ease-out' }}>
                      <div className="w-1 h-20 bg-gradient-to-t from-cyan-500 to-transparent -translate-y-full absolute left-1/2 -translate-x-1/2 rounded-full shadow-[0_0_10px_cyan]"></div>
                 </div>
                 {/* Hub */}
                 <div className="absolute bottom-0 w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_10px_cyan] z-10 translate-y-2"></div>
                 
                 {/* Text Display */}
                 <div className="absolute top-8 flex flex-col items-center">
                    <span className="text-2xl font-mono font-bold text-white tracking-widest drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">
                        {Math.round(speed).toString().padStart(3, '0')}
                    </span>
                    <span className="text-[10px] text-cyan-400 font-bold">km/h</span>
                 </div>
            </div>

            {/* Zoom Controls */}
            <div className="flex gap-2 items-center">
                 <button 
                    onClick={() => { onZoomOut(); audioService.playClickSound(); }}
                    className="bg-slate-900/80 border border-cyan-500/30 p-3 rounded-lg backdrop-blur-md text-cyan-400 hover:bg-cyan-900/40 active:scale-95 transition-all"
                 >
                    <ZoomOut size={20} />
                 </button>
                 
                 <div className="relative group">
                    <input 
                        type="number" 
                        value={zoomInput}
                        onChange={(e) => setZoomInput(e.target.value)}
                        onBlur={handleZoomSubmit}
                        onKeyDown={(e) => e.key === 'Enter' && handleZoomSubmit()}
                        className="w-20 bg-slate-900/80 border border-cyan-500/30 px-2 py-3 rounded-lg backdrop-blur-md text-cyan-200 font-mono text-center focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all appearance-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-500/50 text-xs font-bold pointer-events-none">%</span>
                 </div>

                 <button 
                    onClick={() => { onZoomIn(); audioService.playClickSound(); }}
                    className="bg-slate-900/80 border border-cyan-500/30 p-3 rounded-lg backdrop-blur-md text-cyan-400 hover:bg-cyan-900/40 active:scale-95 transition-all"
                 >
                    <ZoomIn size={20} />
                 </button>
            </div>
        </div>

        {/* Right: Mini Map (Radar) - PLAYER CENTRIC */}
        <div className="relative bg-slate-900/90 border border-cyan-500/50 rounded-full w-48 h-48 md:w-56 md:h-56 shadow-[0_0_20px_rgba(6,182,212,0.2)] overflow-hidden backdrop-blur-xl group">
             {/* Radar Grid */}
             <div className="absolute inset-0 opacity-30" 
                  style={{ 
                      backgroundImage: 'radial-gradient(circle, #22d3ee 1px, transparent 1px)', 
                      backgroundSize: '20px 20px' 
                  }}>
             </div>
             <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-full"></div>
             <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-cyan-500/30"></div>
             <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-cyan-500/30"></div>
             
             {/* Scanning Line Effect */}
             <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(34,211,238,0.1)_60deg,transparent_60deg)] animate-[spin_4s_linear_infinite]"></div>

             {/* Render Planets on Radar (Relative to Player) */}
             <div className="absolute inset-0">
                {PLANETS.map(p => {
                    const RADAR_RANGE = 8000; // Visible range of radar
                    const dx = p.position.x - position.x;
                    const dy = p.position.y - position.y;
                    
                    // Normalize to radar size (0-100%)
                    // Center is 50,50
                    let xPct = 50 + (dx / RADAR_RANGE) * 45;
                    let yPct = 50 + (dy / RADAR_RANGE) * 45;

                    // Clamp to edge if out of range to show direction
                    const dist = Math.sqrt(Math.pow(xPct - 50, 2) + Math.pow(yPct - 50, 2));
                    if (dist > 45) {
                        const angle = Math.atan2(yPct - 50, xPct - 50);
                        xPct = 50 + Math.cos(angle) * 45;
                        yPct = 50 + Math.sin(angle) * 45;
                    }

                    const isVisited = visitedIds.includes(p.id);
                    const isMissionTarget = currentMission?.targetBodyId === p.id;
                    const isAutopilotActive = autopilotTarget?.id === p.id;

                    return (
                        <div 
                            key={p.id}
                            className={`absolute rounded-full -translate-x-1/2 -translate-y-1/2 ${p.type === 'STAR' ? 'w-3 h-3 bg-yellow-400' : 'w-1.5 h-1.5'} ${isVisited ? 'shadow-[0_0_4px_#4ade80]' : ''} ${isMissionTarget || isAutopilotActive ? 'animate-ping' : ''}`}
                            style={{ 
                                left: `${xPct}%`, 
                                top: `${yPct}%`,
                                backgroundColor: isMissionTarget ? '#facc15' : isAutopilotActive ? '#22d3ee' : isVisited ? '#4ade80' : p.color
                            }}
                        />
                    );
                })}

                {/* Player Indicator (Always Center) */}
                <div 
                    className="absolute w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_cyan] animate-pulse z-10 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
                ></div>
             </div>
             
             <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-cyan-500/80 font-mono">RADAR SYSTEM</div>
        </div>

      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(6, 182, 212, 0.5); border-radius: 2px; }
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
            -webkit-appearance: none; 
            margin: 0; 
        }
      `}</style>
    </div>
  );
};

export default Hud;
