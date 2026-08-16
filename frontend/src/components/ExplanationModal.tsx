import React, { useState } from 'react';
import { X, Sparkles, ShieldCheck, ThumbsUp, ThumbsDown, Info, Bookmark, Star, Clock, UserCheck, Film } from 'lucide-react';
import { Recommendation } from '../types';
import { rateMovie } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface ExplanationModalProps {
  recommendation: Recommendation | null;
  onClose: () => void;
  onFeedback: (action: 'like' | 'dismiss') => void;
  isInWatchlist: boolean;
  onToggleWatchlist: () => void;
}

export const ExplanationModal: React.FC<ExplanationModalProps> = ({
  recommendation,
  onClose,
  onFeedback,
  isInWatchlist,
  onToggleWatchlist,
}) => {
  if (!recommendation) return null;

  const { currentUser } = useAuth();
  const { movie, retrieval_score, explanation, confidence_level, confidence_badge, context_reference } = recommendation;

  const [userRating, setUserRating] = useState<number | null>(null);
  const [isRatingSaved, setIsRatingSaved] = useState(false);

  const handleRate = async (score: number) => {
    if (!currentUser) return;
    setUserRating(score);

    try {
      await rateMovie(currentUser.id, movie.id, score);
      setIsRatingSaved(true);
      setTimeout(() => setIsRatingSaved(false), 3000);
    } catch (err) {
      console.error('Failed to rate movie', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-darkCard border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl shadow-brand-500/10 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header backdrop image */}
        <div className="relative h-48 sm:h-56 w-full bg-slate-900 overflow-hidden">
          <img
            src={movie.backdrop_url || movie.poster_url}
            alt={movie.title}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-darkCard via-darkCard/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 border border-white/20 text-slate-300 hover:text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-110"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Movie title & badges on header */}
          <div className="absolute bottom-4 left-6 right-6 z-10 flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                confidence_level === 'HIGH'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : confidence_level === 'MEDIUM'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {confidence_badge}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-black/60 text-slate-300 border border-white/10 flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {movie.average_rating.toFixed(1)}
              </span>
              {movie.duration_minutes && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-black/60 text-slate-300 border border-white/10 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" /> {movie.duration_minutes} min
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {movie.title}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* AI Explanation Box */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-900/90 border border-brand-500/30 rounded-2xl p-5 relative overflow-hidden shadow-inner">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-2 text-brand-500 font-bold text-sm mb-2">
              <Sparkles className="w-4 h-4" />
              <span>AI Explainer Rationale</span>
            </div>

            <p className="text-base text-slate-100 font-medium leading-relaxed italic">
              "{explanation}"
            </p>

            {context_reference && (
              <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-brand-500" />
                <span>{context_reference}</span>
              </div>
            )}
          </div>

          {/* Interactive Star Rating Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs">
              <span className="font-bold text-slate-200 block">Rate this title</span>
              <span className="text-slate-400">Updates your watch profile in real-time</span>
            </div>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  className="p-1 hover:scale-125 transition-transform"

                >
                  <Star
                    className={`w-6 h-6 ${
                      (userRating && star <= userRating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-600 hover:text-amber-300'
                    }`}
                  />
                </button>
              ))}
              {isRatingSaved && (
                <span className="text-xs font-bold text-emerald-400 ml-2 animate-fadeIn">
                  ✓ Saved!
                </span>
              )}
            </div>
          </div>

          {/* Director & Cast */}
          {(movie.director || movie.cast) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-900/40 p-4 rounded-2xl border border-slate-800/60">
              {movie.director && (
                <div>
                  <span className="text-slate-400 font-medium block">Director</span>
                  <span className="text-slate-200 font-bold">{movie.director}</span>
                </div>
              )}
              {movie.cast && (
                <div>
                  <span className="text-slate-400 font-medium block">Starring Cast</span>
                  <span className="text-slate-200 font-bold">{movie.cast}</span>
                </div>
              )}
            </div>
          )}

          {/* Responsible AI Metrics & Audit Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
                <span>Retriever Match Score</span>
                <span className="text-brand-500 font-bold">{(retrieval_score * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-brand-500 to-amber-300 rounded-full"
                  style={{ width: `${Math.min(retrieval_score * 100, 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Hybrid vector similarity (TF-IDF genre/overview match + rating similarity).
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Responsible AI Audit Tag</span>
              </div>
              <p className="text-xs text-slate-200 font-semibold mt-1">
                {confidence_level === 'HIGH' && 'Grounded in 5+ user ratings. High precision.'}
                {confidence_level === 'MEDIUM' && 'Grounded in user genre preferences & rating history.'}
                {confidence_level === 'LOW' && 'Cold-Start exploratory pick. No hallucinated history.'}
              </p>
            </div>
          </div>

          {/* Overview */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Synopsis
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {movie.overview || 'No overview available.'}
            </p>
          </div>

          {/* Feedback & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Helpful suggestion?</span>
              <button
                onClick={() => onFeedback('like')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-slate-700 text-xs font-medium transition-colors"
              >
                <ThumbsUp className="w-3.5 h-3.5" /> Like
              </button>
              <button
                onClick={() => onFeedback('dismiss')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-slate-700 text-xs font-medium transition-colors"
              >
                <ThumbsDown className="w-3.5 h-3.5" /> Dismiss
              </button>
            </div>

            <button
              onClick={onToggleWatchlist}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                isInWatchlist
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-brand-500 text-slate-950 hover:bg-brand-400 shadow-lg shadow-brand-500/20'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
