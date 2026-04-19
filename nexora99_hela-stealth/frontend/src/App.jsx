import { useState, useEffect, Component } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { useWallet } from "./useWallet";
import MerchantDashboard from "./pages/MerchantDashboard";
import CustomerPayment from "./pages/CustomerPayment";
import "./index.css";

// Error Boundary — catches render crashes and shows a message instead of blank screen
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("React crash:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "3rem", textAlign: "center", color: "#fff", background: "#0d1117", minHeight: "100vh" }}>
          <p style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🐞</p>
          <h2 style={{ marginBottom: "0.5rem" }}>Something went wrong</h2>
          <p style={{ color: "#f85149", fontFamily: "monospace", fontSize: "0.85rem", wordBreak: "break-all", maxWidth: "600px", margin: "0 auto" }}>
            {this.state.error?.message || "Unknown error"}
          </p>
          <button
            style={{ marginTop: "1.5rem", padding: "0.5rem 1.5rem", border: "1px solid #555", background: "transparent", color: "#fff", borderRadius: "6px", cursor: "pointer" }}
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function NavBar({ account, balance, onConnect, onDisconnect }) {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="logo" style={{ cursor: "pointer" }} onClick={() => window.location.href = "/"}>
        <div className="icon" style={{ color: "var(--primary)", fontSize: "1.6rem" }}>🛡️</div>
        <span style={{ fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.04em" }}>
          HeLa <span style={{ color: "var(--primary)" }}>Stealth</span>
        </span>
      </div>

      <div className="nav-links">

        {account ? (
          <div className="wallet-pill" onClick={onDisconnect}>
            <span className="wallet-address">
              {account.slice(0, 6)}…{account.slice(-4)}
            </span>
            {balance && (
              <span className="wallet-balance">
                {parseFloat(balance).toFixed(2)}
                <span className="balance-unit">HUSD</span>
              </span>
            )}
          </div>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={onConnect}>
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  const wallet = useWallet();

  return (
    <ErrorBoundary>
      <div className="app-wrapper">
        <BrowserRouter>
          <div className="app-container">
            <NavBar
              account={wallet.account}
              balance={wallet.balance}
              onConnect={wallet.connect}
              onDisconnect={wallet.disconnect}
            />

            <Routes>
              <Route path="/" element={<MerchantDashboard wallet={wallet} />} />
              <Route path="/pay/:invoiceId" element={<CustomerPayment wallet={wallet} />} />
            </Routes>
          </div>
        </BrowserRouter>
      </div>
    </ErrorBoundary>
  );
}
