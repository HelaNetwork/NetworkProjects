import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { User, Truck, Shield, Activity } from "lucide-react";
import CustomerUI from "./pages/CustomerUI";
import DeliveryUI from "./pages/DeliveryUI";
import AdminUI from "./pages/AdminUI";
import "./main.css";

function Sidebar() {
  const loc = useLocation();
  const links = [
    { to: "/", label: "Customer Portal", icon: User },
    { to: "/delivery", label: "Delivery Agent", icon: Truck },
    { to: "/admin", label: "Admin Audit", icon: Shield },
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Activity size={32} strokeWidth={2.5} />
        </div>
        <div>
          <div className="sidebar-name">GasSafe</div>
          <div className="sidebar-tag">Protocol AAEP</div>
        </div>
      </div>

      <nav className="nav-group">
        {links.map(l => (
          <Link key={l.to} to={l.to} className={`nav-item ${loc.pathname === l.to ? "active" : ""}`}>
            <l.icon size={20} />
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Network Status</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', background: 'var(--brand-primary)', borderRadius: '50%' }}></div>
          Hela Testnet
        </div>
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar />
        <main className="main">
          <Routes>
            <Route path="/" element={<CustomerUI />} />
            <Route path="/delivery" element={<DeliveryUI />} />
            <Route path="/admin" element={<AdminUI />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}