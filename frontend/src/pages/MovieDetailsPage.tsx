import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Sparkles, Star, Bookmark, ArrowLeft, Clock, ShieldCheck, Play, Film, Info, Volume2 } from 'lucide-react';
import { Movie, Recommendation, WatchlistItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { fetchMovies, fetchRecommendations, fetchWatchlist, addToWatchlist, removeFromWatchlist, rateMovie, recordInteraction } from '../api/client';
import { MovieCard } from '../components/MovieCard';
import { EmotionHeatmap } from '../components/EmotionHeatmap';

export const MovieDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const movieId = Number(id);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isRatingSaved, setIsRatingSaved] = useState(false);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);

  useEffect(() => {
    if (!movieId) return;

    setIsLoading(true);

    const loadData = async () => {
      try {
        const allMovies = await fetchMovies('', '', 'rating');
        const found = allMovies.find((m) => m.id === movieId);
        if (found) {
          setMovie(found);
        }

        if (currentUser) {
          const [recs, watchData] = await Promise.all([
            fetchRecommendations(currentUser.id, 12).catch(() => []),
            fetchWatchlist(currentUser.id).catch(() => []),
          ]);
          setWatchlist(watchData);

          const recFound = recs.find((r) => r.movie.id === movieId);
          if (recFound) {
            setRecommendation(recFound);
          }

          const filtered = allMovies.filter((m) => m.id !== movieId).slice(0, 4);
          setSimilarMovies(filtered);
        }
      } catch (err) {
        console.error('Failed to load movie details', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [movieId, currentUser]);

  const watchlistMovieIds = new Set(watchlist.map((item) => item.movie_id));
  const isInWatchlist = movie ? watchlistMovieIds.has(movie.id) : false;

  const handleToggleWatchlist = async () => {
    if (!currentUser || !movie) return;

    try {
      if (isInWatchlist) {
        await removeFromWatchlist(currentUser.id, movie.id);
        setWatchlist((prev) => prev.filter((item) => item.movie_id !== movie.id));
      } else {
        const newItem = await addToWatchlist(currentUser.id, movie.id);
        setWatchlist((prev) => [newItem, ...prev]);
      }
    } catch (err) {
      console.error('Watchlist toggle failed', err);
    }
  };

  const handleRate = async (score: number) => {
    if (!currentUser || !movie) return;
    setUserRating(score);

    try {
      await rateMovie(currentUser.id, movie.id, score);
      setIsRatingSaved(true);
      setTimeout(() => setIsRatingSaved(false), 3000);
    } catch (err) {
      console.error('Failed to rate movie', err);
    }
  };

  const getTrailerEmbedUrl = (title: string) => {
    const encoded = encodeURIComponent(`${title} official trailer`);
    return `https://www.youtube.com/embed?listType=search&list=${encoded}&autoplay=1`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-16">
        <div className="h-64 w-full bg-slate-900 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-2xl font-bold text-white">Movie Not Found</h2>
        <button
          onClick={() => navigate('/browse')}
          className="px-4 py-2 bg-brand-500 text-slate-950 font-bold rounded-xl text-xs"
        >
          Back to Browse
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <span>/</span>
        <span className="text-brand-500 font-bold">{movie.title}</span>
      </div>

      {/* Cinema Backdrop / HD Video Player Section */}
      <section className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl min-h-[380px] sm:min-h-[460px] flex items-end">
        {isPlayingTrailer ? (
          <div className="absolute inset-0 w-full h-full z-20 bg-black">
            <iframe
              src={movie.trailer_url || getTrailerEmbedUrl(movie.title)}
              title={`${movie.title} Official Trailer`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <button
              onClick={() => setIsPlayingTrailer(false)}
              className="absolute top-4 right-4 z-30 bg-black/80 text-white font-bold text-xs px-3.5 py-2 rounded-xl border border-white/20 hover:bg-slate-800"
            >
              ✕ Close Trailer
            </button>
          </div>
        ) : (
          <>
            <img
              src={movie.backdrop_url || movie.poster_url}
              alt={movie.title}
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-darkBg via-darkBg/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-darkBg via-darkBg/80 to-transparent" />

            <div className="relative z-10 p-6 sm:p-10 max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {recommendation && (
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    recommendation.confidence_level === 'HIGH'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : recommendation.confidence_level === 'MEDIUM'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {recommendation.confidence_badge}
                  </span>
                )}
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-black/60 text-slate-300 border border-white/10 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {movie.average_rating.toFixed(1)} ({movie.rating_count} ratings)
                </span>
                {movie.duration_minutes && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-black/60 text-slate-300 border border-white/10 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {movie.duration_minutes} min
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                {movie.title}
              </h1>

              <div className="flex flex-wrap gap-2">
                {movie.genres.split(',').map((g, idx) => (
                  <span key={idx} className="text-xs font-semibold bg-slate-800/80 text-slate-300 px-3 py-1 rounded-lg border border-slate-700">
                    {g.trim()}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setIsPlayingTrailer(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-brand-500/20 transition-all hover:scale-105"
                >
                  <Play className="w-4 h-4 fill-slate-950" /> Watch HD Trailer
                </button>

                <button
                  onClick={handleToggleWatchlist}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                    isInWatchlist
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  {isInWatchlist ? 'Saved in Watchlist' : 'Add to Watchlist'}
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: AI Explanation, Synopsis & Emotion Heatmap */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Explainer Panel */}
          {recommendation && (
            <div className="bg-gradient-to-r from-slate-900 to-slate-900/90 border border-brand-500/40 rounded-3xl p-6 relative overflow-hidden shadow-xl">
              <div className="flex items-center gap-2 text-brand-500 font-bold text-sm mb-3">
                <Sparkles className="w-5 h-5" />
                <span>CineSense Explainer Agent Rationale</span>
              </div>

              <p className="text-lg text-slate-100 font-medium leading-relaxed italic">
                "{recommendation.explanation}"
              </p>

              {recommendation.context_reference && (
                <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-brand-500" />
                  <span>{recommendation.context_reference}</span>
                </div>
              )}
            </div>
          )}

          {/* Interactive Star Rating */}
          <div className="bg-darkCard border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Your Rating for {movie.title}</h3>
              <p className="text-xs text-slate-400">Rate this title to update your recommendation profile</p>
            </div>

            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  className="p-1 hover:scale-125 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      userRating && star <= userRating
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

          {/* Synopsis */}
          <div className="bg-darkCard border border-slate-800 rounded-3xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Synopsis
            </h3>
            <p className="text-slate-200 text-base leading-relaxed">
              {movie.overview || 'No synopsis available.'}
            </p>
          </div>

          {/* Phase 6: AI Scene Emotion Heatmap */}
          <EmotionHeatmap movieTitle={movie.title} />
        </div>

        {/* Right Column: Cinema Details */}
        <div className="space-y-6">
          <div className="bg-darkCard border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
              Cinema Details
            </h3>

            {movie.director && (
              <div>
                <span className="text-xs text-slate-400 block font-medium">Director</span>
                <span className="text-sm text-slate-100 font-bold">{movie.director}</span>
              </div>
            )}

            {movie.cast && (
              <div>
                <span className="text-xs text-slate-400 block font-medium">Starring Cast</span>
                <span className="text-sm text-slate-100 font-bold">{movie.cast}</span>
              </div>
            )}

            {movie.release_year && (
              <div>
                <span className="text-xs text-slate-400 block font-medium">Release Year</span>
                <span className="text-sm text-slate-100 font-bold">{movie.release_year}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Similar Movies Row */}
      {similarMovies.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-slate-800">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-brand-500" />
            Similar Movies You Might Like
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {similarMovies.map((m) => (
              <MovieCard
                key={m.id}
                movie={m}
                isInWatchlist={watchlistMovieIds.has(m.id)}
                onToggleWatchlist={() => {}}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
