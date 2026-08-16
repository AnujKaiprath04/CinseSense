import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WatchlistPage } from '../pages/WatchlistPage';

// Mock auth context
import * as AuthContext from '../context/AuthContext';
import { vi } from 'vitest';

describe('WatchlistPage Component', () => {
  it('renders watchlist title header correctly', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      currentUser: { id: 1, username: 'Alex', email: 'alex@test.com', created_at: '2026-01-01' },
      users: [],
      selectUser: vi.fn(),
      isLoading: false,
    });

    render(<WatchlistPage />);
    expect(screen.getByText(/My Saved Watchlist/i)).toBeInDocument();
  });
});
