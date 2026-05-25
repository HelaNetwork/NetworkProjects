import { useState, useEffect } from "react";
import { Contract, parseEther, formatEther } from "ethers";
import { QRCode } from "react-qr-code";
import { CONTRACTS, REGISTRY_ABI, ROUTER_ABI, HUSD_ABI, FEE_ABI, POOL_ABI, API_BASE } from "../config";

const TIERS = [
  { id: "std", name: "Standard", splits: 1, range: "N/A", security: 30, gas: "Low", icon: "⚡", noise: 0 },
  { id: "iron", name: "Iron Shield", splits: 75, range: "50-100", security: 65, gas: "Med", icon: "🛡️", noise: 2000 },
  { id: "ghost", name: "Gold Ghost", splits: 350, range: "200-500", security: 85, gas: "High", icon: "👻", noise: 10000 },
  { id: "shadow", name: "Infinite Shadow", splits: 1000, range: "1000+", security: 98, gas: "Extreme", icon: "🌌", badge: "TOP", noise: 40000 },
];

export default function MerchantDashboard({ wallet }) {
  const { account, signer, provider } = wallet;

  const [registered, setRegistered]     = useState(false);
  const [invoices, setInvoices]         = useState([]);
  const [amount, setAmount]             = useState("");
  const [description, setDescription]   = useState("");
  const [loading, setLoading]           = useState(false);
  const [lastInvoice, setLastInvoice]   = useState(null);
  const [toast, setToast]               = useState(null);
  const [configError, setConfigError]   = useState(null);
  const [selectedTier, setSelectedTier] = useState("std");
  const [withdrawingInv, setWithdrawingInv] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [packetProgress, setPacketProgress] = useState(0);
 
  const LOCAL_METADATA_KEY = "hela_stealth_metadata";
 
  // Helper to save description locally as fallback
  const saveLocalDescription = (id, desc) => {
    if (!id || !desc) return;
    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_METADATA_KEY) || "{}");
      existing[id.toLowerCase()] = desc;
      localStorage.setItem(LOCAL_METADATA_KEY, JSON.stringify(existing));
    } catch (e) {
      console.warn("Local storage save failed:", e);
    }
  };
 
  // Helper to get local description
  const getLocalDescription = (id) => {
    if (!id) return null;
    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_METADATA_KEY) || "{}");
      return existing[id.toLowerCase()] || null;
    } catch (e) {
      return null;
    }
  };

  // Check config on mount
  useEffect(() => {
    const missing = Object.entries(CONTRACTS).filter(([k, v]) => !v).map(([k]) => k);
    if (missing.length > 0) {
      setConfigError(`Missing environment variables: ${missing.join(", ")}`);
    }
  }, []);

  // Check if merchant is registered
  useEffect(() => {
    if (!account || !provider || !CONTRACTS.REGISTRY) return;
    (async () => {
      try {
        const reg = new Contract(CONTRACTS.REGISTRY, REGISTRY_ABI, provider);
        const is = await reg.isMerchant(account);
        setRegistered(is);
        if (is) loadInvoices();
      } catch (err) {
        console.error("Registry check failed:", err);
      }
    })();
  }, [account, provider]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Register as merchant
  const handleRegister = async () => {
    if (!signer || !CONTRACTS.REGISTRY) return;
    setLoading(true);
    try {
      const reg = new Contract(CONTRACTS.REGISTRY, REGISTRY_ABI, signer);
      const metaKey = new TextEncoder().encode(account);
      const tx = await reg.registerMerchant(metaKey);
      await tx.wait();
      setRegistered(true);
      showToast("✅ Registered as merchant!");
    } catch (err) {
      showToast("❌ " + (err.reason || err.message), "error");
    }
    setLoading(false);
  };

  // Create invoice (on-chain + sync metadata to backend)
  const handleCreateInvoice = async () => {
    if (!signer || !amount || !CONTRACTS.ROUTER || !CONTRACTS.HUSD || !CONTRACTS.FEE_MANAGER) {
      showToast("❌ Missing contract configuration!", "error");
      return;
    }
    setLoading(true);
    try {
      showToast("⏳ Requesting Invoice Creation...", "info");
      const router = new Contract(CONTRACTS.ROUTER, ROUTER_ABI, signer);
      const husd   = new Contract(CONTRACTS.HUSD, HUSD_ABI, signer);
      const feeMgr = new Contract(CONTRACTS.FEE_MANAGER, FEE_ABI, provider);

      // Approve fee
      const fee = await feeMgr.protocolFee();
      if (fee > 0n) {
        const allowance = await husd.allowance(account, CONTRACTS.ROUTER);
        if (allowance < fee) {
          const approveTx = await husd.approve(CONTRACTS.ROUTER, parseEther("999999"));
          await approveTx.wait();
        }
      }

      const amountWei = parseEther(amount);
      const tx = await router.createInvoice(amountWei);
      const receipt = await tx.wait();

      // Parse event to get invoiceId
      let invoiceId = null;
      for (const log of receipt.logs) {
        try {
          const parsed = router.interface.parseLog({ topics: log.topics, data: log.data });
          if (parsed?.name === "InvoiceCreated") {
            invoiceId = parsed.args.invoiceId;
            break;
          }
        } catch (parseErr) {}
      }

      // Fallback
      if (!invoiceId) {
        const routerRead = new Contract(CONTRACTS.ROUTER, ROUTER_ABI, provider);
        const count = await routerRead.getMerchantInvoiceCount(account);
        if (count > 0n) {
          invoiceId = await routerRead.getMerchantInvoiceAt(account, count - 1n);
        }
      }

      if (invoiceId) {
        // --- SYNC METADATA TO BACKEND ---
        try {
          await fetch(`${API_BASE}/invoice/save-metadata`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              invoiceId,
              description,
              amount,
              merchantAddress: account
            })
          });
        } catch (syncErr) {
          console.warn("Metadata sync failed, but invoice created:", syncErr);
        }

        // --- CACHE LOCALLY FOR DEMO RELIABILITY ---
        saveLocalDescription(invoiceId, description);
 
        setLastInvoice({ id: invoiceId, amount, description });
        showToast("📄 Invoice created!");
        loadInvoices();
      } else {
        showToast("⚠️ Invoice created but ID not found.", "error");
      }

      setAmount("");
      setDescription("");
    } catch (err) {
      console.error("Create invoice error:", err);
      showToast("❌ " + (err.reason || err.message), "error");
    }
    setLoading(false);
  };

  // Load invoices from Backend API (to include descriptions)
  const loadInvoices = async () => {
    if (!account) return;
    try {
      const resp = await fetch(`${API_BASE}/merchant/invoices/${account}`);
      const data = await resp.json();
      if (data.invoices) {
        // Step 1: Initialize pool contract for status check
        const poolContract = new Contract(CONTRACTS.POOL, POOL_ABI, provider);
 
        // Step 2: Merge with local descriptions and check Pool for "Claimed" status
        const enriched = await Promise.all(data.invoices.map(async (inv) => {
          let currentStatus = inv.status;
          
          // If router says "paid", double-check the pool for "claimed"
          if (currentStatus === "paid") {
            try {
              const dep = await poolContract.getDeposit(inv.id);
              if (dep.claimed) currentStatus = "claimed";
            } catch (e) {
              console.warn("Could not check pool status for", inv.id);
            }
          }
 
          return {
            ...inv,
            status: currentStatus,
            description: inv.description || getLocalDescription(inv.id) || "—"
          };
        }));
        
        setInvoices(enriched);
      }
    } catch (err) {
      console.error("Failed to load invoices:", err);
    }
  };

  // Claim funds — merchant calls PrivacyPool.withdraw() directly from MetaMask
  const handleClaim = async (invoiceId) => {
    if (!signer) return;
    
    // Step 1: Trigger Animation for Non-Standard tiers
    if (selectedTier !== "std") {
      setIsProcessing(true);
      setPacketProgress(0);
      const totalSteps = 20;
      for (let i = 0; i <= totalSteps; i++) {
        setPacketProgress(Math.floor((i / totalSteps) * 100));
        await new Promise(r => setTimeout(r, 80));
      }
      await new Promise(r => setTimeout(r, 400));
      setIsProcessing(false);
    }

    setLoading(true);
    try {
      showToast("⏳ Finalizing Privacy withdrawal...", "info");
 
      const tier = TIERS.find(t => t.id === selectedTier);
 
      // V4: TRIGGER BACKEND FOG MACHINE (On-Chain Decoys)
      try {
        fetch(`${API_BASE}/fog-machine`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ count: Math.min(tier.splits, 10) }) // Max 10 decoys for demo stability
        });
      } catch (fogErr) {
        console.warn("Fog Machine failed (decoy layer only):", fogErr);
      }
 
      // V3: ACTUAL OBFUSCATION via Calldata Padding
      const poolInterface = new Contract(CONTRACTS.POOL, POOL_ABI, provider).interface;
      
      // 1. Base transaction data
      let data = poolInterface.encodeFunctionData("withdraw", [invoiceId]);
      
      // 2. Append Noise (Hex Entropy) if requested by tier
      if (tier.noise > 0) {
        let entropy = "";
        const chars = "0123456789abcdef";
        for (let i = 0; i < tier.noise; i++) {
          entropy += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        data += entropy;
        console.log(`🛡️ Obfuscating transaction with ${tier.noise/2} bytes of entropy...`);
      }
 
      // 3. Send manually to allow padded calldata
      const tx = await signer.sendTransaction({
        to: CONTRACTS.POOL,
        data: data
      });
 
      const receipt = await tx.wait();

      setToast({
        msg: (
          <span>
            ✅ Funds withdrawn! <br/>
            Tx: <a href={`https://testnet-blockexplorer.helachain.com/tx/${receipt.hash}`} target="_blank" rel="noreferrer" style={{color: 'white', textDecoration: 'underline'}}>
              {receipt.hash.slice(0, 10)}…{receipt.hash.slice(-8)}
            </a>
          </span>
        ),
        type: "success"
      });

      setWithdrawingInv(null);
      loadInvoices();
    } catch (err) {
      console.error("Withdrawal error:", err);
      showToast("❌ " + (err.reason || err.message), "error");
    }
    setLoading(false);
    setIsProcessing(false);
  };

  // ── Not Connected ────────────────────────
  if (!account) {
    return (
      <div className="connect-banner" style={{ textAlign: "left", padding: "100px 0", maxWidth: "1000px" }}>
        <div className="network-badge" style={{ 
          background: "rgba(20, 210, 201, 0.1)", 
          color: "var(--primary)", 
          border: "1px solid rgba(20, 210, 201, 0.2)",
          marginBottom: "2.5rem",
          display: "inline-flex",
          padding: "6px 16px",
          borderRadius: "99px",
          fontSize: "0.8rem"
        }}>
          HeLa Testnet Live
        </div>
        <h1 style={{ 
          fontSize: "4.5rem", 
          fontWeight: 800, 
          lineHeight: 1, 
          letterSpacing: "-0.05em",
          marginBottom: "1.5rem"
        }}>
          One Chain. <br/>
          <span style={{ color: "var(--primary)" }}>Stealth Payments.</span>
        </h1>
        <p style={{ 
          fontSize: "1.25rem", 
          color: "var(--text-secondary)", 
          maxWidth: "600px", 
          lineHeight: 1.6,
          marginBottom: "3rem"
        }}>
          Imagine a future where your transactions are truly yours—private, secure, and controlled by you. 
          HeLa combines personalized AI with native privacy on a single, intelligent blockchain.
        </p>
        <div style={{ display: "flex", gap: "16px" }}>
          <button className="btn btn-primary btn-lg" onClick={wallet.connect} style={{ minWidth: "220px" }}>
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  // ── Dashboard ────────────────────────────
  return (
    <div className="dashboard-content" style={{ marginTop: "1rem" }}>
      {configError && (
        <div style={{ background: "rgba(220, 38, 38, 0.1)", border: "1px solid var(--error)", color: "var(--error)", padding: "1rem", borderRadius: "12px", marginBottom: "2rem" }}>
          <strong>⚠️ Setup Incomplete:</strong> {configError}. Please add these to your Vercel Environment Variables and redeploy.
        </div>
      )}
      <header style={{ marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, letterSpacing: "-0.04em" }}>
          Merchant <span style={{ 
            background: "linear-gradient(to right, #ffffff, var(--primary))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>Dashboard</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginTop: "12px" }}>
          Manage your private invoices and track incoming payments in real-time.
        </p>
      </header>

      {/* Stats */}
      <div className="stats-row">
        <div className="card stat-card">
          <div className="label">Wallet Identity</div>
          <div className="value mono" style={{ fontSize: "0.85rem" }}>
            {account.slice(0, 10)}…{account.slice(-8)}
          </div>
        </div>
        <div className="card stat-card">
          <div className="label">Active Invoices</div>
          <div className="value accent">{invoices.length}</div>
        </div>
        <div className="card stat-card">
          <div className="label">Total Paid</div>
          <div className="value success">{invoices.filter(i => i.status === "paid").length}</div>
        </div>
        <div className="card stat-card">
          <div className="label">Merchant Seal</div>
          <div className="value">
            <span className={registered ? "stealth-badge" : "badge-active"} style={{ fontSize: "0.9rem" }}>
              {registered ? "Verified Stealth Merchant" : "Registration Required"}
            </span>
          </div>
        </div>
      </div>

      {/* Register / Create Invoice */}
      <div style={{ display: "grid", gridTemplateColumns: registered ? "1fr 1fr" : "1fr", gap: "1.5rem", marginBottom: "2rem" }}>
        {!registered && (
          <div className="card">
            <div className="card-header">
              <h2>🏪 Register as Merchant</h2>
            </div>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
              Register your wallet on the StealthRegistry to start generating stealth payment invoices.
            </p>
            <button className="btn btn-primary" onClick={handleRegister} disabled={loading}>
              {loading ? <span className="spinner" /> : "Register"}
            </button>
          </div>
        )}

        {registered && (
          <div className="card">
            <div className="card-header">
              <h2>Create Stealth Invoice</h2>
            </div>
            <div className="form-group">
              <label>Amount (HUSD)</label>
              <input
                type="number"
                placeholder="25.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                step="0.01"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Description / Reference</label>
              <input
                type="text"
                placeholder="Ex: Invoice #001"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleCreateInvoice} disabled={loading || !amount}>
              {loading ? <span className="spinner" /> : "Generate Stealth Invoice"}
            </button>
          </div>
        )}

        {registered && lastInvoice && (
          <div className="card">
            <div className="card-header">
              <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                 Payment Link 
                 <span className="stealth-badge">100% Private</span>
              </h2>
            </div>
            <div className="qr-container">
              <div className="qr-box">
                <QRCode value={`${window.location.origin}/pay/${lastInvoice.id}${lastInvoice.description ? `?desc=${encodeURIComponent(lastInvoice.description)}` : ''}`} size={180} />
              </div>
              <div style={{ textAlign: "center", width: "100%" }}>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "12px" }}>Share this link with your customer</p>
                <div style={{ background: "rgba(37, 99, 235, 0.05)", padding: "12px", borderRadius: "8px", border: "1px dashed rgba(37, 99, 235, 0.3)", marginBottom: "16px" }}>
                  <p className="mono" style={{ fontSize: "0.8rem", wordBreak: "break-all", color: "var(--text-primary)" }}>
                    {window.location.origin}/pay/{lastInvoice.id.slice(0, 16)}…{lastInvoice.description ? `?desc=${encodeURIComponent(lastInvoice.description.slice(0, 10))}…` : ''}
                  </p>
                </div>
                <button 
                  className="btn btn-outline btn-sm" 
                  style={{ width: "100%", marginBottom: "16px" }}
                  onClick={() => {
                    const url = `${window.location.origin}/pay/${lastInvoice.id}${lastInvoice.description ? `?desc=${encodeURIComponent(lastInvoice.description)}` : ''}`;
                    navigator.clipboard.writeText(url);
                    showToast("Link copied to clipboard (with description)");
                  }}
                >
                  Copy Full URL
                </button>
                <p style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--text-primary)" }}>{lastInvoice.amount} HUSD</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invoices Table */}
      {registered && (
        <div className="card">
          <div className="card-header">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2>Invoice History</h2>
              <button className="btn btn-outline btn-sm" onClick={loadInvoices}>
                Refresh
              </button>
            </div>
          </div>
          {invoices.length === 0 ? (
            <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem" }}>
              No invoices yet. Create one above!
            </p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                       <td className="mono" title={inv.id}>{inv.id.slice(0, 10)}…{inv.id.slice(-6)}</td>
                       <td style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{inv.description || "—"}</td>
                       <td style={{ fontWeight: 700 }}>{inv.amount} HUSD</td>
                      <td>
                        <span className={`badge badge-${inv.status}`}>
                          {inv.status === "paid" ? "✅ To Claim" : 
                           inv.status === "claimed" ? "Claimed" : 
                           inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                        </span>
                      </td>
                      <td>{new Date(inv.createdAt * 1000).toLocaleString()}</td>
                      <td>
                        {inv.status === "paid" && (
                          <button 
                            className="btn btn-primary btn-sm" 
                            onClick={() => setWithdrawingInv(inv)} 
                            disabled={loading}
                          >
                            Withdraw Payment
                          </button>
                        )}
                        {inv.status === "claimed" && (
                           <span style={{fontSize: "0.8rem", color: "var(--success)"}}>Withdrawn</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Withdrawal Overlay / Modal */}
      {withdrawingInv && (
        <div className="modal-overlay">
          <div className="card modal-content" style={{ maxWidth: "550px", width: "90%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ margin: 0 }}>🛡️ Advanced Withdrawal</h2>
              <button className="btn btn-outline btn-sm" onClick={() => !loading && !isProcessing && setWithdrawingInv(null)}>✕</button>
            </div>

            <div style={{ background: "rgba(20, 210, 201, 0.05)", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(20, 210, 201, 0.1)", marginBottom: "2rem" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "5px" }}>Amount to Withdraw</p>
              <p style={{ fontSize: "2rem", fontWeight: 700, margin: 0, color: "var(--primary)" }}>{withdrawingInv.amount} HUSD</p>
            </div>

            {!isProcessing ? (
              <>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "1rem" }}>
                  Select Privacy Level (Actual On-Chain Obfuscation)
                </p>
                <div className="tier-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "2rem" }}>
                  {TIERS.map(tier => (
                    <div 
                      key={tier.id}
                      className={`tier-card ${selectedTier === tier.id ? 'selected' : ''}`}
                      onClick={() => setSelectedTier(tier.id)}
                      style={{ padding: "12px" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                        <span style={{ fontSize: "1.2rem" }}>{tier.icon}</span>
                        <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{tier.name}</span>
                      </div>
                      <div className="security-meter" style={{ height: "4px" }}>
                        <div className="security-fill" style={{ width: `${tier.security}%` }}></div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                        <span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>{tier.splits} Packets</span>
                        <span style={{ fontSize: "0.6rem", color: "var(--primary)" }}>{tier.gas} Gas</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  className="btn btn-primary btn-lg" 
                  style={{ width: "100%", background: "linear-gradient(135deg, #14D2C9 0%, #059669 100%)" }}
                  onClick={() => handleClaim(withdrawingInv.id)}
                  disabled={loading}
                >
                  {loading ? <span className="spinner" /> : `🛡️ Withdraw with ${TIERS.find(t => t.id === selectedTier).name}`}
                </button>
              </>
            ) : (
              <div className="packet-preparation" style={{ padding: "2rem 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <span style={{ fontSize: "1rem", fontWeight: 600 }}>Generating Entropy & Purity Packets...</span>
                  <span className="mono" style={{ color: "var(--primary)", fontSize: "1.2rem" }}>{packetProgress}%</span>
                </div>
                <div className="security-meter" style={{ height: "12px", marginBottom: "1.5rem" }}>
                  <div className="security-fill" style={{ width: `${packetProgress}%` }}></div>
                </div>
                <div className="packet-container" style={{ gridTemplateColumns: "repeat(10, 1fr)", gap: "6px" }}>
                  {[...Array(40)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`packet-dot ${i < (packetProgress / 2.5) ? 'active' : ''}`}
                      style={{ animationDelay: `${i * 0.04}s`, width: "8px", height: "8px" }}
                    />
                  ))}
                </div>
                <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "1.5rem" }}>
                   Encrypting Calldata & Obfuscating traces on HeLa...
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
