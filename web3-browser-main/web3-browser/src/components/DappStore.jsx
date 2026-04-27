import React, { useState } from 'react';
import { Search, Star } from 'lucide-react';

const DAPPS = [
  // DeFi
  { name: 'Uniswap', url: 'https://app.uniswap.org', emoji: '🦄', color: '#FF007A', cat: 'DeFi', desc: 'DEX & Swap', hot: true },
  { name: 'Aave', url: 'https://app.aave.com', emoji: '👻', color: '#B6509E', cat: 'DeFi', desc: 'Lending Protocol' },
  { name: 'Compound', url: 'https://app.compound.finance', emoji: '🏦', color: '#00D395', cat: 'DeFi', desc: 'Earn Interest' },
  { name: 'Curve', url: 'https://curve.fi', emoji: '📈', color: '#FF0000', cat: 'DeFi', desc: 'Stable Swaps' },
  { name: 'dYdX', url: 'https://dydx.exchange', emoji: '⚡', color: '#6966FF', cat: 'DeFi', desc: 'Perpetuals', hot: true },
  { name: '1inch', url: 'https://app.1inch.io', emoji: '🔱', color: '#1B314F', cat: 'DeFi', desc: 'DEX Aggregator' },
  // NFT
  { name: 'OpenSea', url: 'https://opensea.io', emoji: '🌊', color: '#2081E2', cat: 'NFT', desc: 'NFT Marketplace', hot: true },
  { name: 'Blur', url: 'https://blur.io', emoji: '💨', color: '#FF8700', cat: 'NFT', desc: 'Pro NFT Trading' },
  { name: 'Zora', url: 'https://zora.co', emoji: '🟡', color: '#DBFD66', cat: 'NFT', desc: 'Create & Collect' },
  { name: 'Foundation', url: 'https://foundation.app', emoji: '🎨', color: '#F0F0F0', cat: 'NFT', desc: 'Digital Art' },
  // Social
  { name: 'Lens', url: 'https://hey.xyz', emoji: '🌿', color: '#ABFE2C', cat: 'Social', desc: 'Web3 Social', hot: true },
  { name: 'Mirror', url: 'https://mirror.xyz', emoji: '🪞', color: '#007AFF', cat: 'Social', desc: 'Web3 Publishing' },
  { name: 'Farcaster', url: 'https://warpcast.com', emoji: '💜', color: '#8A63D2', cat: 'Social', desc: 'Decentralized Social' },
  // Tools
  { name: 'Etherscan', url: 'https://etherscan.io', emoji: '🔍', color: '#21325B', cat: 'Tools', desc: 'Block Explorer' },
  { name: 'DeBank', url: 'https://debank.com', emoji: '💰', color: '#FF7D00', cat: 'Tools', desc: 'Portfolio Tracker' },
  { name: 'Snapshot', url: 'https://snapshot.org', emoji: '📸', color: '#FFDB1F', cat: 'Tools', desc: 'DAO Voting' },
];

const CATEGORIES = ['All', 'DeFi', 'NFT', 'Social', 'Tools'];

const DappStore = ({ onNavigate }) => {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');

  const filtered = DAPPS.filter(d => {
    const matchesCat = activeCat === 'All' || d.cat === activeCat;
    const matchesSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.desc.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="sidebar-section" style={{ flex: 1, overflowY: 'auto' }}>
      <div className="sidebar-label">dApp Store</div>

      {/* Search */}
      <div className="relative" style={{ marginBottom: '10px' }}>
        <Search size={11} style={{
          position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-muted)', pointerEvents: 'none'
        }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search dApps..."
          className="w3b-input w-full pl-7 pr-3 py-1.5"
          style={{ fontSize: '0.75rem' }}
        />
      </div>

      {/* Category pills */}
      <div className="flex gap-1 flex-wrap" style={{ marginBottom: '10px' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            style={{
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '0.65rem',
              fontFamily: 'Space Mono, monospace',
              cursor: 'pointer',
              border: `1px solid ${activeCat === cat ? 'var(--accent)' : 'var(--border)'}`,
              background: activeCat === cat ? 'rgba(20,184,166,0.15)' : 'transparent',
              color: activeCat === cat ? 'var(--accent)' : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* dApp Grid */}
      <div className="grid grid-cols-2 gap-2">
        {filtered.map(dapp => (
          <button
            key={dapp.name}
            onClick={() => onNavigate(dapp.url, dapp.name)}
            className="dapp-card relative"
            style={{ padding: '10px 8px' }}
          >
            {dapp.hot && (
              <div style={{
                position: 'absolute', top: '4px', right: '4px',
                background: 'rgba(245,158,11,0.15)',
                border: '1px solid rgba(245,158,11,0.3)',
                color: '#f59e0b',
                fontSize: '0.55rem',
                padding: '1px 4px',
                borderRadius: '3px',
                fontFamily: 'Space Mono, monospace',
              }}>HOT</div>
            )}
            <div
              className="dapp-icon"
              style={{
                background: `${dapp.color}15`,
                border: `1px solid ${dapp.color}25`,
              }}
            >
              {dapp.emoji}
            </div>
            <span style={{ color: 'var(--text-primary)', fontSize: '0.72rem', fontWeight: 500 }}>{dapp.name}</span>
            <span className="dapp-name">{dapp.desc}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', padding: '20px 0' }}>
          No dApps found
        </div>
      )}
    </div>
  );
};

export default DappStore;
