import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MovieCard } from '../components/MovieCard';
import { Movie, Recommendation } from '../types';

const mockMovie: Movie = {
  id: 1,
  title: 'Inception',
  genres: 'Action,Sci-Fi',
  release_year: 2010,
  overview: 'Dream thief movie.',
  poster_url: 'http://example.com/poster.jpg',
  average_rating: 4.8,
  rating_count: 100,
};

const mockRec: Recommendation = {
  movie: mockMovie,
  retrieval_score: 0.95,
  explanation: 'Because you enjoyed sci-fi thrillers, Inception is a top match.',
  confidence_level: 'HIGH',
  confidence_badge: 'High Match',
  is_exploratory: false,
};

describe('MovieCard Component', () => {
  it('renders title, rating, and rationale explanation preview', () => {
    render(
      <MovieCard
        movie={mockMovie}
        recommendation={mockRec}
        isInWatchlist={false}
        onToggleWatchlist={vi.fn()}
        onSelectExplanation={vi.fn()}
      />
    );

    expect(screen.getByText('Inception')).toBeInDocument();
    expect(screen.getByText('4.8')).toBeInDocument();
    expect(screen.getByText(/"Because you enjoyed sci-fi thrillers, Inception is a top match."/)).toBeInDocument();
    expect(screen.getByText('High Match')).toBeInDocument();
  });

  it('triggers watchlist callback when toggle button is clicked', () => {
    const handleToggle = vi.fn();
    render(
      <MovieCard
        movie={mockMovie}
        recommendation={mockRec}
        isInWatchlist={false}
        onToggleWatchlist={handleToggle}
      />
    );

    const btn = screen.getByRole('button', { name: /watchlist/i });
    fireEvent.click(btn);
    expect(handleToggle).toHaveBeenCalledWith(mockMovie);
  });
});
