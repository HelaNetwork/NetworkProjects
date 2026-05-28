import { useState } from "react";
import "./index.css";

const dummyData = [
  {
    id: "NFTR-1042",
    type: "Yield Pass",
    lockedAt: new Date(Date.now() - 15 * 86400000).toLocaleDateString(),
    unlocksAt: new Date(Date.now() + 15 * 86400000).toLocaleDateString(),
    value: "5.00 ETH",
    status: "LOCKED",
  },
  {
    id: "NFTR-0988",
    type: "Lease-to-Own",
    lockedAt: new Date(Date.now() - 60 * 86400000).toLocaleDateString(),
    unlocksAt: new Date(Date.now() - 1 * 86400000).toLocaleDateString(),
    value: "1.25 ETH",
    status: "REDEEMED",
  },
];

function App() {

  const [wallet, setWallet] = useState(null);
  const [receiptType, setReceiptType] = useState("Yield Pass");
  const [duration, setDuration] = useState("30");
  const [value, setValue] = useState("1.5");
  const [receipts, setReceipts] = useState([]);
  const [isDummyMode, setIsDummyMode] = useState(false);

  const toggleDummyMode = () => {
    if (!isDummyMode) {
      setReceipts(dummyData);
      setIsDummyMode(true);
    } else {
      setReceipts([]);
      setIsDummyMode(false);
    }
  };

  const handleConnect = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        setWallet(`${account.slice(0, 6)}...${account.slice(-4)}`);
        // If connecting wallet, we should probably clear dummy data
        setIsDummyMode(false);
        setReceipts([]); 
      } catch (err) {
        console.error("User rejected connection", err);
      }
    } else {
      alert("Please install MetaMask or another Web3 wallet.");
    }
  };

  const handleMint = (e) => {
    e.preventDefault();
    if (!wallet && !isDummyMode) return alert("Please connect wallet or enable Dummy Mode first.");

    alert(
      `Minting ${receiptType} for ${value} ETH locked for ${duration} days...`,
    );
    setTimeout(() => {
      const newReceipt = {
        id: `NFTR-${Math.floor(Math.random() * 9000) + 1000}`,
        type: receiptType,
        lockedAt: new Date().toLocaleDateString(),
        unlocksAt: new Date(
          Date.now() + parseInt(duration) * 86400000,
        ).toLocaleDateString(),
        value: `${parseFloat(value).toFixed(2)} ETH`,
        status: "LOCKED",
      };
      setReceipts([newReceipt, ...receipts]);
    }, 1000);
  };

  return (
    <>
      <nav className="navbar" style={{ borderBottom: '3px solid var(--accent)', padding: '1.2rem 2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" color="var(--accent)">
            <rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect>
            <line x1="8" y1="10" x2="16" y2="10"></line>
            <line x1="8" y1="14" x2="12" y2="14"></line>
          </svg>
          <span style={{ fontWeight: 800, fontSize: '1.4rem' }}>RENTIBLE</span>
          <span style={{ fontWeight: 400, color: "var(--text-secondary)", fontSize: '1.4rem' }}>
            Receipts
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            className="btn" 
            onClick={toggleDummyMode}
            style={{ 
              backgroundColor: isDummyMode ? '#fef3c7' : 'transparent',
              borderColor: isDummyMode ? '#f59e0b' : 'var(--border-color)',
              color: isDummyMode ? '#b45309' : 'var(--text-primary)'
            }}
          >
            {isDummyMode ? '🧪 Dummy Mode: ON' : 'Dummy Mode: OFF'}
          </button>

          {!wallet ? (
            <button
              className="btn btn-primary"
              onClick={handleConnect}
            >
              Connect Wallet
            </button>
          ) : (
            <button className="btn" style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>
              🟢 {wallet}
            </button>
          )}
        </div>
      </nav>

      {isDummyMode && (
        <div style={{ width: '100%', backgroundColor: '#fef3c7', color: '#b45309', textAlign: 'center', padding: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
          You are exploring the dashboard with simulated dummy data.
        </div>
      )}

      <div className="dashboard-container">
        {/* Receipt Maker Panel */}
        <div className="maker-panel">
          <div className="section-title">Issue New Receipt</div>
          <form onSubmit={handleMint}>
            <div className="form-group">
              <label className="form-label">Contract Type</label>
              <select
                className="form-select"
                value={receiptType}
                onChange={(e) => setReceiptType(e.target.value)}
              >
                <option>Yield Pass</option>
                <option>Lease-to-Own</option>
                <option>Vesting Schedule</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Lock Duration (Days)</label>
              <input
                type="number"
                className="form-input"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="1"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Value (ETH)</label>
              <input
                type="number"
                className="form-input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                step="0.01"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "1rem" }}
            >
              Mint NFTR
            </button>
          </form>
        </div>

        {/* Active Receipts Grid */}
        <div>
          <div className="section-title">My Financial Receipts</div>
          
          {receipts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
              <h3>No active receipts found.</h3>
              <p style={{ marginTop: '0.5rem' }}>Connect your wallet or enable Dummy Mode to see examples.</p>
            </div>
          ) : (
            <div className="receipts-grid">
              {receipts.map((rec) => (
                <div className="receipt-card" key={rec.id}>
                  <div className="receipt-header">
                    <div className="receipt-logo">🧾</div>
                    <div className="receipt-type">{rec.type}</div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {rec.id}
                    </div>
                  </div>

                  <div className="receipt-body">
                    <div className="receipt-row">
                      <span className="receipt-label">Locked On</span>
                      <span className="receipt-value">{rec.lockedAt}</span>
                    </div>
                    <div className="receipt-row">
                      <span className="receipt-label">Unlocks On</span>
                      <span className="receipt-value">{rec.unlocksAt}</span>
                    </div>
                    <div className="receipt-row">
                      <span className="receipt-label">Status</span>
                      <span
                        className={`status-badge ${rec.status === "LOCKED" ? "status-locked" : "status-redeemed"}`}
                      >
                        {rec.status}
                      </span>
                    </div>
                  </div>

                  <div className="receipt-total">
                    <span>Total Value</span>
                    <span style={{ fontFamily: "var(--font-mono)" }}>
                      {rec.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
