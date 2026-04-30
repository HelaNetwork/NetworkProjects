'use client';

import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { Wallet, LogOut, ChevronDown, Copy, Check, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const CHAIN_NAMES = {
  1: 'Ethereum',
  11155111: 'Sepolia',
  137: 'Polygon',
  42161: 'Arbitrum',
};

const CHAIN_COLORS = {
  1: '#627eea',
  11155111: '#627eea',
  137: '#8247e5',
  42161: '#28a0f0',
};

export default function WalletConnect() {
  const { address, isConnected, status } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, chains } = useSwitchChain();
  const [copied, setCopied] = useState(false);
  const [showChains, setShowChains] = useState(false);

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /* ── Connected State ── */
  if (isConnected && address) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'var(--gradient-success)' }}
            >
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <p
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                Connected Wallet
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <p
                  className="text-sm font-mono font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {address.slice(0, 6)}...{address.slice(-4)}
                </p>
                <button
                  onClick={copyAddress}
                  className="p-1 rounded-md transition-colors hover:bg-white/5"
                  title="Copy address"
                >
                  {copied
                    ? <Check className="w-3.5 h-3.5" style={{ color: 'var(--accent-green)' }} />
                    : <Copy className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                  }
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={() => disconnect()}
            className="btn-secondary flex items-center gap-2 text-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            Disconnect
          </button>
        </div>

        {/* Chain selector */}
        <div className="relative">
          <button
            onClick={() => setShowChains(!showChains)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-primary)',
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: CHAIN_COLORS[chainId] || '#888' }}
              />
              <span className="font-medium">
                {CHAIN_NAMES[chainId] || `Chain ${chainId}`}
              </span>
            </div>
            <ChevronDown
              className="w-4 h-4"
              style={{
                color: 'var(--text-muted)',
                transform: showChains ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>

          {showChains && (
            <div
              className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-10"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)' }}
            >
              {chains.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => { switchChain({ chainId: chain.id }); setShowChains(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors"
                  style={{
                    color: chain.id === chainId ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    background: chain.id === chainId ? 'var(--bg-secondary)' : 'transparent',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = chain.id === chainId ? 'var(--bg-secondary)' : 'transparent')}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: CHAIN_COLORS[chain.id] || '#888' }}
                  />
                  {chain.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── Disconnected State — Connect Wallet Panel ── */
  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: 'var(--bg-card-hover)',
            border: '1px solid var(--border-card)',
          }}
        >
          <Wallet className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
        </div>
        <div>
          <p
            className="text-sm font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            Connect Wallet
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Connect to analyze transactions
          </p>
        </div>
      </div>

      {/* Connector list with right-arrow icons */}
      <div className="space-y-2">
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            id={`connector-${connector.uid}`}
            onClick={() => connect({ connector })}
            disabled={isConnecting}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-card)',
              color: 'var(--text-primary)',
              opacity: isConnecting ? 0.6 : 1,
              cursor: isConnecting ? 'wait' : 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-accent)';
              e.currentTarget.style.background = 'var(--bg-card-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-card)';
              e.currentTarget.style.background = 'var(--bg-secondary)';
            }}
          >
            <span>{connector.name}</span>
            {isConnecting ? (
              <div className="spinner" style={{ width: 16, height: 16 }} />
            ) : (
              <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            )}
          </button>
        ))}
      </div>

      {status === 'connecting' && (
        <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
          Check your wallet for connection request...
        </p>
      )}
    </div>
  );
}
