'use client';

import { ArrowDownLeft, ArrowUpRight, Fuel, AlertCircle } from 'lucide-react';

export default function SimulatorPanel({ result, isLoading }) {
  if (isLoading) {
    return (
      <div className="glass-card p-10 text-center">
        <div className="spinner mx-auto mb-4" style={{ width: 40, height: 40 }} />
        <p
          className="text-base font-semibold"
          style={{ color: 'var(--text-secondary)' }}
        >
          Simulating transaction...
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="glass-card p-10 text-center">
        <div className="text-5xl mb-4">⚡</div>
        <p
          className="text-base font-bold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}
        >
          &quot;What If I Sign This?&quot;
        </p>
        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
          Analyze a transaction above to see predicted outcomes, balance changes, and hidden interactions.
        </p>
      </div>
    );
  }

  const sim = result.simulation;

  return (
    <div className="glass-card p-6 space-y-5">
      <h3
        className="text-base font-bold flex items-center gap-2"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
      >
        ⚡ Simulation Results
      </h3>

      {/* Effects */}
      {sim.effects.length > 0 && (
        <div className="space-y-2.5">
          <p
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            Actions
          </p>
          {sim.effects.map((effect, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-card)',
              }}
            >
              <span className="text-2xl">{effect.icon}</span>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {effect.description}
                </p>
                <p
                  className="text-xs uppercase tracking-wider mt-1 font-semibold"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {effect.type.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Balance Changes */}
      {sim.balanceChanges.length > 0 && (
        <div className="space-y-2">
          <p
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            Balance Changes
          </p>
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--border-card)' }}
          >
            {sim.balanceChanges.map((change, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3.5"
                style={{
                  background: 'var(--bg-secondary)',
                  borderBottom: i < sim.balanceChanges.length - 1
                    ? '1px solid var(--border-card)'
                    : 'none',
                }}
              >
                <div className="flex items-center gap-3">
                  {change.direction === 'out' ? (
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(239,68,68,0.1)' }}
                    >
                      <ArrowUpRight className="w-4 h-4" style={{ color: 'var(--accent-red)' }} />
                    </div>
                  ) : (
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(16,185,129,0.1)' }}
                    >
                      <ArrowDownLeft className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
                    </div>
                  )}
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {change.token}
                  </span>
                </div>
                <span
                  className="text-sm font-mono font-bold"
                  style={{
                    color: change.direction === 'out' ? 'var(--accent-red)' : 'var(--accent-green)',
                  }}
                >
                  {change.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approval Changes */}
      {sim.approvalChanges.length > 0 && (
        <div className="space-y-2">
          <p
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            Approval Changes
          </p>
          {sim.approvalChanges.map((approval, i) => (
            <div
              key={i}
              className="p-4 rounded-xl"
              style={{
                background: approval.amount === 'UNLIMITED' ? 'rgba(239,68,68,0.06)' : 'var(--bg-secondary)',
                border: `1px solid ${approval.amount === 'UNLIMITED' ? 'rgba(239,68,68,0.15)' : 'var(--border-card)'}`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {approval.action === 'approve' ? '🔓' : '🔒'} {approval.type}
                  {approval.token ? ` — ${approval.token}` : ''}
                </span>
                <span
                  className="text-xs font-extrabold px-3 py-1 rounded-full"
                  style={{
                    background: approval.amount === 'UNLIMITED' ? 'rgba(239,68,68,0.2)' : 'rgba(139,92,246,0.12)',
                    color: approval.amount === 'UNLIMITED' ? '#f87171' : 'var(--accent-purple)',
                  }}
                >
                  {approval.amount || approval.scope}
                </span>
              </div>
              <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                Spender: {approval.spender}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Gas Cost */}
      {sim.gasCost && (
        <div
          className="flex items-center gap-4 p-4 rounded-xl"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-card)',
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(245,158,11,0.1)' }}
          >
            <Fuel className="w-5 h-5" style={{ color: 'var(--accent-yellow)' }} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              Estimated Gas: {sim.gasCost.estimatedCostEth} ETH
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {sim.gasCost.gasPriceGwei} Gwei × {sim.gasCost.gasLimit.toLocaleString()} gas limit
            </p>
          </div>
        </div>
      )}

      {/* Warnings */}
      {sim.warnings.length > 0 && (
        <div className="space-y-2.5">
          {sim.warnings.map((warning, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 rounded-xl"
              style={{
                background: warning.type === 'danger' ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)',
                border: `1px solid ${warning.type === 'danger' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)'}`,
              }}
            >
              <AlertCircle
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                style={{
                  color: warning.type === 'danger' ? 'var(--accent-red)' : 'var(--accent-yellow)',
                }}
              />
              <p
                className="text-sm leading-relaxed"
                style={{
                  color: warning.type === 'danger' ? '#fca5a5' : '#fcd34d',
                }}
              >
                {warning.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
