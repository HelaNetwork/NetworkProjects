import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Home, Compass, User, LogOut, Search } from "lucide-react";
import { useState } from "react";
import useAuthStore from "../store/authStore";
import { shortAddress } from "../utils/helpers";
import SearchModal from "./SearchModal";

export default function Layout() {
  const { user, walletAddress, disconnect } = useAuthStore();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);

  const handleDisconnect = () => {
    disconnect();
    navigate("/");
  };

  const navItems = [
    { to: "/feed", icon: Home, label: "Feed" },
    { to: "/explore", icon: Compass, label: "Explore" },
    { to: `/profile/${walletAddress}`, icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-chain-bg flex">
      {/* Sidebar */}
      <aside className="w-64 hidden md:flex flex-col fixed h-screen bg-chain-surface border-r border-chain-border px-4 py-6">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-chain-accent flex items-center justify-center">
            <span className="text-white font-display font-bold">⬡</span>
          </div>
          <span className="font-display text-lg text-chain-text tracking-wider">ChainGraph</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-body text-sm ${
                  isActive
                    ? "bg-chain-accent/20 text-chain-accent border border-chain-accent/30"
                    : "text-chain-text-muted hover:text-chain-text hover:bg-chain-card"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          <button
            onClick={() => setShowSearch(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-chain-text-muted hover:text-chain-text hover:bg-chain-card transition-all duration-200 text-sm"
          >
            <Search size={18} />
            Search
          </button>
        </nav>

        {/* User info at bottom */}
        <div className="border-t border-chain-border pt-4">
          <div className="flex items-center gap-3 px-2 mb-3">
            <WalletAvatar address={walletAddress} size={8} />
            <div className="flex-1 min-w-0">
              <p className="text-chain-text text-sm font-medium truncate">@{user?.username}</p>
              <p className="text-chain-text-muted text-xs font-display">{shortAddress(walletAddress)}</p>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-chain-red hover:bg-chain-red/10 transition-colors text-sm"
          >
            <LogOut size={16} />
            Disconnect
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-chain-surface border-t border-chain-border flex z-50">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
                isActive ? "text-chain-accent" : "text-chain-text-muted"
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
        <button
          onClick={() => setShowSearch(true)}
          className="flex-1 flex flex-col items-center gap-1 py-3 text-xs text-chain-text-muted"
        >
          <Search size={20} />
          Search
        </button>
      </nav>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <Outlet />
      </main>

      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
    </div>
  );
}

export function WalletAvatar({ address = "", size = 10, className = "" }) {
  const colors = [
    ["#6c63ff", "#00d4aa"], ["#ff4d6d", "#6c63ff"], ["#00d4aa", "#3b82f6"],
    ["#f59e0b", "#ef4444"], ["#8b5cf6", "#06b6d4"], ["#ec4899", "#8b5cf6"],
  ];
  const idx = parseInt(address.slice(2, 4) || "0", 16) % colors.length;
  const [c1, c2] = colors[idx];
  const initials = address ? address.slice(2, 4).toUpperCase() : "??";

  return (
    <div
      className={`w-${size} h-${size} rounded-full flex items-center justify-center font-display text-white text-xs font-bold flex-shrink-0 ${className}`}
      style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
    >
      {initials}
    </div>
  );
}
