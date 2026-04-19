import { useState, useEffect } from "react";
import axios from "axios";
import { ClipboardList, Flame, Lock, Fingerprint, Copy, History, User, CheckCircle, AlertCircle, Activity } from "lucide-react";


const API = "http://localhost:3001/api";

function RegisterForm({ onRegistered }) {
  const [form, setForm] = useState({
    name: "", aadhaarNumber: "", walletAddress: "",
    phone: "", lat: "18.5204", lon: "73.8567", pincode: "411001"
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function submit() {
    setLoading(true); setResult(null);
    try {
      const res = await axios.post(`${API}/register`, form);
      setResult(res.data);
      if (res.data.success) onRegistered(form.walletAddress, form.name);
    } catch (e) {
      setResult({ success: false, error: e.response?.data?.error || e.message });
    }
    setLoading(false);
  }

  return (
    <div className="card">
      <div className="card-title">
        <ClipboardList size={22} className="sidebar-logo" />
        New Connection Registration
      </div>
      
      <div className="input-row">
        <div className="form-group">
          <label className="label">Full Name</label>
          <input className="input" placeholder="e.g. Rajesh Sharma" value={form.name} onChange={e => set("name", e.target.value)} />
        </div>
        <div className="form-group">
          <label className="label">Mobile Number</label>
          <input className="input" placeholder="+91 00000 00000" value={form.phone} onChange={e => set("phone", e.target.value)} />
        </div>
      </div>
      
      <div className="form-group">
        <label className="label">Aadhaar Identification</label>
        <input className="input" placeholder="XXXX XXXX XXXX" value={form.aadhaarNumber} onChange={e => set("aadhaarNumber", e.target.value)} />
      </div>

      <div className="form-group">
        <label className="label">Web3 Wallet Address</label>
        <input className="input" placeholder="0x..." value={form.walletAddress} onChange={e => set("walletAddress", e.target.value)} />
      </div>

      <div className="input-row">
        <div className="form-group">
          <label className="label">Service Latitude</label>
          <input className="input" value={form.lat} onChange={e => set("lat", e.target.value)} />
        </div>
        <div className="form-group">
          <label className="label">Service Longitude</label>
          <input className="input" value={form.lon} onChange={e => set("lon", e.target.value)} />
        </div>
      </div>

      <div className="form-group">
        <label className="label">Regional Pincode</label>
        <input className="input" placeholder="411001" value={form.pincode} onChange={e => set("pincode", e.target.value)} />
      </div>

      <div className="zkp-notice">
        <Lock size={20} color="var(--brand-primary)" style={{ marginTop: '2px' }} />
        <div>
          <strong style={{ display: 'block', marginBottom: '4px' }}>Cryptographic Privacy</strong>
          <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Aadhaar data is hashed locally using ZKP protocol. Only the cryptographic commitment is recorded on the blockchain.</div>
        </div>
      </div>

      <button className="btn btn-primary" onClick={submit} disabled={loading || !form.aadhaarNumber || !form.walletAddress} style={{ width: '100%' }}>
        {loading ? <Activity size={18} className="spin" /> : <Fingerprint size={18} />}
        {loading ? "Processing..." : "Register & Mint Connection SBT"}
      </button>

      {result && (
        <div style={{ marginTop: 24 }}>
          {result.success ? (
            <div className="card" style={{ background: 'var(--success-soft)', borderColor: 'var(--success-border)', padding: '20px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--success)', marginBottom: '12px' }}>
                <CheckCircle size={20} />
                <strong style={{ fontSize: '15px' }}>Registration Verified</strong>
              </div>
              <div className="mono" style={{ display: 'block', marginBottom: '8px', fontSize: '11px', background: 'white' }}>Tx: {result.txHash}</div>
              <div className="mono" style={{ display: 'block', fontSize: '11px', background: 'white' }}>Trace: {result.traceId}</div>
            </div>
          ) : (
            <div style={{ color: 'var(--danger)', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <AlertCircle size={18} />
              {result.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BookingPanel({ wallet }) {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [deviceId] = useState("UID-" + Math.random().toString(36).slice(2, 10).toUpperCase());

  useEffect(() => {
    if (!wallet) return;
    axios.get(`${API}/user/${wallet}`).then(r => setUser(r.data)).catch(() => {});
    axios.get(`${API}/bookings/${wallet}`).then(r => setBookings(r.data.bookings)).catch(() => {});
  }, [wallet, result]);

  async function book() {
    setLoading(true); setResult(null);
    try {
      const res = await axios.post(`${API}/book`, {
        walletAddress: wallet, deviceId,
        deliveryLat: 18.5204, deliveryLon: 73.8567
      });
      setResult(res.data);
    } catch (e) {
      setResult({ success: false, error: e.response?.data?.error || e.message });
    }
    setLoading(false);
  }

  const tierBadge = t => t === 0
    ? <span className="badge badge-green">VERIFIED SAFE</span>
    : t === 1 ? <span className="badge badge-yellow">MANUAL REVIEW</span>
    : <span className="badge badge-red">RESTRICTED ACCESS</span>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {user && (
        <div className="card" style={{ background: 'white', borderLeft: '6px solid var(--brand-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <User size={18} color="var(--brand-primary)" />
                <div style={{ fontSize: '20px', fontWeight: 700 }}>{user.name}</div>
              </div>
              <div className="mono" style={{ fontSize: '12px', background: 'var(--bg-secondary)' }}>{wallet}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="stat-val">{user.vouchersRemaining}</div>
              <div className="stat-lbl">Credits Left</div>
            </div>
          </div>
          
          <button className="btn btn-primary" onClick={book} disabled={loading || user.vouchersRemaining <= 0} style={{ width: "100%", padding: "16px" }}>
            {loading ? <Activity size={20} className="spin" /> : <Flame size={20} />}
            {loading ? "Analyzing Trust Metrics..." : "Initialize Cylinder Booking"}
          </button>

          {result && (
            <div style={{ marginTop: 24 }}>
              {result.success ? (
                <div className="card" style={{ background: 'var(--bg-secondary)', padding: '24px', border: '1px solid var(--border-primary)' }}>
                  <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '16px', color: 'var(--brand-primary)' }}>Booking Authorized</div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
                    <span className="badge badge-blue">Trust Score: {result.fraudScore}</span>
                    {tierBadge(result.riskTier)}
                  </div>

                  {result.otp && (
                    <div style={{
                      margin: "24px 0",
                      padding: "24px",
                      background: "white",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--brand-primary-border)",
                      boxShadow: "var(--shadow-md)"
                    }}>
                      <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 700, textTransform: "uppercase", marginBottom: '12px', letterSpacing: '0.05em' }}>
                        Encrypted Delivery Token
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                        <span style={{
                          fontSize: '40px',
                          fontWeight: 800,
                          letterSpacing: '12px',
                          color: "var(--brand-primary)",
                          fontFamily: "JetBrains Mono, monospace",
                        }}>
                          {result.otp}
                        </span>
                        <button
                          className="btn btn-outline"
                          onClick={() => navigator.clipboard.writeText(result.otp)}
                          style={{ padding: '8px 16px' }}
                        >
                          <Copy size={16} />
                          Copy
                        </button>
                      </div>
                      <div style={{ fontSize: '13px', color: "var(--text-secondary)", marginTop: 16 }}>
                        Authorized personnel only. Share this token with the delivery agent to release assets.
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div className="mono" style={{ fontSize: '11px' }}>ID: {result.bookingId}</div>
                    <div className="mono" style={{ fontSize: '11px' }}>Tx Hash: {result.escrowTxHash}</div>
                  </div>
                </div>
              ) : (
                <div className="alert-error" style={{ color: 'var(--danger)', padding: '16px', display: 'flex', gap: '10px' }}>
                  <AlertCircle size={20} />
                  {result.error}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {bookings.length > 0 && (
        <div className="card">
          <div className="card-title">
            <History size={20} className="sidebar-logo" />
            Booking History
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Booking Reference</th>
                  <th>Timestamp</th>
                  <th>Trust Assessment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.bookingId}>
                    <td className="mono" style={{ fontSize: '11px' }}>{b.bookingId.slice(0, 16)}...</td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{new Date(b.createdAt).toLocaleDateString()}</td>
                    <td style={{ minWidth: '180px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>Score: {b.fraudScore}</span>
                        {tierBadge(b.riskTier)}
                      </div>
                      <div className="score-bar">
                        <div className="score-fill" style={{
                          width: `${b.fraudScore}%`,
                          background: b.fraudScore > 70 ? "var(--danger)" : b.fraudScore > 30 ? "var(--warning)" : "var(--brand-primary)"
                        }} />
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${b.status === "DELIVERED" ? "badge-green" : b.status === "PENDING" ? "badge-yellow" : "badge-blue"}`}>
                        {b.status}
                      </span>
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

export default function CustomerUI() {
  const [wallet, setWallet] = useState("");
  const [registered, setRegistered] = useState(null);
  const [tab, setTab] = useState("register");

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Service Dashboard</h1>
        <p className="page-sub">Secure gas asset management and decentralized identification.</p>
      </div>

      <div className="tab-row">
        <button className={`tab ${tab === "register" ? "active" : ""}`} onClick={() => setTab("register")}>Register</button>
        <button className={`tab ${tab === "book" ? "active" : ""}`} onClick={() => setTab("book")}>Book Cylinder</button>
      </div>

      {tab === "register" && (
        <RegisterForm onRegistered={(w, n) => { setRegistered({ wallet: w, name: n }); setWallet(w); setTab("book"); }} />
      )}

      {tab === "book" && (
        <>
          {!registered && (
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto 40px' }}>
              <div className="card-title">
                <Lock size={20} className="sidebar-logo" />
                Access Controller
              </div>
              <div className="form-group">
                <label className="label">Registered Wallet Address</label>
                <input className="input" placeholder="0x..." value={wallet} onChange={e => setWallet(e.target.value)} />
              </div>
              <button className="btn btn-primary" onClick={() => setRegistered({ wallet, name: "" })} disabled={!wallet} style={{ width: '100%' }}>
                <CheckCircle size={18} />
                Authenticate Account
              </button>
            </div>
          )}
          {(registered || wallet) && <BookingPanel wallet={registered?.wallet || wallet} />}
        </>
      )}
    </div>
  );
}