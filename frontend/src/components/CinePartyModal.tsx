import React, { useState } from 'react';
import { X, Users, Sparkles, Heart, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Movie, Recommendation } from '../types';
import { MovieCard } from './MovieCard';
import axios from 'axios';

interface CinePartyModalProps {
  onClose: () => void;
  onToggleWatchlist: (movie: Movie) => void;
  watchlistMovieIds: Set<number>;
}

export const CinePartyModal: React.FC<CinePartyModalProps> = ({
  onClose,
  onToggleWatchlist,
  watchlistMovieIds,
}) => {
  const { users } = useAuth();
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>(users.slice(0, 2).map((u) => u.id));
  const [isLoading, setIsLoading] = useState(false);
  const [partyResult, setPartyResult] = useState<{
    compatibility_score: number;
    shared_genres: string[];
    group_rationale: string;
    recommendations: Recommendation[];
  } | null>(null);

  const toggleUserSelection = (userId: number) => {
    if (selectedUserIds.includes(userId)) {
      if (selectedUserIds.length > 2) {
        setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
      }
    } else {
      setSelectedUserIds((prev) => [...prev, userId]);
    }
  };

  const handleMatchParty = async () => {
    if (selectedUserIds.length < 2) return;
    setIsLoading(true);

    try {
      const res = await axios.post('/api/recommendations/cineparty', {
        user_ids: selectedUserIds,
      });
      setPartyResult(res.data);
    } catch (err) {
      console.error('CineParty match error', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl glass-modal rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative border border-slate-700/80 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center shadow-lg shadow-pink-500/20">
            <Users className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              CineParty Taste Matcher <Sparkles className="w-5 h-5 text-pink-400" />
            </h2>
            <p className="text-xs text-slate-400">
              Select 2 or more profiles to find movies everyone in your group will love!
            </p>
          </div>
        </div>

        {/* Profile Selector Chips */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300 block">
            Select Watch Party Members:
          </label>
          <div className="flex flex-wrap gap-2">
            {users.slice(0, 8).map((u) => {
              const isSelected = selectedUserIds.includes(u.id);
              return (
                <button
                  key={u.id}
                  onClick={() => toggleUserSelection(u.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md border border-white/20'
                      : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  <span>{u.username}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleMatchParty}
          disabled={isLoading || selectedUserIds.length < 2}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-extrabold text-sm shadow-xl shadow-pink-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Heart className="w-4 h-4 fill-white" /> Calculate Group Taste Match
        </button>

        {/* Results View */}
        {isLoading ? (
          <div className="py-8 text-center text-xs text-pink-400 font-semibold italic animate-pulse">
            ✨ Blending SVD latent embeddings across {selectedUserIds.length} profiles...
          </div>
        ) : partyResult ? (
          <div className="space-y-6 pt-4 border-t border-slate-800">
            {/* Score Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-900/90 border border-pink-500/40 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs font-extrabold uppercase tracking-wider text-pink-400 block">
                  Group Compatibility Score
                </span>
                <p className="text-xs text-slate-300 leading-relaxed italic max-w-lg">
                  "{partyResult.group_rationale}"
                </p>
              </div>

              <div className="text-center bg-black/50 px-6 py-3 rounded-2xl border border-pink-500/30 flex-shrink-0">
                <span className="text-3xl font-black text-pink-400">
                  {partyResult.compatibility_score}%
                </span>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  Match Rating
                </span>
              </div>
            </div>

            {/* Shared Genres */}
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-2">
                Shared Favorite Genres:
              </span>
              <div className="flex flex-wrap gap-2">
                {partyResult.shared_genres.map((g, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold bg-pink-500/20 text-pink-300 px-3 py-1 rounded-full border border-pink-500/30"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* Consensus Recommendations */}
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-white">
                Consensus Recommendations for Your Party:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {partyResult.recommendations.map((rec) => (
                  <MovieCard
                    key={rec.movie.id}
                    movie={rec.movie}
                    recommendation={rec}
                    isInWatchlist={watchlistMovieIds.has(rec.movie.id)}
                    onToggleWatchlist={onToggleWatchlist}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
};
