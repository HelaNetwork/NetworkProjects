'use client';

import { useState } from 'react';
import { Shield, Menu, X } from 'lucide-react';

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'analyze', label: 'Analyze' },
  { id: 'simulate', label: 'Simulate' },
  { id: 'chat', label: 'AI Chat' },
];

export default function Navbar({ activeTab, onTabChange }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      id="main-navbar"
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(13, 17, 23, 0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Inner container — matches page content width */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between h-[72px]">

          {/* ── Logo (far left) ── */}
          <button
            id="nav-logo"
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-3 flex-shrink-0"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1
                className="text-lg font-extrabold tracking-tight leading-tight"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
              >
                ShieldAI
              </h1>
              <p
                className="text-[10px] font-bold tracking-[0.2em] uppercase leading-none"
                style={{ color: 'var(--accent-cyan)' }}
              >
                Wallet Guardian
              </p>
            </div>
          </button>

          {/* ── Desktop Tabs (centered) ── */}
          <div
            className="hidden md:flex items-center gap-1 px-1.5 py-1.5 rounded-xl"
            style={{
              background: 'rgba(13, 17, 23, 0.6)',
              border: '1px solid var(--border-card)',
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  background: activeTab === tab.id ? '#8b5cf6' : 'transparent',
                  color: activeTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
                  boxShadow: activeTab === tab.id ? '0 2px 12px rgba(139,92,246,0.35)' : 'none',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Protected Status Badge (far right) ── */}
          <div
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl flex-shrink-0"
            style={{
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.15)',
            }}
          >
            <div
              className="w-2 h-2 rounded-full animate-status-pulse"
              style={{
                background: 'var(--accent-green)',
              }}
            />
            <span className="text-xs font-bold" style={{ color: 'var(--accent-green)' }}>
              Protected
            </span>
          </div>

          {/* ── Mobile Hamburger Toggle ── */}
          <button
            id="nav-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl transition-colors"
            style={{ color: 'var(--text-secondary)', background: 'var(--bg-card)' }}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu (stacked nav links) ── */}
      {mobileOpen && (
        <div
          className="md:hidden px-6 pb-4 pt-2 space-y-1"
          style={{
            background: 'rgba(13, 17, 23, 0.98)',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { onTabChange(tab.id); setMobileOpen(false); }}
              className="w-full text-left px-4 py-3.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: activeTab === tab.id ? 'var(--gradient-primary)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
              }}
            >
              {tab.label}
            </button>
          ))}

          {/* Mobile status badge */}
          <div className="flex items-center gap-2 px-4 py-3 mt-2" style={{
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: 'var(--accent-green)' }}
            />
            <span className="text-xs font-bold" style={{ color: 'var(--accent-green)' }}>
              Protected
            </span>
          </div>
        </div>
      )}
    </nav>
  );
}

