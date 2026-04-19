'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

// Sample transactions for one-click testing
const SAMPLE_TXS = [
  {
    name: 'Simple ETH Transfer',
    icon: '💸',
    desc: 'Send 0.5 ETH to an address',
    risk: 'Low',
    riskColor: '#10b981',
    data: {
      to: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      value: '0x6f05b59d3b20000',
      data: '0x',
    },
  },
  {
    name: 'Unlimited USDT Approval',
    icon: '🚨',
    desc: 'MAX_UINT256 approve on USDT',
    risk: 'High',
    riskColor: '#ef4444',
    data: {
      to: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      data: '0x095ea7b30000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488dffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      value: '0x0',
    },
  },
  {
    name: 'Uniswap V2 Swap',
    icon: '🔄',
    desc: 'Swap ETH for tokens via Uniswap',
    risk: 'Low',
    riskColor: '#10b981',
    data: {
      to: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
      data: '0x7ff36ab500000000000000000000000000000000000000000000000000038d7ea4c6800000000000000000000000000000000000000000000000000000000000000000800000000000000000000000001234567890123456789012345678901234567890000000000000000000000000000000000000000000000000000000006789abcd0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7',
      value: '0x2386f26fc10000',
    },
  },
  {
    name: 'NFT SetApprovalForAll',
    icon: '🖼️',
    desc: 'Grant full NFT collection access',
    risk: 'High',
    riskColor: '#ef4444',
    data: {
      to: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
      data: '0xa22cb465000000000000000000000000def1c0ded9bec7f1a1670819833240f027b25eff0000000000000000000000000000000000000000000000000000000000000001',
      value: '0x0',
    },
  },
  {
    name: 'Staking Deposit',
    icon: '🏦',
    desc: 'Deposit tokens into staking contract',
    risk: 'Medium',
    riskColor: '#f59e0b',
    data: {
      to: '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9',
      data: '0xb6b55f250000000000000000000000000000000000000000000000000de0b6b3a7640000',
      value: '0x0',
    },
  },
];

export default function TransactionPreview({ onAnalyze, isLoading }) {
  const [mode, setMode] = useState('samples');
  const [txTo, setTxTo] = useState('');
  const [txData, setTxData] = useState('');
  const [txValue, setTxValue] = useState('0x0');

  const handleSubmit = () => {
    if (!txTo && !txData) return;
    onAnalyze({ to: txTo, from: '', data: txData, value: txValue });
  };

  const handleSample = (sample) => {
    setTxTo(sample.data.to);
    setTxData(sample.data.data);
    setTxValue(sample.data.value);
    onAnalyze({ to: sample.data.to, from: '', data: sample.data.data, value: sample.data.value });
  };

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div
        className="flex rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--border-card)' }}
      >
        <button
          onClick={() => setMode('samples')}
          className="flex-1 py-3 text-sm font-bold transition-all duration-200"
          style={{
            background: mode === 'samples' ? 'var(--accent-purple)' : 'var(--bg-secondary)',
            color: mode === 'samples' ? 'white' : 'var(--text-muted)',
          }}
        >
          📦 Sample Transactions
        </button>
        <button
          onClick={() => setMode('paste')}
          className="flex-1 py-3 text-sm font-bold transition-all duration-200"
          style={{
            background: mode === 'paste' ? 'var(--accent-purple)' : 'var(--bg-secondary)',
            color: mode === 'paste' ? 'white' : 'var(--text-muted)',
          }}
        >
          ✏️ Paste Custom Data
        </button>
      </div>

      {/* ── Samples Mode ── */}
      {mode === 'samples' && (
        <div className="space-y-2.5">
          {SAMPLE_TXS.map((sample, i) => (
            <button
              key={i}
              onClick={() => handleSample(sample)}
              disabled={isLoading}
              className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-card)',
                opacity: isLoading ? 0.5 : 1,
                cursor: isLoading ? 'wait' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.borderColor = 'var(--border-accent)';
                  e.currentTarget.style.background = 'var(--bg-card-hover)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-card)';
                e.currentTarget.style.background = 'var(--bg-secondary)';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <span className="text-2xl">{sample.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {sample.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {sample.desc}
                </p>
              </div>
              <span
                className="text-xs font-bold px-3 py-1 rounded-full flex-shrink-0"
                style={{
                  background: `${sample.riskColor}18`,
                  color: sample.riskColor,
                  border: `1px solid ${sample.riskColor}30`,
                }}
              >
                {sample.risk}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ── Paste Mode ── */}
      {mode === 'paste' && (
        <div className="space-y-4">
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-muted)' }}
            >
              To Address (Contract)
            </label>
            <input
              type="text"
              value={txTo}
              onChange={(e) => setTxTo(e.target.value)}
              placeholder="0x..."
              className="input-field"
            />
          </div>
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-muted)' }}
            >
              Transaction Data (Calldata)
            </label>
            <textarea
              value={txData}
              onChange={(e) => setTxData(e.target.value)}
              placeholder="0x095ea7b3..."
              className="input-field"
              rows={4}
            />
          </div>
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-muted)' }}
            >
              Value (hex wei) — <span style={{ color: 'var(--text-secondary)' }}>e.g. 0x0 for no ETH</span>
            </label>
            <input
              type="text"
              value={txValue}
              onChange={(e) => setTxValue(e.target.value)}
              placeholder="0x0"
              className="input-field"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={isLoading || (!txTo && !txData)}
            className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base"
            style={{ opacity: isLoading || (!txTo && !txData) ? 0.4 : 1 }}
          >
            {isLoading ? (
              <>
                <div className="spinner" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Analyze Transaction
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
