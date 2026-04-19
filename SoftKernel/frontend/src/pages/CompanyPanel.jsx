import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';import { useDecimal } from '../context/DecimalContext';import { PriceDisplay, ROLE_NAMES, shortAddr, useHLUSDPrices, formatMultiPrice } from '../utils/priceUtils.jsx';

const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

export default function CompanyPanel() {
  const { account, contracts } = useWallet();
  const prices = useHLUSDPrices();
  const { formatValue } = useDecimal();
  const [companyName, setCompanyName] = useState('');
  const [myCompanies, setMyCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [roles, setRoles] = useState({ members: [], roles: [] });
  const [stats, setStats] = useState(null);
  const [newRoleAddr, setNewRoleAddr] = useState('');
  const [newRoleType, setNewRoleType] = useState('HR');
  const [removeAddr, setRemoveAddr] = useState('');
  const [removeRoleType, setRemoveRoleType] = useState('HR');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [treasuryStats, setTreasuryStats] = useState(null);
  const [newName, setNewName] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [yieldStats, setYieldStats] = useState(null);
  const [bonusAddr, setBonusAddr] = useState('');
  const [bonusAmount, setBonusAmount] = useState('');
  const [bonusUnlockDate, setBonusUnlockDate] = useState('');
  const [liveYield, setLiveYield] = useState('0.000000');
  const [myRole, setMyRole] = useState(0); // 0=NONE, 1=HR, 2=CEO

  const loadCompanies = useCallback(async () => {
    if (!contracts.salaryStream || !account) return;
    try {
      const ids = await contracts.salaryStream.getUserCompanies(account);
      const companiesData = [];
      for (const id of ids) {
        const [name, creator, createdAt, exists] = await contracts.salaryStream.getCompany(id);
        if (exists) {
          companiesData.push({ id: Number(id), name, creator, createdAt: Number(createdAt) });
        }
      }
      // Deduplicate by ID
      const unique = [...new Map(companiesData.map(c => [c.id, c])).values()];
      setMyCompanies(unique);
    } catch (e) {
      console.error('Failed to load companies:', e);
    }
  }, [contracts.salaryStream, account]);

  const loadCompanyDetails = useCallback(async (companyId) => {
    if (!contracts.salaryStream) return;
    try {
      const [name, creator, createdAt, exists] = await contracts.salaryStream.getCompany(companyId);
      setCompanyDetails({ name, creator, createdAt: Number(createdAt), exists });

      // Get current user's role for this company
      const role = await contracts.salaryStream.companyRoles(companyId, account);
      setMyRole(Number(role));

      const [members, roleVals] = await contracts.salaryStream.getCompanyRoles(companyId);
      setRoles({
        members: members.map(m => m),
        roles: roleVals.map(r => Number(r)),
      });

      const [totalEmps, activeStreams, totalReserved, totalPaid] =
        await contracts.salaryStream.getCompanyStats(companyId);
      setStats({
        totalEmployees: Number(totalEmps),
        activeStreams: Number(activeStreams),
        totalReserved,
        totalPaid,
      });

      // Treasury stats for company creator
      if (contracts.treasury) {
        const bal = await contracts.treasury.companyBalances(creator, companyId);
        const reserved = await contracts.treasury.companyReserved(creator, companyId);
        const available = await contracts.treasury.getAvailableBalance(creator, companyId);
        setTreasuryStats({ balance: bal, reserved, available });

        // Yield stats
        try {
          const [reservedYield, accruedYield, totalClaimed, annualRate, lastClaim] = 
            await contracts.treasury.getYieldStats(creator, companyId);
          setYieldStats({
            reserved: reservedYield,
            accrued: accruedYield,
            totalClaimed,
            annualRate: Number(annualRate),
            lastClaim: Number(lastClaim),
          });
        } catch (e) {
          console.error('Failed to load yield stats:', e);
        }
      }
    } catch (e) {
      console.error('Failed to load company details:', e);
    }
  }, [contracts.salaryStream, contracts.treasury, account]);

  useEffect(() => { loadCompanies(); }, [loadCompanies]);
  useEffect(() => {
    if (selectedCompany) {
      loadCompanyDetails(selectedCompany);
      
      // Auto-refresh company details every 15 seconds
      const interval = setInterval(() => {
        loadCompanyDetails(selectedCompany);
      }, 15000);
      
      return () => clearInterval(interval);
    }
  }, [selectedCompany, loadCompanyDetails]);

  // Live yield simulation (updates every second)
  useEffect(() => {
    if (!yieldStats || !yieldStats.reserved || yieldStats.reserved === 0n) {
      setLiveYield('0.000000');
      return;
    }

    const simulateYield = () => {
      const reservedBigInt = BigInt(yieldStats.reserved.toString());
      const lastClaimTimestamp = yieldStats.lastClaim;

      if (reservedBigInt === 0n || lastClaimTimestamp === 0) {
        setLiveYield('0.000000');
        return;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const elapsedSeconds = currentTime - lastClaimTimestamp;

      if (elapsedSeconds <= 0) {
        setLiveYield('0.000000');
        return;
      }

      // Contract formula: yield = (reserved × annualRate × elapsed) / (100 × SECONDS_PER_YEAR)
      const annualRate = BigInt(yieldStats.annualRate);
      const elapsed = BigInt(elapsedSeconds);
      const divisor = BigInt(100 * SECONDS_PER_YEAR);

      const yieldAmount = (reservedBigInt * annualRate * elapsed) / divisor;
      const yieldFormatted = formatValue(yieldAmount);

      setLiveYield(yieldFormatted);
    };

    simulateYield();
    const interval = setInterval(simulateYield, 1000);
    
    return () => clearInterval(interval);
  }, [yieldStats]);

  const handleCreateCompany = async () => {
    if (!companyName.trim()) return;
    setLoading(true);
    setStatus('');
    try {
      const tx = await contracts.salaryStream.createCompany(companyName.trim());
      setStatus('Creating company...');
      await tx.wait();
      setStatus('Company created!');
      setCompanyName('');
      await loadCompanies();
    } catch (e) {
      setStatus('Error: ' + (e.reason || e.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async () => {
    if (!selectedCompany || !newRoleAddr) return;
    if (!ethers.isAddress(newRoleAddr)) {
      setStatus('Error: Invalid Ethereum address');
      return;
    }
    setLoading(true);
    setStatus('');
    try {
      const fn = newRoleType === 'CEO' ? 'addCEO' : 'addHR';
      const tx = await contracts.salaryStream[fn](selectedCompany, newRoleAddr);
      setStatus(`Assigning ${newRoleType}...`);
      await tx.wait();
      setStatus(`${newRoleType} assigned!`);
      setNewRoleAddr('');
      await loadCompanyDetails(selectedCompany);
    } catch (e) {
      setStatus('Error: ' + (e.reason || e.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = async () => {
    if (!selectedCompany || !removeAddr) return;
    if (!ethers.isAddress(removeAddr)) {
      setStatus('Error: Invalid Ethereum address');
      return;
    }
    setLoading(true);
    setStatus('');
    try {
      const fn = removeRoleType === 'CEO' ? 'removeCEO' : 'removeHR';
      const tx = await contracts.salaryStream[fn](selectedCompany, removeAddr);
      setStatus(`Removing ${removeRoleType}...`);
      await tx.wait();
      setStatus(`${removeRoleType} removed!`);
      setRemoveAddr('');
      await loadCompanyDetails(selectedCompany);
    } catch (e) {
      setStatus('Error: ' + (e.reason || e.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async () => {
    if (!selectedCompany || !newName.trim()) return;
    setLoading(true);
    try {
      const tx = await contracts.salaryStream.updateCompanyName(selectedCompany, newName.trim());
      await tx.wait();
      setStatus('Name updated!');
      setNewName('');
      await loadCompanyDetails(selectedCompany);
      await loadCompanies();
    } catch (e) {
      setStatus('Error: ' + (e.reason || e.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0 || !selectedCompany) return;
    setLoading(true);
    try {
      const tx = await contracts.treasury.deposit(selectedCompany, {
        value: ethers.parseEther(depositAmount),
      });
      setStatus('Depositing to treasury...');
      await tx.wait();
      setStatus('Deposited!');
      setDepositAmount('');
      if (selectedCompany) await loadCompanyDetails(selectedCompany);
    } catch (e) {
      setStatus('Error: ' + (e.reason || e.message));
    } finally {
      setLoading(false);
    }
  };

  const handleClaimYield = async () => {
    if (!selectedCompany) return;
    setLoading(true);
    try {
      const tx = await contracts.treasury.claimYield(selectedCompany);
      setStatus('Claiming yield...');
      await tx.wait();
      setStatus('Yield claimed!');
      await loadCompanyDetails(selectedCompany);
    } catch (e) {
      setStatus('Error: ' + (e.reason || e.message));
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleBonus = async () => {
    if (!selectedCompany || !bonusAddr || !bonusAmount || !bonusUnlockDate) return;
    if (!ethers.isAddress(bonusAddr)) {
      setStatus('Error: Invalid employee address');
      return;
    }
    setLoading(true);
    try {
      const unlockTimestamp = Math.floor(new Date(bonusUnlockDate).getTime() / 1000);
      const amount = ethers.parseEther(bonusAmount);
      const tx = await contracts.salaryStream.scheduleBonus(bonusAddr, amount, unlockTimestamp);
      setStatus('Scheduling bonus...');
      await tx.wait();
      setStatus('Bonus scheduled!');
      setBonusAddr('');
      setBonusAmount('');
      setBonusUnlockDate('');
      await loadCompanyDetails(selectedCompany);
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
          <h2 className="panel-title">Company Panel</h2>
          <p className="text-secondary">Connect your wallet to manage companies.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Company Governance</h1>

      {status && <div className="status-banner">{status}</div>}

      {/* Create Company */}
      <div className="panel glass-panel">
        <h3 className="panel-subtitle">Create New Company</h3>
        <div className="form-row">
          <input
            className="input-field"
            placeholder="Company name"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleCreateCompany} disabled={loading}>
            {loading ? '...' : '+ Create'}
          </button>
        </div>
      </div>

      {/* My Companies */}
      <div className="panel glass-panel">
        <h3 className="panel-subtitle">My Companies</h3>
        {myCompanies.length === 0 ? (
          <p className="text-secondary">No companies yet. Create one above.</p>
        ) : (
          <div className="company-grid">
            {myCompanies.map(c => (
              <div
                key={c.id}
                className={`company-card ${selectedCompany === c.id ? 'company-card-active' : ''}`}
                onClick={() => setSelectedCompany(c.id)}
              >
                <div className="company-card-name">{c.name}</div>
                <div className="company-card-id">ID: {c.id}</div>
                <div className="company-card-date">
                  {new Date(c.createdAt * 1000).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Company Details */}
      {selectedCompany && companyDetails && (
        <>
          {/* Stats Overview */}
          <div className="panel glass-panel">
            <h3 className="panel-subtitle">
              {companyDetails.name} -- Overview
              <span style={{ 
                marginLeft: '1rem', 
                fontSize: '0.75rem', 
                color: 'var(--green)', 
                background: 'var(--green-dim)',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontWeight: 600,
                animation: 'pulse 2s ease-in-out infinite'
              }}>
                LIVE
              </span>
            </h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Employees</div>
                <div className="stat-value">{stats?.totalEmployees || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Active Streams</div>
                <div className="stat-value">{stats?.activeStreams || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Reserved</div>
                <div className="stat-value">
                  {stats ? formatMultiPrice(stats.totalReserved, prices, formatValue).hlusd : '0'} HLUSD
                </div>
                {stats && (
                  <div className="stat-sub">
                    ${formatMultiPrice(stats.totalReserved, prices, formatValue).usd} · ₹{formatMultiPrice(stats.totalReserved, prices, formatValue).inr}
                  </div>
                )}
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Paid</div>
                <div className="stat-value">
                  {stats ? formatMultiPrice(stats.totalPaid, prices, formatValue).hlusd : '0'} HLUSD
                </div>
                {stats && (
                  <div className="stat-sub">
                    ${formatMultiPrice(stats.totalPaid, prices, formatValue).usd} · ₹{formatMultiPrice(stats.totalPaid, prices, formatValue).inr}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Company Performance Analytics & Treasury - Side by Side */}
          {stats && treasuryStats && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="panel glass-panel">
              <h3 className="panel-subtitle">Company Performance Metrics</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Stream Activity Rate</div>
                  <div className="stat-value green">
                    {stats.totalEmployees > 0 
                      ? Math.round((stats.activeStreams / stats.totalEmployees) * 100) 
                      : 0}%
                  </div>
                  <div className="stat-sub">{stats.activeStreams} of {stats.totalEmployees} streaming</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Treasury Utilization</div>
                  <div className="stat-value cyan">
                    {treasuryStats.balance > 0n 
                      ? Math.round((Number(treasuryStats.reserved) / Number(treasuryStats.balance)) * 100)
                      : 0}%
                  </div>
                  <div className="stat-sub">
                    {formatMultiPrice(treasuryStats.reserved, prices, formatValue).hlusd} / {formatMultiPrice(treasuryStats.balance, prices, formatValue).hlusd} HLUSD
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Avg Salary</div>
                  <div className="stat-value purple">
                    {stats.activeStreams > 0 && stats.totalReserved > 0n
                      ? formatMultiPrice(stats.totalReserved / BigInt(stats.activeStreams), prices, formatValue).hlusd
                      : '0'} 
                  </div>
                  <div className="stat-sub">HLUSD per stream</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Total Disbursed</div>
                  <div className="stat-value" style={{ color: '#10b981' }}>
                    {formatMultiPrice(stats.totalPaid, prices, formatValue).hlusd} HLUSD
                  </div>
                  <div className="stat-sub">₹{formatMultiPrice(stats.totalPaid, prices, formatValue).inr}</div>
                </div>
              </div>
              </div>

              <div className="panel glass-panel">
              <h3 className="panel-subtitle">
                Company Treasury
                <span style={{ 
                  marginLeft: '0.75rem', 
                  fontSize: '0.7rem', 
                  color: 'var(--text-dim)', 
                  background: 'var(--accent-dim)',
                  padding: '0.2rem 0.4rem',
                  borderRadius: '3px',
                  fontWeight: 600
                }}>
                  Auto-refresh: 15s
                </span>
              </h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Deposited</div>
                  <div className="stat-value">{formatMultiPrice(treasuryStats.balance, prices, formatValue).hlusd} HLUSD</div>
                  <div className="stat-sub">${formatMultiPrice(treasuryStats.balance, prices, formatValue).usd} · ₹{formatMultiPrice(treasuryStats.balance, prices, formatValue).inr}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Reserved</div>
                  <div className="stat-value">{formatMultiPrice(treasuryStats.reserved, prices, formatValue).hlusd} HLUSD</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Available</div>
                  <div className="stat-value cyan">{formatMultiPrice(treasuryStats.available, prices).hlusd} HLUSD</div>
                </div>
              </div>
              <div className="form-row" style={{ marginTop: '1rem' }}>
                <input
                  className="input-field"
                  placeholder="Amount in HLUSD"
                  type="number"
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleDeposit} disabled={loading}>
                  Deposit
                </button>
              </div>
              </div>
            </div>
          )}

          {/* Yield Dashboard & Bonus Scheduling - Side by Side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {yieldStats && (
              <div className="panel glass-panel">
              <h3 className="panel-subtitle">Treasury Yield ({yieldStats.annualRate}% APY)</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Reserved Capital</div>
                  <div className="stat-value">{formatMultiPrice(yieldStats.reserved, prices, formatValue).hlusd} HLUSD</div>
                  <div className="stat-sub">Earning {yieldStats.annualRate}% annually</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Accrued Yield (LIVE)</div>
                  <div className="stat-value green" style={{ 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '1.2rem',
                    animation: 'pulse 2s ease-in-out infinite'
                  }}>
                    {liveYield} HLUSD
                  </div>
                  <div className="stat-sub">Updating every second</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Total Claimed</div>
                  <div className="stat-value">{formatValue(yieldStats.totalClaimed)} HLUSD</div>
                  <div className="stat-sub">
                    {yieldStats.lastClaim > 0 
                      ? `Last: ${new Date(yieldStats.lastClaim * 1000).toLocaleDateString()}`
                      : 'Never claimed'}
                  </div>
                </div>
              </div>
              <button 
                className="btn btn-primary" 
                onClick={handleClaimYield} 
                disabled={loading || parseFloat(liveYield) === 0}
                style={{ marginTop: '1rem', width: '100%' }}
              >
                Claim Yield
              </button>
              </div>
            )}

            <div className="panel glass-panel">
            <h3 className="panel-subtitle">Schedule Employee Bonus</h3>
            <div className="form-row">
              <input
                className="input-field"
                placeholder="Employee address"
                value={bonusAddr}
                onChange={e => setBonusAddr(e.target.value)}
              />
            </div>
            <div className="form-row">
              <input
                className="input-field"
                placeholder="Bonus amount (HLUSD)"
                type="number"
                value={bonusAmount}
                onChange={e => setBonusAmount(e.target.value)}
              />
              <input
                className="input-field"
                type="datetime-local"
                value={bonusUnlockDate}
                onChange={e => setBonusUnlockDate(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handleScheduleBonus} disabled={loading}>
                Schedule
              </button>
            </div>
            <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Bonus will be locked until unlock date, then employee can claim it with salary
            </p>
            </div>
          </div>

          {/* Roles & Update Company - Side by Side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="panel glass-panel">
            <h3 className="panel-subtitle">Company Roles</h3>
            <div className="roles-table">
              <div className="roles-header">
                <span>Address</span>
                <span>Role</span>
              </div>
              {roles.members.map((m, i) => (
                <div key={m} className="roles-row">
                  <span className="mono">{shortAddr(m)}</span>
                  <span className={`role-badge role-${ROLE_NAMES[roles.roles[i]]?.toLowerCase()}`}>
                    {ROLE_NAMES[roles.roles[i]]}
                  </span>
                </div>
              ))}
            </div>

            {/* CEO-only: Add/Remove Roles */}
            {myRole === 2 && (
              <>
                <div className="form-section">
                  <h4>Add Role</h4>
                  <div className="form-row">
                    <input
                      className="input-field"
                      placeholder="0x address"
                      value={newRoleAddr}
                      onChange={e => setNewRoleAddr(e.target.value)}
                    />
                    <select className="select-field" value={newRoleType} onChange={e => setNewRoleType(e.target.value)}>
                      <option value="HR">HR</option>
                      <option value="CEO">CEO</option>
                    </select>
                    <button className="btn btn-primary" onClick={handleAddRole} disabled={loading}>
                      Assign
                    </button>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Remove Role</h4>
                  <div className="form-row">
                    <input
                      className="input-field"
                      placeholder="0x address"
                      value={removeAddr}
                      onChange={e => setRemoveAddr(e.target.value)}
                    />
                    <select className="select-field" value={removeRoleType} onChange={e => setRemoveRoleType(e.target.value)}>
                      <option value="HR">HR</option>
                      <option value="CEO">CEO</option>
                    </select>
                    <button className="btn btn-danger" onClick={handleRemoveRole} disabled={loading}>
                      Remove
                    </button>
                  </div>
                </div>
              </>
            )}
            </div>

            {myRole === 2 && (
              <div className="panel glass-panel">
                <h3 className="panel-subtitle">Update Company</h3>
                <div className="form-row">
                  <input
                    className="input-field"
                    placeholder="New company name"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                  />
                  <button className="btn btn-primary" onClick={handleUpdateName} disabled={loading}>
                    Update Name
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
