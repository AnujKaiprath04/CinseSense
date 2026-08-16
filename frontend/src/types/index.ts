export interface Movie {
  id: number;
  title: string;
  genres: string;
  release_year?: number;
  overview?: string;
  director?: string;
  cast?: string;
  duration_minutes?: number;
  poster_url?: string;
  backdrop_url?: string;
  trailer_url?: string;
  mood?: string;
  average_rating: number;
  rating_count: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface Recommendation {
  movie: Movie;
  retrieval_score: number;
  explanation: string;
  confidence_level: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence_badge: string;
  is_exploratory: boolean;
  context_reference?: string;
}

export interface ContextualRow {
  row_title: string;
  context_type: string;
  reference_movie_title?: string;
  recommendations: Recommendation[];
}

export interface WatchlistItem {
  id: number;
  user_id: number;
  movie_id: number;
  added_at: string;
  movie?: Movie;
}

export interface InteractionLog {
  id: number;
  timestamp: string;
  user_id: number;
  movie_id?: number;
  action_type: string;
  retrieval_score?: number;
  explanation_text?: string;
  confidence_level?: string;
  details?: string;
  movie?: Movie;
  user?: User;
}

export interface AnalyticsData {
  total_recommendations_served: number;
  total_user_interactions: number;
  click_through_rate: number;
  watchlist_add_rate: number;
  confidence_breakdown: {
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  top_recommended_genres: Record<string, number>;
}
