import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import AuthPage from './pages/Auth/AuthPage';
import Dashboard from './pages/Dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import AuditHistory from './pages/Dashboard/AuditHistory';
import DisputeCenter from './pages/Dashboard/DisputeCenter';
import AgentSandbox from './pages/Dashboard/AgentSandbox';
import DecisionDetails from './pages/Dashboard/DecisionDetails';
import { ToastProvider } from './components/Toast';
import { Web3Provider } from './context/Web3Context';

function App() {
  return (
    <Web3Provider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage defaultMode="login" />} />
            <Route path="/signup" element={<AuthPage defaultMode="signup" />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="history" element={<AuditHistory />} />
              <Route path="history/:id" element={<DecisionDetails />} />
              <Route path="disputes" element={<DisputeCenter />} />
              <Route path="sandbox" element={<AgentSandbox />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </Web3Provider>
  );
}

export default App;
