
import React, { useState, useEffect } from 'react';
import { DialogueLine } from '../types';
import { BOSS_DIALOGUE } from '../constants';
import { ArrowRightCircle } from 'lucide-react';
import { audioService } from '../services/audioService';

interface BossIntroSceneProps {
  onComplete: () => void;
  playerAvatar: React.ReactNode;
  bossAvatar: React.ReactNode;
}

const BossIntroScene: React.FC<BossIntroSceneProps> = ({ onComplete, playerAvatar, bossAvatar }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  
  const currentLine = BOSS_DIALOGUE[currentLineIndex];

  // Typing effect
  useEffect(() => {
    setDisplayedText('');
    const speaker = BOSS_DIALOGUE[currentLineIndex].speaker;
    
    // Play sound based on who speaks (Typing sound for boss now, blip for player)
    if (speaker === 'boss') {
        audioService.resume();
        // Changed from alien speak to typing sound as requested
    } else {
        audioService.playPlayerDialogueBlip();
    }

    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText(BOSS_DIALOGUE[currentLineIndex].text.substring(0, i + 1));
      
      // Play typing ticks
      if (speaker === 'boss' && i % 2 === 0) {
          audioService.playTypingSound();
      }
      
      i++;
      if (i >= BOSS_DIALOGUE[currentLineIndex].text.length) {
        clearInterval(intervalId);
      }
    }, 40); // Typing speed

    return () => clearInterval(intervalId);
  }, [currentLineIndex]);

  const handleNext = () => {
    audioService.playClickSound();
    if (currentLineIndex < BOSS_DIALOGUE.length - 1) {
      setCurrentLineIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const isPlayerSpeaking = currentLine.speaker === 'player';
  const isBossSpeaking = currentLine.speaker === 'boss';
  const isLastLine = currentLineIndex === BOSS_DIALOGUE.length - 1;

  return (
    <div className="absolute inset-0 bg-black z-50 flex flex-col justify-between p-4 animate-in fade-in duration-500">
        {/* Top & Bottom Letterbox Bars */}
        <div className="h-16 bg-black border-b border-red-500/30"></div>
        
        {/* Main Content - Fighting Game Style */}
        <div className="flex-1 flex items-center justify-around text-white relative overflow-hidden">
            {/* Player Avatar */}
            <div className={`transition-all duration-500 ${isPlayerSpeaking ? 'translate-x-10 scale-110 opacity-100' : 'scale-90 opacity-50'}`}>
                <div className="relative">
                   <div className="absolute -inset-2 rounded-full bg-cyan-500/20 blur-xl"></div>
                   <div className="relative w-48 h-48 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center p-4">
                        <div className="scale-[1.5]">{playerAvatar}</div>
                   </div>
                </div>
            </div>
            
            {/* Boss Avatar */}
            <div className={`transition-all duration-500 ${isBossSpeaking ? '-translate-x-10 scale-110 opacity-100' : 'scale-90 opacity-50'}`}>
                 <div className="relative">
                   <div className="absolute -inset-2 rounded-full bg-red-500/20 blur-xl"></div>
                   <div className="relative w-48 h-48 rounded-full bg-slate-900 border-2 border-red-400 flex items-center justify-center overflow-hidden p-2">
                        <div className="scale-[0.8]">{bossAvatar}</div>
                   </div>
                </div>
            </div>
        </div>

        {/* Dialogue Box */}
        <div className={`h-40 p-4 border-2 rounded-xl bg-slate-950/80 relative transition-colors duration-500 ${isBossSpeaking ? 'border-red-500/50' : 'border-cyan-500/50'}`}>
            <div className={`absolute -top-6 px-4 py-1 text-lg font-sci-fi rounded-t-lg ${isBossSpeaking ? 'left-1/2 bg-red-500/50 text-red-100' : 'left-8 bg-cyan-500/50 text-cyan-100'}`}>
                {isBossSpeaking ? 'VOID LEVIATHAN' : 'PLAYER'}
            </div>
            <p className={`font-mono text-lg whitespace-pre-wrap ${isBossSpeaking ? 'text-red-200' : 'text-cyan-200'}`}>
                {displayedText}
                <span className="w-2 h-4 bg-white inline-block ml-1 animate-pulse"></span>
            </p>
            <button 
                onClick={handleNext} 
                className="absolute bottom-4 right-4 flex items-center gap-2 text-white font-bold hover:scale-110 transition-transform animate-pulse"
            >
                {isLastLine ? 'BEGIN BATTLE' : 'NEXT'}
                <ArrowRightCircle />
            </button>
        </div>

        <div className="h-16 bg-black border-t border-red-500/30"></div>
    </div>
  );
};

export default BossIntroScene;
