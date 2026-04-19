import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import { useDecimal } from '../context/DecimalContext';
import { useHLUSDPrices, formatMultiPrice, shortAddr } from '../utils/priceUtils.jsx';
import OffRampPanel from '../components/OffRampPanel';

const SECONDS_PER_MONTH = 30 * 24 * 60 * 60;

export default function EmployeePortal() {
  const { account, contracts, provider } = useWallet();
  const prices = useHLUSDPrices();

  const [stream, setStream] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [liveEarned, setLiveEarned] = useState(0n);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [bonuses, setBonuses] = useState([]);
  const [pendingBonus, setPendingBonus] = useState(0n);

  // Ref for animation frame
  const rafRef = useRef(null);
  const { formatValue } = useDecimal();
  const streamRef = useRef(null);

  const loadStream = useCallback(async () => {
    if (!contracts.salaryStream || !account) return;
    try {
      const has = await contracts.salaryStream.hasStream(account);
      if (!has) {
        setStream(null);
        return;
      }
      const details = await contracts.salaryStream.getStreamDetails(account);
      const streamData = {
        employer: details.employer,
        companyId: Number(details.companyId),
        monthlySalary: details.monthlySalary,
        ratePerSecond: details.ratePerSecond,
        startTime: Number(details.startTime),
        endTime: Number(details.endTime),
        withdrawn: details.withdrawn,
        totalAllocated: details.totalAllocated,
        taxPercent: Number(details.taxPercent),
        paused: details.paused,
        exists: details.exists,
      };
      setStream(streamData);
      streamRef.current = streamData;

      // Load company name
      if (streamData.companyId > 0) {
        const [name] = await contracts.salaryStream.getCompany(streamData.companyId);
        setCompanyName(name);
      }

      // Load bonuses
      const b = await contracts.salaryStream.getEmployeeBonuses(account);
      setBonuses(b.map((bonus, i) => ({
        amount: bonus.amount,
        unlockTime: Number(bonus.unlockTime),
        claimed: bonus.claimed,
        index: i,
      })));

      const pending = await contracts.salaryStream.getPendingBonusTotal(account);
      setPendingBonus(pending);
    } catch (e) {
      console.error(e);
    }
  }, [contracts.salaryStream, account]);

  useEffect(() => { loadStream(); }, [loadStream]);

  // Frontend-computed live earned (no polling the chain)
  useEffect(() => {
    if (!stream || !stream.exists || stream.paused) {
      setLiveEarned(0n);
      return;
    }

    const tick = () => {
      const s = streamRef.current;
      if (!s) return;
      const now = Math.floor(Date.now() / 1000);
      const eff = now < s.endTime ? now : s.endTime;
      const elapsed = eff - s.startTime;
      const earned = s.ratePerSecond * BigInt(elapsed > 0 ? elapsed : 0);
      setLiveEarned(earned);
      rafRef.current = requestAnimationFrame(tick);
    };

    tick();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [stream]);

  const withdrawable = stream ? (liveEarned > stream.withdrawn ? liveEarned - stream.withdrawn : 0n) : 0n;

  const handleWithdraw = async () => {
    if (!contracts.salaryStream) return;
    setLoading(true);
    setStatus('');
    try {
      const tx = await contracts.salaryStream.withdraw();
      setStatus('Withdrawing...');
      await tx.wait();
      setStatus('Withdrawal successful!');
      await loadStream();
    } catch (e) {
      setStatus('Error: ' + (e.reason || e.message));
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="page-container">
        <div className="panel glass-panel">
          <h2 className="panel-title">Employee Portal</h2>
          <p className="text-secondary">Connect your wallet to view your salary stream.</p>
        </div>
      </div>
    );
  }

  if (!stream || !stream.exists) {
    return (
      <div className="page-container">
        <h1 className="page-title">Employee Portal</h1>
        <div className="panel glass-panel">
          <p className="text-secondary">No active salary stream found for your address.</p>
          <p className="text-dim mono" style={{ marginTop: '0.5rem' }}>{account}</p>
        </div>
      </div>
    );
  }

  const totalFmt = formatMultiPrice(stream.totalAllocated, prices, formatValue);
  const earnedFmt = formatMultiPrice(liveEarned, prices, formatValue);
  const withdrawnFmt = formatMultiPrice(stream.withdrawn, prices, formatValue);
  const withdrawableFmt = formatMultiPrice(withdrawable, prices, formatValue);
  const monthlyFmt = formatMultiPrice(stream.monthlySalary, prices, formatValue);

  const progress = stream.totalAllocated > 0n
    ? Number((liveEarned * 10000n) / stream.totalAllocated) / 100
    : 0;

  const daysLeft = Math.max(0, Math.ceil((stream.endTime - Date.now() / 1000) / 86400));
  
  // Calculate earnings velocity (per day)
  const secondsElapsed = Math.max(1, Math.floor(Date.now() / 1000) - stream.startTime);
  const earningsPerDay = stream.ratePerSecond * BigInt(86400);
  const earningsPerDayFmt = formatMultiPrice(earningsPerDay, prices, formatValue);
  
  // Average daily withdrawal
  const totalDays = Math.max(1, Math.ceil(secondsElapsed / 86400));
  const avgDailyWithdrawal = stream.withdrawn / BigInt(totalDays);
  const avgDailyWithdrawalFmt = formatMultiPrice(avgDailyWithdrawal, prices, formatValue);
  
  // Completion percentage
  const totalDuration = stream.endTime - stream.startTime;
  const timeElapsed = Math.floor(Date.now() / 1000) - stream.startTime;
  const timeProgress = Math.min(100, (timeElapsed / totalDuration) * 100);

  return (
    <div className="page-container">
      <h1 className="page-title">Employee Portal</h1>
      {status && <div className="status-banner">{status}</div>}

      {/* Company Info */}
      <div className="panel glass-panel">
        <div className="emp-header">
          <div>
            <h3 className="panel-subtitle">{companyName || 'Company #' + stream.companyId}</h3>
            <p className="text-dim">Employer: {shortAddr(stream.employer)}</p>
          </div>
          <div className={`status-badge ${stream.paused ? 'badge-paused' : 'badge-active'}`}>
            {stream.paused ? 'Paused' : 'Streaming'}
          </div>
        </div>
      </div>

      {/* Salary Overview & Earnings Analytics - Side by Side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="panel glass-panel">
        <h3 className="panel-subtitle">Salary Overview</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Allocated</div>
            <div className="stat-value">{totalFmt.hlusd} HLUSD</div>
            <div className="stat-sub">${totalFmt.usd} · ₹{totalFmt.inr}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Monthly Salary</div>
            <div className="stat-value">{monthlyFmt.hlusd} HLUSD</div>
            <div className="stat-sub">${monthlyFmt.usd} · ₹{monthlyFmt.inr}</div>
          </div>
          <div className="stat-card highlight-card">
            <div className="stat-label">Earned (Live)</div>
            <div className="stat-value green live-ticker">{earnedFmt.hlusd} HLUSD</div>
            <div className="stat-sub">${earnedFmt.usd} · ₹{earnedFmt.inr}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Already Withdrawn</div>
            <div className="stat-value">{withdrawnFmt.hlusd} HLUSD</div>
            <div className="stat-sub">${withdrawnFmt.usd} · ₹{withdrawnFmt.inr}</div>
          </div>
        </div>

        {/* Progress Bar */}
        {/* <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
          <div className="progress-labels">
            <span>{progress.toFixed(2)}% earned</span>
            <span>{daysLeft} days left</span>
          </div>
        </div> */}
        </div>

        <div className="panel glass-panel">
        <div className="withdraw-info">
          <div className="stat-label">Withdrawable Now</div>
          <div className="withdraw-amount">{withdrawableFmt.hlusd} HLUSD</div>
          <div className="stat-sub">
            ${withdrawableFmt.usd} · ₹{withdrawableFmt.inr}
            {stream.taxPercent > 0 && (
              <span className="tax-note"> (Tax: {stream.taxPercent}%)</span>
            )}
          </div>
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={handleWithdraw}
          disabled={loading || stream.paused || withdrawable === 0n}
        >
          {loading ? 'Processing...' : 'Withdraw'}
        </button>
        </div>
      </div>

      {/* Stream Details & Bonuses - Side by Side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="panel glass-panel">
        <h3 className="panel-subtitle">Earnings Analytics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Earnings Velocity</div>
            <div className="stat-value green">{earningsPerDayFmt.hlusd} HLUSD</div>
            <div className="stat-sub">Per day · ${earningsPerDayFmt.usd}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Time Completion</div>
            <div className="stat-value cyan">{timeProgress.toFixed(1)}%</div>
            <div className="stat-sub">{daysLeft} days remaining</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Daily Withdrawal</div>
            <div className="stat-value">{avgDailyWithdrawalFmt.hlusd} HLUSD</div>
            <div className="stat-sub">Over {totalDays} days</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Stream Health</div>
            <div className="stat-value" style={{ color: progress >= 80 ? '#10b981' : progress >= 50 ? '#f59e0b' : '#06b6d4' }}>
              {progress >= 80 ? 'Excellent' : progress >= 50 ? 'Good' : 'Early'}
            </div>
            <div className="stat-sub">{progress.toFixed(1)}% earned</div>
          </div>
        </div>
        </div>

        <div className="panel glass-panel">
          <h3 className="panel-subtitle">Stream Details</h3>
          <div className="detail-grid">
            <div className="detail-row">
              <span className="detail-label">Tax Rate</span>
              <span className="detail-value">{stream.taxPercent}%</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Start Date</span>
              <span className="detail-value">{new Date(stream.startTime * 1000).toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">End Date</span>
              <span className="detail-value">{new Date(stream.endTime * 1000).toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Rate / Second</span>
              <span className="detail-value mono">{formatValue(stream.ratePerSecond)} HLUSD</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Company ID</span>
              <span className="detail-value">{stream.companyId}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bonuses */}
      {bonuses.length > 0 && (
        <div className="panel glass-panel">
          <h3 className="panel-subtitle">Bonuses</h3>
          {pendingBonus > 0n && (
            <div className="bonus-pending">
              Pending bonus: {formatMultiPrice(pendingBonus, prices, formatValue).hlusd} HLUSD (claimed on next withdraw)
            </div>
          )}
          <div className="bonus-list">
            {bonuses.map(b => (
              <div key={b.index} className={`bonus-item ${b.claimed ? 'bonus-claimed' : ''}`}>
                <span>{formatMultiPrice(b.amount, prices, formatValue).hlusd} HLUSD</span>
                <span>{new Date(b.unlockTime * 1000).toLocaleDateString()}</span>
                <span className={b.claimed ? 'text-dim' : (b.unlockTime * 1000 < Date.now() ? 'green' : 'text-secondary')}>
                  {b.claimed ? 'Claimed' : (b.unlockTime * 1000 < Date.now() ? 'Ready' : 'Locked')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OffRamp — convert HLUSD to INR */}
      {contracts.offRamp && (
        <div style={{ marginTop: '1rem' }}>
          <OffRampPanel
            offRampContract={contracts.offRamp}
            userAddress={account}
          />
        </div>
      )}
    </div>
  );
}
