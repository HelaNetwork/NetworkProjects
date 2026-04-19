import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Mail, Briefcase, Wallet, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef(null);
  
  // Check if user is logged in using token
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName');
  const userEmail = localStorage.getItem('userEmail');
  const walletAddress = localStorage.getItem('walletAddress');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setShowProfile(false);
    navigate('/login');
  };

  // Hide navbar on login page
  if (location.pathname === '/login') return null;

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Shorten wallet address
  const shortenAddress = (address) => {
    if (!address) return 'Not set';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(10,10,15,0.8)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.1)' : 'none',
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xl" style={{ background: 'linear-gradient(135deg, #F97316, #A855F7)' }}>P</div>
          <span className="text-xl font-bold" style={{ background: 'linear-gradient(135deg, #F97316, #A855F7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PayStream</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className={`transition-colors ${location.pathname === '/' ? 'text-orange-400' : 'text-gray-400 hover:text-white'}`}>Home</Link>
          {isLoggedIn && userRole === 'hr' && (
            <Link to="/hr" className={`transition-colors ${location.pathname === '/hr' ? 'text-orange-400' : 'text-gray-400 hover:text-white'}`}>HR Dashboard</Link>
          )}
          {isLoggedIn && userRole === 'employee' && (
            <Link to="/employee" className={`transition-colors ${location.pathname === '/employee' ? 'text-purple-400' : 'text-gray-400 hover:text-white'}`}>My Salary</Link>
          )}
        </div>

        {isLoggedIn ? (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 px-4 py-2 rounded-xl transition-all hover:scale-105"
              style={{ 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid rgba(255,255,255,0.1)' 
              }}
            >
              {/* Avatar */}
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white text-sm"
                style={{ 
                  background: userRole === 'hr' 
                    ? 'linear-gradient(135deg, #F97316, #EA580C)' 
                    : 'linear-gradient(135deg, #A855F7, #7C3AED)' 
                }}
              >
                {getInitials(userName)}
              </div>
              
              {/* Name */}
              <span className="text-sm font-medium text-white hidden md:block">
                {userName || 'User'}
              </span>
              
              {/* Dropdown Icon */}
              <ChevronDown 
                size={16} 
                className={`text-gray-400 transition-transform ${showProfile ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 rounded-2xl overflow-hidden"
                  style={{
                    background: 'rgba(20,20,25,0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                  }}
                >
                  {/* Header */}
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-4 mb-4">
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-white text-2xl"
                        style={{ 
                          background: userRole === 'hr' 
                            ? 'linear-gradient(135deg, #F97316, #EA580C)' 
                            : 'linear-gradient(135deg, #A855F7, #7C3AED)' 
                        }}
                      >
                        {getInitials(userName)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{userName}</h3>
                        <span 
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            background: userRole === 'hr' ? 'rgba(249,115,22,0.2)' : 'rgba(168,85,247,0.2)',
                            color: userRole === 'hr' ? '#fb923c' : '#c084fc',
                          }}
                        >
                          {userRole === 'hr' ? 'HR Admin' : 'Employee'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Account Info */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <p className="text-sm text-white font-mono">{userEmail || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Briefcase size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Role</p>
                        <p className="text-sm text-white capitalize">{userRole || 'User'}</p>
                      </div>
                    </div>

                    {walletAddress && (
                      <div className="flex items-start gap-3">
                        <Wallet size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
                          <p className="text-sm text-white font-mono">{shortenAddress(walletAddress)}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Logout Button */}
                  <div className="p-4 border-t border-white/10">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 transition-all hover:bg-red-500/10"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link
            to="/login"
            className="px-6 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)', boxShadow: '0 4px 15px rgba(249,115,22,0.3)' }}
          >
            Login
          </Link>
        )}
      </div>
    </motion.nav>
  );
}
