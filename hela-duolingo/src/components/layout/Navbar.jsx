import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, GraduationCap, Zap, Flame, Award } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Navbar = ({ xp, streak, level }) => {
  const location = useLocation();

  const navItems = [
    { label: 'LEARN', path: '/', icon: <Home className="w-5 h-5" /> },
    { label: 'DASHBOARD', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-duo-swan px-4 py-2 flex justify-around items-center z-50 md:top-0 md:bottom-auto md:border-t-0 md:border-b-2 md:px-20 md:py-4">
      <div className="hidden md:flex items-center gap-2 mr-auto">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-duo-green rounded-xl flex items-center justify-center border-b-4 border-duo-green-dark">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-duo-green tracking-tighter leading-none">CryptoDuo</span>
            <span className={`text-[10px] font-black uppercase tracking-widest ${level.color}`}>
              {level.name}
            </span>
          </div>
        </Link>
      </div>

      <div className="flex md:gap-8 w-full justify-around md:w-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.label}
              to={item.path}
              className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 rounded-xl transition-colors ${
                isActive ? 'bg-duo-blue/10 text-duo-blue' : 'text-duo-hare hover:bg-duo-swan/50'
              }`}
            >
              <div className={isActive ? 'text-duo-blue' : 'text-duo-hare'}>
                {item.icon}
              </div>
              <span className="text-[10px] md:text-sm font-black uppercase tracking-widest">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="hidden md:flex ml-auto gap-4 items-center">
        {/* Streak */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl hover:bg-orange-50 transition-colors group cursor-default">
          <Flame className={`w-6 h-6 ${streak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-duo-hare'}`} />
          <span className={`text-sm font-black ${streak > 0 ? 'text-orange-500' : 'text-duo-hare'}`}>{streak}</span>
        </div>

        {/* XP */}
        <div className="flex items-center gap-2 bg-duo-yellow/10 px-4 py-2 rounded-2xl border-b-2 border-duo-yellow">
          <Zap className="w-5 h-5 text-duo-yellow fill-duo-yellow" />
          <span className="text-sm font-black text-duo-eel">{xp} XP</span>
        </div>

        <ConnectButton 
          accountStatus="address"
          showBalance={false}
          chainStatus="icon"
        />
      </div>
    </nav>
  );
};

export default Navbar;
