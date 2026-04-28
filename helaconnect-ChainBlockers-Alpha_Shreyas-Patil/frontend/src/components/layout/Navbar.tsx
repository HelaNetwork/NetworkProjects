import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import ThemeToggle from '../ui/ThemeToggle';
import MonkeyLogo from '../ui/MonkeyLogo';
import useGenerateAvatar from '../../hooks/useGenerateAvatar';

const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, walletAddress } = useSelector((s: RootState) => s.auth);
  const { isDark } = useSelector((s: RootState) => s.theme);
  const [searchQ, setSearchQ] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const { generateAvatar } = useGenerateAvatar();

  const avatarSrc = generateAvatar(walletAddress || user?.fullName || 'anon');

  const tabs = [
    { label: 'Home Feed', path: '/home', icon: '🏠' },
    { label: 'Jobs', path: '/jobs', icon: '💼' },
    { label: 'Events', path: '/events', icon: '🎪' },
    { label: 'Airdrops', path: '/airdrops', icon: '🎁' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`);
    }
  };

  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const subText = isDark ? 'text-white/50' : 'text-gray-500';

  return (
    <nav className="navbar-glass fixed top-0 left-0 right-0 z-40 h-16">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between gap-2 lg:gap-6">
        <div className="flex items-center gap-3 lg:gap-6 flex-1 shrink min-w-0">
          <Link to="/home" className="flex items-center gap-2 shrink-0" id="navbar-logo">
            <MonkeyLogo size={36} animated={false} />
            <span className="font-bold text-lg hidden xl:block mint-gradient-text">helaconntect</span>
          </Link>

          <form onSubmit={handleSearch} className="relative flex-1 max-w-[240px] hidden sm:block">
            <input
              id="navbar-search"
              type="text"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search..."
              className={`input-field w-full pr-8 py-2 text-sm ${!isDark ? '!bg-black/5 !border-black/10 !text-gray-900' : ''}`}
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-mint-400 transition-colors">
              🔍
            </button>
          </form>
        </div>

        <div className="hidden md:flex items-center gap-1 shrink-0">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              id={`nav-tab-${tab.label.toLowerCase().replace(' ', '-')}`}
              className={`nav-tab flex items-center gap-1.5 px-3 lg:px-4 py-2 ${location.pathname === tab.path ? 'active' : ''}`}
            >
              <span>{tab.icon}</span>
              <span className="hidden lg:block whitespace-nowrap">{tab.label}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              id="navbar-profile-btn"
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <img
                src={avatarSrc}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover"
                style={{ boxShadow: '0 0 8px rgba(20,184,166,0.4)' }}
              />
              <span className={`text-sm font-medium hidden sm:block ${textColor}`}>
                {user?.fullName || 'You'}
              </span>
              <span className={`text-xs ${subText}`}>▾</span>
            </button>

            {showMenu && (
              <div
                className="absolute right-0 top-12 w-52 glass-card rounded-2xl p-2 animate-fade-in z-50 dark:!bg-[#161a20] bg-white"
                style={{ border: '1px solid rgba(20,184,166,0.2)' }}
              >
                <div className="flex items-center gap-3 px-3 py-3 mb-1 border-b border-white/5">
                  <img src={avatarSrc} alt="avatar" className="w-10 h-10 rounded-full" style={{ boxShadow: '0 0 10px rgba(20,184,166,0.3)' }} />
                  <div>
                    <p className={`text-sm font-semibold ${textColor}`}>{user?.fullName || 'Anonymous'}</p>
                    <p className="text-xs text-white/30 font-mono truncate max-w-28">{walletAddress?.slice(0, 10)}…</p>
                  </div>
                </div>

                <Link
                  to="/profile"
                  id="menu-profile-link"
                  onClick={() => setShowMenu(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-sm ${textColor}`}
                >
                  <span>👤</span> My Profile
                </Link>
                <Link
                  to="/search"
                  id="menu-search-link"
                  onClick={() => setShowMenu(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-sm ${textColor}`}
                >
                  <span>🔍</span> Search Users
                </Link>
                <div className="my-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

                {/* Mobile tabs in menu */}
                {tabs.map((tab) => (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    onClick={() => setShowMenu(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-sm md:hidden ${textColor}`}
                  >
                    <span>{tab.icon}</span> {tab.label}
                  </Link>
                ))}
                <div className="my-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
                <button
                  id="menu-logout-btn"
                  onClick={() => { dispatch(logout()); navigate('/'); setShowMenu(false); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition-colors text-sm text-red-400 w-full text-left"
                >
                  <span>🚪</span> Disconnect Wallet
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
