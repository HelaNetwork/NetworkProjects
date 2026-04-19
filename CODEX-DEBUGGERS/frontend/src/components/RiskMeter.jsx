'use client';

import { useMemo } from 'react';

export default function RiskMeter({ score, level, threats }) {
  const radius = 85;
  const strokeWidth = 16;
  const circumference = Math.PI * radius;
  const fillPercent = score / 100;
  const dashOffset = circumference * (1 - fillPercent);

  const colors = useMemo(() => {
    switch (level) {
      case 'low': return { stroke: '#10b981', glow: 'rgba(16,185,129,0.3)', bg: 'rgba(16,185,129,0.06)', text: '#34d399', label: 'LOW RISK', emoji: '✅' };
      case 'medium': return { stroke: '#f59e0b', glow: 'rgba(245,158,11,0.3)', bg: 'rgba(245,158,11,0.06)', text: '#fbbf24', label: 'MEDIUM RISK', emoji: '⚡' };
      case 'high': return { stroke: '#ef4444', glow: 'rgba(239,68,68,0.3)', bg: 'rgba(239,68,68,0.06)', text: '#f87171', label: 'HIGH RISK', emoji: '🚨' };
      default: return { stroke: '#10b981', glow: 'rgba(16,185,129,0.3)', bg: 'rgba(16,185,129,0.06)', text: '#34d399', label: 'LOW RISK', emoji: '✅' };
    }
  }, [level]);

  return (
    <div className="glass-card p-6">
      <h3
        className="text-base font-bold mb-2"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
      >
        🛡️ Risk Assessment
      </h3>

      {/* Gauge */}
      <div className="flex justify-center py-4">
        <div className="relative" style={{ width: 220, height: 125 }}>
          <svg width="220" height="125" viewBox="0 0 220 125">
            <path
              d="M 18 110 A 85 85 0 0 1 202 110"
              fill="none"
              stroke="var(--bg-secondary)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <path
              d="M 18 110 A 85 85 0 0 1 202 110"
              fill="none"
              stroke={colors.stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{
                transition: 'stroke-dashoffset 1.2s ease-in-out, stroke 0.5s ease',
                filter: `drop-shadow(0 0 12px ${colors.glow})`,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
            <span
              className="text-4xl font-black tabular-nums"
              style={{ fontFamily: 'var(--font-display)', color: colors.stroke }}
            >
              {score}
            </span>
            <span
              className="text-xs font-extrabold tracking-widest mt-1"
              style={{ color: colors.text }}
            >
              {colors.emoji} {colors.label}
            </span>
          </div>
        </div>
      </div>

      {/* Risk bar */}
      <div className="flex gap-1.5 mb-5">
        {['Low', 'Medium', 'High'].map((l) => (
          <div key={l} className="flex-1 text-center">
            <div
              className="h-2 rounded-full mb-1.5 transition-all duration-500"
              style={{
                background: l.toLowerCase() === level ? colors.stroke : 'var(--bg-secondary)',
                boxShadow: l.toLowerCase() === level ? `0 0 10px ${colors.glow}` : 'none',
              }}
            />
            <span
              className="text-xs font-semibold"
              style={{
                color: l.toLowerCase() === level ? colors.text : 'var(--text-muted)',
              }}
            >
              {l}
            </span>
          </div>
        ))}
      </div>

      {/* Threats */}
      {threats.length > 0 ? (
        <div className="space-y-2.5">
          <p
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            Detected Threats ({threats.length})
          </p>
          {threats.map((threat, i) => (
            <div
              key={i}
              className="p-4 rounded-xl"
              style={{
                background: threat.severity === 'high' ? 'rgba(239,68,68,0.06)' :
                             threat.severity === 'medium' ? 'rgba(245,158,11,0.06)' : 'rgba(148,163,184,0.04)',
                border: `1px solid ${
                  threat.severity === 'high' ? 'rgba(239,68,68,0.15)' :
                  threat.severity === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(148,163,184,0.1)'
                }`,
              }}
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    background: threat.severity === 'high' ? '#ef4444' :
                                threat.severity === 'medium' ? '#f59e0b' : '#64748b',
                    boxShadow: `0 0 6px ${threat.severity === 'high' ? 'rgba(239,68,68,0.4)' : 'transparent'}`,
                  }}
                />
                <span
                  className="text-sm font-bold"
                  style={{
                    color: threat.severity === 'high' ? '#f87171' :
                           threat.severity === 'medium' ? '#fbbf24' : 'var(--text-secondary)',
                  }}
                >
                  {threat.title}
                </span>
              </div>
              <p
                className="text-sm leading-relaxed pl-5"
                style={{ color: 'var(--text-secondary)' }}
              >
                {threat.description}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="text-center p-5 rounded-xl"
          style={{
            background: 'rgba(16,185,129,0.04)',
            border: '1px solid rgba(16,185,129,0.1)',
          }}
        >
          <p className="text-base font-bold" style={{ color: 'var(--accent-green)' }}>
            ✅ No threats detected
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            This transaction appears safe
          </p>
        </div>
      )}
    </div>
  );
}
