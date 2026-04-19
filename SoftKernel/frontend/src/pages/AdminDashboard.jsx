import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import { useDecimal } from '../context/DecimalContext';
// import DepositPanel from '../components/DepositPanel'; // DEPRECATED: Use CompanyPanel for deposits (requires companyId)
import CreateStreamForm from '../components/CreateStreamForm';
import normalizeBigInts from '../utils/normalizeBigInts';

export default function AdminDashboard() {
  const { account, contracts, isCorrectNetwork } = useWallet();
  const { formatValue } = useDecimal();
  const [balances, setBalances] = useState({
    total: '0',
    reserved: '0',
    available: '0',
    treasuryTotal: '0',
  });
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [employerStats, setEmployerStats] = useState(null);

  // Load employee list directly from contract (no events needed!)
  const fetchEmployeesFromChain = useCallback(async () => {
    if (!contracts.salaryStream || !account) return;
    
    try {
      // Direct on-chain call - instant, no scanning
      const employees = await contracts.salaryStream.getEmployeesByEmployer(account);
      setEmployeeList(employees.map(addr => addr.toLowerCase()));
    } catch (err) {
      console.error('Failed to load employees from chain:', err);
    }
  }, [contracts.salaryStream, account]);

  // Fetch global and employer-specific analytics
  const fetchAnalytics = useCallback(async () => {
    if (!contracts.salaryStream || !account) return;
    
    try {
      const [global, employer] = await Promise.all([
        contracts.salaryStream.getGlobalStats(),
        contracts.salaryStream.getEmployerStats(account),
      ]);

      // Normalize BigInt values before setting state
      setGlobalStats(normalizeBigInts({
        totalStreams: global[0],
        activeStreams: global[1],
        totalReserved: global[2],
        totalPaid: global[3],
        totalBonusesScheduled: global[4],
        totalBonusesPaid: global[5],
      }));

      setEmployerStats(normalizeBigInts({
        employeeCount: employer[0],
        activeCount: employer[1],
        totalReserved: employer[2],
        totalPaid: employer[3],
      }));
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  }, [contracts.salaryStream, account]);

  useEffect(() => {
    fetchEmployeesFromChain();
    fetchAnalytics();
  }, [fetchEmployeesFromChain, fetchAnalytics]);

  const addToast = useCallback((message, type = 'info', txHash = null) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, txHash }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const fetchBalances = useCallback(async () => {
    if (!contracts.treasury || !account) return;
    setLoading(true);
    console.log('💰 Fetching balances for account:', account);
    try {
      const [total, reserved, treasuryTotal] = await Promise.all([
        contracts.treasury.employerBalances(account),
        contracts.treasury.employerReserved(account),
        contracts.treasury.getTreasuryBalance(), // Get total contract balance
      ]);
      // Normalize BigInt before setting state
      const totalStr = total.toString();
      const reservedStr = reserved.toString();
      const availableStr = (total - reserved).toString();
      const treasuryTotalStr = treasuryTotal.toString();
      
      console.log('✅ Balances fetched:', {
        account: account,
        total: ethers.formatEther(totalStr),
        reserved: ethers.formatEther(reservedStr),
        available: ethers.formatEther(availableStr),
      });
      
      setBalances({
        total: totalStr,
        reserved: reservedStr,
        available: availableStr,
        treasuryTotal: treasuryTotalStr,
      });
    } catch (err) {
      console.error('Fetch balances error:', err);
    } finally {
      setLoading(false);
    }
  }, [contracts.treasury, account]);

  useEffect(() => {
    fetchBalances();
    const interval = setInterval(fetchBalances, 15000);
    return () => clearInterval(interval);
  }, [fetchBalances]);

  const handleTxResult = useCallback(
    (message, type, txHash) => {
      addToast(message, type, txHash);
      if (type === 'success') {
        setTimeout(fetchBalances, 2000);
      }
    },
    [addToast, fetchBalances]
  );

  const handleStreamCreated = useCallback(async (employeeAddress, streamData) => {
    // Refresh employee list and analytics from blockchain
    await fetchEmployeesFromChain();
    await fetchAnalytics();
  }, [fetchEmployeesFromChain, fetchAnalytics]);

  const handleStreamDeleted = useCallback(async (employeeAddress) => {
    // Refresh analytics after stream deletion
    await fetchEmployeesFromChain();
    await fetchAnalytics();
  }, [fetchEmployeesFromChain, fetchAnalytics]);

  if (!account) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-state-icon">--</div>
          <div className="empty-state-title">Connect Your Wallet</div>
          <div className="empty-state-text">
            Connect MetaMask to access the Admin Console
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
        <div>
          <h1 className="dashboard-title">
            HR Management Console
          </h1>
          <p className="dashboard-subtitle">
            Complete on-chain payroll control system - manage treasury, create streams, monitor employees
          </p>
        </div>
      </div>

      {/* Multi-Company Notice */}
      <div className="dashboard-full">
        <div className="glass-card" style={{ 
          background: 'var(--accent-dim)', 
          border: '1px solid var(--border)',
          marginBottom: '1.5rem'
        }}>
          <div style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Multi-Company Features Available
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Yield claiming and bonus scheduling are now company-scoped.<br/>
              Visit <strong>Company Panel</strong> to manage company-specific treasury, yield, and bonuses.
            </p>
            <a href="/company" style={{ 
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: 'var(--text-primary)',
              color: 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}>
              Go to Company Panel →
            </a>
          </div>
        </div>
      </div>

      {/* Treasury Stats */}
      <div className="dashboard-full">
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <span className="card-title">Treasury Status</span>
            <button
              className="btn btn-outline"
              style={{ width: 'auto', padding: '0.4rem 1rem', fontSize: '0.8rem' }}
              onClick={fetchBalances}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : '↻ Refresh'}
            </button>
          </div>
          
          {/* Account Info Banner */}
          <div style={{ 
            background: 'var(--accent-dim)', 
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            marginBottom: '1rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div>
              <strong>Viewing balance for:</strong> {account}
              <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px', color: 'var(--text-dim)' }}>
                Treasury tracks deposits per wallet address. Switch MetaMask accounts to view different balances.
              </div>
            </div>
          </div>

          <div className="treasury-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div className="stat-item">
              <div className="stat-label">Your Total Deposited</div>
              <div className="stat-value">{formatValue(balances.total)}</div>
              <div className="form-hint">HLUSD</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Your Reserved</div>
              <div className="stat-value purple">
                {formatValue(balances.reserved)}
              </div>
              <div className="form-hint">HLUSD</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Your Available</div>
              <div className="stat-value green">
                {formatValue(balances.available)}
              </div>
              <div className="form-hint">HLUSD</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Total Treasury Balance</div>
              <div className="stat-value" style={{ color: 'var(--cyan)' }}>
                {formatValue(balances.treasuryTotal)}
              </div>
              <div className="form-hint">All employers</div>
            </div>
          </div>
        </div>

        {/* Analytics Panel - Self-Indexing Dashboard */}
        {employerStats && (
          <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <span className="card-title">Real-Time Analytics</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>On-chain indexed</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
              {/* Your Stats */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Your Payroll
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  <div className="stat-item">
                    <div className="stat-label">Total Employees</div>
                    <div className="stat-value cyan">{employerStats.employeeCount.toString()}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Active Streams</div>
                    <div className="stat-value green">{employerStats.activeCount.toString()}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Your Reserved</div>
                    <div className="stat-value purple">{formatValue(employerStats.totalReserved)}</div>
                    <div className="form-hint">HLUSD</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Your Paid</div>
                    <div className="stat-value green">{formatValue(employerStats.totalPaid)}</div>
                    <div className="form-hint">HLUSD</div>
                  </div>
                </div>
              </div>

              {/* Global Stats */}
              {globalStats && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Global Platform
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                    <div className="stat-item">
                      <div className="stat-label">Total Streams</div>
                      <div className="stat-value">{globalStats.totalStreams.toString()}</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Active Now</div>
                      <div className="stat-value green">{globalStats.activeStreams.toString()}</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Global Reserved</div>
                      <div className="stat-value purple">{formatValue(globalStats.totalReserved)}</div>
                      <div className="form-hint">HLUSD</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Global Paid</div>
                      <div className="stat-value green">{formatValue(globalStats.totalPaid)}</div>
                      <div className="form-hint">HLUSD</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Yield Engine + Bonus Scheduler - DEPRECATED: Now company-scoped in CompanyPanel */}
      {/* 
      <div className="dashboard-grid">
        <YieldEnginePanel />
        <BonusSchedulerPanel employeeList={employeeList} />
      </div>
      */}

      {/* Global Analytics Cards */}
      {globalStats && (
        <div className="dashboard-full">
          <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <span className="card-title">Platform Analytics Overview</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>100% on-chain data</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
              <div className="stat-item analytics-card-anim" style={{ '--anim-delay': '0s' }}>
                <div className="stat-label">Total Streams</div>
                <div className="stat-value cyan">{globalStats.totalStreams.toString()}</div>
              </div>
              <div className="stat-item analytics-card-anim" style={{ '--anim-delay': '0.05s' }}>
                <div className="stat-label">Active Streams</div>
                <div className="stat-value green">{globalStats.activeStreams.toString()}</div>
              </div>
              <div className="stat-item analytics-card-anim" style={{ '--anim-delay': '0.1s' }}>
                <div className="stat-label">Total Reserved</div>
                <div className="stat-value purple">{formatValue(globalStats.totalReserved)}</div>
                <div className="form-hint">HLUSD</div>
              </div>
              <div className="stat-item analytics-card-anim" style={{ '--anim-delay': '0.15s' }}>
                <div className="stat-label">Total Paid</div>
                <div className="stat-value green">{formatValue(globalStats.totalPaid)}</div>
                <div className="form-hint">HLUSD</div>
              </div>
              <div className="stat-item analytics-card-anim" style={{ '--anim-delay': '0.2s' }}>
                <div className="stat-label">Yield Generated</div>
                <div className="stat-value">
                  {(() => { try { return formatValue(globalStats.totalPaid || '0'); } catch { return '0'; }})()}
                </div>
                <div className="form-hint">HLUSD</div>
              </div>
              <div className="stat-item analytics-card-anim" style={{ '--anim-delay': '0.25s' }}>
                <div className="stat-label">Bonuses Scheduled</div>
                <div className="stat-value">{formatValue(globalStats.totalBonusesScheduled || '0')}</div>
                <div className="form-hint">HLUSD</div>
              </div>
              <div className="stat-item analytics-card-anim" style={{ '--anim-delay': '0.3s' }}>
                <div className="stat-label">Bonuses Paid</div>
                <div className="stat-value green">{formatValue(globalStats.totalBonusesPaid || '0')}</div>
                <div className="form-hint">HLUSD</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Panels */}
      <div className="dashboard-full">
        <ExplanationPanels />
      </div>

      {/* Deposit + Create Stream */}
      <div className="dashboard-grid">
        {/* DepositPanel removed - deposits now require companyId. Use CompanyPanel instead. */}
        <CreateStreamForm 
          onSuccess={(msg, type, txHash, employeeAddr, streamData) => {
            handleTxResult(msg, type, txHash);
            if (type === 'success' && employeeAddr) {
              handleStreamCreated(employeeAddr, streamData);
            }
          }} 
        />
      </div>

      {/* Employee Management */}
      <div className="dashboard-full" style={{ marginTop: '1.5rem' }}>
        <EmployeeManager 
          employeeList={employeeList}
          onAddEmployee={(addr) => setEmployeeList((prev) => [...new Set([...prev, addr.toLowerCase()])])}
          onRemoveEmployee={(addr) => setEmployeeList((prev) => prev.filter((a) => a !== addr.toLowerCase()))}
          onStreamDeleted={handleStreamDeleted}
        />
      </div>
    </div>
  );
}

function EmployeeManager({ employeeList, onAddEmployee, onRemoveEmployee, onStreamDeleted }) {
  const { contracts } = useWallet();
  const [newAddress, setNewAddress] = useState('');
  const [streams, setStreams] = useState({});
  const [loading, setLoading] = useState({});
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Fetch all employee streams
  const fetchStreams = useCallback(async () => {
    if (!contracts.salaryStream || employeeList.length === 0) return;
    
    const newStreams = {};
    const newLoading = {};
    
    for (const addr of employeeList) {
      newLoading[addr] = true;
    }
    setLoading(newLoading);

    const results = await Promise.allSettled(
      employeeList.map(async (addr) => {
        const exists = await contracts.salaryStream.hasStream(addr);
        if (exists) {
          const details = await contracts.salaryStream.getStreamDetails(addr);
          const withdrawable = await contracts.salaryStream.getWithdrawable(addr);
          // Normalize BigInt values before returning
          return { 
            addr, 
            stream: normalizeBigInts(details), 
            withdrawable: withdrawable.toString() 
          };
        }
        return { addr, stream: null, withdrawable: '0' };
      })
    );

    results.forEach((result, idx) => {
      if (result.status === 'fulfilled') {
        newStreams[employeeList[idx]] = result.value;
      }
      newLoading[employeeList[idx]] = false;
    });

    setStreams(newStreams);
    setLoading(newLoading);
  }, [contracts.salaryStream, employeeList]);

  useEffect(() => {
    fetchStreams();
    const interval = setInterval(fetchStreams, 20000);
    return () => clearInterval(interval);
  }, [fetchStreams]);

  const handleAddAddress = () => {
    if (newAddress && ethers.isAddress(newAddress)) {
      onAddEmployee(newAddress);
      setNewAddress('');
    }
  };

  const handleBulkAdd = () => {
    const addresses = prompt('Paste employee addresses (comma or newline separated):');
    if (!addresses) return;
    
    const parsed = addresses
      .split(/[,\n]/)
      .map((a) => a.trim())
      .filter((a) => ethers.isAddress(a));
    
    parsed.forEach((addr) => onAddEmployee(addr));
  };

  const handleExport = () => {
    // Safe export - employeeList contains addresses (strings), no BigInt
    const data = JSON.stringify(employeeList, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paystream-employees-${Date.now()}.json`;
    a.click();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (Array.isArray(data)) {
            data.filter((a) => ethers.isAddress(a)).forEach((addr) => onAddEmployee(addr));
          }
        } catch (err) {
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const stats = {
    total: employeeList.length,
    active: Object.values(streams).filter((s) => s?.stream && !s.stream[8]).length,
    paused: Object.values(streams).filter((s) => s?.stream && s.stream[8]).length,
    noStream: employeeList.length - Object.values(streams).filter((s) => s?.stream).length,
  };

  return (
    <div className="glass-card">
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <span className="card-title">Employee Management ({stats.total})</span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            className="btn btn-outline"
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
            style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
          >
            {viewMode === 'grid' ? 'Table' : 'Grid'}
          </button>
          <button
            className="btn btn-outline"
            onClick={fetchStreams}
            style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
          >
            ↻
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div className="stat-item">
          <div className="stat-label">Total</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Active</div>
          <div className="stat-value green">{stats.active}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Paused</div>
          <div className="stat-value purple">{stats.paused}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">No Stream</div>
          <div className="stat-value">{stats.noStream}</div>
        </div>
      </div>

      {/* Add Employee */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label className="form-label">Add Employee</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            className="form-input"
            type="text"
            placeholder="0x..."
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            style={{ marginBottom: 0 }}
          />
          <button
            className="btn btn-cyan"
            onClick={handleAddAddress}
            disabled={!newAddress || !ethers.isAddress(newAddress)}
            style={{ width: 'auto', padding: '0.75rem 1.5rem', minWidth: '100px' }}
          >
            + Add
          </button>
          <button
            className="btn btn-outline"
            onClick={handleBulkAdd}
            style={{ width: 'auto', padding: '0.75rem 1rem', fontSize: '0.8rem' }}
          >
            Bulk
          </button>
          <button
            className="btn btn-outline"
            onClick={handleImport}
            style={{ width: 'auto', padding: '0.75rem 1rem', fontSize: '0.8rem' }}
          >
            Import
          </button>
          <button
            className="btn btn-outline"
            onClick={handleExport}
            disabled={employeeList.length === 0}
            style={{ width: 'auto', padding: '0.75rem 1rem', fontSize: '0.8rem' }}
          >
            Export
          </button>
        </div>
      </div>

      {/* Employee List */}
      {employeeList.length === 0 ? (
        <div className="empty-state" style={{ padding: '2rem 1rem' }}>
          <div className="empty-state-icon">--</div>
          <div className="empty-state-text">No employees added yet. Add addresses above to manage streams.</div>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {employeeList.map((addr) => (
            <EmployeeCard
              key={addr}
              address={addr}
              streamData={streams[addr]}
              loading={loading[addr]}
              onRemove={() => onRemoveEmployee(addr)}
              onRefresh={fetchStreams}
              onEdit={() => {
                setSelectedEmployee(addr);
                setEditModalOpen(true);
              }}
              onStreamDeleted={onStreamDeleted}
            />
          ))}
        </div>
      ) : (
        <EmployeeTable
          employees={employeeList}
          streams={streams}
          loading={loading}
          onRemove={onRemoveEmployee}
          onRefresh={fetchStreams}
          onStreamDeleted={onStreamDeleted}
        />
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <EditStreamModal
          address={selectedEmployee}
          streamData={streams[selectedEmployee]}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedEmployee(null);
          }}
          onSuccess={() => {
            fetchStreams();
            setEditModalOpen(false);
            setSelectedEmployee(null);
          }}
        />
      )}
    </div>
  );
}

function EmployeeCard({ address, streamData, loading, onRemove, onRefresh, onEdit, onStreamDeleted }) {
  const { contracts } = useWallet();
  const [actionLoading, setActionLoading] = useState(false);

  const formatDate = (ts) => {
    const d = new Date(Number(ts) * 1000);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handlePauseResume = async () => {
    if (!contracts.salaryStream || !streamData?.stream) return;
    setActionLoading(true);
    try {
      const tx = streamData.stream[8]
        ? await contracts.salaryStream.resumeStream(address)
        : await contracts.salaryStream.pauseStream(address);
      await tx.wait();
      onRefresh();
    } catch (err) {
      console.error('Pause/Resume error:', err);
      alert(err.reason || err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!contracts.salaryStream) return;
    if (!confirm(`Cancel stream for ${address.slice(0, 6)}...${address.slice(-4)}?`)) return;
    setActionLoading(true);
    try {
      const tx = await contracts.salaryStream.cancelStream(address);
      await tx.wait();
      onStreamDeleted(address);
      onRefresh();
    } catch (err) {
      console.error('Cancel error:', err);
      alert(err.reason || err.message || 'Cancel failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: 30, height: 30, margin: '1rem auto', borderWidth: 3 }} />
        </div>
      </div>
    );
  }

  const stream = streamData?.stream;
  const hasStream = !!stream;

  return (
    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--cyan)', marginBottom: '0.5rem' }}>
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
          {hasStream && (
            <span className={`card-badge ${!stream[8] ? 'badge-active' : 'badge-paused'}`}>
              {stream[8] ? 'Paused' : 'Active'}
            </span>
          )}
        </div>
        <button
          onClick={() => onRemove(address)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            fontSize: '1rem',
            padding: '0.25rem',
          }}
          title="Remove from list"
        >
          ✕
        </button>
      </div>

      {hasStream ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <div className="stream-detail-label">Monthly</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {console.log(stream)}
                {formatValue(BigInt(stream[2]) * 2592000n)}
              </div>
            </div>
            <div>
              <div className="stream-detail-label">Tax</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {stream[7]}%
              </div>
            </div>
            <div>
              <div className="stream-detail-label">Withdrawable</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--green)' }}>
                {formatValue(streamData.withdrawable || '0')}
              </div>
            </div>
            <div>
              <div className="stream-detail-label">End Date</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {formatDate(stream[5])}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              className="btn btn-outline"
              onClick={handlePauseResume}
              disabled={actionLoading}
              style={{ padding: '0.5rem', fontSize: '0.75rem' }}
            >
              {stream[8] ? 'Resume' : 'Pause'}
            </button>
            <button
              className="btn btn-outline"
              onClick={handleCancel}
              disabled={actionLoading}
              style={{ padding: '0.5rem', fontSize: '0.75rem', color: 'var(--red)', borderColor: 'var(--red)' }}
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '1rem 0', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
          No stream created yet
        </div>
      )}
    </div>
  );
}

function EmployeeTable({ employees, streams, loading, onRemove, onRefresh, onStreamDeleted }) {
  const { contracts } = useWallet();
  const [actionLoading, setActionLoading] = useState({});

  const handleAction = async (address, action) => {
    if (!contracts.salaryStream) return;
    setActionLoading({ ...actionLoading, [address]: true });
    try {
      let tx;
      const stream = streams[address]?.stream;
      
      if (action === 'pause') {
        tx = await contracts.salaryStream.pauseStream(address);
      } else if (action === 'resume') {
        tx = await contracts.salaryStream.resumeStream(address);
      } else if (action === 'cancel') {
        if (!confirm(`Cancel stream for ${address.slice(0, 6)}...${address.slice(-4)}?`)) return;
        tx = await contracts.salaryStream.cancelStream(address);
      }
      
      await tx.wait();
      if (action === 'cancel') {
        onStreamDeleted(address);
      }
      onRefresh();
    } catch (err) {
      console.error('Action error:', err);
      alert(err.reason || err.message || 'Action failed');
    } finally {
      setActionLoading({ ...actionLoading, [address]: false });
    }
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
            <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Address</th>
            <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Status</th>
            <th style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Monthly</th>
            <th style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Tax</th>
            <th style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Withdrawable</th>
            <th style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((addr) => {
            const streamData = streams[addr];
            const stream = streamData?.stream;
            const hasStream = !!stream;
            const isLoading = loading[addr] || actionLoading[addr];

            return (
              <tr key={addr} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--cyan)', fontSize: '0.8rem' }}>
                  {addr.slice(0, 6)}...{addr.slice(-4)}
                </td>
                <td style={{ padding: '0.75rem' }}>
                  {hasStream ? (
                    <span className={`card-badge ${!stream[9] ? 'badge-active' : 'badge-paused'}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                      {stream[9] ? 'Paused' : 'Active'}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>—</span>
                  )}
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>
                  {hasStream ? formatValue(BigInt(stream[2]) * 2592000n) : '—'}
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>
                  {hasStream ? `${stream[7].toString()}%` : '—'}
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: 'var(--green)' }}>
                  {hasStream ? formatValue(streamData.withdrawable || '0') : '—'}
                </td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                    {hasStream && (
                      <>
                        <button
                          onClick={() => handleAction(addr, stream[9] ? 'resume' : 'pause')}
                          disabled={isLoading}
                          style={{
                            padding: '0.35rem 0.6rem',
                            fontSize: '0.7rem',
                            background: 'transparent',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '6px',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                          }}
                        >
                          {stream[9] ? 'Resume' : 'Pause'}
                        </button>
                        <button
                          onClick={() => handleAction(addr, 'cancel')}
                          disabled={isLoading}
                          style={{
                            padding: '0.35rem 0.6rem',
                            fontSize: '0.7rem',
                            background: 'transparent',
                            border: '1px solid var(--red)',
                            borderRadius: '6px',
                            color: 'var(--red)',
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onRemove(addr)}
                      style={{
                        padding: '0.35rem 0.6rem',
                        fontSize: '0.7rem',
                        background: 'transparent',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '6px',
                        color: 'var(--text-dim)',
                        cursor: 'pointer',
                      }}
                      title="Remove from list"
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EditStreamModal({ address, streamData, onClose, onSuccess }) {
  // Note: Contract doesn't support direct modification
  // This modal explains the workflow: cancel + recreate
  const stream = streamData?.stream;

  return (
    <div className="network-warning-overlay" onClick={onClose}>
      <div className="glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480, padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Modify Stream</h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              fontSize: '1.5rem',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '8px', background: 'var(--accent-dim)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>
            How to Modify
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            The contract doesn't support direct stream modification. To change parameters:
            <ol style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
              <li>Cancel the current stream</li>
              <li>Create a new stream with updated parameters</li>
            </ol>
          </div>
        </div>

        {stream && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Current Configuration
            </div>
            <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div>Monthly Salary: <strong>{formatValue(BigInt(stream[2]) * 2592000n)} HLUSD</strong></div>
              <div>Tax: <strong>{stream[7]}%</strong></div>
              <div>Status: <strong>{stream[9] ? 'Paused' : 'Active'}</strong></div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={onClose} style={{ flex: 1 }}>
            Cancel
          </button>
          <button className="btn btn-cyan" onClick={onClose} style={{ flex: 1 }}>
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== YIELD ENGINE PANEL ==========
/**
 * ⏱️ LOCAL YIELD SIMULATION ENGINE
 * 
 * Architecture:
 * - Fetches yield stats ONCE on mount (no polling)
 * - Simulates yield locally using contract formula:
 *   yield = (reserved × annualRate × elapsed) / (100 × SECONDS_PER_YEAR)
 * - Updates every 1 second for smooth animation
 * - Drift correction on tab focus
 * - Refresh after claim
 * 
 * Security: Frontend simulation is DISPLAY ONLY
 * Actual claimYield() always uses contract-calculated values
 */
function YieldEnginePanel() {
  const { account, contracts } = useWallet();
  const [displayYield, setDisplayYield] = useState('0');
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  
  // Yield parameters (fetched once)
  const [yieldData, setYieldData] = useState({
    reserved: '0',
    totalClaimed: '0',
    annualRate: 5,
    lastClaimTimestamp: 0,
  });
  
  const [initialized, setInitialized] = useState(false);
  const SECONDS_PER_YEAR = 365 * 24 * 3600;

  /**
   * Fetch yield stats from contract (called once on mount + drift correction)
   */
  const fetchYieldStats = useCallback(async () => {
    if (!contracts.treasury || !account) return;
    try {
      console.log('🔄 Fetching yield stats from contract (no polling)...');
      
      const stats = await contracts.treasury.getYieldStats(account);
      
      // Store yield parameters for local simulation
      setYieldData({
        reserved: stats[0].toString(),
        totalClaimed: stats[2].toString(),
        annualRate: Number(stats[3]),
        lastClaimTimestamp: Number(stats[4]),
      });
      
      setInitialized(true);
      
      console.log('✅ Yield data loaded:', {
        reserved: ethers.formatEther(stats[0]),
        annualRate: Number(stats[3]) + '%',
        lastClaim: stats[4] > 0 ? new Date(Number(stats[4]) * 1000).toLocaleString() : 'Never',
        totalClaimed: ethers.formatEther(stats[2]),
      });
    } catch (err) {
      console.error('❌ Yield stats fetch error:', err);
    }
  }, [contracts.treasury, account]);

  /**
   * Fetch yield stats ONCE on mount
   * NO polling intervals - pure local simulation
   */
  useEffect(() => {
    fetchYieldStats();
  }, [fetchYieldStats]);

  /**
   * DRIFT CORRECTION: Re-fetch on tab focus
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && initialized) {
        console.log('👀 Tab focused - refreshing yield data for drift correction');
        fetchYieldStats();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [initialized, fetchYieldStats]);

  /**
   * LOCAL YIELD SIMULATION
   * Updates every 1 second (smooth animation)
   * 
   * Formula (mirrors Treasury contract):
   * elapsed = currentTime - lastClaimTimestamp
   * yield = (reserved × annualRate × elapsed) / (100 × SECONDS_PER_YEAR)
   */
  useEffect(() => {
    if (!initialized) return;

    const simulateYield = () => {
      const reservedBigInt = BigInt(yieldData.reserved || '0');
      const lastClaimTimestamp = yieldData.lastClaimTimestamp;

      // If no reserved capital or no last claim, yield is zero
      if (reservedBigInt === 0n || lastClaimTimestamp === 0) {
        setDisplayYield('0.000000000000');
        return;
      }

      // Get current time (Unix timestamp in seconds)
      const currentTime = Math.floor(Date.now() / 1000);

      // Calculate elapsed time since last claim
      const elapsedSeconds = currentTime - lastClaimTimestamp;

      if (elapsedSeconds <= 0) {
        setDisplayYield('0.000000000000');
        return;
      }

      // Calculate yield using contract formula:
      // yield = (reserved × annualRate × elapsed) / (100 × SECONDS_PER_YEAR)
      const annualRate = BigInt(yieldData.annualRate);
      const elapsed = BigInt(elapsedSeconds);
      const divisor = BigInt(100 * SECONDS_PER_YEAR);

      const yieldAmount = (reservedBigInt * annualRate * elapsed) / divisor;

      // Format for display (full precision)
      const yieldFormatted = formatValue(yieldAmount);

      setDisplayYield(yieldFormatted);
    };

    // Run simulation immediately
    simulateYield();

    // Update every 1 second for smooth animation
    const interval = setInterval(simulateYield, 1000);
    
    return () => clearInterval(interval);
  }, [initialized, yieldData, SECONDS_PER_YEAR]);

  /**
   * Claim yield and refresh data
   */
  const handleClaimYield = async () => {
    if (!contracts.treasury) return;
    setClaiming(true);
    try {
      const tx = await contracts.treasury.claimYield();
      await tx.wait();
      
      setClaimSuccess(true);
      setTimeout(() => setClaimSuccess(false), 2000);
      
      // Refresh yield data after claim
      fetchYieldStats();
    } catch (err) {
      console.error('Claim yield error:', err);
      alert(err.reason || err.message || 'Claim failed');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="glass-card yield-panel">
      <div className="card-header">
        <span className="card-title">Payroll Capital Yield Engine</span>
        <span className="yield-badge">{yieldData.annualRate}% APY</span>
      </div>

      <div className="yield-display">
        <div className="yield-arc-container">
          <div className="yield-arc" />
          <div className="yield-center">
            <div className="yield-label">ACCRUED YIELD</div>
            <div className={`yield-ticker ${claimSuccess ? 'yield-reset' : ''}`}>
              {displayYield}
            </div>
            <div className="yield-unit">HLUSD</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', margin: '1rem 0' }}>
        <div className="stat-item" style={{ borderColor: 'var(--border)' }}>
          <div className="stat-label">Reserved Capital</div>
          <div className="stat-value" style={{ fontSize: '1.1rem' }}>
            {initialized ? formatValue(yieldData.reserved) : '0'}
          </div>
          <div className="form-hint">HLUSD</div>
        </div>
        <div className="stat-item" style={{ borderColor: 'var(--border)' }}>
          <div className="stat-label">Total Yield Claimed</div>
          <div className="stat-value green" style={{ fontSize: '1.1rem' }}>
            {initialized ? formatValue(yieldData.totalClaimed) : '0'}
          </div>
          <div className="form-hint">HLUSD</div>
        </div>
      </div>

      <button
        className="btn btn-yield"
        onClick={handleClaimYield}
        disabled={claiming || displayYield === '0.000000000000'}
      >
        {claiming ? <span className="spinner" /> : claimSuccess ? 'Yield Claimed!' : 'Claim Yield'}
      </button>

      {/* Last Claim Info */}
      {yieldData.lastClaimTimestamp > 0 && (
        <div className="form-hint" style={{ marginTop: '0.75rem', textAlign: 'center', color: 'var(--text-dim)' }}>
          Last claim: {new Date(yieldData.lastClaimTimestamp * 1000).toLocaleString()}
        </div>
      )}
    </div>
  );
}

// ========== BONUS SCHEDULER PANEL ==========
function BonusSchedulerPanel({ employeeList }) {
  const { contracts, account } = useWallet();
  const [bonusAddr, setBonusAddr] = useState('');
  const [bonusAmount, setBonusAmount] = useState('');
  const [bonusDate, setBonusDate] = useState('');
  const [bonusTime, setBonusTime] = useState('12:00');
  const [scheduling, setScheduling] = useState(false);
  const [allBonuses, setAllBonuses] = useState({});
  const [loadingBonuses, setLoadingBonuses] = useState(false);

  const fetchBonuses = useCallback(async () => {
    if (!contracts.salaryStream || employeeList.length === 0) return;
    setLoadingBonuses(true);
    try {
      const result = {};
      for (const addr of employeeList) {
        try {
          const bonuses = await contracts.salaryStream.getEmployeeBonuses(addr);
          if (bonuses.length > 0) {
            result[addr] = bonuses.map(b => ({
              amount: b.amount.toString(),
              unlockTime: Number(b.unlockTime),
              claimed: b.claimed,
            }));
          }
        } catch { /* no bonuses */ }
      }
      setAllBonuses(result);
    } catch (err) {
      console.error('Fetch bonuses error:', err);
    }
    setLoadingBonuses(false);
  }, [contracts.salaryStream, employeeList]);

  useEffect(() => {
    fetchBonuses();
  }, [fetchBonuses]);

  const handleScheduleBonus = async () => {
    if (!contracts.salaryStream || !bonusAddr || !bonusAmount || !bonusDate) return;
    setScheduling(true);
    try {
      const unlockTimestamp = Math.floor(new Date(`${bonusDate}T${bonusTime}`).getTime() / 1000);
      const amount = ethers.parseEther(bonusAmount);
      const tx = await contracts.salaryStream.scheduleBonus(bonusAddr, amount, unlockTimestamp);
      await tx.wait();
      setBonusAmount('');
      setBonusDate('');
      fetchBonuses();
    } catch (err) {
      console.error('Schedule bonus error:', err);
      alert(err.reason || err.message || 'Failed to schedule bonus');
    } finally {
      setScheduling(false);
    }
  };

  const formatDate = (ts) => new Date(ts * 1000).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="glass-card bonus-panel">
      <div className="card-header">
        <span className="card-title">Bonus Scheduler</span>
        <button className="btn btn-outline" onClick={fetchBonuses} disabled={loadingBonuses} style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
          {loadingBonuses ? <span className="spinner" /> : '↻'}
        </button>
      </div>

      {/* Schedule Form */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label className="form-label">Employee Address</label>
        <select
          className="form-input"
          value={bonusAddr}
          onChange={(e) => setBonusAddr(e.target.value)}
          style={{ marginBottom: '0.75rem' }}
        >
          <option value="">Select employee...</option>
          {employeeList.map(addr => (
            <option key={addr} value={addr}>{addr.slice(0, 8)}...{addr.slice(-6)}</option>
          ))}
        </select>

        <label className="form-label">Bonus Amount (HLUSD)</label>
        <input
          className="form-input"
          type="number"
          step="0.001"
          placeholder="e.g. 5.0"
          value={bonusAmount}
          onChange={(e) => setBonusAmount(e.target.value)}
          style={{ marginBottom: '0.75rem' }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div>
            <label className="form-label">Unlock Date</label>
            <input
              className="form-input"
              type="date"
              value={bonusDate}
              onChange={(e) => setBonusDate(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Unlock Time</label>
            <input
              className="form-input"
              type="time"
              value={bonusTime}
              onChange={(e) => setBonusTime(e.target.value)}
            />
          </div>
        </div>
      </div>

      <button
        className="btn btn-purple"
        onClick={handleScheduleBonus}
        disabled={scheduling || !bonusAddr || !bonusAmount || !bonusDate}
        style={{ marginBottom: '1.25rem' }}
      >
        {scheduling ? <span className="spinner" /> : 'Schedule Bonus'}
      </button>

      {/* Bonus List */}
      {Object.keys(allBonuses).length > 0 && (
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Scheduled Bonuses
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {Object.entries(allBonuses).map(([addr, bonuses]) => (
              bonuses.map((b, i) => (
                <div key={`${addr}-${i}`} className="bonus-row">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--cyan)' }}>
                      {addr.slice(0, 6)}...{addr.slice(-4)}
                    </span>
                    <span className={`card-badge ${b.claimed ? 'badge-paused' : Date.now() / 1000 > b.unlockTime ? 'badge-active' : ''}`}
                      style={!b.claimed && Date.now() / 1000 <= b.unlockTime ? { background: 'var(--accent-dim)', color: 'var(--text-dim)', border: '1px solid var(--border)' } : {}}>
                      {b.claimed ? 'Claimed' : Date.now() / 1000 > b.unlockTime ? 'Ready' : 'Locked'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 600 }}>{formatValue(b.amount)} HLUSD</span>
                    <span style={{ color: 'var(--text-dim)' }}>{formatDate(b.unlockTime)}</span>
                  </div>
                </div>
              ))
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ========== EXPLANATION PANELS ==========
function ExplanationPanels() {
  const [open, setOpen] = useState({});
  const toggle = (key) => setOpen(prev => ({ ...prev, [key]: !prev[key] }));

  const panels = [
    {
      key: 'streaming',
      icon: '',
      title: 'How Salary Streaming Works',
      content: 'PayStream converts monthly salaries into per-second payment rates. When an employer creates a stream, funds are reserved in the Treasury contract. The employee\'s earnings increase every second based on their ratePerSecond. No continuous transactions are needed — earnings are calculated dynamically using block.timestamp, and employees withdraw whenever they choose. Tax is automatically deducted at withdrawal.',
    },
    {
      key: 'yield',
      icon: '',
      title: 'How Yield Accrues',
      content: 'While employer funds are reserved in the Treasury for active salary streams, they earn a deterministic 5% annual yield. Yield accrues linearly per second using the formula: yield = reserved × rate% × elapsed / (100 × SECONDS_PER_YEAR). This is calculated on-chain with no oracle dependency. Employers can claim accrued yield at any time without affecting employee salary streams.',
    },
    {
      key: 'bonuses',
      icon: '',
      title: 'How Bonuses Unlock',
      content: 'Admins can schedule one-time performance bonuses for any employee with a future unlock time. Bonus funds are reserved from the employer\'s Treasury balance immediately. When the unlock time arrives, the bonus becomes claimable. During the next withdrawal, all unlocked bonuses are automatically included in the gross withdrawable amount, with tax applied uniformly. Bonuses can never be claimed twice.',
    },
  ];

  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      {panels.map(p => (
        <div key={p.key} className="glass-card explanation-card" onClick={() => toggle(p.key)} style={{ cursor: 'pointer', padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              {p.icon} {p.title}
            </span>
            <span style={{ fontSize: '1.2rem', transition: 'transform 0.3s', transform: open[p.key] ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
          </div>
          {open[p.key] && (
            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7, animation: 'fadeInUp 0.3s ease' }}>
              {p.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
