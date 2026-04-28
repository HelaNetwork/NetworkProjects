import React, { useEffect, useState } from 'react';
import { fetchOnChainData } from '../../lib/ethers';
import { OnChainData } from '../../types';

interface Props {
  walletAddress: string;
  onClose: () => void;
}

const OnChainModal: React.FC<Props> = ({ walletAddress, onClose }) => {
  const [data, setData] = useState<OnChainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'txns' | 'tokens' | 'transfers'>('overview');

  useEffect(() => {
    fetchOnChainData(walletAddress)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [walletAddress]);

  const truncate = (s: string, n = 8) =>
    s ? `${s.slice(0, n)}...${s.slice(-4)}` : '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto glass-card p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ border: '1px solid rgba(20,184,166,0.3)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold mint-gradient-text">On-Chain Data</h2>
            <p className="text-xs text-white/40 mt-1 font-mono">{walletAddress}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge-mint text-xs">Hela Testnet</span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-white/60 hover:text-white"
              id="close-onchain-modal"
            >✕</button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 rounded-xl shimmer" />
            ))}
          </div>
        ) : !data ? (
          <div className="text-center py-12 text-white/40">
            <div className="text-4xl mb-3">⛓️</div>
            <p>Unable to fetch on-chain data</p>
          </div>
        ) : (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Balance', value: `${data.balance} HLA`, icon: '💰' },
                { label: 'Transactions', value: data.totalTransactions.toLocaleString(), icon: '🔄' },
                { label: 'Gas Used', value: data.gasUsed, icon: '⛽' },
                { label: 'Contracts', value: data.contractsCreated, icon: '📄' },
              ].map((stat) => (
                <div key={stat.label} className="glass-card p-3 text-center rounded-xl" style={{ border: '1px solid rgba(20,184,166,0.15)' }}>
                  <div className="text-xl mb-1">{stat.icon}</div>
                  <div className="text-sm font-bold text-mint-400">{stat.value}</div>
                  <div className="text-xs text-white/40 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              {(['overview', 'txns', 'tokens', 'transfers'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all capitalize ${
                    activeTab === tab ? 'text-mint-400 bg-mint-500/15' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {tab === 'txns' ? 'Transactions' : tab === 'transfers' ? 'Token Txns' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'overview' && (
              <div className="space-y-2">
                <p className="text-white/50 text-sm text-center py-8">
                  {data.nfts.length === 0 ? '🖼️ No NFTs found on Hela testnet' : `${data.nfts.length} NFTs minted`}
                </p>
              </div>
            )}

            {activeTab === 'txns' && (
              <div className="space-y-2">
                {data.recentTransactions.length === 0 ? (
                  <p className="text-white/40 text-sm text-center py-8">No transactions found</p>
                ) : (
                  data.recentTransactions.map((tx, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${tx.status === 'success' ? 'bg-mint-400' : 'bg-red-400'}`} />
                        <div>
                          <p className="text-xs font-mono text-white/70">{truncate(tx.hash, 10)}</p>
                          <p className="text-xs text-white/30">{tx.timestamp}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-mint-400">{tx.value} HLA</p>
                        <p className="text-xs text-white/30">→ {truncate(tx.to)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'tokens' && (
              <div className="space-y-2">
                {data.tokenHoldings.length === 0 ? (
                  <p className="text-white/40 text-sm text-center py-8">No token holdings found</p>
                ) : (
                  data.tokenHoldings.map((token, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div>
                        <p className="font-semibold text-sm text-white">{token.name}</p>
                        <p className="text-xs text-white/40 font-mono">{truncate(token.contractAddress)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-mint-400">{token.balance}</p>
                        <p className="text-xs text-white/40">{token.symbol}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'transfers' && (
              <div className="space-y-2">
                {data.tokenTransfers.length === 0 ? (
                  <p className="text-white/40 text-sm text-center py-8">No token transfers found</p>
                ) : (
                  data.tokenTransfers.map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div>
                        <p className="text-xs font-mono text-white/70">{truncate(t.hash, 10)}</p>
                        <p className="text-xs text-white/30">{t.timestamp}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-mint-400">{t.value} {t.token}</p>
                        <p className="text-xs text-white/30">→ {truncate(t.to)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}

        {/* Explorer link */}
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <a
            href={`https://testnet.helascan.io/address/${walletAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-mint-400 hover:text-mint-300 transition-colors flex items-center gap-1"
          >
            <span>View on Helascan Explorer</span>
            <span>↗</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default OnChainModal;
