import axios from 'axios';
import { User, Movie, Recommendation, ContextualRow, WatchlistItem, InteractionLog, AnalyticsData } from '../types';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchDemoUsers = async (): Promise<User[]> => {
  const res = await api.get('/auth/users');
  return res.data;
};

export const createNewUser = async (username: string, email: string): Promise<User> => {
  const res = await api.post('/auth/users', { username, email });
  return res.data;
};

export const registerUser = async (data: { username: string; email: string; password: string }): Promise<{ user: User; token: string; message: string }> => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

export const loginUser = async (data: { email_or_username: string; password: string }): Promise<{ user: User; token: string; message: string }> => {
  const res = await api.post('/auth/login', data);
  return res.data;
};

export const fetchRecommendations = async (userId: number, limit = 8): Promise<Recommendation[]> => {
  const res = await api.get(`/recommendations?user_id=${userId}&limit=${limit}`);
  return res.data;
};

export const fetchContextualRows = async (userId: number): Promise<ContextualRow[]> => {
  const res = await api.get(`/recommendations/contextual?user_id=${userId}`);
  return res.data;
};

export const fetchMovies = async (query?: string, genre?: string, sortBy = 'rating', mood?: string): Promise<Movie[]> => {
  const params = new URLSearchParams();
  if (query) params.append('query', query);
  if (genre) params.append('genre', genre);
  if (mood) params.append('mood', mood);
  if (sortBy) params.append('sort_by', sortBy);
  const res = await api.get(`/movies?${params.toString()}`);
  return res.data;
};

export const fetchGenres = async (): Promise<string[]> => {
  const res = await api.get('/movies/genres');
  return res.data;
};

export const fetchWatchlist = async (userId: number): Promise<WatchlistItem[]> => {
  const res = await api.get(`/watchlist?user_id=${userId}`);
  return res.data;
};

export const addToWatchlist = async (userId: number, movieId: number): Promise<WatchlistItem> => {
  const res = await api.post('/watchlist', { user_id: userId, movie_id: movieId });
  return res.data;
};

export const removeFromWatchlist = async (userId: number, movieId: number): Promise<void> => {
  await api.delete(`/watchlist?user_id=${userId}&movie_id=${movieId}`);
};

export const recordInteraction = async (payload: {
  user_id: number;
  movie_id?: number;
  action_type: string;
  retrieval_score?: number;
  explanation_text?: string;
  confidence_level?: string;
  details?: string;
}) => {
  const res = await api.post('/engagement/interact', payload);
  return res.data;
};

export const rateMovie = async (userId: number, movieId: number, rating: number) => {
  const res = await api.post('/engagement/rate', { user_id: userId, movie_id: movieId, rating });
  return res.data;
};

export const fetchAuditLogs = async (confidence?: string, action?: string): Promise<{ total: number; logs: InteractionLog[] }> => {
  const params = new URLSearchParams();
  if (confidence) params.append('confidence', confidence);
  if (action) params.append('action', action);
  const res = await api.get(`/admin/audit-logs?${params.toString()}`);
  return res.data;
};

export const fetchAnalytics = async (): Promise<AnalyticsData> => {
  const res = await api.get('/admin/analytics');
  return res.data;
};
