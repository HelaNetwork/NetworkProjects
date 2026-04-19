import { useState, useEffect, useRef } from "react";
import { getFactory, loadStream, getUserAddress } from "../web3/wallet";
import { fetchAllEmployees, addEmployee, deleteEmployee } from "../supabase";
import { ethers } from "ethers";

/*//////////////////////////////////////////////////////////////
                  MODAL STYLES (scoped inline)
//////////////////////////////////////////////////////////////*/
const overlay = {
  position: "fixed", inset: 0,
  background: "rgba(0,0,0,0.7)",
  backdropFilter: "blur(6px)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 1000,
};
const modalBox = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  borderRadius: "20px",
  padding: "36px",
  width: "100%",
  maxWidth: "480px",
  boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
};
const inputStyle = {
  width: "100%",
  background: "var(--bg-dark)",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  padding: "12px 16px",
  color: "var(--text-primary)",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  marginBottom: "16px",
};
const labelStyle = {
  fontSize: "12px",
  fontWeight: "600",
  color: "var(--text-secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: "6px",
  display: "block",
};

/*//////////////////////////////////////////////////////////////
    STREAM DATA HELPER
    Reads all necessary fields from the contract to derive:
      - withdrawableNow  : what employee can pull right now
      - totalStreamed    : cumulative all-time streamed (incl. withdrawn)
      - ratePerSec       : HLUSD/sec (as JS float) for live ticking
      - fetchedAt        : JS timestamp when we fetched (for ticking)
//////////////////////////////////////////////////////////////*/
const EXTRA_ABI = [
  "function withdrawableAmount() view returns (uint256)",
  "function accruedBalance() view returns (uint256)",
  "function alreadyWithdrawn() view returns (uint256)",
  "function ratePerSecondScaled() view returns (uint256)",
  "function lastUpdateTime() view returns (uint256)",
  "function status() view returns (uint8)",
  "function employee() view returns (address)",
  "function employer() view returns (address)",
  "function monthlySalary() view returns (uint256)",
  "function taxPercent() view returns (uint256)",
  "function taxVault() view returns (address)",
  "function pause() nonpayable",
  "function resume() nonpayable",
  "function cancel() nonpayable",
];

async function fetchStreamData(addr, signer) {
  const contract = new ethers.Contract(addr, EXTRA_ABI, signer);

  const [
    withdrawableRaw,
    accruedRaw,
    withdrawnRaw,
    rateScaledRaw,
    lastUpdateRaw,
    statusRaw,
    employeeAddr,
    monthlySalaryRaw,
    taxPercentRaw,
    taxVaultAddr,
  ] = await Promise.all([
    contract.withdrawableAmount(),
    contract.accruedBalance(),
    contract.alreadyWithdrawn(),
    contract.ratePerSecondScaled(),
    contract.lastUpdateTime(),
    contract.status(),
    contract.employee(),
    contract.monthlySalary(),
    contract.taxPercent(),
    contract.taxVault(),
  ]);

  const lastUpdate   = Number(lastUpdateRaw);
  const status       = Number(statusRaw);

  // ratePerSecondScaled = (monthlySalary_wei * 1e18) / SECONDS_PER_MONTH
  // To get HLUSD/sec we must divide by 1e18 USING BigInt, then convert.
  // Using Number() directly overflows — the value is ~1e36 for a 0.05 HLUSD/mo stream.
  const SCALE_BI     = BigInt("1000000000000000000"); // 1e18
  const rateInWei    = rateScaledRaw / SCALE_BI;      // BigInt division → wei/sec (integer)
  // Remainder captures the sub-wei fractional part
  const rateRemainder = rateScaledRaw - (rateInWei * SCALE_BI); // BigInt
  // Convert: whole wei part + fractional part
  const ratePerSec   = Number(ethers.formatEther(rateInWei))
                     + Number(rateRemainder) / 1e36;  // 1e18 (scale) * 1e18 (wei->ETH)

  const accrued      = Number(ethers.formatEther(accruedRaw));
  const withdrawn    = Number(ethers.formatEther(withdrawnRaw));
  const withdrawable = Number(ethers.formatEther(withdrawableRaw));
  const salary       = Number(ethers.formatEther(monthlySalaryRaw));

  // Total ever streamed = accrued + already withdrawn
  // (We'll add live streaming in the ticker)
  const totalStreamed = accrued + withdrawn;

  const taxPct       = Number(taxPercentRaw);
  // Tax flows to the vault at taxPct% of the gross stream rate
  const taxRatePerSec = status === 1 ? ratePerSec * (taxPct / 100) : 0;
  // Total tax ever sent = taxPct% of total gross streamed
  const totalTaxStreamed = totalStreamed * (taxPct / 100);

  return {
    address:          addr,
    employeeAddr,
    salary,
    ratePerSec:       status === 1 ? ratePerSec : 0,
    taxRatePerSec,
    taxPct,
    taxVaultAddr,
    withdrawable,
    accrued,
    withdrawn,
    totalStreamed,
    totalTaxStreamed,
    lastUpdateTime:   lastUpdate,  // Use blockchain time, not JavaScript time
    status,
  };
}

/*//////////////////////////////////////////////////////////////
              DELETE CONFIRMATION MODAL
//////////////////////////////////////////////////////////////*/
function DeleteConfirmModal({ employee, streams, onClose, onConfirmed }) {
  const [deleting, setDeleting] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const linkedStream = streams.find(
    s => s.walletAddress?.toLowerCase() === employee.wallet_address?.toLowerCase()
  );

  async function handleDelete() {
    try {
      setDeleting(true);
      if (linkedStream) {
        setStatusMsg("Cancelling on-chain stream...");
        const sc = loadStream(linkedStream.address);
        const tx = await sc.cancel();
        await tx.wait();
      }
      setStatusMsg("Removing from directory...");
      await deleteEmployee(employee.id);
      onConfirmed(employee.id, linkedStream?.address);
      onClose();
    } catch (err) {
      alert("Failed: " + err.message);
    } finally {
      setDeleting(false);
      setStatusMsg("");
    }
  }

  return (
    <div style={overlay} onClick={!deleting ? onClose : undefined}>
      <div style={{ ...modalBox, maxWidth: "420px" }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "14px",
            background: "rgba(255,61,113,0.15)", border: "1px solid rgba(255,61,113,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "24px", margin: "0 auto 16px",
          }}>🗑️</div>
          <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>Remove Employee?</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6" }}>
            This will permanently remove{" "}
            <strong style={{ color: "var(--text-primary)" }}>{employee.name}</strong> from the directory.
          </p>
          {linkedStream && (
            <div style={{
              marginTop: "14px", padding: "12px 16px",
              background: "rgba(255,61,113,0.08)", border: "1px solid rgba(255,61,113,0.25)",
              borderRadius: "10px", fontSize: "13px", color: "var(--accent)", lineHeight: "1.6",
            }}>
              This employee has an <strong>active salary stream</strong>. It will be cancelled on-chain automatically.
            </div>
          )}
        </div>
        {statusMsg && (
          <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
            ⏳ {statusMsg}
          </p>
        )}
        <div style={{ display: "flex", gap: "12px" }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose} disabled={deleting}>Cancel</button>
          <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleDelete} disabled={deleting}>
            {deleting ? "Processing..." : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

/*//////////////////////////////////////////////////////////////
                ADD EMPLOYEE MODAL
//////////////////////////////////////////////////////////////*/
function AddEmployeeModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: "", email: "", position: "", salary: "", wallet_address: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit() {
    const { name, email, position, salary, wallet_address } = form;
    if (!name || !email || !position || !salary || !wallet_address) { setError("All fields are required."); return; }
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet_address)) { setError("Invalid Ethereum address."); return; }
    try {
      setSaving(true); setError("");
      const saved = await addEmployee({ name, email, position, salary: parseFloat(salary), wallet_address });
      onSaved(saved); onClose();
    } catch (err) {
      setError(err.message || "Failed to save.");
    } finally { setSaving(false); }
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modalBox} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "700" }}>Add New Employee</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: "22px", cursor: "pointer" }}>✕</button>
        </div>
        <label style={labelStyle}>Full Name</label>
        <input style={inputStyle} name="name" placeholder="Alice Johnson" value={form.name} onChange={handleChange} />
        <label style={labelStyle}>Work Email</label>
        <input style={inputStyle} name="email" placeholder="alice@company.com" value={form.email} onChange={handleChange} />
        <label style={labelStyle}>Position</label>
        <input style={inputStyle} name="position" placeholder="Senior Developer" value={form.position} onChange={handleChange} />
        <label style={labelStyle}>Monthly Salary (HLUSD)</label>
        <input style={inputStyle} name="salary" type="number" step="0.001" placeholder="0.05" value={form.salary} onChange={handleChange} />
        <label style={labelStyle}>MetaMask Wallet Address</label>
        <input style={inputStyle} name="wallet_address" placeholder="0x..." value={form.wallet_address} onChange={handleChange} />
        {error && <div style={{ color: "var(--accent)", fontSize: "13px", marginBottom: "16px" }}>⚠️ {error}</div>}
        <div style={{ display: "flex", gap: "12px" }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : "Save Employee"}
          </button>
        </div>
      </div>
    </div>
  );
}

/*//////////////////////////////////////////////////////////////
                CREATE STREAM MODAL
//////////////////////////////////////////////////////////////*/
function CreateStreamModal({ employees, streams, onClose, onCreated }) {
  const [selectedId, setSelectedId] = useState("");
  const [taxVault, setTaxVault]     = useState("");
  const [taxPercent, setTaxPercent] = useState("10");
  const [creating, setCreating]     = useState(false);
  const [error, setError]           = useState("");

  const selectedEmployee = employees.find(e => String(e.id) === selectedId);
  const streamedWallets  = new Set(streams.map(s => s.walletAddress?.toLowerCase()).filter(Boolean));
  const empHasStream     = emp => streamedWallets.has(emp.wallet_address?.toLowerCase());

  async function handleCreate() {
    if (!selectedEmployee)          { setError("Please select an employee."); return; }
    if (empHasStream(selectedEmployee)) { setError("This employee already has an active stream."); return; }
    if (!taxVault)                  { setError("Tax vault address is required."); return; }
    if (!/^0x[a-fA-F0-9]{40}$/.test(taxVault)) { setError("Invalid tax vault address."); return; }
    if (!/^0x[a-fA-F0-9]{40}$/.test(selectedEmployee.wallet_address)) { setError("Employee has no valid wallet."); return; }

    try {
      setCreating(true); setError("");
      const factory   = getFactory();
      const salaryWei = ethers.parseEther(String(selectedEmployee.salary));
      const tx = await factory.createStream(selectedEmployee.wallet_address, taxVault, salaryWei, taxPercent, { value: salaryWei });
      await tx.wait();
      alert("Stream created for " + selectedEmployee.name + "!");
      onCreated(); onClose();
    } catch (err) {
      setError(err.message || "Transaction failed.");
    } finally { setCreating(false); }
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modalBox} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "700" }}>Create Salary Stream</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: "22px", cursor: "pointer" }}>✕</button>
        </div>
        <label style={labelStyle}>Select Employee</label>
        <select style={{ ...inputStyle, cursor: "pointer" }} value={selectedId} onChange={e => setSelectedId(e.target.value)}>
          <option value="">— choose employee —</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id} disabled={empHasStream(emp)}>
              {emp.name} ({emp.position}){empHasStream(emp) ? " — already streaming" : ""}
            </option>
          ))}
        </select>
        {selectedEmployee && (
          <div style={{
            background: empHasStream(selectedEmployee) ? "rgba(255,61,113,0.08)" : "rgba(123,47,255,0.1)",
            border: "1px solid var(--border)", borderRadius: "10px",
            padding: "14px 16px", marginBottom: "16px", fontSize: "13px",
            color: "var(--text-secondary)", lineHeight: "1.7",
          }}>
            {empHasStream(selectedEmployee) ? (
              <span style={{ color: "var(--accent)" }}>Already has an active stream. Cancel it first.</span>
            ) : (
              <>
                <strong style={{ color: "var(--text-primary)" }}>Wallet:</strong> {selectedEmployee.wallet_address}<br />
                <strong style={{ color: "var(--text-primary)" }}>Salary:</strong> {selectedEmployee.salary} HLUSD / month
              </>
            )}
          </div>
        )}
        <label style={labelStyle}>Tax Vault Address</label>
        <input style={inputStyle} placeholder="0x..." value={taxVault} onChange={e => setTaxVault(e.target.value)} />
        <label style={labelStyle}>Tax Percent (%)</label>
        <input style={inputStyle} type="number" min="0" max="100" value={taxPercent} onChange={e => setTaxPercent(e.target.value)} />
        {error && <div style={{ color: "var(--accent)", fontSize: "13px", marginBottom: "16px" }}>⚠️ {error}</div>}
        <div style={{ display: "flex", gap: "12px" }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleCreate}
            disabled={creating || (selectedEmployee && empHasStream(selectedEmployee))}>
            {creating ? "Creating..." : "Create Stream"}
          </button>
        </div>
      </div>
    </div>
  );
}

/*//////////////////////////////////////////////////////////////
                      MAIN HR COMPONENT
//////////////////////////////////////////////////////////////*/
function HR() {
  const [streamData, setStreamData]             = useState([]);   // raw on-chain snapshots
  const [liveStreams, setLiveStreams]            = useState([]);   // what the table renders
  const [employees, setEmployees]               = useState([]);
  const [showAddEmployee, setShowAddEmployee]   = useState(false);
  const [showCreateStream, setShowCreateStream] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [deleteTarget, setDeleteTarget]         = useState(null);
  const signerRef = useRef(null);

  // Quarterly tracking for total streamed amount
  const [quarterlyStreamed, setQuarterlyStreamed] = useState(0);
  const [quarterStartDate, setQuarterStartDate] = useState(() => {
    const stored = localStorage.getItem('paystream_quarter_start');
    return stored ? parseInt(stored) : Date.now();
  });

  // Store baseline stream totals at quarter start
  const [quarterBaselineTotals, setQuarterBaselineTotals] = useState(() => {
    const stored = localStorage.getItem('paystream_quarter_baseline');
    return stored ? JSON.parse(stored) : {};
  });

  /*//////////////////////////////////////////////////////////////
      QUARTERLY RESET LOGIC
      Resets every 3 months (91 days)
  //////////////////////////////////////////////////////////////*/
  useEffect(() => {
    const checkQuarterReset = () => {
      const now = Date.now();
      const quarterDuration = 91 * 24 * 60 * 60 * 1000; // 91 days in milliseconds
      
      if (now - quarterStartDate >= quarterDuration) {
        // Reset quarterly counter
        setQuarterlyStreamed(0);
        const newQuarterStart = now;
        setQuarterStartDate(newQuarterStart);
        
        // Capture current totals as new baseline for next quarter
        const newBaseline = {};
        streamData.forEach(s => {
          newBaseline[s.address] = s.totalStreamed;
        });
        setQuarterBaselineTotals(newBaseline);
        
        localStorage.setItem('paystream_quarter_start', String(newQuarterStart));
        localStorage.setItem('paystream_quarter_baseline', JSON.stringify(newBaseline));
      }
    };

    checkQuarterReset();
    const interval = setInterval(checkQuarterReset, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [quarterStartDate, streamData]);

  /*//////////////////////////////////////////////////////////////
      LOAD EMPLOYEES
  //////////////////////////////////////////////////////////////*/
  async function loadEmployees() {
    try {
      setLoadingEmployees(true);
      setEmployees(await fetchAllEmployees());
    } catch (err) {
      console.error("Failed to load employees:", err);
    } finally {
      setLoadingEmployees(false);
    }
  }

  useEffect(() => { loadEmployees(); }, []);

  /*//////////////////////////////////////////////////////////////
      LOAD STREAMS — reads all real values from chain
  //////////////////////////////////////////////////////////////*/
  async function loadStreamsFromFactory() {
    try {
      const factory  = getFactory();
      const employer = await getUserAddress();

      // Grab the signer from the factory provider for direct contract calls
      const signer   = factory.runner;
      signerRef.current = signer;

      const addrs    = await factory.getEmployerStreams(employer);
      const results  = [];

      for (let addr of addrs) {
        try {
          const data = await fetchStreamData(addr, signer);

          // Skip cancelled (3) and inactive (0)
          if (data.status === 3 || data.status === 0) continue;

          const matched = employees.find(
            e => e.wallet_address?.toLowerCase() === data.employeeAddr.toLowerCase()
          );

          results.push({
            ...data,
            name:          matched ? matched.name : data.employeeAddr.slice(0, 6) + "..." + data.employeeAddr.slice(-4),
            position:      matched ? matched.position : "Onchain Stream",
            walletAddress: data.employeeAddr,
            statusText:    data.status === 1 ? "active" : "paused",
          });
        } catch (e) {
          console.warn("Skipping stream", addr, e.message);
        }
      }

      // Store results without trying to prevent backwards movement
      // The blockchain data is the source of truth
      setStreamData(results);
    } catch (err) {
      console.error("Factory load error:", err);
    }
  }

  useEffect(() => {
    if (loadingEmployees) return;
    loadStreamsFromFactory();
    const refresh = setInterval(loadStreamsFromFactory, 15000);
    return () => clearInterval(refresh);
  }, [loadingEmployees, employees]);

  /*//////////////////////////////////////////////////////////////
      LIVE TICK — updates every second from blockchain anchor
      Uses blockchain's lastUpdateTime as the source of truth
  //////////////////////////////////////////////////////////////*/
  useEffect(() => {
    const tick = setInterval(() => {
      const nowInSeconds = Math.floor(Date.now() / 1000);
      
      setLiveStreams(prev =>
        streamData.map(s => {
          // Seconds elapsed since blockchain's lastUpdateTime
          const elapsedSeconds = nowInSeconds - s.lastUpdateTime;

          // Withdrawable = base withdrawable + newly streamed since last update
          const withdrawableNow = s.withdrawable + (s.ratePerSec * elapsedSeconds);

          // Total streamed = accrued + withdrawn + newly streamed
          const streamedSinceUpdate = s.ratePerSec * elapsedSeconds;
          const totalStreamedNow = s.accrued + streamedSinceUpdate + s.withdrawn;
          
          // Tax sent to vault ticks up proportionally
          const totalTaxStreamedNow = totalStreamedNow * (s.taxPct / 100);

          return { ...s, withdrawableNow, totalStreamedNow, totalTaxStreamedNow };
        })
      );

      // Calculate QUARTERLY total: current totals minus baseline at quarter start
      const quarterTotal = streamData.reduce((sum, s) => {
        const nowInSeconds = Math.floor(Date.now() / 1000);
        const elapsedSeconds = nowInSeconds - s.lastUpdateTime;
        const streamedSinceUpdate = s.ratePerSec * elapsedSeconds;
        const currentTotal = s.accrued + streamedSinceUpdate + s.withdrawn;
        
        // Get baseline for this stream (amount streamed before quarter started)
        const baseline = quarterBaselineTotals[s.address] || 0;
        
        // Only count what was streamed THIS QUARTER
        const streamedThisQuarter = Math.max(0, currentTotal - baseline);
        
        return sum + streamedThisQuarter;
      }, 0);
      
      setQuarterlyStreamed(quarterTotal);
    }, 1000);
    return () => clearInterval(tick);
  }, [streamData, quarterBaselineTotals]);  // re-anchors whenever we get fresh chain data

  /*//////////////////////////////////////////////////////////////
      STREAM ACTIONS
  //////////////////////////////////////////////////////////////*/
  async function pauseStream(address) {
    try {
      const stream   = loadStream(address);
      const caller   = await getUserAddress();
      const employer = await stream.employer();
      if (caller.toLowerCase() !== employer.toLowerCase()) { alert("Not the employer"); return; }
      const tx = await stream.pause();
      await tx.wait();
      loadStreamsFromFactory();
    } catch (err) { alert(err.message); }
  }

  async function resumeStream(address) {
    try {
      const stream = loadStream(address);
      const tx = await stream.resume();
      await tx.wait();
      loadStreamsFromFactory();
    } catch (err) { alert(err.message); }
  }

  async function cancelStream(address) {
    try {
      const stream = loadStream(address);
      const tx = await stream.cancel();
      await tx.wait();
      setStreamData(prev => prev.filter(s => s.address !== address));
    } catch (err) { alert(err.message); }
  }

  /*//////////////////////////////////////////////////////////////
      STATS
  //////////////////////////////////////////////////////////////*/
  const activeCount       = liveStreams.filter(s => s.statusText === "active").length;
  const totalWithdrawable = liveStreams.reduce((sum, s) => sum + (s.withdrawableNow || 0), 0);

  // Calculate days remaining until quarter reset
  const quarterDuration = 91 * 24 * 60 * 60 * 1000; // 91 days
  const timeInQuarter = Date.now() - quarterStartDate;
  const daysRemaining = Math.max(0, Math.ceil((quarterDuration - timeInQuarter) / (24 * 60 * 60 * 1000)));

  return (
    <div>

      {showAddEmployee && (
        <AddEmployeeModal
          onClose={() => setShowAddEmployee(false)}
          onSaved={newEmp => setEmployees(prev => [...prev, newEmp])}
        />
      )}

      {showCreateStream && (
        <CreateStreamModal
          employees={employees}
          streams={liveStreams}
          onClose={() => setShowCreateStream(false)}
          onCreated={loadStreamsFromFactory}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          employee={deleteTarget}
          streams={liveStreams}
          onClose={() => setDeleteTarget(null)}
          onConfirmed={(removedId, cancelledAddr) => {
            setEmployees(prev => prev.filter(e => e.id !== removedId));
            if (cancelledAddr) setStreamData(prev => prev.filter(s => s.address !== cancelledAddr));
          }}
        />
      )}

      {/* Stats - 3 cards with quarterly tracking */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "24px" }}>
        
        {/* Active Streams */}
        <div className="stat-card">
          <div className="stat-label">Active Streams</div>
          <div className="stat-value">{activeCount}</div>
          <div className="stat-change">Live</div>
        </div>

        {/* Current Withdrawable */}
        <div className="stat-card">
          <div className="stat-label">Total Withdrawable</div>
          <div className="stat-value">{totalWithdrawable.toFixed(6)} HLUSD</div>
          <div className="stat-change">Realtime</div>
        </div>

        {/* Quarterly Total Streamed */}
        <div className="stat-card" style={{
          background: "linear-gradient(135deg, var(--bg-elevated) 0%, rgba(123, 47, 255, 0.15) 100%)",
          border: "2px solid var(--primary)"
        }}>
          <div className="stat-label" style={{ color: "var(--primary)" }}>
            Quarterly Total Streamed
          </div>
          <div className="stat-value" style={{ 
            background: "var(--gradient-1)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            {quarterlyStreamed.toFixed(6)} HLUSD
          </div>
          <div className="stat-change" style={{ color: "var(--primary)" }}>
            Resets in {daysRemaining} days
          </div>
        </div>

      </div>

      {/* Employee Directory */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-header">
          <h2 className="card-title">Employee Directory</h2>
          <button className="btn btn-primary" onClick={() => setShowAddEmployee(true)}>+ Add Employee</button>
        </div>
        {loadingEmployees ? (
          <p style={{ color: "var(--text-secondary)", padding: "16px 0" }}>Loading employees...</p>
        ) : employees.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", padding: "16px 0" }}>No employees yet. Click "Add Employee" to get started.</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Position</th>
                  <th>Salary (HLUSD/mo)</th><th>Wallet Address</th><th>Stream</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => {
                  const hasStream = liveStreams.some(
                    s => s.walletAddress?.toLowerCase() === emp.wallet_address?.toLowerCase()
                  );
                  return (
                    <tr key={emp.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{
                            width: "36px", height: "36px", borderRadius: "8px",
                            background: "var(--gradient-1)", display: "flex", alignItems: "center",
                            justifyContent: "center", fontWeight: "700", color: "var(--bg-dark)", fontSize: "14px",
                          }}>{emp.name.charAt(0)}</div>
                          <strong>{emp.name}</strong>
                        </div>
                      </td>
                      <td style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{emp.email}</td>
                      <td>{emp.position}</td>
                      <td>{Number(emp.salary).toFixed(4)} HLUSD</td>
                      <td style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--text-secondary)" }}>
                        {emp.wallet_address
                          ? emp.wallet_address.slice(0, 8) + "..." + emp.wallet_address.slice(-6)
                          : <span style={{ color: "var(--accent)" }}>Not set</span>}
                      </td>
                      <td>
                        <span className={`badge ${hasStream ? "badge-success" : "badge-warning"}`}>
                          {hasStream ? "Active" : "None"}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-danger" style={{ padding: "8px 16px", fontSize: "13px" }}
                          onClick={() => setDeleteTarget(emp)}>
                          🗑 Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active Salary Streams */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Active Salary Streams</h2>
          <button className="btn btn-primary" onClick={() => setShowCreateStream(true)}
            disabled={employees.length === 0}>
            + New Stream
          </button>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Position</th>
                <th>Monthly Salary</th>
                <th>Withdrawable Now</th>
                <th>Total Streamed</th>
                <th>Stream Contract</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {liveStreams.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", color: "var(--text-secondary)", padding: "24px" }}>
                    No streams yet. Create one above.
                  </td>
                </tr>
              ) : (
                liveStreams.map(stream => (
                  <tr key={stream.address}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                          width: "40px", height: "40px", borderRadius: "10px",
                          background: "var(--gradient-1)", display: "flex", alignItems: "center",
                          justifyContent: "center", fontWeight: "700", color: "var(--bg-dark)",
                        }}>{stream.name.charAt(0)}</div>
                        <strong>{stream.name}</strong>
                      </div>
                    </td>
                    <td>{stream.position}</td>
                    <td>{stream.salary.toFixed(6)} HLUSD</td>

                    {/* WITHDRAWABLE NOW — ticks up live, resets after withdraw */}
                    <td>
                      <strong style={{ color: "var(--success)" }}>
                        {(stream.withdrawableNow ?? stream.withdrawable).toFixed(8)} HLUSD
                      </strong>
                    </td>

                    {/* TOTAL STREAMED ALL TIME — never resets, includes withdrawn */}
                    <td style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
                      {(stream.totalStreamedNow ?? stream.totalStreamed).toFixed(8)} HLUSD
                    </td>

                    {/* STREAM CONTRACT ADDRESS */}
                    <td style={{ fontFamily: "monospace", fontSize: "12px" }}>
                      <a
                        href={`https://testnet.helascan.io/address/${stream.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "var(--primary)", textDecoration: "none" }}
                        title={stream.address}
                      >
                        {stream.address.slice(0, 8) + "..." + stream.address.slice(-6)}
                      </a>
                    </td>

                    <td>
                      <span className={`badge ${stream.statusText === "active" ? "badge-success" : "badge-warning"}`}>
                        {stream.statusText}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: "13px" }}
                          onClick={() => stream.statusText === "active" ? pauseStream(stream.address) : resumeStream(stream.address)}>
                          {stream.statusText === "active" ? "⏸ Pause" : "▶ Resume"}
                        </button>
                        <button className="btn btn-danger" style={{ padding: "8px 16px", fontSize: "13px" }}
                          onClick={() => cancelStream(stream.address)}>
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tax Vault — real data from on-chain streams */}
      {liveStreams.length > 0 && (
        <div className="card" style={{ marginTop: "24px" }}>
          <h2 className="card-title" style={{ marginBottom: "20px" }}>Tax Vault Summary</h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Tax Vault Address</th>
                  <th>Tax Rate</th>
                  <th>Tax Streamed (HLUSD/sec)</th>
                  <th>Total Tax Sent</th>
                </tr>
              </thead>
              <tbody>
                {liveStreams.map(stream => (
                  <tr key={stream.address + "-tax"}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "32px", height: "32px", borderRadius: "8px",
                          background: "var(--gradient-1)", display: "flex", alignItems: "center",
                          justifyContent: "center", fontWeight: "700", color: "var(--bg-dark)", fontSize: "13px",
                        }}>{stream.name.charAt(0)}</div>
                        <strong>{stream.name}</strong>
                      </div>
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--text-secondary)" }}>
                      {stream.taxVaultAddr
                        ? stream.taxVaultAddr.slice(0, 8) + "..." + stream.taxVaultAddr.slice(-6)
                        : "—"}
                    </td>
                    <td>
                      <span className="badge badge-warning">{stream.taxPct}%</span>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
                      {(stream.taxRatePerSec ?? 0).toFixed(10)} HLUSD/sec
                    </td>
                    <td>
                      <strong style={{ color: "var(--accent)" }}>
                        {(stream.totalTaxStreamedNow ?? stream.totalTaxStreamed ?? 0).toFixed(8)} HLUSD
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

export default HR;