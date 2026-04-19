
import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { 
  Wallet, Users, Landmark, Settings, Activity, Download, 
  Play, Pause, Ban, Coins, Gift, ArrowRightLeft, ShieldCheck, Percent, X, Repeat, Lock, Key 
} from 'lucide-react';
import './App.css';
import { 
  PAYSTREAM_ADDRESS, PAYSTREAM_ABI, TOKEN_ADDRESS, TOKEN_ABI, HELA_CHAIN_ID 
} from './config';

// Utility Helpers
const formatEth = (val) => val ? parseFloat(ethers.formatEther(val)).toFixed(4) : '0.0000';
const parseEth = (val) => ethers.parseEther(val.toString());
const formatDate = (ts) => new Date(Number(ts) * 1000).toLocaleString();

function App() {
  const [contract, setContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [account, setAccount] = useState('');
  const [role, setRole] = useState('employee'); // 'hr', 'owner', 'both', 'employee'
  const [viewMode, setViewMode] = useState('employee'); // 'hr', 'dev', 'employee'
  const [loading, setLoading] = useState(false);
  const [devUnlocked, setDevUnlocked] = useState(false); // Password State

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");
    setLoading(true);
    try {
      const _provider = new ethers.BrowserProvider(window.ethereum);
      const _signer = await _provider.getSigner();
      const _account = await _signer.getAddress();
      const { chainId } = await _provider.getNetwork();

      if (Number(chainId) !== HELA_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xA2D58' }],
          });
        } catch (e) {
          setLoading(false);
          return alert("Please switch to HeLa Testnet (Chain ID 666888)");
        }
      }

      const psContract = new ethers.Contract(PAYSTREAM_ADDRESS, PAYSTREAM_ABI, _signer);
      const tokContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, _signer);
      
      setContract(psContract);
      setTokenContract(tokContract);
      setAccount(_account);

    } catch (err) { console.error(err); }
    setLoading(false);
  };

  // Role Detection
  useEffect(() => {
    const checkRole = async () => {
      if (!contract || !account) return;
      try {
        const hrAddr = (await contract.hr()).toLowerCase();
        const ownerAddr = (await contract.platformOwner()).toLowerCase();
        const user = account.toLowerCase();

        if (user === hrAddr && user === ownerAddr) {
          setRole('both');
          setViewMode('hr'); 
        } else if (user === hrAddr) {
          setRole('hr');
          setViewMode('hr');
        } else if (user === ownerAddr) {
          setRole('owner');
          setViewMode('dev');
        } else {
          setRole('employee');
          setViewMode('employee');
        }
      } catch (e) { console.error(e); }
    };
    checkRole();
  }, [contract, account]);

  const switchView = () => {
    if (viewMode === 'hr') {
        setViewMode('dev');
    } else {
        setViewMode('hr');
        setDevUnlocked(false); // Lock it again when leaving
    }
  }

  return (
    <div className="container">
      <header>
        <div className="logo">
          <Activity size={32} color="var(--primary)" /> 
          <span>PayStream <span style={{fontSize:'0.8em', color:'var(--text-muted)'}}>V2</span></span>
        </div>
        <div>
          {account ? (
            <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
              {role === 'both' && (
                <button className="btn-outline small" onClick={switchView}>
                  <Repeat size={14} style={{marginRight:5}}/> 
                  Switch to {viewMode === 'hr' ? 'Developer' : 'HR'}
                </button>
              )}
              <div className="wallet-badge">
                <span className={`role-tag ${viewMode === 'dev' ? 'hr' : viewMode === 'hr' ? 'hr' : 'emp'}`}>
                  {viewMode === 'dev' ? '🛠️ Developer' : viewMode === 'hr' ? '👑 HR Admin' : '👷 Employee'}
                </span>
                <span className="addr">{account.slice(0, 6)}...{account.slice(-4)}</span>
              </div>
            </div>
          ) : (
            <button className="btn-primary" onClick={connectWallet}>
              <Wallet size={18} style={{ marginRight: 8 }} /> Connect Wallet
            </button>
          )}
        </div>
      </header>

      {loading ? <div className="hero"><h2>Connecting...</h2></div> :
       !account ? (
        <div className="hero">
          <h1>Corporate Payroll Streaming</h1>
          <p>Real-time salary, bonuses, and yield on HeLa Chain.</p>
          <button className="btn-primary" onClick={connectWallet}>Connect to Dashboard</button>
        </div>
      ) : (
        <>
          {viewMode === 'hr' && <HRDashboard contract={contract} tokenContract={tokenContract} account={account} />}
          
          {viewMode === 'dev' && (
            !devUnlocked ? 
            <DevLockScreen onUnlock={() => setDevUnlocked(true)} /> : 
            <DeveloperDashboard contract={contract} account={account} />
          )}

          {viewMode === 'employee' && <EmployeeDashboard contract={contract} tokenContract={tokenContract} account={account} />}
        </>
      )}
    </div>
  );
}

// ============================================
// 🔒 DEVELOPER LOCK SCREEN
// ============================================
function DevLockScreen({ onUnlock }) {
    const [pass, setPass] = useState('');
    const [error, setError] = useState(false);

    const check = () => {
        if(pass === 'admin123') {
            onUnlock();
        } else {
            setError(true);
            setPass('');
        }
    }

    return (
        <div className="hero" style={{marginTop:'40px'}}>
            <div className="card" style={{maxWidth:'400px', margin:'0 auto', textAlign:'center'}}>
                <Lock size={40} color="var(--primary)" style={{marginBottom:'20px'}}/>
                <h3>Developer Access</h3>
                <p style={{color:'#aaa', fontSize:'0.9rem', marginBottom:'20px'}}>Restricted Area. Enter Admin Password.</p>
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={pass} 
                    onChange={e => {setPass(e.target.value); setError(false)}} 
                    style={{textAlign:'center', fontSize:'1.2rem'}}
                />
                {error && <p style={{color:'var(--danger)', fontSize:'0.8rem'}}>Incorrect Password</p>}
                <button className="btn-primary" onClick={check} style={{width:'100%', marginTop:'10px'}}>
                    <Key size={16} style={{marginRight:5}}/> Unlock Dashboard
                </button>
            </div>
        </div>
    )
}

// ============================================
// 👑 HR DASHBOARD (Payroll, Employees, Settings)
// ============================================
function HRDashboard({ contract, tokenContract, account }) {
  const [stats, setStats] = useState({});
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState('employees');
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [modalType, setModalType] = useState('');
  
  // Settings State
  const [offRampEnabled, setOffRampEnabled] = useState(true);
  const [yieldRate, setYieldRate] = useState(0);
  const [newYieldRate, setNewYieldRate] = useState('');
  const [exchangeRate, setExchangeRate] = useState('');

  // Forms
  const [depositAmt, setDepositAmt] = useState('');
  const [streamAddr, setStreamAddr] = useState('');
  const [streamRate, setStreamRate] = useState('');

  const refreshData = useCallback(async () => {
    if (!contract) return;
    try {
      const data = await contract.getHRDashboard();
      const _offRamp = await contract.offRampEnabled();
      const _yield = await contract.yieldRateBps();

      setStats({
        treasury: formatEth(data.treasury),
        taxVault: formatEth(data.totalTax),
        employees: Number(data.employeeCount),
        active: Number(data.activeCount),
      });
      setOffRampEnabled(_offRamp);
      setYieldRate(Number(_yield));

      const empList = [];
      for (let i = 0; i < Number(data.employeeCount); i++) {
        const addr = await contract.employeeList(i);
        const info = await contract.getEmployeeSalaryInfo(addr);
        const streamData = await contract.streams(addr);
        empList.push({
          address: addr,
          rate: formatEth(info.salaryPerSecond),
          earned: formatEth(info.grossEarned),
          isActive: info.isActive,
          isPaused: info.isPaused,
          taxRate: Number(streamData.taxPercent)
        });
      }
      setEmployees(empList);
    } catch (e) { console.error("HR Fetch Error:", e); }
  }, [contract]);

  useEffect(() => { refreshData(); }, [refreshData]);

  // Actions
  const handleDeposit = async () => {
    try {
      const amt = parseEth(depositAmt);
      const tx1 = await tokenContract.approve(PAYSTREAM_ADDRESS, amt); await tx1.wait();
      const tx2 = await contract.deposit(amt); await tx2.wait();
      alert("Deposit Success"); refreshData();
    } catch (e) { alert(e.message); }
  };

  const startStream = async () => {
    try {
      const tx = await contract.startStream(streamAddr, parseEth(streamRate));
      await tx.wait(); alert("Stream Started"); refreshData();
    } catch (e) { alert(e.message); }
  };

  const terminateStream = async (empAddr) => {
    if(!window.confirm("⚠️ Terminate Employee? This action cannot be undone.")) return;
    try {
      const tx = await contract.terminateEmployee(empAddr);
      await tx.wait(); alert("Terminated"); refreshData();
    } catch(e) { alert(e.message); }
  };

  const collectTax = async () => {
    try {
      const tx = await contract.collectTax();
      await tx.wait(); alert("Tax Collected"); refreshData();
    } catch (e) { alert(e.message); }
  }

  // Settings Actions
  const toggleOffRamp = async () => {
    try {
      const tx = await contract.toggleOffRamp();
      await tx.wait(); alert("Toggled"); refreshData();
    } catch (e) { alert(e.message); }
  }

  const updateYield = async () => {
    try {
      const tx = await contract.updateYieldRate(newYieldRate);
      await tx.wait(); alert("Yield Updated"); refreshData();
    } catch (e) { alert(e.message); }
  }

  const updateINR = async () => {
    try {
      const tx = await contract.updateExchangeRate(1, exchangeRate);
      await tx.wait(); alert("Rate Updated");
    } catch (e) { alert(e.message); }
  }

  const openModal = (empAddr, type) => { setSelectedEmp(empAddr); setModalType(type); }

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Payroll Treasury</div>
          <div className="value">{stats.treasury || 0} HRS</div>
        </div>
        <div className="stat-card">
          <div className="label">Tax Vault</div>
          <div className="value">{stats.taxVault || 0} HRS</div>
        </div>
        <div className="stat-card">
          <div className="label">System Status</div>
          <div className="value" style={{fontSize:'1rem'}}>
             Off-Ramp: {offRampEnabled ? '✅' : '❌'} | Yield: {yieldRate} bps
          </div>
        </div>
      </div>

      <div className="tabs">
        <button className={activeTab === 'employees' ? 'active' : ''} onClick={() => setActiveTab('employees')}><Users size={16}/> Employees</button>
        <button className={activeTab === 'treasury' ? 'active' : ''} onClick={() => setActiveTab('treasury')}><Landmark size={16}/> Treasury</button>
        <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}><Settings size={16}/> Settings</button>
      </div>

      {activeTab === 'employees' && (
        <div className="card">
           <div className="row-header">
              <h3>Employee Management</h3>
              <div className="new-stream-box">
                <input placeholder="Addr" onChange={e=>setStreamAddr(e.target.value)} />
                <input placeholder="Rate" onChange={e=>setStreamRate(e.target.value)} style={{width:'80px'}} />
                <button className="btn-primary small" onClick={startStream}>+ Stream</button>
              </div>
           </div>
           <table>
             <thead>
               <tr>
                 <th>Address</th>
                 <th>Rate</th>
                 <th>Tax %</th>
                 <th>Status</th>
                 <th>Manage</th>
               </tr>
             </thead>
             <tbody>
               {employees.map(emp => (
                 <tr key={emp.address}>
                   <td className="mono">{emp.address.slice(0,6)}...</td>
                   <td>{emp.rate}</td>
                   <td>{emp.taxRate}%</td>
                   <td>{emp.isActive ? (emp.isPaused ? '⏸️' : '🟢') : '🔴'}</td>
                   <td style={{display:'flex', gap:'5px'}}>
                     <button className="icon-btn" title="Pause/Resume" onClick={async () => {
                        const tx = emp.isPaused ? await contract.resumeStream(emp.address) : await contract.pauseStream(emp.address);
                        await tx.wait(); refreshData();
                     }}>{emp.isPaused ? <Play size={14}/> : <Pause size={14}/>}</button>
                     <button className="icon-btn" title="Bonuses" onClick={()=>openModal(emp.address, 'bonus')}><Gift size={14}/></button>
                     <button className="icon-btn" title="Off-Ramp" onClick={()=>openModal(emp.address, 'offramp')}><ArrowRightLeft size={14}/></button>
                     <button className="icon-btn" title="Edit Tax" onClick={()=>openModal(emp.address, 'tax')}><Percent size={14}/></button>
                     <button className="icon-btn" title="Distribute Yield" onClick={async()=>{
                        await (await contract.distributeYield(emp.address)).wait(); alert("Yield Distributed");
                     }}><Coins size={14}/></button>
                     {emp.isActive && (
                       <button className="icon-btn danger" title="Terminate" onClick={() => terminateStream(emp.address)}>
                         <Ban size={14} color="var(--danger)" />
                       </button>
                     )}
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      )}

      {activeTab === 'treasury' && (
        <div className="card">
           <h3>Treasury Operations</h3>
           <div style={{display:'flex', gap:'10px', marginTop:'15px', marginBottom:'20px'}}>
             <input placeholder="Amount HRS" onChange={e=>setDepositAmt(e.target.value)} />
             <button className="btn-success" onClick={handleDeposit}>Approve & Deposit</button>
           </div>
           <div style={{display:'flex', justifyContent:'space-between', marginTop:'20px'}}>
              <button className="btn-outline" onClick={async () => {
                  const tx = await tokenContract.mint(account, parseEth("10000"));
                  await tx.wait(); alert("Minted 10k HRS");
              }}>Mint 10k Test Tokens</button>
              <button className="btn-outline" onClick={collectTax}>Collect Tax ({stats.taxVault})</button>
           </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid-split">
           <div className="card">
              <h3>Protocol Settings</h3>
              <div className="item-row">
                <label>Off-Ramp Status</label>
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                   <strong>{offRampEnabled ? "✅ ON" : "❌ OFF"}</strong>
                   <button className="btn-outline small" onClick={toggleOffRamp}>Toggle</button>
                </div>
              </div>
              <div className="item-row">
                <label>Yield (BPS)</label>
                <div style={{display:'flex', gap:'5px'}}>
                    <input placeholder={yieldRate} onChange={e=>setNewYieldRate(e.target.value)} style={{width:'70px'}}/>
                    <button className="btn-outline small" onClick={updateYield}>Set</button>
                </div>
              </div>
              <div className="item-row">
                <label>INR Rate</label>
                <div style={{display:'flex', gap:'5px'}}>
                    <input placeholder="e.g. 85000000" onChange={e=>setExchangeRate(e.target.value)} style={{width:'100px'}}/>
                    <button className="btn-outline small" onClick={updateINR}>Set</button>
                </div>
              </div>
           </div>
        </div>
      )}

      {selectedEmp && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-btn" onClick={()=>{setSelectedEmp(null); setModalType('')}}><X size={20}/></button>
            {modalType === 'bonus' && <HRBonusPanel contract={contract} employee={selectedEmp} />}
            {modalType === 'offramp' && <HROffRampPanel contract={contract} employee={selectedEmp} />}
            {modalType === 'tax' && <HRTaxPanel contract={contract} employee={selectedEmp} onClose={()=>{setSelectedEmp(null); refreshData()}} />}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// 🛠️ DEVELOPER DASHBOARD (Platform Revenue Only)
// ============================================
function DeveloperDashboard({ contract, account }) {
  const [stats, setStats] = useState({});
  const [platformFee, setPlatformFee] = useState(0);
  const [newFee, setNewFee] = useState('');

  const refreshData = useCallback(async () => {
    if (!contract) return;
    try {
      const data = await contract.getHRDashboard();
      const _pFee = await contract.platformFeePercent();
      
      setStats({ platformVault: formatEth(data.totalPlatformFees) });
      setPlatformFee(Number(_pFee));
    } catch (e) { console.error("Dev Fetch Error:", e); }
  }, [contract]);

  useEffect(() => { refreshData(); }, [refreshData]);

  const updatePlatformCharge = async () => {
    try {
      const tx = await contract.updatePlatformFee(newFee);
      await tx.wait(); alert("Fee Updated"); refreshData();
    } catch (e) { alert(e.message); }
  }

  const collectPlatformFees = async () => {
    try {
      const tx = await contract.collectPlatformFees();
      await tx.wait(); alert("Fees Collected"); refreshData();
    } catch (e) { alert(e.message); }
  }

  return (
    <div className="dashboard">
      <div className="card">
        <h3>Platform Revenue</h3>
        <p style={{color:'#aaa', marginBottom:'20px'}}>Manage platform fees charged on employee streams.</p>
        
        <div style={{marginBottom:'20px'}}>
            <div style={{color:'#aaa', fontSize:'0.9rem'}}>Current Fee Rate</div>
            <div style={{fontSize:'2.5rem', fontWeight:'bold'}}>{platformFee}%</div>
        </div>
        
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', background:'#0f172a', padding:'20px', borderRadius:'10px'}}>
            <div>
                <div style={{color:'#aaa'}}>Vault Balance</div>
                <div style={{fontSize:'1.5rem'}}>{stats.platformVault} HRS</div>
            </div>
            <button className="btn-success" onClick={collectPlatformFees}>Collect Fees</button>
        </div>
        
        <hr style={{borderColor:'#334155', margin:'25px 0'}}/>
        
        <label>Update Fee Percentage (Max 10%)</label>
        <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
            <input placeholder="New Fee %" onChange={e=>setNewFee(e.target.value)} />
            <button className="btn-primary" onClick={updatePlatformCharge}>Update Rate</button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 👷 EMPLOYEE DASHBOARD
// ============================================
function EmployeeDashboard({ contract, tokenContract, account }) {
  const [data, setData] = useState(null);
  const [liveEarned, setLiveEarned] = useState(0);
  const [bonuses, setBonuses] = useState([]);
  const [offRampAmt, setOffRampAmt] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!contract) return;
    try {
      const info = await contract.getEmployeeSalaryInfo(account);
      const yieldInfo = await contract.getEmployeeYieldInfo(account);
      
      setData({
        rate: Number(ethers.formatEther(info.salaryPerSecond)),
        gross: Number(ethers.formatEther(info.grossEarned)),
        yield: formatEth(yieldInfo.yieldClaimable),
        active: info.isActive,
        paused: info.isPaused,
        // FIX: Check salaryPerSecond instead of grossEarned to detect termination on zero-balance
        terminated: !info.isActive && info.salaryPerSecond > 0n 
      });
      setLiveEarned(Number(ethers.formatEther(info.grossEarned)));

      const bCount = await contract.getScheduledBonusCount(account);
      const bList = [];
      for(let i=0; i<bCount; i++) {
         const b = await contract.getScheduledBonus(account, i);
         if(b.exists) bList.push({ index: i, amount: formatEth(b.amount), time: Number(b.releaseTime), claimed: b.claimed });
      }
      setBonuses(bList);
    } catch(e) { 
      setData({ rate: 0, gross: 0, yield: '0', active: false, paused: false, terminated: false });
    }
    setLoading(false);
  }, [contract, account]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    let interval;
    if (data && data.active && !data.paused) {
      interval = setInterval(() => { setLiveEarned(prev => prev + data.rate) }, 1000);
    }
    return () => clearInterval(interval);
  }, [data]);

  const claimBonus = async (idx) => {
    try {
      const tx = await contract.claimScheduledBonus(idx);
      await tx.wait(); alert("Bonus Claimed!"); fetchData();
    } catch(e) { alert(e.message); }
  }

  const handleOffRamp = async () => {
     try {
       const amt = parseEth(offRampAmt);
       const allow = await tokenContract.allowance(account, PAYSTREAM_ADDRESS);
       if(allow < amt) {
          const tx1 = await tokenContract.approve(PAYSTREAM_ADDRESS, amt);
          await tx1.wait();
       }
       const tx2 = await contract.requestOffRamp(amt, 1);
       await tx2.wait(); alert("Request Sent");
     } catch(e) { alert(e.message); }
  }

  if(loading) return <div className="hero"><h3>Loading Profile...</h3></div>;
  if(!data) return <div className="hero"><h3>Welcome! Ask HR to start a stream.</h3></div>;

  return (
    <div className="dashboard">
      {data.terminated && (
        <div style={{background:'rgba(239, 68, 68, 0.2)', border:'1px solid var(--danger)', padding:'20px', borderRadius:'12px', textAlign:'center', marginBottom:'20px'}}>
          <h2 style={{color:'var(--danger)', margin:0, display:'flex', alignItems:'center', justifyContent:'center', gap:'10px'}}>
            <Ban size={24}/> ACCOUNT TERMINATED
          </h2>
          <p style={{margin:'10px 0 0'}}>Stream stopped. You can withdraw remaining funds.</p>
        </div>
      )}

      <div className="live-card">
         <div className="header"><span className={`dot ${data.terminated ? 'red' : ''}`}></span> {data.terminated ? 'FINAL BALANCE' : 'LIVE SALARY'}</div>
         
         {/* STATUS INDICATOR */}
         <div style={{marginBottom:'10px', fontSize:'0.9rem', color: data.terminated ? 'var(--danger)' : data.paused ? 'orange' : 'var(--success)', fontWeight:'bold', background:'rgba(0,0,0,0.2)', display:'inline-block', padding:'4px 12px', borderRadius:'20px'}}>
            Status: {data.terminated ? 'TERMINATED' : data.paused ? 'PAUSED' : 'ACTIVE STREAMING'}
         </div>

         <div className="amount">{liveEarned.toFixed(6)} <span>HRS</span></div>
         {!data.terminated && <div className="rate">Streaming Rate: {data.rate} HRS / sec</div>}
         
         <div className="actions">
           <button className="btn-primary large" onClick={async()=>{ await (await contract.withdrawSalary()).wait(); alert("Withdrawn"); fetchData(); }}>
             <Download size={20} style={{marginRight:8}}/> Withdraw
           </button>
           <button className="btn-outline large" onClick={async()=>{ await (await contract.claimYield()).wait(); alert("Yield Claimed"); }}>
             Claim Yield ({data.yield})
           </button>
         </div>
      </div>

      <div className="grid-split">
         <div className="card">
            <h3>Scheduled Bonuses</h3>
            {bonuses.length === 0 && <p style={{color:'#666'}}>No bonuses found.</p>}
            {bonuses.map(b => (
              <div key={b.index} className="item-row">
                 <div>
                   <div style={{fontWeight:'bold'}}>{b.amount} HRS</div>
                   <div style={{fontSize:'0.8rem', color:'#888'}}>{new Date(b.time*1000).toLocaleString()}</div>
                 </div>
                 {b.claimed ? <span className="status terminated">Claimed</span> : 
                   (Date.now()/1000 > b.time) ? 
                   <button className="btn-success small" onClick={()=>claimBonus(b.index)}>Claim</button> : 
                   <span className="status paused">Locked</span>
                 }
              </div>
            ))}
         </div>
         <div className="card">
            <h3>Off-Ramp (Fiat)</h3>
            <p style={{fontSize:'0.9rem', color:'#aaa'}}>Convert HRS to INR directly.</p>
            <div style={{display:'flex', gap:'10px', marginTop:'15px'}}>
               <input placeholder="Amount HRS" onChange={e=>setOffRampAmt(e.target.value)} />
               <button className="btn-outline" onClick={handleOffRamp}>Request</button>
            </div>
         </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// MODAL COMPONENTS
// ----------------------------------------------------
function HRTaxPanel({ contract, employee, onClose }) {
  const [newTax, setNewTax] = useState('');
  const update = async () => {
    try {
      if(Number(newTax) > 50) return alert("Max tax is 50%");
      const tx = await contract.updateTax(employee, newTax);
      await tx.wait(); alert("Tax Updated"); onClose();
    } catch(e) { alert(e.message); }
  }
  return (
    <div>
      <h3>Update Tax Rate</h3>
      <p style={{color:'#aaa', fontSize:'0.9rem', marginBottom:'15px'}}>Employee: {employee.slice(0,8)}...</p>
      <input placeholder="New Tax % (Max 50)" onChange={e=>setNewTax(e.target.value)} type="number" />
      <button className="btn-primary" onClick={update} style={{width:'100%', marginTop:'10px'}}>Save New Rate</button>
    </div>
  )
}

function HRBonusPanel({ contract, employee }) {
  const [bonuses, setBonuses] = useState([]);
  const [amount, setAmount] = useState('');
  const [delayMin, setDelayMin] = useState('');

  const load = async () => {
     const count = await contract.getScheduledBonusCount(employee);
     const list = [];
     for(let i=0; i<count; i++) {
        const b = await contract.getScheduledBonus(employee, i);
        if(b.exists) list.push({ index: i, amount: formatEth(b.amount), time: b.releaseTime, claimed: b.claimed });
     }
     setBonuses(list);
  }
  useEffect(()=>{load()}, [employee]);

  const schedule = async () => {
    try {
      const releaseTime = Math.floor(Date.now()/1000) + (Number(delayMin)*60);
      const tx = await contract.scheduleBonus(employee, parseEth(amount), releaseTime);
      await tx.wait(); alert("Scheduled"); load();
    } catch(e) { alert(e.message); }
  }

  const cancel = async (idx) => {
    try {
       const tx = await contract.cancelScheduledBonus(employee, idx);
       await tx.wait(); alert("Cancelled"); load();
    } catch(e) { alert(e.message); }
  }

  return (
    <div>
       <h3>Manage Bonuses</h3>
       <div style={{background:'#0f172a', padding:'10px', borderRadius:'8px', marginBottom:'15px'}}>
         <div style={{display:'flex', gap:'5px', marginBottom:'5px'}}>
            <input placeholder="Amt HRS" onChange={e=>setAmount(e.target.value)} style={{flex:1}}/>
            <input placeholder="Mins Delay" onChange={e=>setDelayMin(e.target.value)} style={{flex:1}}/>
         </div>
         <button className="btn-primary small" onClick={schedule} style={{width:'100%'}}>Schedule Bonus</button>
       </div>
       <div style={{maxHeight:'200px', overflowY:'auto'}}>
         {bonuses.length === 0 && <p style={{color:'#666', textAlign:'center'}}>No active bonuses</p>}
         {bonuses.map(b => (
           <div key={b.index} className="item-row">
             <div><div style={{fontWeight:'bold'}}>{b.amount} HRS</div><div style={{fontSize:'0.7rem', color:'#888'}}>{formatDate(b.time)}</div></div>
             {b.claimed ? <span className="status terminated">Claimed</span> : <button className="btn-danger small" onClick={()=>cancel(b.index)}>Cancel</button>}
           </div>
         ))}
       </div>
    </div>
  )
}

function HROffRampPanel({ contract, employee }) {
  const [requests, setRequests] = useState([]);

  const load = async () => {
    const count = await contract.getOffRampCount(employee);
    const list = [];
    for(let i=0; i<count; i++) {
       const r = await contract.getOffRampRequest(employee, i);
       list.push({ index: i, amount: formatEth(r.amount), currency: r.currencyCode, processed: r.processed });
    }
    setRequests(list);
  }
  useEffect(()=>{load()}, [employee]);

  const process = async (idx) => {
    try {
      const tx = await contract.processOffRamp(employee, idx);
      await tx.wait(); alert("Processed"); load();
    } catch(e) { alert(e.message); }
  }

  return (
    <div>
      <h3>Off-Ramp Requests</h3>
      {requests.length === 0 && <p style={{textAlign:'center', color:'#666'}}>No requests found.</p>}
      <div style={{maxHeight:'250px', overflowY:'auto'}}>
        {requests.map(r => (
           <div key={r.index} className="item-row">
             <div><div style={{fontWeight:'bold'}}>{r.amount} HRS</div><div style={{fontSize:'0.8rem', color:'#aaa'}}>{r.currency === 1n ? '🇮🇳 INR' : '💵 Fiat'}</div></div>
             {r.processed ? <span className="status active">Processed</span> : <button className="btn-primary small" onClick={()=>process(r.index)}>Mark Done</button>}
           </div>
        ))}
      </div>
    </div>
  )
}

export default App;