import { useState, useEffect } from "react";
import axios from "axios";
import {
  Truck, Fingerprint, CheckCircle, AlertCircle, Calendar, Link,
  Activity, ShieldCheck, UserCheck, Clock, PackageCheck
} from "lucide-react";

const API = "http://localhost:3001/api";

function tierInfo(t) {
  if (t === 0) return { label: "LOW RISK", color: "var(--brand-primary)", bg: "var(--brand-primary-soft)", border: "var(--brand-primary-border)", proof: "OTP Verification", hint: "Standard verification: Request 6-digit OTP from customer." };
  if (t === 1) return { label: "MEDIUM RISK", color: "var(--warning)", bg: "var(--warning-soft)", border: "var(--warning-border)", proof: "Photo Evidence", hint: "Elevated risk: Upload photo of cylinder installation at premises." };
  return { label: "HIGH RISK", color: "var(--danger)", bg: "var(--danger-soft)", border: "var(--danger-border)", proof: "Biometric Face Auth", hint: "Critical risk: Live face authentication required via UIDAI portal." };
}

// ── Pending delivery card ──────────────────────────────────────
function PendingCard({ booking: b, agentAddress, onDelivered }) {
  const [open, setOpen] = useState(false);
  const [proofData, setProofData] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const ti = tierInfo(b.riskTier);

  async function confirm() {
    if (!proofData.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await axios.post(`${API}/deliver`, {
        bookingId: b.bookingId,
        proofType: b.riskTier === 0 ? "OTP" : b.riskTier === 1 ? "PHOTO" : "FACE_AUTH",
        proofData,
        agentAddress,
        agentLat: 18.5204, agentLon: 73.8567
      });
      setResult(res.data);
      if (res.data.success) { setOpen(false); setProofData(""); onDelivered(); }
    } catch (e) {
      setResult({ success: false, error: e.response?.data?.error || e.message });
    }
    setLoading(false);
  }

  return (
    <div className="card" style={{ borderLeft: `6px solid ${ti.color}`, transition: "all 0.3s" }}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Ref: {b.bookingId.slice(0, 16)}...</div>
          <div className="mono" style={{ fontSize: 11 }}>Recipient: {b.walletAddress}</div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ textAlign: "right" }}>
            <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: ti.color }}>{b.fraudScore}</div>
            <div style={{ fontSize: 9, color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase" }}>Fraud Index</div>
          </div>
          <span className="badge" style={{ background: ti.bg, color: ti.color, border: `1px solid ${ti.border}` }}>{ti.label}</span>
        </div>
      </div>

      {/* Verification requirement banner */}
      <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-md)", padding: 16, border: "1px solid var(--border-primary)", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Fingerprint size={16} color={ti.color} />
          <div style={{ fontSize: 13, fontWeight: 700, color: ti.color, textTransform: "uppercase" }}>{ti.proof} REQUIRED</div>
        </div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{ti.hint}</div>
      </div>

      {/* Meta */}
      <div style={{ display: "flex", gap: 20, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-tertiary)", fontSize: 12 }}>
          <Calendar size={14} />{new Date(b.createdAt).toLocaleString()}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-tertiary)", fontSize: 12 }}>
          <Link size={14} />Escrow: {b.escrowTxHash?.slice(0, 12)}...
        </div>
      </div>

      {/* Error result */}
      {result && !result.success && (
        <div className="card" style={{ background: "var(--danger-soft)", borderColor: "var(--danger-border)", marginBottom: 16, padding: "12px 16px" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", color: "var(--danger)" }}>
            <AlertCircle size={18} /><div style={{ fontSize: 13 }}>{result.error}</div>
          </div>
        </div>
      )}

      {/* Action */}
      {!open ? (
        <button className="btn btn-primary" onClick={() => { setOpen(true); setProofData(""); setResult(null); }} style={{ width: "100%", padding: 16 }}>
          Initialize Verification Sequence
        </button>
      ) : (
        <div style={{ borderTop: "1px solid var(--border-primary)", paddingTop: 24 }}>
          <div className="form-group">
            <label className="label">Verification Evidence Payload</label>
            {b.riskTier === 0 && <input className="input" placeholder="Input 6-digit OTP provided by recipient" value={proofData} onChange={e => setProofData(e.target.value)} />}
            {b.riskTier === 1 && <input className="input" placeholder="IPFS CID of installation photograph" value={proofData} onChange={e => setProofData(e.target.value)} />}
            {b.riskTier === 2 && <input className="input" placeholder="UIDAI Biometric Transaction ID" value={proofData} onChange={e => setProofData(e.target.value)} />}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn-primary" onClick={confirm} disabled={loading || !proofData.trim()} style={{ flex: 1 }}>
              {loading ? <Activity size={18} className="spin" /> : <ShieldCheck size={18} />}
              {loading ? "Confirming Proof..." : "Verify & Release Escrow"}
            </button>
            <button className="btn btn-outline" onClick={() => setOpen(false)}>Abort</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Completed delivery card ────────────────────────────────────
function CompletedCard({ booking: b }) {
  const ti = tierInfo(b.riskTier);
  return (
    <div className="card" style={{ borderLeft: `6px solid var(--brand-primary)`, opacity: 0.92 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <CheckCircle size={16} color="var(--brand-primary)" />
            <div style={{ fontWeight: 700, fontSize: 15 }}>Ref: {b.bookingId.slice(0, 16)}...</div>
          </div>
          <div className="mono" style={{ fontSize: 11, marginBottom: 12 }}>Recipient: {b.walletAddress}</div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-tertiary)", fontSize: 12 }}>
              <Calendar size={13} />Booked: {new Date(b.createdAt).toLocaleString()}
            </div>
            {b.updatedAt && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--brand-primary)", fontSize: 12 }}>
                <PackageCheck size={13} />Delivered: {new Date(b.updatedAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <span className="badge" style={{ background: ti.bg, color: ti.color, border: `1px solid ${ti.border}` }}>{ti.label}</span>
          <span className="badge badge-green" style={{ fontSize: 11 }}>DELIVERED</span>
          {b.deliveryTxHash && (
            <div className="mono" style={{ fontSize: 10, color: "var(--brand-primary)" }}>
              Tx: {b.deliveryTxHash.slice(0, 14)}...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────
export default function DeliveryUI() {
  const [tab, setTab] = useState("pending");
  const [pending, setPending] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [globalResult, setGlobalResult] = useState(null);
  const [agentAddress] = useState("0xacc1f6E32dB61CB6d48FB752ED28E15EA48A4aD6");

  function loadPending() {
    axios.get(`${API}/deliveries/pending`).then(r => setPending(r.data.bookings)).catch(() => {});
  }
  function loadCompleted() {
    axios.get(`${API}/deliveries/completed`).then(r => setCompleted(r.data.bookings)).catch(() => {});
  }
  function loadAll() { loadPending(); loadCompleted(); }

  useEffect(() => {
    loadAll();
    const t = setInterval(loadAll, 8000);
    return () => clearInterval(t);
  }, []);

  function handleDelivered() {
    setGlobalResult({ success: true });
    loadAll();
    setTimeout(() => setGlobalResult(null), 4000);
  }

  return (
    <div className="page">
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">Fulfillment Center</h1>
        <p className="page-sub">Tiered verification workflow for secure gas asset distribution.</p>
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--bg-secondary)", border: "1px solid var(--border-primary)", borderRadius: 6 }}>
            <UserCheck size={14} color="var(--brand-primary)" />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>Agent ID: {agentAddress.slice(0, 10)}...</span>
          </div>
        </div>
      </div>

      {/* Global success toast */}
      {globalResult?.success && (
        <div className="card" style={{ background: "var(--success-soft)", borderColor: "var(--success-border)", marginBottom: 32, padding: "16px 24px" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <ShieldCheck size={24} color="var(--success)" />
            <div style={{ fontWeight: 700, color: "var(--success)" }}>Subsidy Release Authorized — Delivery confirmed on-chain.</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tab-row">
        <button className={`tab ${tab === "pending" ? "active" : ""}`} onClick={() => setTab("pending")}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Clock size={14} />
            Pending
            {pending.length > 0 && (
              <span style={{ background: "var(--warning)", color: "white", borderRadius: 99, fontSize: 10, fontWeight: 700, padding: "1px 6px", marginLeft: 2 }}>
                {pending.length}
              </span>
            )}
          </span>
        </button>
        <button className={`tab ${tab === "completed" ? "active" : ""}`} onClick={() => setTab("completed")}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <CheckCircle size={14} />
            Completed
            {completed.length > 0 && (
              <span style={{ background: "var(--brand-primary)", color: "white", borderRadius: 99, fontSize: 10, fontWeight: 700, padding: "1px 6px", marginLeft: 2 }}>
                {completed.length}
              </span>
            )}
          </span>
        </button>
      </div>

      {/* Pending tab */}
      {tab === "pending" && (
        <div>
          <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <Truck size={18} color="var(--text-tertiary)" />
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>
              Pending Distributions ({pending.length})
            </span>
          </div>
          {pending.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 80, background: "var(--bg-secondary)", borderStyle: "dashed" }}>
              <div style={{ color: "var(--text-tertiary)", marginBottom: 16 }}>
                <Truck size={48} strokeWidth={1} />
              </div>
              <div style={{ color: "var(--text-secondary)", fontSize: 16, fontWeight: 600 }}>Operational Queue Empty</div>
              <div style={{ color: "var(--text-tertiary)", fontSize: 13, marginTop: 4 }}>System is monitoring for new bookings on Hela Testnet.</div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              {pending.map(b => (
                <PendingCard key={b.bookingId} booking={b} agentAddress={agentAddress} onDelivered={handleDelivered} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Completed tab */}
      {tab === "completed" && (
        <div>
          <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <PackageCheck size={18} color="var(--text-tertiary)" />
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>
              Completed Deliveries ({completed.length})
            </span>
          </div>
          {completed.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 80, background: "var(--bg-secondary)", borderStyle: "dashed" }}>
              <div style={{ color: "var(--text-tertiary)", marginBottom: 16 }}>
                <PackageCheck size={48} strokeWidth={1} />
              </div>
              <div style={{ color: "var(--text-secondary)", fontSize: 16, fontWeight: 600 }}>No Completed Deliveries Yet</div>
              <div style={{ color: "var(--text-tertiary)", fontSize: 13, marginTop: 4 }}>Fulfilled orders will appear here after verification.</div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              {completed.map(b => (
                <CompletedCard key={b.bookingId} booking={b} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}