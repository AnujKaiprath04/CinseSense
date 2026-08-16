import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CommandPalette } from './components/CommandPalette';
import { MobileBottomDock } from './components/MobileBottomDock';
import { AICoPilotDrawer } from './components/AICoPilotDrawer';
import { CinePartyModal } from './components/CinePartyModal';
import { HomePage } from './pages/HomePage';
import { MovieDetailsPage } from './pages/MovieDetailsPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { BrowsePage } from './pages/BrowsePage';
import { AdminAuditPage } from './pages/AdminAuditPage';
import { LoginPage } from './pages/LoginPage';
import { fetchWatchlist } from './api/client';

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const { currentUser, isLoggedIn } = useAuth();
  const [watchlistCount, setWatchlistCount] = useState<number>(0);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showCoPilot, setShowCoPilot] = useState(false);
  const [showCineParty, setShowCineParty] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith('/watchlist')) return 'watchlist';
    if (path.startsWith('/browse')) return 'browse';
    if (path.startsWith('/admin')) return 'admin';
    return 'home';
  };

  const activeTab = getActiveTab();

  const handleSetActiveTab = (tab: 'home' | 'watchlist' | 'browse' | 'admin') => {
    if (tab === 'home') navigate('/');
    else if (tab === 'watchlist') navigate('/watchlist');
    else if (tab === 'browse') navigate('/browse');
    else if (tab === 'admin') navigate('/admin');
  };

  useEffect(() => {
    if (currentUser && isLoggedIn) {
      fetchWatchlist(currentUser.id)
        .then((items) => setWatchlistCount(items.length))
        .catch(console.error);
    }
  }, [currentUser, isLoggedIn, location]);

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 flex flex-col font-sans antialiased relative pb-16 sm:pb-0 w-full">
      {/* Command Palette (Ctrl+K) */}
      {isLoggedIn && (
        <CommandPalette
          isOpen={showCommandPalette}
          onClose={() => setShowCommandPalette(false)}
          onNavigateTab={handleSetActiveTab}
          onOpenCoPilot={() => setShowCoPilot(true)}
          onOpenCineParty={() => setShowCineParty(true)}
        />
      )}

      {/* AI Co-Pilot Slide-Out Drawer */}
      {isLoggedIn && (
        <AICoPilotDrawer
          isOpen={showCoPilot}
          onClose={() => setShowCoPilot(false)}
          onToggleWatchlist={() => {}}
          watchlistMovieIds={new Set()}
        />
      )}

      {/* CineParty Multi-User Matcher Modal */}
      {isLoggedIn && showCineParty && (
        <CinePartyModal
          onClose={() => setShowCineParty(false)}
          onToggleWatchlist={() => {}}
          watchlistMovieIds={new Set()}
        />
      )}

      {/* Header Navigation - Full Widescreen */}
      {isLoggedIn && (
        <Navbar
          activeTab={activeTab}
          setActiveTab={handleSetActiveTab}
          watchlistCount={watchlistCount}
          onOpenCommandPalette={() => setShowCommandPalette(true)}
        />
      )}

      {/* Main Page Body - Full Viewport Width */}
      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 xl:px-16 pt-6">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<LoginPage />} />
          
          {/* Strict Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/movie/:id"
            element={
              <ProtectedRoute>
                <MovieDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/watchlist"
            element={
              <ProtectedRoute>
                <WatchlistPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/browse"
            element={
              <ProtectedRoute>
                <BrowsePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminAuditPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {/* Mobile Floating Bottom Dock */}
      {isLoggedIn && (
        <MobileBottomDock
          activeTab={activeTab}
          setActiveTab={handleSetActiveTab}
          onOpenCommandPalette={() => setShowCommandPalette(true)}
          onOpenCoPilot={() => setShowCoPilot(true)}
          watchlistCount={watchlistCount}
        />
      )}

      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500 w-full mt-10">
        <p>CineSense — Responsible AI OTT Content Recommendation & Engagement Agent</p>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
