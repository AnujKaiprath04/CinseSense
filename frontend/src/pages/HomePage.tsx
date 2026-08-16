import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Film, Star, Bookmark, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Movie, Recommendation, ContextualRow, WatchlistItem } from '../types';
import { fetchRecommendations, fetchContextualRows, fetchWatchlist, addToWatchlist, removeFromWatchlist, recordInteraction, fetchMovies } from '../api/client';
import { MovieCard } from '../components/MovieCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { ExplanationModal } from '../components/ExplanationModal';
import { OnboardingModal } from '../components/OnboardingModal';
import { MoodSelector } from '../components/MoodSelector';
import { TasteRadarChart } from '../components/TasteRadarChart';
import { QuickViewModal } from '../components/QuickViewModal';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [contextualRows, setContextualRows] = useState<ContextualRow[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [allCatalogMovies, setAllCatalogMovies] = useState<Movie[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [quickViewMovie, setQuickViewMovie] = useState<Movie | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    if (!currentUser) return;

    setIsLoading(true);

    const loadData = async () => {
      try {
        const [watchData, catalogData] = await Promise.all([
          fetchWatchlist(currentUser.id).catch(() => []),
          fetchMovies('', '', 'rating', selectedMood !== 'all' ? selectedMood : undefined).catch(() => []),
        ]);
        setWatchlist(watchData);
        setAllCatalogMovies(catalogData);

        try {
          const rowsData = await fetchContextualRows(currentUser.id);
          if (rowsData && rowsData.length > 0) {
            let finalRows = rowsData;
            if (selectedMood !== 'all') {
              finalRows = rowsData.map((r) => ({
                ...r,
                recommendations: r.recommendations.filter(
                  (rec) => rec.movie.mood === selectedMood || rec.movie.genres.toLowerCase().includes(selectedMood)
                ),
              })).filter((r) => r.recommendations.length > 0);
            }

            setContextualRows(finalRows.length > 0 ? finalRows : rowsData);

            const primaryRecs = rowsData[0].recommendations;
            if (primaryRecs.length > 0 && primaryRecs[0].confidence_level === 'LOW') {
              setShowOnboarding(true);
            }
            return;
          }
        } catch (e) {
          console.warn('Contextual rows fallback trigger', e);
        }

        const recs = await fetchRecommendations(currentUser.id, 12);
        if (recs && recs.length > 0) {
          setContextualRows([
            {
              row_title: 'Top Recommended for You',
              context_type: 'primary_recs',
              recommendations: recs,
            },
          ]);
          if (recs[0].confidence_level === 'LOW') {
            setShowOnboarding(true);
          }
        }
      } catch (err) {
        console.error('HomePage data load note', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentUser, selectedMood]);

  const watchlistMovieIds = new Set(watchlist.map((item) => item.movie_id));

  const handleToggleWatchlist = async (movie: Movie) => {
    if (!currentUser) return;

    try {
      if (watchlistMovieIds.has(movie.id)) {
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

  const handleSelectExplanation = (rec: Recommendation) => {
    setSelectedRec(rec);
    if (currentUser) {
      recordInteraction({
        user_id: currentUser.id,
        movie_id: rec.movie.id,
        action_type: 'click',
        retrieval_score: rec.retrieval_score,
        explanation_text: rec.explanation,
        confidence_level: rec.confidence_level,
        details: 'Opened explanation modal',
      });
    }
  };

  const handleFeedback = (action: 'like' | 'dismiss') => {
    if (!currentUser || !selectedRec) return;

    recordInteraction({
      user_id: currentUser.id,
      movie_id: selectedRec.movie.id,
      action_type: action,
      retrieval_score: selectedRec.retrieval_score,
      explanation_text: selectedRec.explanation,
      confidence_level: selectedRec.confidence_level,
      details: `User feedback: ${action}`,
    });

    if (action === 'dismiss') {
      setContextualRows((prev) =>
        prev.map((row) => ({
          ...row,
          recommendations: row.recommendations.filter((r) => r.movie.id !== selectedRec.movie.id),
        }))
      );
    }
    setSelectedRec(null);
  };

  const heroList = contextualRows.length > 0 && contextualRows[0].recommendations.length > 0
    ? contextualRows[0].recommendations
    : [];

  const heroRec = heroList.length > 0 ? heroList[heroIndex % heroList.length] : undefined;
  const heroMovie = heroRec ? heroRec.movie : allCatalogMovies[0];

  return (
    <div className="space-y-10 pb-16 w-full">
      {/* Cold-Start Onboarding Modal */}
      {showOnboarding && currentUser && (
        <OnboardingModal
          userId={currentUser.id}
          movies={allCatalogMovies}
          onComplete={() => {
            setShowOnboarding(false);
            if (currentUser) {
              fetchContextualRows(currentUser.id).then(setContextualRows).catch(console.error);
            }
          }}
        />
      )}

      {/* Explanation Detail Modal */}
      {selectedRec && (
        <ExplanationModal
          recommendation={selectedRec}
          onClose={() => setSelectedRec(null)}
          onFeedback={handleFeedback}
          isInWatchlist={watchlistMovieIds.has(selectedRec.movie.id)}
          onToggleWatchlist={() => handleToggleWatchlist(selectedRec.movie)}
        />
      )}

      {/* QuickView Preview Modal */}
      {quickViewMovie && (
        <QuickViewModal
          movie={quickViewMovie}
          isInWatchlist={watchlistMovieIds.has(quickViewMovie.id)}
          onToggleWatchlist={handleToggleWatchlist}
          onClose={() => setQuickViewMovie(null)}
          onNavigateDetails={(id) => navigate(`/movie/${id}`)}
        />
      )}

      {/* Top Grid: Hero Spotlight Carousel + Taste Radar Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch w-full">
        {/* Hero Spotlight Carousel */}
        {heroMovie && (
          <section className="lg:col-span-2 relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl min-h-[380px] sm:min-h-[460px] flex items-end group w-full">
            <img
              src={heroMovie.backdrop_url || heroMovie.poster_url}
              alt={heroMovie.title}
              className="absolute inset-0 w-full h-full object-cover opacity-50 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-darkBg via-darkBg/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-darkBg via-darkBg/80 to-transparent" />

            {/* Carousel Controls */}
            {heroList.length > 1 && (
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                <button
                  onClick={() => setHeroIndex((prev) => (prev > 0 ? prev - 1 : heroList.length - 1))}
                  className="p-2.5 rounded-full bg-black/60 hover:bg-brand-500 text-white hover:text-slate-950 backdrop-blur-md border border-white/10 transition-all shadow-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setHeroIndex((prev) => (prev + 1) % heroList.length)}
                  className="p-2.5 rounded-full bg-black/60 hover:bg-brand-500 text-white hover:text-slate-950 backdrop-blur-md border border-white/10 transition-all shadow-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="relative z-10 p-6 sm:p-10 max-w-3xl space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-brand-500 text-slate-950 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md shadow-brand-500/20">
                  <Sparkles className="w-3 h-3" /> Top Agent Match
                </span>
                <span className="text-xs font-semibold text-slate-300 bg-black/60 px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {heroMovie.average_rating.toFixed(1)}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                {heroMovie.title}
              </h1>

              {heroRec && (
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  "{heroRec.explanation}"
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => navigate(`/movie/${heroMovie.id}`)}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-brand-500/20 transition-all hover:scale-105"
                >
                  <Play className="w-4 h-4 fill-slate-950" /> Watch Movie
                </button>
                <button
                  onClick={() => heroRec && handleSelectExplanation(heroRec)}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm backdrop-blur-md transition-all"
                >
                  <Sparkles className="w-4 h-4 text-brand-500" /> Why Recommended?
                </button>
                <button
                  onClick={() => handleToggleWatchlist(heroMovie)}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm backdrop-blur-md transition-all"
                >
                  <Bookmark className="w-4 h-4" />
                  {watchlistMovieIds.has(heroMovie.id) ? 'Saved' : 'Watchlist'}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Taste Radar Chart Widget */}
        <div className="lg:col-span-1 flex flex-col justify-between">
          <TasteRadarChart />
        </div>
      </div>

      {/* Emotional Mood Selector */}
      <section className="pt-2 w-full">
        <MoodSelector
          selectedMood={selectedMood}
          onSelectMood={(m) => setSelectedMood(m)}
        />
      </section>

      {/* Contextual Rows Section - Full Widescreen Grid */}
      {isLoading ? (
        <div className="space-y-6 w-full">
          <div className="h-6 w-48 bg-slate-800 rounded animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 w-full">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </div>
        </div>
      ) : (
        contextualRows.map((row, idx) => (
          <section key={idx} className="space-y-4 pt-2 w-full">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-500" />
                  {row.row_title}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Explainable recommendations powered by CineSense Retriever & Explainer agents.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 w-full">
              {row.recommendations.map((rec) => (
                <MovieCard
                  key={rec.movie.id}
                  movie={rec.movie}
                  recommendation={rec}
                  isInWatchlist={watchlistMovieIds.has(rec.movie.id)}
                  onToggleWatchlist={handleToggleWatchlist}
                  onSelectExplanation={handleSelectExplanation}
                  onQuickView={(m) => setQuickViewMovie(m)}
                />
              ))}
            </div>
          </section>
        ))
      )}

      {/* Catalog Highlight Row - Full Widescreen Grid */}
      <section className="space-y-4 pt-4 border-t border-slate-800/80 w-full">
        <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
          <Film className="w-5 h-5 text-tealAccent-500" />
          Popular Highlights Across Catalog
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 w-full">
          {allCatalogMovies.slice(0, 6).map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              isInWatchlist={watchlistMovieIds.has(movie.id)}
              onToggleWatchlist={handleToggleWatchlist}
              onQuickView={(m) => setQuickViewMovie(m)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
