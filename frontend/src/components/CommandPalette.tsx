import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Film, Bookmark, Compass, ShieldAlert, Bot, Users, ArrowRight, X } from 'lucide-react';
import { Movie } from '../types';
import { fetchMovies } from '../api/client';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: 'home' | 'watchlist' | 'browse' | 'admin') => void;
  onOpenCoPilot: () => void;
  onOpenCineParty: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenCoPilot,
  onOpenCineParty,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await fetchMovies(query.trim(), '', 'rating');
        setSearchResults(data.slice(0, 5));
      } catch (err) {
        console.error('Command Palette search failed', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <aside className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl glass-modal rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 space-y-0">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/90">
          <Search className="w-5 h-5 text-brand-500 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a movie title, genre, or page command (e.g. 'Sci-Fi', 'Watchlist')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-1 rounded-md border border-slate-700">
            ESC
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Stream */}
        <div className="p-3 max-h-96 overflow-y-auto space-y-3 custom-scrollbar">
          {/* Quick AI & Page Actions */}
          {!query.trim() && (
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2">
                Quick Commands:
              </span>
              <div className="grid grid-cols-1 gap-1">
                <button
                  onClick={() => {
                    onClose();
                    onOpenCoPilot();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left text-xs text-purple-300 font-bold transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Bot className="w-4 h-4 text-purple-400" />
                    <span>Launch AI Co-Pilot Vibe Search</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenCineParty();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left text-xs text-pink-300 font-bold transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-pink-400" />
                    <span>Launch CineParty Taste Matcher</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onNavigateTab('browse');
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left text-xs text-slate-200 font-bold transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Compass className="w-4 h-4 text-tealAccent-500" />
                    <span>Browse 5,200 Movie Catalog</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>
          )}

          {/* Movie Search Results */}
          {query.trim() && (
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2">
                Movie Results ({searchResults.length})
              </span>

              {isLoading ? (
                <div className="p-4 text-center text-xs text-brand-500 animate-pulse">
                  Searching catalog...
                </div>
              ) : searchResults.length === 0 ? (
                <p className="p-4 text-center text-xs text-slate-400">
                  No movies found matching '{query}'.
                </p>
              ) : (
                searchResults.map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => {
                      onClose();
                      navigate(`/movie/${movie.id}`);
                    }}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-colors group"
                  >
                    <img
                      src={movie.poster_url}
                      alt={movie.title}
                      className="w-9 h-12 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white group-hover:text-brand-500 truncate">
                        {movie.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate">{movie.genres}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 flex-shrink-0" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
