import React, { useState, useEffect } from 'react';
import { Search, Compass, ArrowUpDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Movie, WatchlistItem } from '../types';
import { fetchMovies, fetchGenres, fetchWatchlist, addToWatchlist, removeFromWatchlist } from '../api/client';
import { MovieCard } from '../components/MovieCard';
import { SkeletonCard } from '../components/SkeletonCard';

export const BrowsePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('rating');
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGenres().then(setGenres).catch(console.error);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchMovies(searchQuery, selectedGenre, sortBy)
      .then(setMovies)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [searchQuery, selectedGenre, sortBy]);

  useEffect(() => {
    if (currentUser) {
      fetchWatchlist(currentUser.id).then(setWatchlist).catch(console.error);
    }
  }, [currentUser]);

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

  return (
    <div className="space-y-6 pb-16 w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
          <Compass className="w-6 h-6 text-brand-500" />
          Explore & Search Movie Catalog
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Search by title, director, cast, or overview across all 5,000+ titles.
        </p>
      </div>

      {/* Controls Bar: Search, Sorting & Genre Pills */}
      <div className="space-y-4 w-full">
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between w-full">
          {/* Search Bar */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, director, cast, or keyword..."
              className="w-full bg-darkCard border border-slate-800 rounded-2xl pl-11 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500/60 shadow-inner"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-darkCard border border-slate-800 rounded-2xl px-3 py-2 self-end sm:self-auto">
            <ArrowUpDown className="w-4 h-4 text-brand-500 flex-shrink-0" />
            <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="rating" className="bg-slate-900">Highest Rated</option>
              <option value="year_newest" className="bg-slate-900">Release Year (Newest)</option>
              <option value="year_oldest" className="bg-slate-900">Release Year (Oldest)</option>
              <option value="title" className="bg-slate-900">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Genre Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin w-full">
          <button
            onClick={() => setSelectedGenre('')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
              selectedGenre === ''
                ? 'bg-brand-500 text-slate-950 shadow-md shadow-brand-500/20'
                : 'bg-darkCard text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            All Genres
          </button>
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
                selectedGenre === g
                  ? 'bg-brand-500 text-slate-950 shadow-md shadow-brand-500/20'
                  : 'bg-darkCard text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Movies Grid - Full Widescreen Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
            <SkeletonCard key={n} />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="bg-darkCard border border-slate-800 rounded-3xl p-12 text-center text-slate-400 max-w-md mx-auto my-8">
          No movies matching your search or genre filter.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 w-full">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              isInWatchlist={watchlistMovieIds.has(movie.id)}
              onToggleWatchlist={handleToggleWatchlist}
            />
          ))}
        </div>
      )}
    </div>
  );
};
