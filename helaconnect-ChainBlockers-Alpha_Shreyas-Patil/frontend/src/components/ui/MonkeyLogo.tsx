import React from 'react';

// Animated monkey logo SVG with ring effects
const MonkeyLogo: React.FC<{ animated?: boolean; size?: number }> = ({
  animated = false,
  size = 80,
}) => {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer rotating ring */}
      {animated && (
        <>
          <div
            className="absolute inset-0 rounded-full ring-rotate"
            style={{
              background: 'conic-gradient(from 0deg, transparent 70%, rgba(20,184,166,0.8) 100%)',
              padding: '2px',
            }}
          >
            <div className="w-full h-full rounded-full bg-dark-300 dark:bg-dark-300" style={{ background: '#0d1117' }} />
          </div>
          <div
            className="absolute inset-1 rounded-full ring-counter opacity-60"
            style={{
              background: 'conic-gradient(from 180deg, transparent 60%, rgba(94,234,212,0.6) 100%)',
              padding: '1px',
            }}
          >
            <div className="w-full h-full rounded-full" style={{ background: '#0d1117' }} />
          </div>
        </>
      )}

      {/* Glow effect when animated */}
      {animated && (
        <div
          className="absolute inset-0 rounded-full animate-glow"
          style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.15) 0%, transparent 70%)' }}
        />
      )}

      {/* Main logo circle */}
      <div
        className={`relative rounded-full flex items-center justify-center overflow-hidden z-10 ${
          animated ? '' : ''
        }`}
        style={{
          width: size * 0.75,
          height: size * 0.75,
          background: animated
            ? 'linear-gradient(135deg, rgba(20,184,166,0.2), rgba(13,148,136,0.1))'
            : 'rgba(255,255,255,0.06)',
          border: `2px solid ${animated ? 'rgba(20,184,166,0.5)' : 'rgba(255,255,255,0.15)'}`,
        }}
      >
        {/* Monkey emoji */}
        <span style={{ fontSize: size * 0.35 }}>🐒</span>
      </div>
    </div>
  );
};

export default MonkeyLogo;
