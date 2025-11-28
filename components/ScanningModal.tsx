
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ScanResult, QuizQuestion, Mission } from '../types';
import { X, Database, Thermometer, ArrowDown, Aperture, Globe, Wind, Clock, Disc, RotateCw, Ruler, Scaling, BrainCircuit, CheckCircle, XCircle, RefreshCw, Heart, Skull, Zap, Trophy } from 'lucide-react';
import { generatePlanetQuiz } from '../services/geminiService';
import { audioService } from '../services/audioService';
import BossIntroScene from './BossIntroScene';
// FIX: Imported MISSIONS to make boss fight logic robust.
import { MISSIONS } from '../constants';

interface ScanningModalProps {
  data: ScanResult | null;
  isLoading: boolean;
  onClose: () => void;
  planetSize?: number;
  planetNameEng?: string; // To fetch quiz
  currentMission?: Mission | null; // Use the live mission object
  allMissionsCompleted?: boolean; // New prop to handle re-fighting the boss
}

type AlienBodyType = 'OCTOPUS' | 'INSECT' | 'BRAIN' | 'CYBORG';

// Create a standalone component for the Player's rocket avatar
const PlayerAvatar = () => (
    <svg width="100" height="100" viewBox="0 0 100 100">
        <path d="M20 70 Q10 90 20 95 L30 80 Z" fill="#dc2626" />
        <path d="M80 70 Q90 90 80 95 L70 80 Z" fill="#dc2626" />
        <path d="M50 70 L50 95" stroke="#dc2626" strokeWidth="8" strokeLinecap="round" />
        <ellipse cx="50" cy="50" rx="20" ry="45" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
        <path d="M36 20 Q50 0 64 20" fill="#dc2626" />
        <path d="M30 30 Q50 5 70 30 L64 20 Q50 0 36 20 Z" fill="#dc2626" />
        <circle cx="50" cy="40" r="8" fill="#38bdf8" stroke="#0ea5e9" strokeWidth="2" />
        <circle cx="53" cy="38" r="2" fill="white" opacity="0.6" />
    </svg>
);


// Procedural Alien Enemy Component
const AlienEnemy = ({ 
    planetName, 
    isDamaged, 
    isAttacking, 
    isDead, 
    bodyType 
}: { 
    planetName: string, 
    isDamaged: boolean, 
    isAttacking: boolean, 
    isDead: boolean, 
    bodyType: AlienBodyType
}) => {
    // Generate deterministic features based on planet name hash
    const safeName = planetName ? String(planetName) : 'Unknown';
    const seed = safeName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = seed % 360;
    const eyeCount = (seed % 3) + 1; // 1, 2, or 3 eyes
    
    const bossScale = bodyType === 'CYBORG' ? 1.5 : 1.0;

    return (
        <div className={`relative transition-all duration-500 ${isDamaged ? 'animate-shake opacity-70 scale-95' : 'animate-float'} ${isAttacking ? 'scale-125' : ''}`}>
             
             {/* Render Alien SVG only if NOT dead, or during the initial phase of death */}
             <svg width={200 * bossScale} height={200 * bossScale} viewBox="0 0 200 200" 
                className={`drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-1000 ${isDead ? 'opacity-0 scale-150' : 'opacity-100'}`}
             >
                 <defs>
                     <radialGradient id="alienGrad" cx="50%" cy="50%" r="50%">
                         <stop offset="0%" stopColor={`hsl(${hue}, 80%, 70%)`} />
                         <stop offset="100%" stopColor={`hsl(${hue}, 80%, 40%)`} />
                     </radialGradient>
                 </defs>
                 
                 {bodyType === 'OCTOPUS' && (
                     <>
                        <path d="M60 160 Q40 190 20 180" stroke={`hsl(${hue}, 80%, 30%)`} strokeWidth="8" fill="none" className="animate-[pulse_2s_infinite]" />
                        <path d="M140 160 Q160 190 180 180" stroke={`hsl(${hue}, 80%, 30%)`} strokeWidth="8" fill="none" className="animate-[pulse_2s_infinite]" style={{animationDelay: '0.5s'}} />
                        <path d="M100 170 Q100 200 100 190" stroke={`hsl(${hue}, 80%, 30%)`} strokeWidth="8" fill="none" />
                        <path d="M50 60 Q20 100 50 160 L150 160 Q180 100 150 60 Q100 0 50 60" fill="url(#alienGrad)" stroke="white" strokeWidth="2" style={{ filter: isDamaged ? 'brightness(2)' : 'none' }} />
                     </>
                 )}
                 {bodyType === 'INSECT' && (
                     <>
                        <path d="M40 100 L10 140 M40 120 L10 170" stroke={`hsl(${hue}, 80%, 30%)`} strokeWidth="4" fill="none" />
                        <path d="M160 100 L190 140 M160 120 L190 170" stroke={`hsl(${hue}, 80%, 30%)`} strokeWidth="4" fill="none" />
                        <path d="M100 20 L140 60 L100 180 L60 60 Z" fill="url(#alienGrad)" stroke="white" strokeWidth="2" style={{ filter: isDamaged ? 'brightness(2)' : 'none' }} />
                        <path d="M80 160 L90 180 M120 160 L110 180" stroke="white" strokeWidth="2" />
                     </>
                 )}
                 {bodyType === 'BRAIN' && (
                     <>
                        <path d="M60 140 Q60 180 50 190 M100 140 Q100 190 100 200 M140 140 Q140 180 150 190" stroke={`hsl(${hue}, 60%, 50%)`} strokeWidth="2" fill="none" className="animate-pulse" />
                        <path d="M40 80 Q40 20 100 20 Q160 20 160 80 Q160 140 100 140 Q40 140 40 80" fill="url(#alienGrad)" stroke="white" strokeWidth="2" style={{ filter: isDamaged ? 'brightness(2)' : 'none' }} />
                        <path d="M60 60 Q100 40 140 60 M60 100 Q100 120 140 100" stroke={`hsl(${hue}, 80%, 30%)`} strokeWidth="2" fill="none" opacity="0.5"/>
                     </>
                 )}
                 {/* BOSS: "Void Leviathan" */}
                 {bodyType === 'CYBORG' && (
                     <g style={{ filter: isDamaged ? 'brightness(1.5)' : 'none' }}>
                        <defs>
                           <radialGradient id="bossGrad" cx="50%" cy="50%" r="50%">
                             <stop offset="0%" stopColor="#a855f7" />
                             <stop offset="100%" stopColor="#4c1d95" />
                           </radialGradient>
                           <filter id="bossGlow"><feGaussianBlur stdDeviation="3.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                        </defs>
                        {/* Wriggling Tentacles */}
                        {[0, 60, 120, 180, 240, 300].map(angle => (
                            <path key={angle} d="M100 100 C 80 140, 120 160, 100 200" stroke="#3b0764" strokeWidth="15" fill="none" transform={`rotate(${angle} 100 100)`}>
                                <animateTransform attributeName="transform" type="rotate" values={`${angle} 100 100; ${angle+20} 100 100; ${angle} 100 100`} dur={`${2 + Math.random()*2}s`} repeatCount="indefinite" />
                            </path>
                        ))}
                        {/* Main Body */}
                        <path d="M50 50 Q100 0 150 50 T 150 150 Q100 200 50 150 T 50 50" fill="url(#bossGrad)" stroke="#f472b6" strokeWidth="4" />
                        {/* Eye */}
                        <circle cx="100" cy="100" r="30" fill="black" />
                        <circle cx="100" cy="100" r="20" fill="#dc2626" filter="url(#bossGlow)" />
                        <circle cx="100" cy="100" r="8" fill="black" />
                        <circle cx="103" cy="97" r="3" fill="white" opacity="0.8" />
                     </g>
                 )}

                 {/* Eyes (For non-bosses) */}
                 {bodyType !== 'CYBORG' && (
                    <>
                    {eyeCount === 1 && (
                        <g className="animate-[pulse_4s_infinite]">
                           <circle cx="100" cy="90" r="25" fill="white" />
                           <circle cx="100" cy="90" r="10" fill="black" />
                           <circle cx="105" cy="85" r="3" fill="white" />
                        </g>
                    )}
                    {eyeCount === 2 && (
                        <g>
                           <circle cx="75" cy="90" r="15" fill="white" />
                           <circle cx="75" cy="90" r="6" fill="black" />
                           <circle cx="125" cy="90" r="15" fill="white" />
                           <circle cx="125" cy="90" r="6" fill="black" />
                        </g>
                    )}
                    {eyeCount === 3 && (
                        <g>
                           <circle cx="70" cy="100" r="12" fill="white" />
                           <circle cx="70" cy="100" r="5" fill="black" />
                           <circle cx="130" cy="100" r="12" fill="white" />
                           <circle cx="130" cy="100" r="5" fill="black" />
                           <circle cx="100" cy="70" r="15" fill="white" />
                           <circle cx="100" cy="70" r="6" fill="black" />
                        </g>
                    )}
                    </>
                 )}

                 {/* Mouth */}
                 {bodyType !== 'CYBORG' && (isAttacking) ? (
                     <ellipse cx="100" cy="130" rx="20" ry="15" fill="black" />
                 ) : bodyType !== 'CYBORG' && (
                     <path d="M80 130 Q100 140 120 130" stroke="black" strokeWidth="3" fill="none" />
                 )}
             </svg>
             
             {isDead && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     {/* One-shot explosion animation using keyframes implicitly by removal or CSS class */}
                     <div className="w-full h-full bg-cyan-400 rounded-full animate-[ping_0.5s_ease-out_forwards] opacity-0"></div>
                     <div className="absolute w-full h-full bg-white rounded-full animate-[ping_0.3s_ease-out_forwards] opacity-0" style={{ animationDelay: '0.1s' }}></div>
                 </div>
             )}
        </div>
    )
}

// FIX: Removed duplicate ScanningModal component definition.
const ScanningModal: React.FC<ScanningModalProps> = ({ data, isLoading, onClose, planetSize = 38, planetNameEng, currentMission, allMissionsCompleted }) => {
  const [activeTab, setActiveTab] = useState<'DATA' | 'QUIZ'>('DATA');
  
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [generationError, setGenerationError] = useState(false);
  const isMounted = useRef(true);

  const isBossFight = useMemo(() => {
    if (!planetNameEng || planetNameEng !== 'Neptune') return false;
    // FIX: Changed hardcoded mission number to MISSIONS.length for robustness.
    return currentMission?.id === MISSIONS.length || allMissionsCompleted;
  }, [planetNameEng, currentMission, allMissionsCompleted]);
  
  const [cutsceneState, setCutsceneState] = useState<'IDLE' | 'RUNNING' | 'COMPLETE'>(isBossFight ? 'RUNNING' : 'IDLE');

  const MAX_PLAYER_HEALTH = 3;
  const ALIEN_HEALTH = isBossFight ? 10 : 5;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [playerHealth, setPlayerHealth] = useState(MAX_PLAYER_HEALTH);
  const [alienHealth, setAlienHealth] = useState(ALIEN_HEALTH);
  const [isDying, setIsDying] = useState(false);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [battleState, setBattleState] = useState<'IDLE' | 'PLAYER_ATTACK' | 'ALIEN_ATTACK' | 'DAMAGED' | 'ALIEN_DEAD'>('IDLE');

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    resetState();
    setCutsceneState(isBossFight ? 'RUNNING' : 'IDLE');
  }, [planetNameEng, isBossFight]);

  const resetState = () => {
    if (!isMounted.current) return;
    setQuizQuestions([]);
    setQuizLoading(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setPlayerHealth(MAX_PLAYER_HEALTH);
    setAlienHealth(ALIEN_HEALTH);
    setSelectedOption(null);
    setShowExplanation(false);
    setGenerationError(false);
    setBattleState('IDLE');
    setIsDying(false);
    setActiveTab('DATA');
  };
  
  // Audio trigger removed as requested

  const alienBodyType = useMemo((): AlienBodyType => {
      if (isBossFight) return 'CYBORG';
      const seed = (planetNameEng || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const types: AlienBodyType[] = ['OCTOPUS', 'INSECT', 'BRAIN'];
      return types[seed % types.length];
  }, [planetNameEng, isBossFight]);

  if (cutsceneState === 'RUNNING') {
      const bossAvatar = <AlienEnemy planetName="Neptune" bodyType="CYBORG" isDamaged={false} isAttacking={false} isDead={false} />;
      const playerAvatar = <PlayerAvatar />;
      return <BossIntroScene onComplete={() => setCutsceneState('COMPLETE')} playerAvatar={playerAvatar} bossAvatar={bossAvatar} />;
  }

  if (!data && !isLoading) return null;

  const earthSize = 38;
  const currentSize = planetSize || 38;
  const scaleRatio = currentSize / earthSize;

  const startQuiz = async (forceRefetch = false) => {
    if (!data || !planetNameEng) return;
    setActiveTab('QUIZ');
    
    if (quizQuestions.length === 0 || forceRefetch) {
        setQuizLoading(true);
        setGenerationError(false);
        try {
            const questions = await generatePlanetQuiz(planetNameEng, data.planetName);
            if (!isMounted.current) return;

            if (questions && questions.length > 0) {
                setQuizQuestions(questions);
                setPlayerHealth(MAX_PLAYER_HEALTH);
                setAlienHealth(ALIEN_HEALTH);
                setCurrentQuestionIndex(0);
                setScore(0);
            } else {
                setGenerationError(true);
            }
        } catch (e) {
            if (isMounted.current) setGenerationError(true);
        } finally {
            if (isMounted.current) setQuizLoading(false);
        }
    }
  };

  const handleReloadChallenge = async () => {
      setSelectedOption(null);
      setShowExplanation(false);
      setBattleState('IDLE');
      setIsDying(false);
      startQuiz(true);
  };

  const handleAnswer = (index: number) => {
    if (selectedOption !== null || playerHealth <= 0 || alienHealth <= 0 || isDying) return;
    setSelectedOption(index);
    
    const isCorrect = index === quizQuestions[currentQuestionIndex].correctAnswerIndex;

    if (isCorrect) {
        setScore(prev => prev + 1);
        setBattleState('PLAYER_ATTACK');
        audioService.playLaserSound();
        setTimeout(() => {
            if (!isMounted.current) return;
            const newAlienHealth = alienHealth - 1;
            setAlienHealth(newAlienHealth);
            if (newAlienHealth <= 0) {
                // Alien dies
                setIsDying(true);
                audioService.playExplosionSound(); // NEW: Big explosion sound
                // Wait for explosion animation (1s), then show victory
                setTimeout(() => { if(isMounted.current) setBattleState('ALIEN_DEAD') }, 1000); 
            } else {
                setBattleState('IDLE');
                setShowExplanation(true);
            }
        }, 400);
    } else {
        setBattleState('ALIEN_ATTACK');
        setTimeout(() => {
            if (!isMounted.current) return;
            setPlayerHealth(prev => Math.max(0, prev - 1));
            setBattleState('DAMAGED');
            audioService.playDamageSound();
            setTimeout(() => {
                if (!isMounted.current) return;
                setBattleState('IDLE');
                setShowExplanation(true);
            }, 400);
        }, 400);
    }
  };

  const nextQuestion = () => {
    if (playerHealth <= 0 || isDying) return;

    if (currentQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOption(null);
        setShowExplanation(false);
    } else {
        if (playerHealth > alienHealth) {
             // Alien dies (Safety catch if health calculation was off)
            setIsDying(true);
            audioService.playExplosionSound(); // NEW
            setTimeout(() => { if(isMounted.current) setBattleState('ALIEN_DEAD') }, 1000);
        } else {
            setPlayerHealth(0);
        }
    }
  };

  const isPlayerDead = playerHealth <= 0;
  const isAlienDead = battleState === 'ALIEN_DEAD';

  return (
    <div className={`absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-300 ${battleState === 'DAMAGED' ? 'animate-shake bg-red-900/20' : ''}`}>
      <div className="relative w-full max-w-6xl bg-[#0b1121] border border-cyan-500/30 rounded-xl shadow-[0_0_80px_rgba(6,182,212,0.2)] overflow-hidden flex flex-col lg:flex-row max-h-[90vh]">
        
        <div className="lg:w-5/12 bg-black relative flex flex-col min-h-[300px] border-b lg:border-b-0 lg:border-r border-cyan-500/30 shrink-0">
            {activeTab === 'QUIZ' && !quizLoading && !generationError && (
                <div className="absolute inset-0 flex flex-col">
                    <div className="p-4 flex justify-between items-start z-20">
                        <div className="flex flex-col gap-1">
                            <div className="text-cyan-400 font-mono text-[10px] font-bold">PLAYER INTEGRITY</div>
                            <div className="flex gap-1">
                                {Array.from({length: MAX_PLAYER_HEALTH}).map((_, i) => (
                                    <Heart key={i} className={`w-6 h-6 ${i < playerHealth ? 'text-green-500 fill-green-500 animate-pulse' : 'text-slate-800'}`} />
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 items-end">
                            <div className="text-red-400 font-mono text-[10px] font-bold">ALIEN THREAT</div>
                            <div className="flex gap-1 flex-wrap justify-end">
                                {Array.from({length: ALIEN_HEALTH}).map((_, i) => (
                                    <Skull key={i} className={`w-6 h-6 ${i < alienHealth ? 'text-red-500 fill-red-500 animate-pulse' : 'text-slate-800'}`} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,#1e1b4b_0%,#000_100%)]">
                        <div className="absolute inset-0 opacity-50" style={{backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '50px 50px'}}></div>
                        
                        <div className="relative z-10">
                           <AlienEnemy 
                                planetName={planetNameEng || 'Unknown'} 
                                isDamaged={battleState === 'PLAYER_ATTACK'}
                                isAttacking={battleState === 'ALIEN_ATTACK'}
                                isDead={isDying}
                                bodyType={alienBodyType}
                           />
                        </div>

                        {battleState === 'PLAYER_ATTACK' && (
                            <div className="absolute bottom-0 left-1/2 w-4 h-full bg-cyan-400 shadow-[0_0_30px_cyan] -translate-x-1/2 animate-[ping_0.2s_linear] z-30" />
                        )}

                        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black to-transparent pointer-events-none z-20 border-b-4 border-cyan-500/50"></div>
                    </div>
                </div>
            )}

            {activeTab === 'DATA' && (
                <>
                    <div className="relative flex-1 flex items-center justify-center overflow-hidden">
                        {isLoading ? (
                        <div className="flex flex-col items-center gap-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 animate-pulse"></div>
                                <Aperture className="w-20 h-20 text-cyan-400 animate-[spin_3s_linear_infinite]" />
                            </div>
                            <div className="text-cyan-200 font-mono text-sm tracking-[0.2em] animate-pulse">ANALYZING COSMIC DATA...</div>
                        </div>
                        ) : data?.imageUrl && typeof data.imageUrl === 'string' ? (
                        <div className="relative w-full h-full group">
                            <img 
                                src={data.imageUrl} 
                                alt={String(data.planetName)} 
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1000"; // Fallback
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1121] via-transparent to-transparent opacity-80" />
                            <div className="absolute bottom-6 left-6 right-6">
                                <h1 className="text-4xl lg:text-5xl font-sci-fi font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                                    {String(data.planetName)}
                                </h1>
                                <div className="text-cyan-400 font-mono text-sm tracking-widest mt-1 uppercase">{String(data.structure)}</div>
                            </div>
                        </div>
                        ) : (
                        <div className="text-slate-600 font-mono text-xs">NO VISUAL FEED AVAILABLE</div>
                        )}
                    </div>

                    {!isLoading && data && (
                        <div className="h-32 bg-slate-900/50 border-t border-cyan-500/20 p-4 flex items-center justify-around relative overflow-hidden">
                            <div className="text-[10px] text-cyan-500 absolute top-2 left-2 uppercase tracking-wider font-bold flex gap-1">
                                <Scaling size={12} /> Size Comparison (vs Earth)
                            </div>
                            
                            <div className="flex flex-col items-center gap-2 z-10">
                                <div className="w-8 h-8 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent)]"></div>
                                </div>
                                <span className="text-[10px] text-slate-400">Earth</span>
                            </div>

                            <div className="h-[1px] bg-slate-600 flex-1 mx-4 relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0b1121] px-2 text-xs text-slate-500">
                                    {scaleRatio > 1 ? `${scaleRatio.toFixed(1)}x Bigger` : `${(1/scaleRatio).toFixed(1)}x Smaller`}
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-2 z-10">
                                <div 
                                    className="rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)] relative overflow-hidden transition-all duration-500"
                                    style={{ 
                                        width: `${Math.min(60, Math.max(10, 32 * scaleRatio))}px`, 
                                        height: `${Math.min(60, Math.max(10, 32 * scaleRatio))}px`,
                                        background: 'linear-gradient(135deg, #cbd5e1 0%, #475569 100%)' 
                                    }}
                                >
                                    {data.imageUrl && typeof data.imageUrl === 'string' && (
                                        <img src={data.imageUrl} className="w-full h-full object-cover opacity-80" alt="" />
                                    )}
                                </div>
                                <span className="text-[10px] text-slate-400">{String(data.planetName)}</span>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>

        <div className="lg:w-7/12 flex flex-col min-h-0 bg-[#0b1121]">
            <div className="p-5 flex justify-between items-center border-b border-slate-800 bg-slate-900/50 shrink-0">
              <div className="flex gap-4">
                  <button 
                    onClick={() => setActiveTab('DATA')}
                    className={`flex items-center gap-2 font-sci-fi text-sm font-bold tracking-wide px-3 py-1 rounded transition-colors ${activeTab === 'DATA' ? 'text-cyan-300 bg-cyan-900/30 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                     <Database size={16} /> DATABASE
                  </button>
                  {!isLoading && (
                      <button 
                        onClick={() => startQuiz(false)}
                        className={`flex items-center gap-2 font-sci-fi text-sm font-bold tracking-wide px-3 py-1 rounded transition-colors ${activeTab === 'QUIZ' ? 'text-red-400 bg-red-900/30 border border-red-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        <BrainCircuit size={16} /> BATTLE SIM
                      </button>
                  )}
              </div>
              <button 
                onClick={onClose} 
                className="group p-2 rounded-full hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/50"
              >
                <X className="text-slate-400 group-hover:text-red-400 transition-colors" size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar relative">
              {isLoading ? (
                <div className="space-y-6 animate-pulse">
                   <div className="h-4 bg-slate-800/50 rounded w-full mb-8" />
                   <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 bg-slate-800/50 rounded" />
                      <div className="h-24 bg-slate-800/50 rounded" />
                      <div className="h-24 bg-slate-800/50 rounded" />
                      <div className="h-24 bg-slate-800/50 rounded" />
                   </div>
                </div>
              ) : activeTab === 'DATA' && data ? (
                <div className="space-y-8 pb-4 animate-in fade-in slide-in-from-right-4 duration-300">
                   <div className="prose prose-invert max-w-none">
                      <h3 className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <div className="w-8 h-[1px] bg-cyan-400"></div> Overview
                      </h3>
                      <p className="text-slate-300 leading-relaxed font-light text-lg border-l-2 border-cyan-500/30 pl-4">
                          {String(data.summary)}
                      </p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DataItem icon={<Thermometer size={18} />} label="Surface Temp" value={String(data.temperature)} color="text-red-400" />
                      <DataItem icon={<ArrowDown size={18} />} label="Gravity" value={String(data.gravity)} color="text-purple-400" />
                      <DataItem icon={<Clock size={18} />} label="Orbit Period" value={String(data.orbitPeriod)} color="text-blue-400" />
                      <DataItem icon={<RotateCw size={18} />} label="Rotation Period" value={String(data.rotationPeriod)} color="text-green-400" />
                      <DataItem icon={<Ruler size={18} />} label="Dist. from Earth" value={String(data.distanceFromEarth)} color="text-orange-400" />
                      <DataItem icon={<Disc size={18} />} label="Moons" value={String(data.moons)} color="text-yellow-400" />
                      <DataItem icon={<Wind size={18} />} label="Atmosphere" value={String(data.atmosphere)} color="text-emerald-400" />
                      <DataItem icon={<Globe size={18} />} label="Life Potential" value={String(data.potentialForLife)} color="text-pink-400" />
                   </div>

                   <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/20 p-5">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Aperture size={100} />
                      </div>
                      <h4 className="text-indigo-300 font-bold mb-2 flex items-center gap-2">
                        <span className="text-xl">💡</span> DID YOU KNOW?
                      </h4>
                      <p className="text-indigo-100 italic font-light relative z-10">
                          "{String(data.funFact)}"
                      </p>
                   </div>
                </div>
              ) : activeTab === 'QUIZ' ? (
                 <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                     {quizLoading ? (
                         <div className="flex-1 flex flex-col items-center justify-center gap-4">
                             <BrainCircuit className="w-16 h-16 text-purple-500 animate-pulse" />
                             <div className="text-purple-300 font-mono text-sm">INITIALIZING COMBAT SIMULATION...</div>
                         </div>
                     ) : generationError ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
                             <XCircle className="w-12 h-12 text-red-400" />
                             <div className="text-red-300">Failed to initialize simulation.</div>
                             <button onClick={() => startQuiz(true)} className="px-6 py-2 bg-red-900/50 hover:bg-red-800 text-red-200 rounded-lg flex items-center gap-2">
                                 <RefreshCw size={16} /> Retry Link
                             </button>
                        </div>
                     ) : isPlayerDead ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 animate-in zoom-in duration-300 bg-red-950/20 p-8 rounded-xl border border-red-500/30">
                             <Skull className="w-24 h-24 text-red-500 animate-bounce" />
                             <div>
                                 <h2 className="text-5xl font-bold text-red-500 mb-4 tracking-widest font-sci-fi animate-pulse">DEFEAT</h2>
                                 <p className="text-red-400/50 text-xs mt-2 uppercase tracking-widest">Signal Lost</p>
                             </div>
                             <div className="flex gap-4 mt-8">
                                <button onClick={handleReloadChallenge} className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                                    <Zap size={16} /> RE-ENGAGE
                                </button>
                                <button onClick={onClose} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-colors">
                                    RETREAT
                                </button>
                             </div>
                        </div>
                     ) : isAlienDead ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 animate-in zoom-in duration-500">
                             <TrophyIcon score={score} total={score + (MAX_PLAYER_HEALTH - playerHealth)} />
                             <div>
                                 <h2 className="text-4xl font-bold text-yellow-400 mb-2 font-sci-fi animate-pulse">VICTORY</h2>
                                 <p className="text-slate-300 text-lg">Alien Threat Neutralized.</p>
                                 <div className="text-green-400 mt-2 font-bold bg-green-900/20 px-4 py-2 rounded border border-green-500/30 inline-block">
                                     Remaining Integrity: {playerHealth} / {MAX_PLAYER_HEALTH}
                                 </div>
                             </div>
                             <div className="flex gap-4">
                                <button onClick={handleReloadChallenge} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                                    <RefreshCw size={16} /> NEW BATTLE
                                </button>
                                <button onClick={onClose} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold transition-colors">
                                    RETURN TO SHIP
                                </button>
                             </div>
                        </div>
                     ) : quizQuestions.length > 0 ? (
                         <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
                             <div className="flex justify-between items-center text-xs font-mono text-purple-400 mb-6 border-b border-purple-500/20 pb-2">
                                 <span>BATTLE LOG {currentQuestionIndex + 1} / {quizQuestions.length}</span>
                             </div>
                             
                             <h3 className="text-xl font-bold text-white mb-8 leading-relaxed">
                                 {String(quizQuestions[currentQuestionIndex].question)}
                             </h3>

                             <div className="space-y-3">
                                 {quizQuestions[currentQuestionIndex].options.map((opt, i) => {
                                     let btnClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex justify-between items-center group relative overflow-hidden ";
                                     
                                     if (selectedOption === null) {
                                         btnClass += "bg-slate-800/50 border-slate-700 hover:border-purple-500 hover:bg-purple-900/20 text-slate-200 hover:scale-[1.01]";
                                     } else {
                                         if (i === quizQuestions[currentQuestionIndex].correctAnswerIndex) {
                                             btnClass += "bg-green-900/40 border-green-500 text-green-100 shadow-[0_0_15px_rgba(34,197,94,0.3)]";
                                         } else if (i === selectedOption) {
                                             btnClass += "bg-red-900/40 border-red-500 text-red-100";
                                         } else {
                                             btnClass += "bg-slate-900/30 border-slate-800 text-slate-500 opacity-30";
                                         }
                                     }

                                     return (
                                         <button 
                                            key={i}
                                            onClick={() => handleAnswer(i)}
                                            disabled={selectedOption !== null}
                                            className={btnClass}
                                         >
                                             <span className="relative z-10">{String(opt)}</span>
                                             {selectedOption !== null && i === quizQuestions[currentQuestionIndex].correctAnswerIndex && <CheckCircle className="text-green-400 z-10" size={20}/>}
                                             {selectedOption !== null && i === selectedOption && i !== quizQuestions[currentQuestionIndex].correctAnswerIndex && <XCircle className="text-red-400 z-10" size={20}/>}
                                         </button>
                                     );
                                 })}
                             </div>

                             {showExplanation && (
                                 <div className="mt-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                                     <div className="text-xs font-bold text-purple-400 uppercase mb-1">Tactical Analysis</div>
                                     <p className="text-sm text-purple-100">{String(quizQuestions[currentQuestionIndex].explanation)}</p>
                                     <div className="mt-4 flex justify-end">
                                         <button onClick={nextQuestion} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded shadow-lg transition-colors">
                                             NEXT ROUND
                                         </button>
                                     </div>
                                 </div>
                             )}
                         </div>
                     ) : (
                         <div className="flex items-center justify-center h-full text-red-400">Simulation initialization failed.</div>
                     )}
                 </div>
              ) : null}
            </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(6, 182, 212, 0.3); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(6, 182, 212, 0.5); }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>
    </div>
  );
};

// Safer DataItem component with strict checking
const DataItem = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) => {
    return (
        <div className="bg-slate-900/40 border border-slate-700/50 p-4 rounded-lg flex items-start gap-3 hover:bg-slate-800/40 transition-colors">
            <div className={`mt-1 ${color}`}>{icon}</div>
            <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">{label}</div>
                <div className="text-slate-200 text-sm font-medium leading-snug">{value}</div>
            </div>
        </div>
    );
};

const TrophyIcon = ({ score, total }: { score: number, total: number }) => {
    return (
        <div className={`w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center border-4 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.4)]`}>
            <Trophy size={48} className="text-yellow-400" />
        </div>
    );
}

export default ScanningModal;
