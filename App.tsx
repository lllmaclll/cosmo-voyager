
import React, { useState, useMemo } from 'react';
import StarField from './components/StarField';
import SpaceFlight from './components/SpaceFlight';
import ScanningModal from './components/ScanningModal';
import GalacticDatabase from './components/GalacticDatabase';
import { GameMode, CelestialBody, ScanResult, Mission, DatabaseTopic } from './types';
import { fetchPlanetData, fetchDatabaseTopic } from './services/geminiService';
import { Rocket, ArrowUp, ArrowLeft, ArrowRight, ScanLine } from 'lucide-react';
import { MISSIONS, DATABASE_CATEGORIES } from './constants';
import { audioService } from './services/audioService';

const App: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.MENU);
  const [modalData, setModalData] = useState<ScanResult | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [scannedBody, setScannedBody] = useState<CelestialBody | null>(null);
  
  // Mission State
  const [completedMissions, setCompletedMissions] = useState<number[]>([]);
  
  // Database State
  const [databaseTopic, setDatabaseTopic] = useState<DatabaseTopic | null>(null);
  const [isDbLoading, setIsDbLoading] = useState(false);
  const [selectedDbCategory, setSelectedDbCategory] = useState<string | null>(null);

  const currentMission = useMemo(() => {
    return MISSIONS.find(m => !completedMissions.includes(m.id)) || null;
  }, [completedMissions]);

  const allMissionsCompleted = useMemo(() => {
    return completedMissions.length === MISSIONS.length;
  }, [completedMissions]);


  const handleStartMission = () => {
    audioService.init(); // Init audio context on first interaction
    audioService.playClickSound();
    setGameMode(GameMode.FLIGHT);
  };

  const handleExitGame = () => {
    audioService.playClickSound();
    setGameMode(GameMode.MENU);
    setCompletedMissions([]);
    setModalData(null);
    setScannedBody(null);
  };
  
  const handleOpenDatabase = () => {
    audioService.playClickSound();
    setGameMode(GameMode.DATABASE);
    setDatabaseTopic(null);
    setSelectedDbCategory(null);
  };

  const handleSelectTopic = async (topicId: string) => {
    const category = DATABASE_CATEGORIES.find(c => c.id === topicId);
    if (!category) return;
    
    audioService.playClickSound();
    setSelectedDbCategory(category.title);
    setIsDbLoading(true);
    setDatabaseTopic(null);
    
    const topicData = await fetchDatabaseTopic(category.id.replace('_', ' '), category.title);
    
    setDatabaseTopic(topicData);
    setIsDbLoading(false);
  };

  // Improved Navigation: Smart Back Button
  const handleDatabaseBack = () => {
    audioService.playClickSound();
    
    if (databaseTopic) {
      // If currently viewing a topic, go back to category list (Index)
      setDatabaseTopic(null);
      setSelectedDbCategory(null);
    } else {
      // If at Index, go back to Flight Mode
      setGameMode(GameMode.FLIGHT);
    }
  };

  const handleScan = async (planet: CelestialBody) => {
    setGameMode(GameMode.SCANNING);
    setIsModalLoading(true);
    setModalData(null); 
    setScannedBody(planet);

    const result = await fetchPlanetData(planet.name, planet.thaiName);
    
    setModalData(result);
    setIsModalLoading(false);
  };

  const closeModal = () => {
    if (currentMission && scannedBody && scannedBody.id === currentMission.targetBodyId) {
      setCompletedMissions(prev => [...prev, currentMission.id]);
    }
    
    setGameMode(GameMode.FLIGHT);
    setModalData(null);
    setScannedBody(null);
  };

  const renderContent = () => {
    switch (gameMode) {
      case GameMode.MENU:
        return (
          <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
            <div className="mb-8 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-slate-950 ring-1 ring-slate-900/5 rounded-full p-8">
                <Rocket size={64} className="text-cyan-400 animate-bounce" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold font-sci-fi mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400">
              COSMO VOYAGER
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl font-light">
              สำรวจระบบสุริยะจักรวาล บังคับยานอวกาศของคุณเพื่อค้นหาความลับของดวงดาว
            </p>
  
            <button
              onClick={handleStartMission}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-cyan-600 font-sci-fi rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-600 hover:bg-cyan-500 hover:scale-105 shadow-lg shadow-cyan-500/30"
            >
              START MISSION
              <div className="absolute -inset-1 rounded-full bg-cyan-400 opacity-20 blur-md group-hover:opacity-40 transition-opacity duration-200" />
            </button>
  
            <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-6 text-slate-500 text-xs md:text-sm font-mono opacity-70">
               <div className="flex flex-col items-center gap-1">
                  <div className="flex gap-1">
                     <div className="px-2 py-1 bg-slate-800 rounded border border-slate-700"><ArrowUp size={16}/></div>
                  </div>
                  <span>THRUSTERS</span>
               </div>
               <div className="flex flex-col items-center gap-1">
                  <div className="flex gap-1">
                     <div className="px-2 py-1 bg-slate-800 rounded border border-slate-700"><ArrowLeft size={16}/></div>
                     <div className="px-2 py-1 bg-slate-800 rounded border border-slate-700"><ArrowRight size={16}/></div>
                  </div>
                  <span>ROTATE</span>
               </div>
               <div className="flex flex-col items-center gap-1 col-span-2 md:col-span-1">
                  <div className="px-2 py-1 bg-slate-800 rounded border border-slate-700 font-bold">E</div>
                  <span>INITIATE SCAN</span>
               </div>
            </div>
          </div>
        );
      case GameMode.FLIGHT:
        return <SpaceFlight onScan={handleScan} currentMission={currentMission} onExit={handleExitGame} onOpenDatabase={handleOpenDatabase} isPaused={false} />;
      case GameMode.DATABASE:
        return <GalacticDatabase 
                  onSelectTopic={handleSelectTopic}
                  onBack={handleDatabaseBack}
                  topicData={databaseTopic}
                  isLoading={isDbLoading}
                  categoryTitle={selectedDbCategory}
               />;
      default:
        return null; // Scanning mode is handled by modal overlay
    }
  };


  return (
    <div className="relative min-h-screen text-slate-200 selection:bg-cyan-500/30 overflow-hidden">
      <StarField />

      {/* Render flight mode in background if scanning */}
      { (gameMode === GameMode.FLIGHT || gameMode === GameMode.SCANNING) && (
        <SpaceFlight 
            onScan={handleScan} 
            currentMission={currentMission}
            onExit={handleExitGame}
            onOpenDatabase={handleOpenDatabase}
            isPaused={gameMode === GameMode.SCANNING} // Pause physics/inputs when scanning
        />
      )}

      {renderContent()}

      {/* Modal Overlay for Scanning */}
      { gameMode === GameMode.SCANNING && (
         <ScanningModal 
            data={modalData} 
            isLoading={isModalLoading} 
            onClose={closeModal} 
            planetSize={scannedBody?.size}
            planetNameEng={scannedBody?.name}
            currentMission={currentMission} 
            allMissionsCompleted={allMissionsCompleted}
          />
      )}
    </div>
  );
};

export default App;
