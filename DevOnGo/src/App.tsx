import React, { useEffect, useState } from 'react';
import {
  WagmiProvider,
  RainbowKitProvider,
  config,
  queryClient,
  lightTheme
} from './services/web3Config';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Toaster } from 'sonner';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Lobby from './pages/Lobby';
import GameSession from './pages/GameSession';
import Learn from './pages/Learn';
import Profile from './pages/Profile';
import Achievements from './pages/Achievements';
import { Layout } from './components/ui/Layout';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setSession(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={lightTheme({ accentColor: '#6366F1' })}>
          <BrowserRouter>
            <Toaster position="top-center" richColors theme="system" />
            <Routes>
              <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
              
              <Route element={<Layout />}>
                <Route path="/" element={session ? <Dashboard /> : <Navigate to="/login" />} />
                <Route path="/learn" element={session ? <Learn /> : <Navigate to="/login" />} />
                <Route path="/game/lobby" element={session ? <Lobby /> : <Navigate to="/login" />} />
                <Route path="/game/:id" element={session ? <GameSession /> : <Navigate to="/login" />} />
                <Route path="/achievements" element={session ? <Achievements /> : <Navigate to="/login" />} />
                <Route path="/profile" element={session ? <Profile /> : <Navigate to="/login" />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
