import { ethers } from 'ethers';
import { useDecimal } from '../context/DecimalContext';
import EarningsTicker from './EarningsTicker';

export default function StreamCard({ stream, account, onWithdraw, withdrawing, pendingBonusTotal }) {
  const { formatValue } = useDecimal();
  if (!stream || stream[0] === ethers.ZeroAddress) return null;

  const formatDate = (ts) => {
    const d = new Date(Number(ts) * 1000);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // All BigInt values come normalized as strings from parent component
  const monthlySalary = BigInt(stream[2]) * 2592000n; // 30 * 24 * 3600
  const isActive = !stream[8];
  const now = BigInt(Math.floor(Date.now() / 1000));
  const hasEnded = now > BigInt(stream[4]);

  return (
    <div className="stream-card">
      <div className="card-header">
        <span className="card-title">Salary Stream</span>
        <span className={`card-badge ${isActive && !hasEnded ? 'badge-active' : 'badge-paused'}`}>
          {hasEnded ? 'Ended' : isActive ? 'Active' : 'Paused'}
        </span>
      </div>

      <div className="stream-details">
        <div className="stream-detail">
          <div className="stream-detail-label">Employer</div>
          <div className="stream-detail-value cyan">
            {stream[0].slice(0, 6)}...{stream[0].slice(-4)}
          </div>
        </div>
        <div className="stream-detail">
          <div className="stream-detail-label">Monthly Salary</div>
          <div className="stream-detail-value">
            {formatValue(monthlySalary)} HLUSD
          </div>
        </div>
        <div className="stream-detail">
          <div className="stream-detail-label">Rate / Second</div>
          <div className="stream-detail-value">
            {formatValue(BigInt(stream[2]))} HLUSD
          </div>
        </div>
        <div className="stream-detail">
          <div className="stream-detail-label">Tax</div>
          <div className="stream-detail-value">{stream[7]}%</div>
        </div>
        <div className="stream-detail">
          <div className="stream-detail-label">Stream Start</div>
          <div className="stream-detail-value">{formatDate(stream[3])}</div>
        </div>
        <div className="stream-detail">
          <div className="stream-detail-label">Stream End</div>
          <div className="stream-detail-value">{formatDate(stream[4])}</div>
        </div>
      </div>

      {isActive && !hasEnded && account && (
        <EarningsTicker employeeAddress={account} />
      )}

      {/* Pending Bonus Display */}
      {pendingBonusTotal && BigInt(pendingBonusTotal) > 0n && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--accent-dim)',
          border: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Bonus Ready</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)' }}>
            +{formatValue(pendingBonusTotal)} HLUSD
          </span>
        </div>
      )}

      {onWithdraw && (
        <button
          className="btn btn-green"
          style={{ marginTop: '1.25rem' }}
          onClick={onWithdraw}
          disabled={withdrawing || stream[8]}
        >
          {withdrawing ? (
            <>
              <span className="spinner" />
              Claiming...
            </>
          ) : (
            <>Claim Earned</>
          )}
        </button>
      )}
    </div>
  );
}
