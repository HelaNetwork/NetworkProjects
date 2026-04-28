import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { toggleTheme } from '../../store/slices/themeSlice';

const ThemeToggle: React.FC = () => {
  const dispatch = useDispatch();
  const { isDark } = useSelector((s: RootState) => s.theme);

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-mint-500 focus:ring-offset-2 focus:ring-offset-transparent"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #14b8a6, #0d9488)'
          : 'rgba(255,255,255,0.2)',
        border: isDark ? 'none' : '1px solid rgba(0,0,0,0.15)',
      }}
      aria-label="Toggle theme"
      id="theme-toggle-btn"
    >
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 text-xs"
        style={{
          left: isDark ? '26px' : '2px',
          background: isDark ? 'white' : '#f59e0b',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}
      >
        {isDark ? '🌙' : '☀️'}
      </div>
    </button>
  );
};

export default ThemeToggle;
