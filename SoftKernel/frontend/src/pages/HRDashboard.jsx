import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import { useDecimal } from '../context/DecimalContext';
import { ROLE_NAMES, shortAddr, useHLUSDPrices, formatMultiPrice } from '../utils/priceUtils.jsx';

export default function HRDashboard() {
  const { account, contracts } = useWallet();
  const prices = useHLUSDPrices();
  const { formatValue } = useDecimal();

  const [myCompanies, setMyCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [myRole, setMyRole] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [streamEmployees, setStreamEmployees] = useState([]);
  const [streamDetails, setStreamDetails] = useState({});

  // Form states
  const [newEmpAddr, setNewEmpAddr] = useState('');
  const [streamEmp, setStreamEmp] = useState('');
  const [streamSalary, setStreamSalary] = useState('');
  const [streamDuration, setStreamDuration] = useState('12');
  const [streamTax, setStreamTax] = useState('10');

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [stats, setStats] = useState(null);

  // Load user's companies where they have HR or CEO role
  const loadCompanies = useCallback(async () => {
    if (!contracts.salaryStream || !account) return;
    try {
      const ids = await contracts.salaryStream.getUserCompanies(account);
      const result = [];
      for (const id of ids) {
        const role = await contracts.salaryStream.companyRoles(id, account);
        const roleNum = Number(role);
        if (roleNum === 1 || roleNum === 2) {
          const [name] = await contracts.salaryStream.getCompany(id);
          result.push({ id: Number(id), name, role: roleNum });
        }
      }
      const unique = [...new Map(result.map(c => [c.id, c])).values()];
      setMyCompanies(unique);
      if (unique.length > 0 && !selectedCompany) {
        setSelectedCompany(unique[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  }, [contracts.salaryStream, account, selectedCompany]);

  const loadCompanyData = useCallback(async () => {
    if (!contracts.salaryStream || !selectedCompany) return;
    try {
      const [name] = await contracts.salaryStream.getCompany(selectedCompany);
      setCompanyName(name);

      const role = await contracts.salaryStream.companyRoles(selectedCompany, account);
      setMyRole(Number(role));

      const emps = await contracts.salaryStream.getCompanyEmployees(selectedCompany);
      setEmployees(emps.map(e => e));

      const sEmps = await contracts.salaryStream.getCompanyStreamEmployees(selectedCompany);
      setStreamEmployees(sEmps.map(e => e));

      // Load stream details for each stream employee
      const details = {};
      for (const emp of sEmps) {
        try {
          const stream = await contracts.salaryStream.getStreamDetails(emp);
          const withdrawable = await contracts.salaryStream.getWithdrawable(emp);
          const earned = await contracts.salaryStream.getEarned(emp);
          details[emp] = {
            employer: stream.employer || stream[0],
            companyId: stream.companyId ?? stream[1],
            monthlySalary: stream.monthlySalary ?? stream[2],
            ratePerSecond: stream.ratePerSecond ?? stream[3],
            startTime: stream.startTime ?? stream[4],
            endTime: stream.endTime ?? stream[5],
            withdrawn: stream.withdrawn ?? stream[6],
            totalAllocated: stream.totalAllocated ?? stream[7],
            taxPercent: stream.taxPercent ?? stream[8],
            paused: stream.paused ?? stream[9],
            exists: stream.exists ?? stream[10],
            withdrawable,
            earned,
          };
        } catch { }
      }
      setStreamDetails(details);

      const [totalEmps, activeStreams, totalReserved, totalPaid] =
        await contracts.salaryStream.getCompanyStats(selectedCompany);
      setStats({
        totalEmployees: Number(totalEmps),
        activeStreams: Number(activeStreams),
        totalReserved,
        totalPaid,
      });
    } catch (e) {
      console.error(e);
    }
  }, [contracts.salaryStream, selectedCompany, account]);

  useEffect(() => { loadCompanies(); }, [loadCompanies]);
  useEffect(() => { loadCompanyData(); }, [loadCompanyData]);

  const handleAddEmployee = async () => {
    if (!newEmpAddr || !selectedCompany) return;
    if (!ethers.isAddress(newEmpAddr)) {
      setStatus('Error: Invalid Ethereum address');
      return;
    }
    setLoading(true);
    setStatus('');
    try {
      const tx = await contracts.salaryStream.addEmployee(selectedCompany, newEmpAddr);
      setStatus('Adding employee...');
      await tx.wait();
      setStatus('Employee added!');
      setNewEmpAddr('');
      await loadCompanyData();
    } catch (e) {
      setStatus('Error: ' + (e.reason || e.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStream = async () => {
    if (!streamEmp || !streamSalary || !selectedCompany) return;
    if (!ethers.isAddress(streamEmp)) {
      setStatus('Error: Invalid employee address');
      return;
    }
    if (parseFloat(streamSalary) <= 0) {
      setStatus('Error: Salary must be greater than 0');
      return;
    }
    setLoading(true);
    setStatus('');
    try {
      const salary = ethers.parseEther(streamSalary);
      const tx = await contracts.salaryStream.createStream(
        selectedCompany,
        streamEmp,
        salary,
        parseInt(streamDuration),
        parseInt(streamTax)
      );
      setStatus('Creating stream...');
      await tx.wait();
      setStatus('Stream created!');
      setStreamEmp('');
      setStreamSalary('');
      await loadCompanyData();
    } catch (e) {
      setStatus('Error: ' + (e.reason || e.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async (emp) => {
    setLoading(true);
    try {
      const tx = await contracts.salaryStream.pauseStream(emp);
      await tx.wait();
      setStatus('Stream paused.');
      await loadCompanyData();
    } catch (e) {
      setStatus('Error: ' + (e.reason || e.message));
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async (emp) => {
    setLoading(true);
    try {
      const tx = await contracts.salaryStream.resumeStream(emp);
      await tx.wait();
      setStatus('Stream resumed.');
      await loadCompanyData();
    } catch (e) {
      setStatus('Error: ' + (e.reason || e.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (emp) => {
    setLoading(true);
    try {
      const tx = await contracts.salaryStream.cancelStream(emp);
      await tx.wait();
      setStatus('Stream cancelled.');
      await loadCompanyData();
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
          <h2 className="panel-title">HR Dashboard</h2>
          <p className="text-secondary">Connect your wallet to manage payroll.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">HR Dashboard</h1>
      {status && <div className="status-banner">{status}</div>}

      {/* Company Selector */}
      <div className="panel glass-panel">
        <h3 className="panel-subtitle">Select Company</h3>
        {myCompanies.length === 0 ? (
          <p className="text-secondary">
            You don't have HR or CEO role in any company. Ask a CEO to assign you.
          </p>
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
                <span className={`role-badge role-${ROLE_NAMES[c.role]?.toLowerCase()}`}>
                  {ROLE_NAMES[c.role]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedCompany && (
        <>
          {/* Payroll Analytics & HR Operations - Side by Side */}
          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="panel glass-panel">
                <h3 className="panel-subtitle">{companyName} -- Payroll Analytics</h3>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-label">Employees</div>
                    <div className="stat-value">{stats.totalEmployees}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Active Streams</div>
                    <div className="stat-value cyan">{stats.activeStreams}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Reserved</div>
                    <div className="stat-value">{formatMultiPrice(stats.totalReserved, prices, formatValue).hlusd} HLUSD</div>
                    <div className="stat-sub">
                      ${formatMultiPrice(stats.totalReserved, prices, formatValue).usd} · ₹{formatMultiPrice(stats.totalReserved, prices, formatValue).inr}
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Total Paid</div>
                    <div className="stat-value green">{formatMultiPrice(stats.totalPaid, prices, formatValue).hlusd} HLUSD</div>
                    <div className="stat-sub">
                      ${formatMultiPrice(stats.totalPaid, prices, formatValue).usd} · ₹{formatMultiPrice(stats.totalPaid, prices, formatValue).inr}
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel glass-panel">
                <h3 className="panel-subtitle">HR Operations Dashboard</h3>
                <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Stream Fill Rate</div>
                  <div className="stat-value" style={{ 
                    color: stats.totalEmployees > 0 && (stats.activeStreams / stats.totalEmployees) >= 0.8 
                      ? '#10b981' 
                      : '#f59e0b' 
                  }}>
                    {stats.totalEmployees > 0 
                      ? Math.round((stats.activeStreams / stats.totalEmployees) * 100) 
                      : 0}%
                  </div>
                  <div className="stat-sub">
                    {stats.totalEmployees - stats.activeStreams} pending
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Avg Salary Per Stream</div>
                  <div className="stat-value purple">
                    {stats.activeStreams > 0 
                      ? formatMultiPrice(stats.totalReserved / BigInt(stats.activeStreams), prices, formatValue).hlusd
                      : '0'} 
                  </div>
                  <div className="stat-sub">HLUSD allocated</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Payroll Efficiency</div>
                  <div className="stat-value green">
                    {stats.totalReserved > 0n
                      ? Math.round((Number(stats.totalPaid) / Number(stats.totalReserved)) * 100)
                      : 0}%
                  </div>
                  <div className="stat-sub">Disbursed vs Reserved</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Operational Status</div>
                  <div className="stat-value cyan">
                    {stats.activeStreams > 0 ? 'Active' : 'Inactive'}
                  </div>
                  <div className="stat-sub">
                    {stats.activeStreams} live stream{stats.activeStreams !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Add Employee & Create Stream - Side by Side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="panel glass-panel">
            <h3 className="panel-subtitle">Add Employee</h3>
            <div className="form-row">
              <input
                className="input-field"
                placeholder="Employee 0x address"
                value={newEmpAddr}
                onChange={e => setNewEmpAddr(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handleAddEmployee} disabled={loading}>
                + Add
              </button>
            </div>
            {employees.length > 0 && (
              <div className="employee-list">
                <h4>Current Employees ({employees.length})</h4>
                {employees.map(emp => (
                  <div key={emp} className="employee-item">
                    <span className="mono">{shortAddr(emp)}</span>
                    {streamDetails[emp] ? (
                      <span className={`status-dot ${streamDetails[emp].paused ? 'paused' : 'active'}`}>
                        {streamDetails[emp].paused ? 'Paused' : 'Active'}
                      </span>
                    ) : (
                      <span className="status-dot none">No stream</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            </div>

            <div className="panel glass-panel">
            <h3 className="panel-subtitle">Create Salary Stream</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Employee Address</label>
                <input
                  className="input-field"
                  placeholder="0x..."
                  value={streamEmp}
                  onChange={e => setStreamEmp(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Monthly Salary (HLUSD)</label>
                <input
                  className="input-field"
                  type="number"
                  placeholder="e.g. 3000"
                  value={streamSalary}
                  onChange={e => setStreamSalary(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Duration (months)</label>
                <input
                  className="input-field"
                  type="number"
                  value={streamDuration}
                  onChange={e => setStreamDuration(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Tax %</label>
                <input
                  className="input-field"
                  type="number"
                  value={streamTax}
                  onChange={e => setStreamTax(e.target.value)}
                />
              </div>
            </div>
            <button
              className="btn btn-primary"
              style={{ marginTop: '1rem' }}
              onClick={handleCreateStream}
              disabled={loading}
            >
              Create Stream
            </button>
            </div>
          </div>

          {/* Active Streams */}
          <div className="panel glass-panel">
            <h3 className="panel-subtitle">Active Streams</h3>
            {streamEmployees.length === 0 ? (
              <p className="text-secondary">No streams created for this company yet.</p>
            ) : (
              <div className="stream-list">
                {streamEmployees.map(emp => {
                  const s = streamDetails[emp];
                  if (!s || !s.exists) return null;
                  const monthlyFmt = formatMultiPrice(s.monthlySalary, prices, formatValue);
                  const earnedFmt = formatMultiPrice(s.earned, prices, formatValue);
                  const withdrawFmt = formatMultiPrice(s.withdrawable, prices, formatValue);
                  return (
                    <div key={emp} className="stream-card">
                      <div className="stream-card-header">
                        <span className="mono">{shortAddr(emp)}</span>
                        <span className={`status-badge ${s.paused ? 'badge-paused' : 'badge-active'}`}>
                          {s.paused ? 'Paused' : 'Active'}
                        </span>
                      </div>
                      <div className="stream-card-details">
                        <div>
                          <span className="detail-label">Monthly</span>
                          <span className="detail-value">{monthlyFmt.hlusd} HLUSD</span>
                          <span className="detail-sub">${monthlyFmt.usd} · ₹{monthlyFmt.inr}</span>
                        </div>
                        <div>
                          <span className="detail-label">Earned</span>
                          <span className="detail-value green">{earnedFmt.hlusd} HLUSD</span>
                        </div>
                        <div>
                          <span className="detail-label">Withdrawable</span>
                          <span className="detail-value cyan">{withdrawFmt.hlusd} HLUSD</span>
                        </div>
                        <div>
                          <span className="detail-label">Tax</span>
                          <span className="detail-value">{Number(s.taxPercent)}%</span>
                        </div>
                        <div>
                          <span className="detail-label">End Date</span>
                          <span className="detail-value">
                            {new Date(Number(s.endTime) * 1000).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="stream-card-actions">
                        {!s.paused ? (
                          <button className="btn btn-warning btn-sm" onClick={() => handlePause(emp)} disabled={loading}>
                            Pause
                          </button>
                        ) : (
                          <button className="btn btn-primary btn-sm" onClick={() => handleResume(emp)} disabled={loading}>
                            Resume
                          </button>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(emp)} disabled={loading}>
                          ✕ Cancel
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
