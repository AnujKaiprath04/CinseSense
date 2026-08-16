import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Plus, Check, Sparkles, HelpCircle, Eye } from 'lucide-react';
import { Movie, Recommendation } from '../types';

interface MovieCardProps {
  movie: Movie;
  recommendation?: Recommendation;
  isInWatchlist: boolean;
  onToggleWatchlist: (movie: Movie) => void;
  onSelectExplanation?: (rec: Recommendation) => void;
  onQuickView?: (movie: Movie) => void;
}

const DEFAULT_POSTER = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80';

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  recommendation,
  isInWatchlist,
  onToggleWatchlist,
  onSelectExplanation,
  onQuickView,
}) => {
  const navigate = useNavigate();
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const genresList = movie.genres ? movie.genres.split(',').map((g) => g.trim()) : [];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const centerX = box.width / 2;
    const centerY = box.height / 2;

    const rotateX = (centerY - y) / 16;
    const rotateY = (x - centerX) / 16;

    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  const handleCardClick = () => {
    if (onSelectExplanation && recommendation) {
      onSelectExplanation(recommendation);
    } else {
      navigate(`/movie/${movie.id}`);
    }
  };

  const renderConfidenceBadge = () => {
    if (!recommendation) return null;

    const { confidence_level, confidence_badge } = recommendation;

    if (confidence_level === 'HIGH') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          {confidence_badge}
        </span>
      );
    } else if (confidence_level === 'MEDIUM') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30">
          <Sparkles className="w-3 h-3 text-teal-300" />
          {confidence_badge}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 animate-pulse">
          <HelpCircle className="w-3 h-3 text-amber-400" />
          {confidence_badge}
        </span>
      );
    }
  };

  return (
    <div className="tilt-container">
      <article
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        }}
        className="group relative glass-card tilt-card rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between"
      >
        <div className="ambient-glow" />

        {/* Poster & Badges Overlay */}
        <figure
          onClick={handleCardClick}
          className="relative h-60 w-full overflow-hidden bg-slate-900 cursor-pointer m-0"
        >
          <img
            src={movie.poster_url || DEFAULT_POSTER}
            alt={movie.title}
            onError={(e) => {
              e.currentTarget.src = DEFAULT_POSTER;
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-darkBg via-transparent to-black/30" />

          {/* Confidence Badge */}
          <div className="absolute top-3 left-3 z-10">
            {renderConfidenceBadge()}
          </div>

          {/* Rating pill */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-black/60 backdrop-blur-md text-amber-400 font-bold text-xs px-2.5 py-1 rounded-full border border-white/10">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{movie.average_rating.toFixed(1)}</span>
          </div>

          {/* QuickView Eye Overlay Button */}
          {onQuickView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(movie);
              }}
              className="absolute bottom-3 right-3 z-20 p-2 rounded-xl bg-black/70 hover:bg-brand-500 text-slate-200 hover:text-slate-950 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
              title="Quick Preview"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </figure>

        {/* Card Body */}
        <div className="p-4 flex flex-col flex-1 justify-between gap-3">
          <div>
            <div
              onClick={handleCardClick}
              className="flex items-baseline justify-between gap-2 cursor-pointer"
            >
              <h3 className="font-bold text-base text-slate-100 line-clamp-1 group-hover:text-brand-500 transition-colors">
                {movie.title}
              </h3>
              {movie.release_year && (
                <span className="text-xs font-medium text-slate-400 flex-shrink-0">
                  {movie.release_year}
                </span>
              )}
            </div>

            {/* Genre tags */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {genresList.slice(0, 3).map((g, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-medium bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/50"
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Short rationale snippet if recommendation provided */}
            {recommendation && (
              <div
                onClick={handleCardClick}
                className="mt-3 bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 cursor-pointer hover:border-brand-500/40 transition-colors group/rationale"
              >
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed italic">
                  "{recommendation.explanation}"
                </p>
              </div>
            )}
          </div>

          {/* Card Footer Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
            <button
              onClick={() => onToggleWatchlist(movie)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold text-xs transition-all ${
                isInWatchlist
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-brand-500 text-slate-950 hover:bg-brand-400 font-bold shadow-md shadow-brand-500/20'
              }`}
            >
              {isInWatchlist ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Saved
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" /> Watchlist
                </>
              )}
            </button>
          </div>
        </div>
      </article>
    </div>
  );
};
