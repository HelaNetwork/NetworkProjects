import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import StreamCard from '../components/StreamCard';
import OffRampPanel from '../components/OffRampPanel';
import normalizeBigInts from '../utils/normalizeBigInts';
import { useDecimal } from '../context/DecimalContext';

export default function EmployeeDashboard() {
  const { account, contracts, isCorrectNetwork } = useWallet();
  const { formatValue } = useDecimal();
  const [stream, setStream] = useState(null);
  const [hasStream, setHasStream] = useState(false);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [successPulse, setSuccessPulse] = useState(false);
  const [bonuses, setBonuses] = useState([]);
  const [pendingBonusTotal, setPendingBonusTotal] = useState('0');

  const addToast = useCallback((message, type = 'info', txHash = null) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, txHash }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const fetchStream = useCallback(async () => {
    if (!contracts.salaryStream || !account) return;
    setLoading(true);
    try {
      const exists = await contracts.salaryStream.hasStream(account);
      setHasStream(exists);
      if (exists) {
        const [details, bonusList, pendingBonus] = await Promise.all([
          contracts.salaryStream.getStreamDetails(account),
          contracts.salaryStream.getEmployeeBonuses(account),
          contracts.salaryStream.getPendingBonusTotal(account),
        ]);
        const normalized = normalizeBigInts(details);
        setStream(normalized);
        setBonuses(bonusList.map(b => ({
          amount: b.amount.toString(),
          unlockTime: Number(b.unlockTime),
          claimed: b.claimed,
        })));
        setPendingBonusTotal(pendingBonus.toString());
      }
    } catch (err) {
      console.error('Fetch stream error:', err);
    } finally {
      setLoading(false);
    }
  }, [contracts.salaryStream, account]);

  useEffect(() => {
    fetchStream();
  }, [fetchStream]);

  const handleWithdraw = async () => {
    if (!contracts.salaryStream || !stream) return;
    setWithdrawing(true);
    try {
      // Get withdrawable amount before transaction
      const grossWithdrawable = await contracts.salaryStream.getWithdrawable(account);
      const taxPercent = BigInt(stream[7]); // Convert normalized string back to BigInt
      const taxAmount = (grossWithdrawable * taxPercent) / 100n;
      const netAmount = grossWithdrawable - taxAmount;
      
      console.log('=== WITHDRAWAL DEBUG ===');
      console.log('Gross withdrawable:', ethers.formatEther(grossWithdrawable), 'HLUSD');
      console.log('Tax percent:', stream[7], '%');
      console.log('Tax amount:', ethers.formatEther(taxAmount), 'HLUSD');
      console.log('Net amount to receive:', ethers.formatEther(netAmount), 'HLUSD');
      console.log('Employee address:', account);
      
      // Check balance before
      const provider = contracts.salaryStream.runner.provider;
      const balanceBefore = await provider.getBalance(account);
      console.log('Balance BEFORE withdrawal:', ethers.formatEther(balanceBefore), 'HLUSD');
      
      const tx = await contracts.salaryStream.withdraw();
      addToast(
        `Claiming ${ethers.formatEther(netAmount)} HLUSD (after ${stream[7]}% tax)... TX: ${tx.hash}`,
        'info'
      );
      
      const receipt = await tx.wait();
      console.log('Transaction receipt:', receipt);
      console.log('Gas used:', receipt.gasUsed.toString());
      console.log('Effective gas price:', receipt.gasPrice ? receipt.gasPrice.toString() : 'N/A');
      
      // Parse logs to see what actually happened
      console.log('Transaction logs:', receipt.logs);
      receipt.logs.forEach((log, index) => {
        try {
          const parsed = contracts.salaryStream.interface.parseLog(log);
          console.log(`Log ${index} (SalaryStream):`, parsed.name, parsed.args);
        } catch (e) {
          // Try Treasury interface
          try {
            const parsedTreasury = contracts.treasury.interface.parseLog(log);
            console.log(`Log ${index} (Treasury):`, parsedTreasury.name, parsedTreasury.args);
          } catch (e2) {
            console.log(`Log ${index} (Unknown):`, log);
          }
        }
      });
      
      // Check Treasury balance
      const treasuryBalance = await provider.getBalance(contracts.treasury.target);
      console.log('Treasury contract balance:', ethers.formatEther(treasuryBalance), 'HLUSD');
      
      // Check balance after
      const balanceAfter = await provider.getBalance(account);
      console.log('Balance AFTER withdrawal:', ethers.formatEther(balanceAfter), 'HLUSD');
      
      const balanceChange = balanceAfter - balanceBefore;
      console.log('Balance change (including gas):', ethers.formatEther(balanceChange), 'HLUSD');
      console.log('Expected net:', ethers.formatEther(netAmount), 'HLUSD');
      
      if (balanceChange < 0n) {
        console.error('❌ ALERT: Balance DECREASED! Money was NOT transferred!');
        console.error('This likely means Treasury has insufficient HLUSD balance or transfer failed');
      }
      console.log('========================');
      
      addToast(
        `Successfully claimed ${ethers.formatEther(netAmount)} HLUSD!`,
        'success',
        tx.hash
      );
      setSuccessPulse(true);
      setTimeout(() => setSuccessPulse(false), 1000);
      
      // Refresh stream data
      fetchStream();
      
      // Trigger EarningsTicker refresh for drift correction
      if (typeof window.refreshEarningsTicker === 'function') {
        window.refreshEarningsTicker();
      }
    } catch (err) {
      console.error('Withdraw error:', err);
      let errorMsg = err.reason || err.message || 'Withdrawal failed';
      
      // User-friendly error messages
      if (errorMsg.includes('Nothing to withdraw')) {
        errorMsg = 'No earnings available to withdraw yet. Wait for more time to pass.';
      } else if (errorMsg.includes('Stream paused')) {
        errorMsg = 'Stream is paused. Contact your employer to resume it.';
      } else if (errorMsg.includes('Insufficient')) {
        errorMsg = 'Treasury has insufficient balance. Contact your employer.';
      }
      
      addToast(errorMsg, 'error');
    } finally {
      setWithdrawing(false);
    }
  };

  if (!account) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-state-icon">--</div>
          <div className="empty-state-title">Connect Your Wallet</div>
          <div className="empty-state-text">
            Connect MetaMask to access the Employee Portal
          </div>
        </div>
      </div>
    );
  }

  if (!isCorrectNetwork) return null;

  return (
    <div className="dashboard">
      {/* Toasts */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>
              {t.type === 'success' && ''}
              {t.type === 'error' && ''}
              {t.type === 'info' && ''}
              {t.message}
            </span>
            {t.txHash && (
              <a
                href={`https://testnet-blockexplorer.helachain.com/tx/${t.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="toast-link"
              >
                View TX
              </a>
            )}
          </div>
        ))}
      </div>

      <div className="dashboard-header">
        <h1 className="dashboard-title">Employee Portal</h1>
        <p className="dashboard-subtitle">
          Monitor your salary stream and claim earnings
        </p>
      </div>

      <div className="dashboard-full">
        {loading ? (
          <div className="empty-state">
            <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 1rem', borderWidth: 3 }} />
            <div className="empty-state-text">Scanning temporal streams...</div>
          </div>
        ) : !hasStream ? (
          <div className="empty-state">
            <div className="empty-state-icon">--</div>
            <div className="empty-state-title">No Active Stream Detected</div>
            <div className="empty-state-text">
              Your employer hasn't opened a salary stream for this address yet.
              <br />
              Ask your admin to create one from the Admin Console.
            </div>
          </div>
        ) : (
          <>
            <div className={successPulse ? 'success-pulse' : ''} style={{ maxWidth: 640 }}>
              <StreamCard
                stream={stream}
                account={account}
                onWithdraw={handleWithdraw}
                withdrawing={withdrawing}
                pendingBonusTotal={pendingBonusTotal}
              />
            </div>

            {/* Performance Bonus Vault */}
            {bonuses.length > 0 && (
              <div style={{ marginTop: '24px', maxWidth: 640 }}>
                <BonusVault bonuses={bonuses} />
              </div>
            )}

            {/* Explanation Panels */}
            <div style={{ marginTop: '24px', maxWidth: 640 }}>
              <EmployeeExplanationPanels />
            </div>

            {/* OffRamp Panel */}
            {contracts.offRamp && (
              <div style={{ marginTop: '40px' }}>
                <OffRampPanel
                  offRampContract={contracts.offRamp}
                  userAddress={account}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ========== BONUS VAULT ==========
function BonusVault({ bonuses }) {
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const iv = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(iv);
  }, []);

  const fmtCountdown = (seconds) => {
    if (seconds <= 0) return 'Unlocked';
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (d > 0) return `${d}d ${h}h ${m}m ${s}s`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <div className="glass-card bonus-vault-panel">
      <div className="card-header">
        <span className="card-title">Performance Bonus Vault</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{bonuses.length} bonus{bonuses.length !== 1 ? 'es' : ''}</span>
      </div>

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {bonuses.map((b, i) => {
          const remaining = b.unlockTime - now;
          const isReady = remaining <= 0 && !b.claimed;
          const isClaimed = b.claimed;

          return (
            <div
              key={i}
              className={`bonus-card ${isReady ? 'bonus-ready' : ''} ${isClaimed ? 'bonus-claimed' : ''}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{isClaimed ? '--' : isReady ? '!!' : '||'}</span>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem', color: isReady ? 'var(--green)' : isClaimed ? 'var(--text-dim)' : 'var(--text-primary)' }}>
                      {formatValue(b.amount)} HLUSD
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                      Unlock: {new Date(b.unlockTime * 1000).toLocaleString()}
                    </div>
                  </div>
                </div>
                <span className={`card-badge ${isClaimed ? 'badge-paused' : isReady ? 'badge-active' : ''}`}
                  style={!isClaimed && !isReady ? { background: 'var(--accent-dim)', color: 'var(--text-dim)', border: '1px solid var(--border)' } : {}}>
                  {isClaimed ? 'Claimed' : isReady ? 'Ready' : 'Locked'}
                </span>
              </div>

              {!isClaimed && !isReady && (
                <div className="bonus-countdown">
                  <div className="bonus-countdown-bar" style={{ width: `${Math.max(0, Math.min(100, (1 - remaining / 86400) * 100))}%` }} />
                  <span className="bonus-countdown-text">{fmtCountdown(remaining)}</span>
                </div>
              )}

              {isReady && (
                <div style={{ fontSize: '0.8rem', color: 'var(--green)', marginTop: '0.25rem', fontWeight: 600 }}>
                  Included in your next withdrawal!
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ========== EMPLOYEE EXPLANATION PANELS ==========
function EmployeeExplanationPanels() {
  const [open, setOpen] = useState({});
  const toggle = (key) => setOpen(prev => ({ ...prev, [key]: !prev[key] }));

  const panels = [
    {
      key: 'streaming',
      icon: '',
      title: 'How Salary Streaming Works',
      content: 'Your salary streams in real-time, every second. The rate is your monthly salary divided by seconds in a month. You can withdraw your earned HLUSD at any time. Tax is automatically deducted at the configured rate and sent to the tax vault.',
    },
    {
      key: 'bonuses',
      icon: '',
      title: 'How Bonuses Unlock',
      content: 'Performance bonuses are scheduled by your employer with a specific unlock date. When the countdown reaches zero, the bonus becomes "Ready" and will be automatically included in your next withdrawal. Bonuses are subject to the same tax rate as your salary.',
    },
  ];

  return (
    <div style={{ display: 'grid', gap: '0.5rem' }}>
      {panels.map(p => (
        <div key={p.key} className="glass-card explanation-card" onClick={() => toggle(p.key)} style={{ cursor: 'pointer', padding: '0.75rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
              {p.icon} {p.title}
            </span>
            <span style={{ fontSize: '1rem', transition: 'transform 0.3s', transform: open[p.key] ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
          </div>
          {open[p.key] && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, animation: 'fadeInUp 0.3s ease' }}>
              {p.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
