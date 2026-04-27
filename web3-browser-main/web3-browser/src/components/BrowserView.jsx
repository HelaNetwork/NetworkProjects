import React, { useState, useRef, useCallback } from 'react';
import {
  ArrowLeft, ArrowRight, RotateCw, Home, Plus, X,
  Shield, ShieldOff, Lock, Globe, ExternalLink, Bookmark, BookmarkCheck
} from 'lucide-react';

const QUICK_DAPPS = [
  { name: 'Uniswap', url: 'https://app.uniswap.org', emoji: '🦄', color: '#FF007A' },
  { name: 'OpenSea', url: 'https://opensea.io', emoji: '🌊', color: '#2081E2' },
  { name: 'Aave', url: 'https://app.aave.com', emoji: '👻', color: '#B6509E' },
  { name: 'dYdX', url: 'https://dydx.exchange', emoji: '⚡', color: '#6966FF' },
  { name: 'Compound', url: 'https://app.compound.finance', emoji: '🏦', color: '#00D395' },
  { name: 'Curve', url: 'https://curve.fi', emoji: '📈', color: '#FF0000' },
  { name: 'Lens', url: 'https://hey.xyz', emoji: '🌿', color: '#ABFE2C' },
  { name: 'Mirror', url: 'https://mirror.xyz', emoji: '🪞', color: '#007AFF' },
];

const BLOCKED_TRACKERS = ['google-analytics.com', 'doubleclick.net', 'facebook.com/tr', 'hotjar.com'];
let blockedCount = 0;

const NewTabPage = ({ onNavigate }) => (
  <div
    className="h-full flex flex-col items-center justify-center gap-8 fade-in"
    style={{ background: 'var(--bg-primary)', padding: '40px' }}
  >
    <div className="text-center">
      <div style={{
        fontFamily: 'Space Mono, monospace',
        fontSize: '2.5rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        letterSpacing: '-0.03em',
      }}>W3B Browser</div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '8px' }}>
        Your gateway to the decentralized web
      </div>
    </div>

    <div style={{ width: '100%', maxWidth: '500px' }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '16px',
      }}>
        <div className="sidebar-label" style={{ marginBottom: '12px' }}>Quick Access — dApps</div>
        <div className="grid grid-cols-4 gap-3">
          {QUICK_DAPPS.map(dapp => (
            <button
              key={dapp.name}
              onClick={() => onNavigate(dapp.url)}
              className="dapp-card"
            >
              <div
                className="dapp-icon"
                style={{ background: `${dapp.color}20`, border: `1px solid ${dapp.color}30` }}
              >
                {dapp.emoji}
              </div>
              <span className="dapp-name">{dapp.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const UrlBar = ({ url, onNavigate, loading, adBlock, onToggleAdBlock, blockedCount }) => {
  const [inputVal, setInputVal] = useState(url || '');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    let val = inputVal.trim();
    if (!val) return;
    if (!val.includes('.') && !val.startsWith('http')) {
      val = `https://www.google.com/search?q=${encodeURIComponent(val)}`;
    } else if (!val.startsWith('http')) {
      val = 'https://' + val;
    }
    onNavigate(val);
  };

  React.useEffect(() => {
    if (!focused) setInputVal(url || '');
  }, [url, focused]);

  const isHttps = url?.startsWith('https://');

  return (
    <div
      className="flex items-center gap-2 px-3 py-2"
      style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}
    >
      <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
        {url ? (
          isHttps ? (
            <Lock size={13} style={{ color: 'var(--success)', flexShrink: 0 }} />
          ) : (
            <Globe size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          )
        ) : (
          <Globe size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        )}
        <input
          ref={inputRef}
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onFocus={() => { setFocused(true); inputRef.current?.select(); }}
          onBlur={() => setFocused(false)}
          placeholder="Search or enter URL..."
          className="w3b-input flex-1 px-3 py-1.5"
          style={{ fontSize: '0.8rem' }}
        />
      </form>

      {loading && (
        <RotateCw
          size={13}
          className="animate-spin"
          style={{ color: 'var(--accent)', flexShrink: 0 }}
        />
      )}

      {/* Ad block toggle */}
      <button
        onClick={onToggleAdBlock}
        className="tooltip flex items-center gap-1 px-2 py-1 rounded text-xs"
        data-tip={adBlock ? `Ad Block ON (${blockedCount} blocked)` : 'Ad Block OFF'}
        style={{
          background: adBlock ? 'rgba(20,184,166,0.1)' : 'transparent',
          border: `1px solid ${adBlock ? 'var(--accent)' : 'var(--border)'}`,
          color: adBlock ? 'var(--accent)' : 'var(--text-muted)',
        }}
      >
        {adBlock ? <Shield size={13} /> : <ShieldOff size={13} />}
      </button>

      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost p-1.5"
          title="Open in new window"
        >
          <ExternalLink size={13} />
        </a>
      )}
    </div>
  );
};

const TabBar = ({ tabs, activeTabId, onSelectTab, onCloseTab, onNewTab }) => (
  <div className="tab-bar">
    {tabs.map(tab => (
      <div
        key={tab.id}
        className={`tab ${tab.id === activeTabId ? 'active' : ''}`}
        onClick={() => onSelectTab(tab.id)}
      >
        {tab.loading ? (
          <RotateCw size={10} className="animate-spin" style={{ flexShrink: 0 }} />
        ) : (
          <Globe size={10} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
        )}
        <span className="tab-title">{tab.title || 'New Tab'}</span>
        <button
          onClick={e => { e.stopPropagation(); onCloseTab(tab.id); }}
          style={{ flexShrink: 0, background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '1px', borderRadius: '3px' }}
          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={e => e.currentTarget.style.color = 'inherit'}
        >
          <X size={10} />
        </button>
      </div>
    ))}
    <button
      onClick={onNewTab}
      style={{
        padding: '6px 10px',
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        borderRadius: '6px 6px 0 0',
        transition: 'color 0.15s',
        alignSelf: 'flex-end',
      }}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
    >
      <Plus size={13} />
    </button>
  </div>
);

const NavControls = ({ onBack, onForward, onReload, onHome }) => (
  <div className="flex items-center gap-1 px-2 py-2" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
    {[
      { icon: ArrowLeft, onClick: onBack, tip: 'Back' },
      { icon: ArrowRight, onClick: onForward, tip: 'Forward' },
      { icon: RotateCw, onClick: onReload, tip: 'Reload' },
      { icon: Home, onClick: onHome, tip: 'Home' },
    ].map(({ icon: Icon, onClick, tip }) => (
      <button
        key={tip}
        onClick={onClick}
        title={tip}
        className="btn-ghost p-1.5"
        style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Icon size={13} />
      </button>
    ))}
  </div>
);

const BrowserView = ({ tabs, activeTab, activeTabId, onSelectTab, onCloseTab, onNewTab, navigateTab }) => {
  const [adBlock, setAdBlock] = useState(true);
  const [blockedTrackers, setBlockedTrackers] = useState(0);
  const iframeRef = useRef(null);
  const historyRef = useRef({ back: [], forward: [] });

  const navigate = useCallback((url, addToHistory = true) => {
    if (!url) return;
    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http')) finalUrl = 'https://' + finalUrl;
    if (addToHistory && activeTab.url) {
      historyRef.current.back.push(activeTab.url);
      historyRef.current.forward = [];
    }
    navigateTab(activeTabId, finalUrl, new URL(finalUrl).hostname);
  }, [activeTabId, activeTab, navigateTab]);

  const goBack = () => {
    const back = historyRef.current.back;
    if (!back.length) return;
    const prev = back.pop();
    if (activeTab.url) historyRef.current.forward.push(activeTab.url);
    navigateTab(activeTabId, prev, prev);
  };

  const goForward = () => {
    const forward = historyRef.current.forward;
    if (!forward.length) return;
    const next = forward.pop();
    if (activeTab.url) historyRef.current.back.push(activeTab.url);
    navigateTab(activeTabId, next, next);
  };

  const goHome = () => {
    navigateTab(activeTabId, '', 'New Tab');
  };

  const reload = () => {
    if (iframeRef.current && activeTab.url) {
      iframeRef.current.src = activeTab.url;
    }
  };

  // Mock ad blocking
  const handleIframeLoad = () => {
    if (adBlock) {
      setBlockedTrackers(prev => prev + Math.floor(Math.random() * 3));
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ overflow: 'hidden' }}>
      {/* Tab Bar */}
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={onSelectTab}
        onCloseTab={onCloseTab}
        onNewTab={onNewTab}
      />

      {/* Nav controls + URL bar row */}
      <div className="flex items-stretch" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        {/* Nav buttons */}
        <div className="flex items-center gap-1 px-2">
          {[
            { icon: ArrowLeft, onClick: goBack, tip: 'Back' },
            { icon: ArrowRight, onClick: goForward, tip: 'Forward' },
            { icon: RotateCw, onClick: reload, tip: 'Reload' },
            { icon: Home, onClick: goHome, tip: 'Home' },
          ].map(({ icon: Icon, onClick, tip }) => (
            <button
              key={tip}
              onClick={onClick}
              title={tip}
              className="btn-ghost p-1.5"
              style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon size={13} />
            </button>
          ))}
        </div>

        {/* URL bar */}
        <div className="flex-1 flex items-center gap-2 px-2 py-2">
          {activeTab.url ? (
            activeTab.url.startsWith('https://') ? (
              <Lock size={12} style={{ color: 'var(--success)', flexShrink: 0 }} />
            ) : (
              <Globe size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            )
          ) : (
            <Globe size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          )}
          <UrlBarInput url={activeTab.url} onNavigate={navigate} loading={activeTab.loading} />
          {activeTab.loading && (
            <RotateCw size={12} className="animate-spin" style={{ color: 'var(--accent)', flexShrink: 0 }} />
          )}
          <button
            onClick={() => setAdBlock(v => !v)}
            title={adBlock ? `Ad Block: ON (${blockedTrackers} blocked)` : 'Ad Block: OFF'}
            className="flex items-center gap-1 px-2 py-1 rounded"
            style={{
              background: adBlock ? 'rgba(20,184,166,0.1)' : 'transparent',
              border: `1px solid ${adBlock ? 'var(--accent)' : 'var(--border)'}`,
              color: adBlock ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: '0.65rem',
              fontFamily: 'Space Mono, monospace',
              flexShrink: 0,
            }}
          >
            {adBlock ? <Shield size={11} /> : <ShieldOff size={11} />}
            {adBlock && <span>{blockedTrackers}</span>}
          </button>
          {activeTab.url && (
            <a
              href={activeTab.url}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in new window"
              className="btn-ghost p-1.5 flex items-center"
              style={{ flexShrink: 0 }}
            >
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      {/* Browser Content */}
      <div className="flex-1" style={{ overflow: 'hidden', position: 'relative' }}>
        {activeTab.url ? (
          <>
            {activeTab.loading && (
              <div
                className="absolute top-0 left-0 right-0 z-10"
                style={{ height: '2px', background: 'var(--bg-card)' }}
              >
                <div
                  className="h-full"
                  style={{
                    background: 'var(--accent)',
                    width: '60%',
                    animation: 'shimmer 1s linear infinite',
                    boxShadow: '0 0 10px var(--accent)',
                  }}
                />
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={activeTab.url}
              onLoad={handleIframeLoad}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block',
                background: '#fff',
              }}
              title="Web3 Browser Frame"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
          </>
        ) : (
          <NewTabPage onNavigate={navigate} />
        )}
      </div>
    </div>
  );
};

// Inline URL input within the bar
const UrlBarInput = ({ url, onNavigate, loading }) => {
  const [val, setVal] = useState(url || '');
  const [focused, setFocused] = useState(false);
  const ref = useRef(null);

  React.useEffect(() => {
    if (!focused) setVal(url || '');
  }, [url, focused]);

  const handleSubmit = (e) => {
    e.preventDefault();
    let v = val.trim();
    if (!v) return;
    if (!v.includes('.') && !v.startsWith('http')) {
      v = `https://www.google.com/search?q=${encodeURIComponent(v)}`;
    } else if (!v.startsWith('http')) {
      v = 'https://' + v;
    }
    onNavigate(v);
    ref.current?.blur();
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1">
      <input
        ref={ref}
        value={val}
        onChange={e => setVal(e.target.value)}
        onFocus={() => { setFocused(true); ref.current?.select(); }}
        onBlur={() => setFocused(false)}
        placeholder="Search or enter URL..."
        className="w3b-input w-full px-2 py-1"
        style={{ fontSize: '0.78rem' }}
      />
    </form>
  );
};

export default BrowserView;
