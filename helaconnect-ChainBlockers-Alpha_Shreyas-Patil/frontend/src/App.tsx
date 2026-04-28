import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';

import OnboardingPage from './pages/OnboardingPage.tsx';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';
import AirdropsPage from './pages/AirdropsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

// ── Guards ────────────────────────────────────────────────────────────────

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useSelector((s: RootState) => s.auth);
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const RequireOnboarded: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isOnboarded } = useSelector((s: RootState) => s.auth);
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!isOnboarded) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
};

const RedirectIfAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isOnboarded } = useSelector((s: RootState) => s.auth);
  if (isAuthenticated && isOnboarded) return <Navigate to="/home" replace />;
  if (isAuthenticated && !isOnboarded) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
};

// ── App ────────────────────────────────────────────────────────────────────

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public: redirect if already logged in */}
        <Route
          path="/"
          element={
            <RedirectIfAuth>
              <OnboardingPage />
            </RedirectIfAuth>
          }
        />

        {/* Authenticated but not onboarded */}
        <Route
          path="/onboarding"
          element={
            <RequireAuth>
              <OnboardingPage />
            </RequireAuth>
          }
        />

        {/* Protected: require auth + onboarding */}
        <Route
          path="/home"
          element={
            <RequireOnboarded>
              <HomePage />
            </RequireOnboarded>
          }
        />
        <Route
          path="/jobs"
          element={
            <RequireOnboarded>
              <HomePage />
            </RequireOnboarded>
          }
        />
        <Route
          path="/events"
          element={
            <RequireOnboarded>
              <HomePage />
            </RequireOnboarded>
          }
        />
        <Route
          path="/search"
          element={
            <RequireOnboarded>
              <SearchPage />
            </RequireOnboarded>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireOnboarded>
              <ProfilePage />
            </RequireOnboarded>
          }
        />
        <Route
          path="/user/:walletAddress"
          element={
            <RequireOnboarded>
              <PublicProfilePage />
            </RequireOnboarded>
          }
        />
        
        {/* Airdrops Route – dedicated page */}
        <Route
          path="/airdrops"
          element={
            <RequireOnboarded>
              <AirdropsPage />
            </RequireOnboarded>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
