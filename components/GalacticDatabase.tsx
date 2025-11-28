
import React from 'react';
import { DatabaseTopic } from '../types';
import { DATABASE_CATEGORIES } from '../constants';
import { ArrowLeft, LoaderCircle, BookOpen, Share2, Star, List } from 'lucide-react';

interface GalacticDatabaseProps {
  onSelectTopic: (topicId: string) => void;
  onBack: () => void;
  topicData: DatabaseTopic | null;
  isLoading: boolean;
  categoryTitle: string | null;
}

const GalacticDatabase: React.FC<GalacticDatabaseProps> = ({
  onSelectTopic,
  onBack,
  topicData,
  isLoading,
  categoryTitle,
}) => {
  return (
    <div className="absolute inset-0 z-20 bg-[#020617] flex flex-col p-4 md:p-8 overflow-hidden animate-in fade-in duration-500">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px]"></div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6 shrink-0 relative z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className={`group p-3 rounded-full border transition-all active:scale-95 flex items-center gap-2 ${
                topicData 
                ? "bg-slate-900 border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-950 text-cyan-400" 
                : "bg-red-900/20 border-red-500/30 hover:bg-red-900/40 text-red-400"
            }`}
          >
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold font-sci-fi hidden md:inline">
                {topicData ? 'BACK TO CATEGORIES' : 'EXIT DATABASE'}
            </span>
          </button>
          <div>
            <h1 className="text-3xl md:text-5xl font-sci-fi font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
              GALACTIC ARCHIVES
            </h1>
            <p className="text-slate-400 text-sm font-mono tracking-widest uppercase flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full animate-pulse ${topicData ? 'bg-green-500' : 'bg-cyan-500'}`}></span>
              {categoryTitle ? `ACCESSING: ${categoryTitle}` : 'SYSTEM READY // SELECT CATEGORY'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2 relative z-10 pb-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-cyan-400 gap-6">
            <div className="relative">
                <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 animate-pulse"></div>
                <LoaderCircle size={64} className="animate-spin text-cyan-400 relative z-10" />
            </div>
            <p className="font-mono text-lg tracking-widest animate-pulse">DECRYPTING DATA STREAM...</p>
          </div>
        ) : topicData ? (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-500 max-w-7xl mx-auto">
            
            {/* Hero Section */}
            <div className="relative w-full aspect-[21/9] md:aspect-[3/1] rounded-2xl overflow-hidden mb-8 shadow-2xl shadow-black/80 border border-cyan-500/30 group bg-slate-900">
              {topicData.imageUrl ? (
                <img 
                    src={topicData.imageUrl} 
                    alt={topicData.title} 
                    className="w-full h-full object-cover transition-transform duration-[20s] group-hover:scale-110 opacity-90" 
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1000"; // Fallback
                    }}
                />
              ) : (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500 font-mono">
                    <span className="flex items-center gap-2"><LoaderCircle className="animate-spin"/> LOADING VISUALS...</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/90 via-[#020617]/40 to-transparent" />
              
              <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 max-w-3xl pr-4">
                  <div className="inline-block px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-cyan-300 text-xs font-bold mb-3 backdrop-blur-md">
                      CONFIDENTIAL CLEARANCE: LEVEL 5
                  </div>
                  <h2 className="text-3xl md:text-6xl font-bold font-sci-fi text-white mb-4 drop-shadow-lg leading-tight">
                    {topicData.title}
                  </h2>
                  <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border-l-4 border-cyan-500">
                    <p className="text-sm md:text-lg text-slate-200 leading-relaxed font-light">
                        {topicData.content}
                    </p>
                  </div>
              </div>
            </div>

            {/* Structured Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                {topicData.sections && topicData.sections.length > 0 ? (
                    topicData.sections.map((section, idx) => (
                        <div 
                            key={idx}
                            className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/60 hover:border-cyan-500/50 transition-all duration-300 group hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-sm relative overflow-hidden"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                                <span className="text-6xl">{section.icon || '🚀'}</span>
                            </div>
                            <div className="flex items-start gap-4 relative z-10">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-600/20 to-purple-600/20 flex items-center justify-center text-2xl border border-white/10 group-hover:scale-110 transition-transform shadow-lg shrink-0">
                                    {section.icon || '🚀'}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-cyan-100 mb-2 font-sci-fi group-hover:text-cyan-400 transition-colors">
                                        {section.title}
                                    </h3>
                                    <p className="text-slate-300 leading-relaxed text-sm">
                                        {section.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                   <div className="col-span-2 text-center text-slate-500 py-10 font-mono">End of File.</div>
                )}
            </div>

          </div>
        ) : (
          /* Category Selection Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-300 max-w-7xl mx-auto">
            {DATABASE_CATEGORIES.map((cat, idx) => (
              <button 
                key={cat.id} 
                onClick={() => onSelectTopic(cat.id)}
                className="relative bg-slate-900/40 border border-slate-700/50 rounded-xl p-6 text-left flex flex-col items-start gap-4 hover:border-cyan-500 hover:bg-slate-800/80 hover:-translate-y-2 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] transition-all duration-300 group overflow-hidden"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all relative z-10">
                  <cat.icon className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-lg font-bold font-sci-fi text-white group-hover:text-cyan-300 transition-colors">
                    {cat.title}
                  </h3>
                  <div className="h-[1px] w-12 bg-slate-700 my-3 group-hover:w-full group-hover:bg-cyan-500/50 transition-all duration-500"></div>
                  <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300">
                    {cat.description}
                  </p>
                </div>

                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(6, 182, 212, 0.2); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(6, 182, 212, 0.6); }
      `}</style>
    </div>
  );
};

export default GalacticDatabase;
