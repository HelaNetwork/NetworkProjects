import React from 'react';
import { Zap, AlertTriangle, ExternalLink, TrendingUp, Wallet } from 'lucide-react';
import { formatBalance } from '../utils/wallet';
import { isMetaMaskInstalled } from '../utils/wallet';

const StatCard = ({ label, value, sub, accent }) => (
  <div style={{
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '10px',
    flex: 1,
  }}>
    <div style={{ color: 'var(--text-muted)', fontSize: '0.6rem', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{label}</div>
    <div style={{ color: accent || 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>{value}</div>
    {sub && <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginTop: '2px' }}>{sub}</div>}
  </div>
);

const WalletConnect = ({ wallet }) => {
  const metaMaskInstalled = isMetaMaskInstalled();

  if (!wallet.connected) {
    return (
      <div className="sidebar-section fade-in">
        <div className="sidebar-label">Wallet</div>
        {!metaMaskInstalled ? (
          <div style={{
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '10px',
          }}>
            <div className="flex items-center gap-2" style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px' }}>
              <AlertTriangle size={13} /> MetaMask Required
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', lineHeight: 1.5, marginBottom: '8px' }}>
              Install MetaMask to connect your wallet and interact with dApps.
            </p>
            <a
              href="https://metamask.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
              style={{ color: 'var(--accent)', fontSize: '0.7rem', textDecoration: 'none' }}
            >
              <ExternalLink size={11} /> Install MetaMask
            </a>
          </div>
        ) : (
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '10px',
              textAlign: 'center',
            }}
          >
            <div style={{ marginBottom: '8px' }}>
              <Wallet size={20} style={{ color: 'var(--text-muted)', margin: '0 auto' }} />
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '10px' }}>
              Connect your wallet to get started
            </div>
            {wallet.error && (
              <div style={{ color: 'var(--danger)', fontSize: '0.7rem', marginBottom: '8px', background: 'rgba(239,68,68,0.08)', padding: '6px', borderRadius: '4px' }}>
                {wallet.error}
              </div>
            )}
          </div>
        )}

        <button
          onClick={wallet.connect}
          disabled={wallet.connecting || !metaMaskInstalled}
          className="btn-primary w-full flex items-center justify-center gap-2 py-2"
          style={{ fontSize: '0.75rem', fontFamily: 'Space Mono, monospace', opacity: !metaMaskInstalled ? 0.5 : 1 }}
        >
          {wallet.connecting ? (
            <>
              <span className="animate-spin">⟳</span> Connecting...
            </>
          ) : (
            <>
              <Zap size={13} /> Connect MetaMask
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="sidebar-section fade-in">
      <div className="sidebar-label">Wallet</div>

      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        padding: '10px',
        marginBottom: '10px',
      }}>
        <div className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
          <span className="status-dot connected" />
          <span style={{ color: 'var(--success)', fontSize: '0.7rem', fontFamily: 'Space Mono, monospace' }}>Connected</span>
        </div>

        <div style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: '0.65rem',
          color: 'var(--accent)',
          wordBreak: 'break-all',
          lineHeight: 1.6,
        }}>
          {wallet.address}
        </div>
      </div>

      <div className="flex gap-2" style={{ marginBottom: '10px' }}>
        <StatCard
          label="Balance"
          value={formatBalance(wallet.balance, 4)}
          sub={wallet.network?.symbol || 'ETH'}
          accent="var(--accent)"
        />
        <StatCard
          label="Network"
          value={wallet.network?.name?.split(' ')[0] || '—'}
          sub={wallet.network?.name?.split(' ').slice(1).join(' ') || ''}
        />
      </div>

      {/* Portfolio placeholder */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        padding: '10px',
      }}>
        <div className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
          <TrendingUp size={12} style={{ color: 'var(--accent)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem', fontFamily: 'Space Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Portfolio</span>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textAlign: 'center', padding: '10px 0' }}>
          Connect to Etherscan API for full portfolio view
        </div>
      </div>
    </div>
  );
};

export default WalletConnect;
