import React, { useState } from 'react';
import { X, Play, Star, Bookmark, Check, Sparkles, Film, Clock } from 'lucide-react';
import { Movie, Recommendation } from '../types';

interface QuickViewModalProps {
  movie: Movie;
  recommendation?: Recommendation;
  isInWatchlist: boolean;
  onToggleWatchlist: (movie: Movie) => void;
  onClose: () => void;
  onNavigateDetails: (movieId: number) => void;
}

const DEFAULT_POSTER = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80';

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  movie,
  recommendation,
  isInWatchlist,
  onToggleWatchlist,
  onClose,
  onNavigateDetails,
}) => {
  const [showTrailer, setShowTrailer] = useState(false);
  const genresList = movie.genres ? movie.genres.split(',').map((g) => g.trim()) : [];

  return (
    <aside className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl glass-modal rounded-3xl overflow-hidden shadow-2xl relative border border-slate-700/80 space-y-0">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-slate-300 hover:text-white bg-black/60 p-2 rounded-full backdrop-blur-md border border-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Hero / Trailer */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-950 overflow-hidden">
          {showTrailer && movie.trailer_url ? (
            <iframe
              src={`${movie.trailer_url}?autoplay=1&mute=0`}
              title={movie.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <>
              <img
                src={movie.backdrop_url || movie.poster_url || DEFAULT_POSTER}
                alt={movie.title}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => setShowTrailer(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-sm shadow-xl shadow-brand-500/30 transition-all hover:scale-105"
                >
                  <Play className="w-5 h-5 fill-slate-950" /> Watch HD Trailer
                </button>
              </div>
            </>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 bg-slate-950">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-black text-white">{movie.title}</h2>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1 font-bold text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" /> {movie.average_rating.toFixed(1)}
                </span>
                {movie.release_year && <span>{movie.release_year}</span>}
                {movie.duration_minutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {movie.duration_minutes}m
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleWatchlist(movie)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isInWatchlist
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-brand-500 text-slate-950 hover:bg-brand-400'
                }`}
              >
                {isInWatchlist ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                {isInWatchlist ? 'In Watchlist' : 'Add Watchlist'}
              </button>
              <button
                onClick={() => {
                  onClose();
                  onNavigateDetails(movie.id);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700"
              >
                <Film className="w-4 h-4 text-brand-500" /> Full Details
              </button>
            </div>
          </div>

          {/* Genre Pills */}
          <div className="flex flex-wrap gap-1.5">
            {genresList.map((g, idx) => (
              <span
                key={idx}
                className="text-xs font-medium bg-slate-900 text-slate-300 px-3 py-1 rounded-lg border border-slate-800"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Overview */}
          <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
            {movie.overview || 'No synopsis available.'}
          </p>

          {/* Rationale if present */}
          {recommendation && (
            <div className="bg-slate-900/90 border border-brand-500/30 rounded-2xl p-3.5 space-y-1">
              <span className="text-[11px] font-extrabold text-brand-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> CineSense Agent Rationale
              </span>
              <p className="text-xs text-slate-200 italic leading-relaxed">
                "{recommendation.explanation}"
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
