import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Bookmark, Compass, ShieldAlert, User as UserIcon, Sparkles, LogIn, LogOut, Bot, Users, Search, Brain } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AICoPilotDrawer } from './AICoPilotDrawer';
import { RAGAssistantDrawer } from './RAGAssistantDrawer';
import { CinePartyModal } from './CinePartyModal';
import { NotificationCenter } from './NotificationCenter';

interface NavbarProps {
  activeTab: 'home' | 'watchlist' | 'browse' | 'admin';
  setActiveTab: (tab: 'home' | 'watchlist' | 'browse' | 'admin') => void;
  watchlistCount: number;
  onOpenCommandPalette: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  watchlistCount,
  onOpenCommandPalette,
}) => {
  const navigate = useNavigate();
  const { currentUser, isLoggedIn, logout } = useAuth();
  const [showCoPilot, setShowCoPilot] = useState(false);
  const [showRAGAssistant, setShowRAGAssistant] = useState(false);
  const [showCineParty, setShowCineParty] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-darkBg/90 backdrop-blur-md border-b border-slate-800/80 transition-all w-full">
      {/* AI Co-Pilot Slide-Out Drawer */}
      <AICoPilotDrawer
        isOpen={showCoPilot}
        onClose={() => setShowCoPilot(false)}
        onToggleWatchlist={() => {}}
        watchlistMovieIds={new Set()}
      />

      {/* RAG Assistant Slide-Out Drawer */}
      <RAGAssistantDrawer
        isOpen={showRAGAssistant}
        onClose={() => setShowRAGAssistant(false)}
        onToggleWatchlist={() => {}}
        watchlistMovieIds={new Set()}
      />

      {/* CineParty Multi-User Matcher Modal */}
      {showCineParty && (
        <CinePartyModal
          onClose={() => setShowCineParty(false)}
          onToggleWatchlist={() => {}}
          watchlistMovieIds={new Set()}
        />
      )}

      {/* Navigation Header Bar - Full Edge to Edge */}
      <nav className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-3.5 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-amber-300 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Film className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight shimmer-text">
              Cine<span className="text-brand-500">Sense</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-brand-500" /> AI Agent
            </span>
          </div>
        </div>

        {/* Nav Links & AI Tools */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'home'
                ? 'bg-brand-500/10 text-brand-500 border border-brand-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">For You</span>
          </button>

          <button
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-all"
          >
            <Search className="w-3.5 h-3.5 text-brand-500" />
            <span>Search...</span>
            <span className="font-mono text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
              Ctrl+K
            </span>
          </button>

          <button
            onClick={() => setShowRAGAssistant(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500/20 to-brand-500/20 text-amber-300 border border-amber-500/40 hover:scale-105 transition-all shadow-lg"
          >
            <Brain className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">RAG AI Assistant</span>
          </button>

          <button
            onClick={() => setShowCoPilot(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-500/40 hover:scale-105 transition-all shadow-lg"
          >
            <Bot className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Vibe Search</span>
          </button>

          <button
            onClick={() => setShowCineParty(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-sm bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-300 border border-pink-500/40 hover:scale-105 transition-all shadow-lg"
          >
            <Users className="w-4 h-4 text-pink-400" />
            <span className="hidden sm:inline">CineParty</span>
          </button>

          <button
            onClick={() => setActiveTab('watchlist')}
            className={`relative flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'watchlist'
                ? 'bg-brand-500/10 text-brand-500 border border-brand-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span className="hidden sm:inline">Watchlist</span>
            {watchlistCount > 0 && (
              <span className="ml-1 bg-brand-500 text-slate-950 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {watchlistCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('browse')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'browse'
                ? 'bg-brand-500/10 text-brand-500 border border-brand-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="hidden sm:inline">Browse</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'admin'
                ? 'bg-brand-500/10 text-brand-500 border border-brand-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="hidden sm:inline">AI Audit Log</span>
          </button>
        </div>

        {/* User Switcher, Notification Bell & Auth Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <NotificationCenter />

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-1.5">
                <UserIcon className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0" />
                <span className="text-xs font-bold text-emerald-300">
                  {currentUser?.username}
                </span>
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-1 bg-slate-800 hover:bg-red-500/20 hover:text-red-300 border border-slate-700 hover:border-red-500/40 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-1.5 bg-gradient-to-r from-brand-500 to-amber-400 hover:from-brand-400 hover:to-amber-300 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-extrabold shadow-lg shadow-brand-500/20 transition-all hover:scale-105"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Register</span>
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};
