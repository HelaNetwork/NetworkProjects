import React, { useState } from 'react';
import { Globe, Wifi, WifiOff, ChevronDown, Copy, LogOut, RefreshCw, Zap } from 'lucide-react';
import { formatBalance, NETWORKS, switchNetwork } from '../utils/wallet';

const NetworkSelector = ({ network, chainId, onSwitch }) => {
  const [open, setOpen] = useState(false);
  const nets = Object.entries(NETWORKS).map(([id, info]) => ({ id: parseInt(id), ...info }));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="btn-ghost flex items-center gap-2 px-3 py-1.5 text-xs"
        style={{ fontFamily: 'Space Mono, monospace' }}
      >
        <span className={`network-badge ${network?.badge || 'unknown'}`}>
          {network?.name?.split(' ')[0] || 'Unknown'}
        </span>
        <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
      </button>
      {open && (
        <div
          className="absolute top-full mt-1 right-0 z-50 rounded-lg overflow-hidden"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-bright)',
            minWidth: '180px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
          }}
        >
          {nets.map(net => (
            <button
              key={net.id}
              onClick={async () => {
                await onSwitch(net.id);
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
              style={{
                background: net.id === chainId ? 'var(--bg-card-hover)' : 'transparent',
                color: net.id === chainId ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: '0.75rem',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = net.id === chainId ? 'var(--bg-card-hover)' : 'transparent'}
            >
              <span className={`network-badge ${net.badge}`}>{net.badge}</span>
              <span>{net.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const WalletMenu = ({ address, shortAddress, balance, network, onDisconnect, onRefresh }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-bright)',
          color: 'var(--text-primary)',
        }}
      >
        <span className="status-dot connected" />
        <span className="address" style={{ fontSize: '0.7rem' }}>{shortAddress}</span>
        <span style={{ color: 'var(--accent)', fontSize: '0.7rem', fontFamily: 'Space Mono, monospace' }}>
          {formatBalance(balance, 3)} {network?.symbol || 'ETH'}
        </span>
        <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
      </button>
      {open && (
        <div
          className="absolute top-full mt-1 right-0 z-50 rounded-lg overflow-hidden"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-bright)',
            minWidth: '220px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
          }}
        >
          <div className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.6rem', fontFamily: 'Space Mono, monospace', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Wallet Address</div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.7rem', color: 'var(--accent)', wordBreak: 'break-all' }}>{address}</div>
          </div>
          <div className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.6rem', fontFamily: 'Space Mono, monospace', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Balance</div>
            <div style={{ fontSize: '1rem', fontFamily: 'Space Mono, monospace', color: 'var(--text-primary)' }}>
              {formatBalance(balance)} <span style={{ color: 'var(--accent)' }}>{network?.symbol || 'ETH'}</span>
            </div>
          </div>
          <div className="p-1">
            <button onClick={copyAddress} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs transition-colors"
              style={{ color: copied ? 'var(--success)' : 'var(--text-secondary)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Copy size={13} /> {copied ? 'Copied!' : 'Copy Address'}
            </button>
            <button onClick={() => { onRefresh(); setOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <RefreshCw size={13} /> Refresh Balance
            </button>
            <button onClick={() => { onDisconnect(); setOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs transition-colors"
              style={{ color: 'var(--danger)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={13} /> Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Navbar = ({ wallet }) => {
  return (
    <div
      className="flex items-center justify-between px-4"
      style={{
        height: '52px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div
          className="flex items-center justify-center"
          style={{
            width: '28px', height: '28px',
            background: 'linear-gradient(135deg, var(--accent), #0891b2)',
            borderRadius: '8px',
          }}
        >
          <Globe size={15} color="#000" />
        </div>
        <span style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: '0.9rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}>
          W3B
        </span>
        <span style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: '0.55rem',
          color: 'var(--accent)',
          background: 'rgba(20,184,166,0.1)',
          padding: '2px 6px',
          borderRadius: '4px',
          border: '1px solid rgba(20,184,166,0.2)',
          letterSpacing: '0.1em',
        }}>BETA</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {wallet.connected ? (
          <>
            <NetworkSelector
              network={wallet.network}
              chainId={wallet.chainId}
              onSwitch={switchNetwork}
            />
            <WalletMenu
              address={wallet.address}
              shortAddress={wallet.shortAddress}
              balance={wallet.balance}
              network={wallet.network}
              onDisconnect={wallet.disconnect}
              onRefresh={wallet.refreshBalance}
            />
          </>
        ) : (
          <button
            onClick={wallet.connect}
            disabled={wallet.connecting}
            className="btn-primary flex items-center gap-2 px-4 py-1.5"
            style={{ fontSize: '0.75rem', fontFamily: 'Space Mono, monospace' }}
          >
            {wallet.connecting ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Zap size={13} />
                Connect Wallet
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
