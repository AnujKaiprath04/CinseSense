import React from 'react';
import { Sparkles, Compass, Bookmark, Search, Bot, ShieldAlert } from 'lucide-react';

interface MobileBottomDockProps {
  activeTab: 'home' | 'watchlist' | 'browse' | 'admin';
  setActiveTab: (tab: 'home' | 'watchlist' | 'browse' | 'admin') => void;
  onOpenCommandPalette: () => void;
  onOpenCoPilot: () => void;
  watchlistCount: number;
}

export const MobileBottomDock: React.FC<MobileBottomDockProps> = ({
  activeTab,
  setActiveTab,
  onOpenCommandPalette,
  onOpenCoPilot,
  watchlistCount,
}) => {
  return (
    <div className="sm:hidden fixed bottom-4 left-4 right-4 z-40">
      <nav className="bottom-dock-glass rounded-2xl p-2 flex items-center justify-around shadow-2xl border border-white/10">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition-all ${
            activeTab === 'home' ? 'text-brand-500 bg-brand-500/10' : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>For You</span>
        </button>

        <button
          onClick={onOpenCoPilot}
          className="flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold text-purple-400 bg-purple-500/10"
        >
          <Bot className="w-5 h-5 text-purple-400" />
          <span>Co-Pilot</span>
        </button>

        <button
          onClick={onOpenCommandPalette}
          className="flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold text-amber-400 bg-amber-500/10"
        >
          <Search className="w-5 h-5 text-amber-400" />
          <span>Search</span>
        </button>

        <button
          onClick={() => setActiveTab('watchlist')}
          className={`relative flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition-all ${
            activeTab === 'watchlist' ? 'text-brand-500 bg-brand-500/10' : 'text-slate-400'
          }`}
        >
          <Bookmark className="w-5 h-5" />
          <span>Watchlist</span>
          {watchlistCount > 0 && (
            <span className="absolute top-1 right-1 bg-brand-500 text-slate-950 text-[9px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {watchlistCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('browse')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition-all ${
            activeTab === 'browse' ? 'text-brand-500 bg-brand-500/10' : 'text-slate-400'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Browse</span>
        </button>
      </nav>
    </div>
  );
};
