import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { useWeb3Context } from '../context/Web3Context';
import { ShieldCheck, Zap, Scroll, Scale, FlaskConical, Menu, X, LogOut, ChevronDown, Copy } from 'lucide-react';
import { useToast } from '../components/Toast';
import './DashboardLayout.css';

const navItems = [
  { href: "/dashboard", label: "Command Center", icon: Zap, exact: true },
  { href: "/dashboard/history", label: "Audit History", icon: Scroll },
  { href: "/dashboard/disputes", label: "Dispute Center", icon: Scale },
  { href: "/dashboard/sandbox", label: "Agent Sandbox", icon: FlaskConical },
];

const routeTitles = {
  "/dashboard": "Command Center",
  "/dashboard/history": "Audit History",
  "/dashboard/disputes": "Dispute Center",
  "/dashboard/sandbox": "Agent Sandbox",
  "/dashboard/settings": "Settings",
};

export default function DashboardLayout() {
  const { address, isConnected, connect, disconnect } = useWeb3Context();
  const toast = useToast();
  
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isWalletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      if (isConnected) disconnect();
      navigate('/');
    } catch (err) {
      toast.error("Logout failed", err.message);
    }
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.info("Address copied", "Wallet address copied to clipboard");
      setWalletDropdownOpen(false);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const pageTitle = routeTitles[location.pathname] || "Dashboard";

  return (
    <div className="dashboard-shell">
      {/* Ambient grid backdrop */}
      <div aria-hidden="true" className="dashboard-bg-grid bg-grid" />

      <div className="dashboard-layout-inner">
        {/* Sidebar Desktop */}
        <aside className="dashboard-sidebar glass-strong">
          <div className="sidebar-header">
            <div className="sidebar-logo-container">
              <div className="sidebar-logo-icon bg-gradient-brand">
                <ShieldCheck className="text-white" size={20} strokeWidth={2.5} />
              </div>
              <div className="sidebar-logo-text">
                <span className="logo-title">TAAP</span>
                <span className="logo-subtitle">Guardian Protocol</span>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <ul className="sidebar-nav-list">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <NavLink
                      to={item.href}
                      end={item.exact}
                      className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active bg-gradient-brand-soft' : ''}`}
                    >
                      <Icon className="nav-icon" size={18} strokeWidth={2} />
                      <span className="nav-label">{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-status glass">
              <span className="pulse-dot-wrapper">
                <span className="pulse-dot-ping bg-success" />
                <span className="pulse-dot bg-success" />
              </span>
              <span className="status-network">HeLa</span>
              <span className="status-divider">·</span>
              <span className="status-live text-success">Live</span>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isSidebarOpen && (
          <div className="mobile-nav-overlay">
            <div className="mobile-nav-backdrop" onClick={() => setSidebarOpen(false)} />
            <div className="mobile-nav-drawer glass-strong">
              <div className="mobile-drawer-header">
                <div className="sidebar-logo-container">
                  <div className="sidebar-logo-icon bg-gradient-brand">
                    <ShieldCheck className="text-white" size={20} strokeWidth={2.5} />
                  </div>
                  <div className="sidebar-logo-text">
                    <span className="logo-title">TAAP</span>
                    <span className="logo-subtitle">Guardian Protocol</span>
                  </div>
                </div>
                <button className="mobile-close-btn" onClick={() => setSidebarOpen(false)}>
                  <X size={16} />
                </button>
              </div>
              <nav className="mobile-drawer-nav">
                <ul className="sidebar-nav-list">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <NavLink
                          to={item.href}
                          end={item.exact}
                          onClick={() => setSidebarOpen(false)}
                          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active bg-gradient-brand-soft' : ''}`}
                        >
                          <Icon className="nav-icon" size={18} strokeWidth={2} />
                          <span className="nav-label">{item.label}</span>
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="dashboard-main">
          {/* Top Header */}
          <header className="dashboard-top-nav glass">
            <div className="top-nav-inner">
              <div className="top-nav-left">
                <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
                  <Menu size={16} />
                </button>
                <h1 className="top-nav-title">{pageTitle}</h1>
              </div>

              <div className="top-nav-right">
                <div className="wallet-container">
                  {isConnected ? (
                    <div className="wallet-connected-wrapper">
                      <button
                        className="wallet-btn connected hover-lift"
                        onClick={() => setWalletDropdownOpen(!isWalletDropdownOpen)}
                      >
                        <span className="wallet-dot bg-success" />
                        <span className="wallet-address">{formatAddress(address)}</span>
                        <ChevronDown size={14} className="wallet-chevron" />
                      </button>
                      
                      {isWalletDropdownOpen && (
                        <div className="wallet-dropdown glass-strong">
                          <button className="wallet-dropdown-item" onClick={handleCopyAddress}>
                            <Copy size={14} />
                            Copy Address
                          </button>
                          <div className="wallet-dropdown-divider" />
                          <button className="wallet-dropdown-item" onClick={() => { disconnect(); setWalletDropdownOpen(false); }}>
                            <LogOut size={14} />
                            Disconnect
                          </button>
                          <button className="wallet-dropdown-item text-destructive" onClick={handleLogout}>
                            <LogOut size={14} />
                            Logout Session
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button className="wallet-btn connect-btn hover-lift" onClick={() => connect()}>
                      Connect Wallet
                    </button>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="dashboard-content-area">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
