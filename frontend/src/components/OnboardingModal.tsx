import React, { useState } from 'react';
import { Star, Sparkles, CheckCircle2 } from 'lucide-react';
import { Movie } from '../types';
import { rateMovie } from '../api/client';

interface OnboardingModalProps {
  userId: number;
  movies: Movie[];
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ userId, movies, onComplete }) => {
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarClick = (movieId: number, score: number) => {
    setRatings((prev) => ({ ...prev, [movieId]: score }));
  };

  const sampleMovies = movies.slice(0, 4);
  const ratedCount = Object.keys(ratings).length;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      for (const [movieIdStr, score] of Object.entries(ratings)) {
        await rateMovie(userId, Number(movieIdStr), score);
      }
      onComplete();
    } catch (err) {
      console.error('Onboarding rating submit failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl bg-darkCard border border-brand-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-brand-500/10 flex flex-col gap-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-500 border border-brand-500/40 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Welcome to CineSense!</h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            Rate a few popular titles below so our Retriever & Explainer agents can build your personalized watch profile.
          </p>
        </div>

        {/* Movies Rating List */}
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
          {sampleMovies.map((movie) => {
            const currentRating = ratings[movie.id] || 0;

            return (
              <div
                key={movie.id}
                className="flex items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-12 h-16 object-cover rounded-xl bg-slate-800"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-100">{movie.title}</h4>
                    <span className="text-xs text-slate-400">{movie.genres}</span>
                  </div>
                </div>

                {/* Star rating picker */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleStarClick(movie.id, star)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= currentRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <span className="text-xs text-slate-400 font-medium">
            {ratedCount} of {sampleMovies.length} rated
          </span>

          <div className="flex gap-3">
            <button
              onClick={onComplete}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Skip for now
            </button>

            <button
              onClick={handleSubmit}
              disabled={ratedCount === 0 || isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-500 text-slate-950 font-bold text-xs hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-500/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Saving Profile...' : 'Personalize My Feed'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
