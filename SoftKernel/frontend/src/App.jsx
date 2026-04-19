import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WalletProvider, useWallet } from './context/WalletContext';
import { DecimalProvider } from './context/DecimalContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import LogsPage from './pages/LogsPage';
import CompanyPanel from './pages/CompanyPanel';
import HRDashboard from './pages/HRDashboard';
import EmployeePortal from './pages/EmployeePortal';
import './styles.css';
import SplashCursor from './components/SplashCursor';
  
function NetworkGuard({ children }) {
  const { account, isCorrectNetwork, switchToHela } = useWallet();

  if (account && !isCorrectNetwork) {
    return (
      <>
        {children}
        <div className="network-warning-overlay">
          <div className="network-warning-modal">
            <div className="network-warning-icon">!</div>
            <h2 className="network-warning-title">Wrong Network</h2>
            <p className="network-warning-text">
              You are not connected to the HeLa Testnet.<br />
              Switch networks to access the Temporal Finance Engine.
            </p>
            <button className="network-switch-btn" onClick={switchToHela}>
              Switch to HeLa Testnet
            </button>
          </div>
        </div>
      </>
    );
  }

  return children;
}

function AppInner() {
  return (
    <NetworkGuard>
      <SplashCursor />
      <div className="app-background" />
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/company" element={<CompanyPanel />} />
        <Route path="/hr" element={<HRDashboard />} />
        <Route path="/employee" element={<EmployeePortal />} />
        {/* <Route path="/admin" element={<AdminDashboard />} /> */}
        <Route path="/employee-legacy" element={<EmployeeDashboard />} />
        <Route path="/logs" element={<LogsPage />} />
      </Routes>
    </NetworkGuard>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <WalletProvider>
        <DecimalProvider>
          <AppInner />
        </DecimalProvider>
      </WalletProvider>
    </BrowserRouter>
  );
}
