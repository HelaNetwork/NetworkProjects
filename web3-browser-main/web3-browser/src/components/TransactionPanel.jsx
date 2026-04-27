import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, ExternalLink, Clock, CheckCircle, XCircle, Activity } from 'lucide-react';

const TX_TYPES = {
  Swap: { icon: '🔄', color: '#6366f1' },
  'NFT Transfer': { icon: '🖼️', color: '#8b5cf6' },
  Deposit: { icon: '⬇️', color: '#10b981' },
  Withdraw: { icon: '⬆️', color: '#f59e0b' },
  Transfer: { icon: '↗️', color: '#3b82f6' },
  Mint: { icon: '✨', color: '#ec4899' },
  Approve: { icon: '✅', color: '#14b8a6' },
};

const StatusIcon = ({ status }) => {
  if (status === 'success') return <CheckCircle size={11} style={{ color: 'var(--success)' }} />;
  if (status === 'pending') return <Clock size={11} style={{ color: 'var(--warning)', animation: 'pulse 1.5s infinite' }} />;
  if (status === 'failed') return <XCircle size={11} style={{ color: 'var(--danger)' }} />;
  return null;
};

const timeAgo = (timestamp) => {
  const s = Math.floor((Date.now() - timestamp) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const TxItem = ({ tx, explorerUrl }) => {
  const typeInfo = TX_TYPES[tx.type] || { icon: '📋', color: 'var(--accent)' };

  return (
    <div className="tx-item" style={{ marginBottom: '6px' }}>
      <div
        style={{
          width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
          background: `${typeInfo.color}20`,
          border: `1px solid ${typeInfo.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.9rem',
        }}
      >
        {typeInfo.icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="flex items-center gap-1.5" style={{ marginBottom: '2px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-primary)', fontWeight: 500 }}>{tx.type}</span>
          <StatusIcon status={tx.status} />
          {tx.status === 'pending' && (
            <span style={{
              fontSize: '0.55rem', fontFamily: 'Space Mono, monospace',
              background: 'rgba(245,158,11,0.1)', color: '#f59e0b',
              padding: '1px 5px', borderRadius: '3px', border: '1px solid rgba(245,158,11,0.2)',
            }}>PENDING</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
            {tx.hash}
          </span>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
            {timeAgo(tx.timestamp)}
          </span>
        </div>
        {tx.value !== '0' && (
          <div style={{ fontSize: '0.65rem', color: 'var(--accent)', fontFamily: 'Space Mono, monospace', marginTop: '2px' }}>
            {tx.value} ETH
          </div>
        )}
        {tx.gas && (
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '1px' }}>
            Gas: {tx.gas} ETH
          </div>
        )}
      </div>

      {explorerUrl && (
        <a
          href={`${explorerUrl}/tx/${tx.hash}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--text-muted)', flexShrink: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <ExternalLink size={11} />
        </a>
      )}
    </div>
  );
};

const TransactionPanel = ({ wallet }) => {
  const [filter, setFilter] = useState('all');

  const txs = wallet.transactions || [];
  const filtered = filter === 'all' ? txs : txs.filter(t => t.status === filter);

  if (!wallet.connected) {
    return (
      <div className="sidebar-section">
        <div className="sidebar-label">Transactions</div>
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: '6px', padding: '16px', textAlign: 'center',
        }}>
          <Activity size={20} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
            Connect wallet to view transactions
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
        <div className="sidebar-label" style={{ marginBottom: 0 }}>Transactions</div>
        <div className="flex gap-1">
          {['all', 'pending', 'success'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '2px 8px', borderRadius: '4px', fontSize: '0.6rem',
                fontFamily: 'Space Mono, monospace', cursor: 'pointer',
                border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border)'}`,
                background: filter === f ? 'rgba(20,184,166,0.1)' : 'transparent',
                color: filter === f ? 'var(--accent)' : 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        {filtered.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textAlign: 'center', padding: '20px 0' }}>
            No {filter === 'all' ? '' : filter} transactions
          </div>
        ) : (
          filtered.map((tx, i) => (
            <TxItem key={i} tx={tx} explorerUrl={wallet.network?.explorer} />
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionPanel;
