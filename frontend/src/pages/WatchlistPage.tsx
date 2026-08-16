import React, { useState, useEffect } from 'react';
import { Bookmark, Trash2, Film, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { WatchlistItem } from '../types';
import { fetchWatchlist, removeFromWatchlist } from '../api/client';
import { SkeletonCard } from '../components/SkeletonCard';

export const WatchlistPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    setIsLoading(true);

    fetchWatchlist(currentUser.id)
      .then(setItems)
      .catch((err) => console.error('Failed to load watchlist', err))
      .finally(() => setIsLoading(false));
  }, [currentUser]);

  const handleRemove = async (movieId: number) => {
    if (!currentUser) return;

    try {
      await removeFromWatchlist(currentUser.id, movieId);
      setItems((prev) => prev.filter((item) => item.movie_id !== movieId));
    } catch (err) {
      console.error('Failed to remove item from watchlist', err);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-brand-500" />
            My Saved Watchlist
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Persisted watchlist for {currentUser?.username || 'User'}.
          </p>
        </div>
        <span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-full border border-slate-700">
          {items.length} Saved Titles
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <SkeletonCard key={n} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-darkCard border border-slate-800 rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto my-12">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto border border-brand-500/20">
            <Film className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Your Watchlist is Empty</h3>
          <p className="text-xs text-slate-400">
            Click "+ Watchlist" on any recommended movie card to save titles to your personal collection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const movie = item.movie;
            if (!movie) return null;

            return (
              <div
                key={item.id}
                className="group relative bg-darkCard border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between"
              >
                <div className="relative h-60 w-full overflow-hidden bg-slate-900">
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-darkCard via-transparent to-black/30" />

                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-md text-amber-400 font-bold text-xs px-2.5 py-1 rounded-full border border-white/10">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{movie.average_rating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-100 line-clamp-1">
                      {movie.title}
                    </h3>
                    <span className="text-xs text-slate-400 mt-1 block">{movie.genres}</span>
                  </div>

                  <button
                    onClick={() => handleRemove(movie.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold text-xs bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove from Watchlist
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
