import { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function shortAddr(addr) {
  if (!addr) return "—";
  const clean = addr.replace("whatsapp:", "").replace("+91", "+91 ");
  return clean.length > 14 ? clean.slice(0, 7) + "..." + clean.slice(-4) : clean;
}

function shortHash(hash) {
  if (!hash) return "—";
  return hash.slice(0, 8) + "..." + hash.slice(-6);
}

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const target = parseFloat(value) || 0;
    const start = prev.current;
    const diff = target - start;
    if (diff === 0) return;
    const steps = 30;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplay(Math.round(start + (diff * i) / steps));
      if (i >= steps) { clearInterval(timer); prev.current = target; }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}</span>;
}

export default function App() {
  const [stats, setStats] = useState({ totalUsers: 0, totalTransactions: 0, totalVolume: 0 });
  const [txs, setTxs] = useState([]);
  const [users, setUsers] = useState([]);
  const [active, setActive] = useState("dashboard");
  const [apiStatus, setApiStatus] = useState("connecting");
  const [search, setSearch] = useState("");
  const [selectedTx, setSelectedTx] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchAll = () => {
    Promise.all([
      fetch(`${API}/stats`).then(r => r.json()),
      fetch(`${API}/transactions`).then(r => r.json()),
      fetch(`${API}/users`).then(r => r.json()),
    ]).then(([s, t, u]) => {
      setStats(s);
      setTxs(t);
      setUsers(u);
      setApiStatus("ok");
      setLastUpdate(new Date());
    }).catch(() => setApiStatus("error"));
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredTxs = txs.filter(tx => {
    const matchSearch = search === "" ||
      tx.fromPhone?.includes(search) ||
      tx.toPhone?.includes(search) ||
      tx.txHash?.includes(search);
    const matchStatus = filterStatus === "all" || tx.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const successCount = txs.filter(t => t.status === "success").length;
  const failCount = txs.filter(t => t.status === "failed").length;
  const successRate = txs.length > 0 ? Math.round((successCount / txs.length) * 100) : 0;

  return (
    <div style={{ minHeight:"100vh", background:"#040810", fontFamily:"'JetBrains Mono', 'Fira Code', monospace", color:"#C8D8E8", display:"flex", flexDirection:"column", position:"relative", overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;600;700&family=Space+Grotesk:wght@400;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.95)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes glowPulse { 0%,100%{box-shadow:0 0 20px rgba(99,179,237,0.1)} 50%{box-shadow:0 0 40px rgba(99,179,237,0.25)} }

        .nav-item { transition: all 0.2s ease; }
        .nav-item:hover { background: rgba(99,179,237,0.06) !important; color: #63B3ED !important; }
        .nav-item.active { background: rgba(99,179,237,0.1) !important; color: #63B3ED !important; border-left: 2px solid #63B3ED !important; }

        .tx-row { transition: all 0.15s ease; cursor: pointer; animation: slideIn 0.3s ease; }
        .tx-row:hover { background: rgba(99,179,237,0.04) !important; transform: translateX(2px); }

        .stat-card { animation: slideIn 0.4s ease; transition: all 0.2s ease; }
        .stat-card:hover { transform: translateY(-2px); border-color: rgba(99,179,237,0.3) !important; }

        .search-input { background: rgba(99,179,237,0.05); border: 1px solid rgba(99,179,237,0.15); border-radius: 8px; padding: 8px 14px; color: #C8D8E8; font-family: inherit; font-size: 12px; outline: none; transition: all 0.2s; width: 280px; }
        .search-input:focus { border-color: rgba(99,179,237,0.4); background: rgba(99,179,237,0.08); }
        .search-input::placeholder { color: #3A5060; }

        .filter-btn { background: none; border: 1px solid rgba(99,179,237,0.15); border-radius: 6px; padding: 5px 12px; color: #3A7080; font-family: inherit; font-size: 11px; cursor: pointer; transition: all 0.2s; }
        .filter-btn:hover { border-color: rgba(99,179,237,0.3); color: #63B3ED; }
        .filter-btn.active-filter { background: rgba(99,179,237,0.1); border-color: #63B3ED; color: #63B3ED; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(4,8,16,0.85); backdrop-filter: blur(4px); z-index: 100; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s ease; }
        .modal { background: #070E18; border: 1px solid rgba(99,179,237,0.2); border-radius: 16px; padding: 32px; width: 480px; max-width: 90vw; animation: slideIn 0.2s ease; }

        .copy-btn { background: none; border: 1px solid rgba(99,179,237,0.2); border-radius: 4px; padding: 3px 8px; color: #3A7080; font-family: inherit; font-size: 10px; cursor: pointer; transition: all 0.2s; margin-left: 8px; }
        .copy-btn:hover { color: #63B3ED; border-color: #63B3ED; }

        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(99,179,237,0.15); border-radius: 2px; }

        .grid-bg { position: absolute; inset: 0; background-image: linear-gradient(rgba(99,179,237,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,237,0.02) 1px, transparent 1px); background-size: 40px 40px; pointer-events: none; }
      `}</style>

      <div className="grid-bg" />

      {/* HEADER */}
      <header style={{ padding:"0 32px", height:60, borderBottom:"1px solid rgba(99,179,237,0.08)", display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(4,8,16,0.8)", backdropFilter:"blur(12px)", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:"linear-gradient(135deg,#63B3ED,#3182CE)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:700, animation:"glowPulse 3s infinite" }}>Z</div>
          <div>
            <div style={{ fontSize:14, fontWeight:700, letterSpacing:3, color:"#E2EEF8", fontFamily:"'Space Grotesk', sans-serif" }}>ZAPPAY</div>
            <div style={{ fontSize:9, color:"#2A4A5A", letterSpacing:4 }}>WHATSAPP CRYPTO NETWORK</div>
          </div>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:24 }}>
          {lastUpdate && (
            <span style={{ fontSize:10, color:"#2A4060" }}>
              Updated {timeAgo(lastUpdate)}
            </span>
          )}
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 14px", borderRadius:20, background:"rgba(99,179,237,0.06)", border:"1px solid rgba(99,179,237,0.12)" }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background: apiStatus==="ok"?"#48BB78":apiStatus==="error"?"#FC8181":"#ECC94B", animation:"pulse 2s infinite" }}/>
            <span style={{ fontSize:10, color: apiStatus==="ok"?"#48BB78":apiStatus==="error"?"#FC8181":"#ECC94B", letterSpacing:1 }}>
              {apiStatus==="ok"?"LIVE":apiStatus==="error"?"OFFLINE":"CONNECTING"}
            </span>
            <span style={{ fontSize:10, color:"#2A4060", marginLeft:4 }}>· HELA TESTNET</span>
          </div>
        </div>
      </header>

      <div style={{ display:"flex", flex:1, position:"relative" }}>

        {/* SIDEBAR */}
        <aside style={{ width:220, borderRight:"1px solid rgba(99,179,237,0.06)", padding:"28px 0", background:"rgba(4,8,16,0.4)", backdropFilter:"blur(8px)", flexShrink:0 }}>
          <div style={{ padding:"0 16px 20px", fontSize:9, color:"#1A3040", letterSpacing:3 }}>NAVIGATION</div>
          {[
            { id:"dashboard", icon:"▦", label:"Dashboard" },
            { id:"transactions", icon:"⇄", label:"Transactions" },
            { id:"users", icon:"◎", label:"Users" },
            { id:"analytics", icon:"▲", label:"Analytics" },
            { id:"bot", icon:"◈", label:"Bot Guide" },
          ].map(item => (
            <button
              key={item.id}
              className={`nav-item ${active===item.id?"active":""}`}
              onClick={() => setActive(item.id)}
              style={{ width:"100%", padding:"11px 20px", background:"none", border:"none", borderLeft:"2px solid transparent", color:"#2A4A5A", cursor:"pointer", textAlign:"left", fontSize:11, letterSpacing:2, display:"flex", alignItems:"center", gap:12, fontFamily:"inherit" }}
            >
              <span style={{ fontSize:14, opacity:0.8 }}>{item.icon}</span>
              {item.label.toUpperCase()}
            </button>
          ))}

          <div style={{ margin:"24px 16px 0", padding:"16px", borderRadius:10, background:"rgba(99,179,237,0.04)", border:"1px solid rgba(99,179,237,0.08)" }}>
            <div style={{ fontSize:9, color:"#2A4060", letterSpacing:2, marginBottom:10 }}>NETWORK STATS</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:10, color:"#3A5060" }}>Success Rate</span>
                <span style={{ fontSize:10, color:"#48BB78", fontWeight:600 }}>{successRate}%</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:10, color:"#3A5060" }}>Failed TXs</span>
                <span style={{ fontSize:10, color:"#FC8181" }}>{failCount}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:10, color:"#3A5060" }}>Chain ID</span>
                <span style={{ fontSize:10, color:"#63B3ED" }}>666888</span>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main style={{ flex:1, padding:"32px", overflowY:"auto", maxHeight:"calc(100vh - 60px)" }}>

          {/* ── DASHBOARD ── */}
          {active === "dashboard" && (
            <div style={{ animation:"slideIn 0.3s ease" }}>
              <div style={{ marginBottom:28 }}>
                <div style={{ fontSize:10, color:"#2A4060", letterSpacing:4, marginBottom:6 }}>OVERVIEW</div>
                <h1 style={{ fontSize:26, fontWeight:700, color:"#E2EEF8", fontFamily:"'Space Grotesk', sans-serif", letterSpacing:1 }}>Network Dashboard</h1>
              </div>

              {apiStatus === "error" && (
                <div style={{ padding:"12px 16px", marginBottom:24, borderRadius:10, background:"rgba(252,129,129,0.06)", border:"1px solid rgba(252,129,129,0.2)", color:"#FC8181", fontSize:11, display:"flex", alignItems:"center", gap:10 }}>
                  <span>⚠</span> Backend offline — displaying cached data
                </div>
              )}

              {/* STAT CARDS */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:28 }}>
                {[
                  { label:"Total Users", value:stats.totalUsers, icon:"◎", color:"#63B3ED", bg:"rgba(99,179,237,0.06)" },
                  { label:"Transactions", value:stats.totalTransactions, icon:"⇄", color:"#68D391", bg:"rgba(104,211,145,0.06)" },
                  { label:"Volume (HELA)", value:stats.totalVolume, icon:"◈", color:"#F6AD55", bg:"rgba(246,173,85,0.06)" },
                ].map((s, i) => (
                  <div key={s.label} className="stat-card" style={{ padding:"22px 24px", borderRadius:14, background:s.bg, border:`1px solid ${s.color}20` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                      <span style={{ fontSize:20, color:s.color, opacity:0.7 }}>{s.icon}</span>
                      <div style={{ fontSize:9, color:s.color, opacity:0.5, letterSpacing:2 }}>HELA</div>
                    </div>
                    <div style={{ fontSize:32, fontWeight:700, color:s.color, marginBottom:4, fontFamily:"'Space Grotesk', sans-serif" }}>
                      <AnimatedNumber value={s.value} />
                    </div>
                    <div style={{ fontSize:10, color:"#3A5060", letterSpacing:1 }}>{s.label.toUpperCase()}</div>
                  </div>
                ))}
              </div>

              {/* PROGRESS BAR */}
              <div style={{ padding:"16px 20px", borderRadius:12, background:"rgba(99,179,237,0.03)", border:"1px solid rgba(99,179,237,0.08)", marginBottom:24 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <span style={{ fontSize:10, color:"#3A5060", letterSpacing:2 }}>SUCCESS RATE</span>
                  <span style={{ fontSize:10, color:"#48BB78", fontWeight:600 }}>{successRate}% ({successCount}/{txs.length})</span>
                </div>
                <div style={{ height:4, borderRadius:2, background:"rgba(99,179,237,0.1)", overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${successRate}%`, background:"linear-gradient(90deg,#48BB78,#68D391)", borderRadius:2, transition:"width 0.5s ease" }}/>
                </div>
              </div>

              {/* RECENT TXS */}
              <div style={{ borderRadius:14, overflow:"hidden", border:"1px solid rgba(99,179,237,0.08)" }}>
                <div style={{ padding:"14px 20px", borderBottom:"1px solid rgba(99,179,237,0.06)", display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(99,179,237,0.02)" }}>
                  <span style={{ fontSize:11, letterSpacing:3, color:"#63B3ED" }}>RECENT TRANSACTIONS</span>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ width:5, height:5, borderRadius:"50%", background:"#48BB78", animation:"pulse 2s infinite" }}/>
                    <span style={{ fontSize:9, color:"#2A4060" }}>LIVE · 5s</span>
                  </div>
                </div>
                {txs.length === 0 ? (
                  <div style={{ padding:"40px", textAlign:"center", color:"#2A4060", fontSize:12 }}>No transactions yet</div>
                ) : txs.slice(0,6).map(tx => (
                  <div key={tx.id} className="tx-row" onClick={() => setSelectedTx(tx)} style={{ padding:"13px 20px", borderBottom:"1px solid rgba(99,179,237,0.04)", display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{ width:34, height:34, borderRadius:10, background:`${tx.status==="success"?"rgba(72,187,120":"rgba(252,129,129"},0.1)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:tx.status==="success"?"#48BB78":"#FC8181", flexShrink:0 }}>
                      {tx.fromPhone==="contract"?"↓":"↑"}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:11, marginBottom:2, display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ color:"#68D391" }}>{shortAddr(tx.fromPhone)}</span>
                        <span style={{ color:"#2A4060", fontSize:10 }}>→</span>
                        <span style={{ color:"#63B3ED" }}>{shortAddr(tx.toPhone)}</span>
                      </div>
                      <div style={{ fontSize:9, color:"#2A4060", fontFamily:"monospace" }}>{shortHash(tx.txHash)}</div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ color:"#F6AD55", fontWeight:600, fontSize:13 }}>{tx.amount} HELA</div>
                      <div style={{ fontSize:9, color:"#2A4060", marginTop:2 }}>{timeAgo(tx.createdAt)}</div>
                    </div>
                    <div style={{ padding:"3px 10px", borderRadius:20, background:tx.status==="success"?"rgba(72,187,120,0.1)":"rgba(252,129,129,0.1)", color:tx.status==="success"?"#48BB78":"#FC8181", fontSize:9, letterSpacing:1, flexShrink:0 }}>
                      {tx.status?.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TRANSACTIONS ── */}
          {active === "transactions" && (
            <div style={{ animation:"slideIn 0.3s ease" }}>
              <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:10, color:"#2A4060", letterSpacing:4, marginBottom:6 }}>BLOCKCHAIN LEDGER</div>
                <h1 style={{ fontSize:26, fontWeight:700, color:"#E2EEF8", fontFamily:"'Space Grotesk', sans-serif" }}>All Transactions</h1>
              </div>

              <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
                <input
                  className="search-input"
                  placeholder="Search by phone, address or hash..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <div style={{ display:"flex", gap:6 }}>
                  {["all","success","failed"].map(f => (
                    <button key={f} className={`filter-btn ${filterStatus===f?"active-filter":""}`} onClick={() => setFilterStatus(f)}>
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
                <span style={{ fontSize:10, color:"#2A4060", alignSelf:"center", marginLeft:"auto" }}>{filteredTxs.length} results</span>
              </div>

              <div style={{ borderRadius:14, overflow:"hidden", border:"1px solid rgba(99,179,237,0.08)" }}>
                <div style={{ padding:"10px 20px", borderBottom:"1px solid rgba(99,179,237,0.06)", display:"grid", gridTemplateColumns:"40px 1fr 1fr 100px 80px 70px", gap:12, fontSize:9, color:"#2A4060", letterSpacing:2 }}>
                  <span>#</span><span>FROM</span><span>TO</span><span>AMOUNT</span><span>TIME</span><span>STATUS</span>
                </div>
                {filteredTxs.length === 0 ? (
                  <div style={{ padding:"40px", textAlign:"center", color:"#2A4060", fontSize:12 }}>No transactions found</div>
                ) : filteredTxs.map((tx, i) => (
                  <div key={tx.id} className="tx-row" onClick={() => setSelectedTx(tx)} style={{ padding:"12px 20px", borderBottom:"1px solid rgba(99,179,237,0.04)", display:"grid", gridTemplateColumns:"40px 1fr 1fr 100px 80px 70px", gap:12, alignItems:"center" }}>
                    <span style={{ fontSize:10, color:"#2A4060" }}>{i+1}</span>
                    <span style={{ fontSize:11, color:"#68D391" }}>{shortAddr(tx.fromPhone)}</span>
                    <span style={{ fontSize:11, color:"#63B3ED" }}>{shortAddr(tx.toPhone)}</span>
                    <span style={{ fontSize:11, color:"#F6AD55", fontWeight:600 }}>{tx.amount} HELA</span>
                    <span style={{ fontSize:10, color:"#2A4060" }}>{timeAgo(tx.createdAt)}</span>
                    <span style={{ fontSize:9, color:tx.status==="success"?"#48BB78":"#FC8181", padding:"2px 8px", borderRadius:20, background:tx.status==="success"?"rgba(72,187,120,0.1)":"rgba(252,129,129,0.1)", textAlign:"center" }}>
                      {tx.status==="success"?"✓":"✗"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {active === "users" && (
            <div style={{ animation:"slideIn 0.3s ease" }}>
              <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:10, color:"#2A4060", letterSpacing:4, marginBottom:6 }}>REGISTERED WALLETS</div>
                <h1 style={{ fontSize:26, fontWeight:700, color:"#E2EEF8", fontFamily:"'Space Grotesk', sans-serif" }}>Users <span style={{ color:"#63B3ED" }}>({users.length})</span></h1>
              </div>

              <input
                className="search-input"
                placeholder="Search users..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ marginBottom:20 }}
              />

              <div style={{ display:"grid", gap:12 }}>
                {users.filter(u => !search || u.phone?.includes(search) || u.walletAddress?.includes(search)).map((u, i) => (
                  <div key={i} className="stat-card" style={{ padding:"18px 20px", borderRadius:12, background:"rgba(99,179,237,0.03)", border:"1px solid rgba(99,179,237,0.08)", display:"flex", alignItems:"center", gap:16 }}>
                    <div style={{ width:40, height:40, borderRadius:12, background:"linear-gradient(135deg, rgba(99,179,237,0.2), rgba(49,130,206,0.1))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:"#63B3ED", flexShrink:0 }}>
                      {i+1}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, color:"#68D391", marginBottom:4, fontWeight:600 }}>{u.phone}</div>
                      <div style={{ fontSize:10, color:"#2A4060", fontFamily:"monospace", wordBreak:"break-all" }}>{u.walletAddress || "—"}</div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:9, color:"#2A4060", marginBottom:4 }}>JOINED</div>
                      <div style={{ fontSize:10, color:"#3A5060" }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</div>
                      {u.contacts > 0 && (
                        <div style={{ fontSize:9, color:"#63B3ED", marginTop:4 }}>{u.contacts} contacts</div>
                      )}
                    </div>
                    <button className="copy-btn" onClick={() => navigator.clipboard.writeText(u.walletAddress)}>COPY</button>
                  </div>
                ))}
                {users.length === 0 && (
                  <div style={{ padding:"40px", textAlign:"center", color:"#2A4060", fontSize:12, borderRadius:12, border:"1px solid rgba(99,179,237,0.06)" }}>No users registered yet</div>
                )}
              </div>
            </div>
          )}

          {/* ── ANALYTICS ── */}
          {active === "analytics" && (
            <div style={{ animation:"slideIn 0.3s ease" }}>
              <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:10, color:"#2A4060", letterSpacing:4, marginBottom:6 }}>INSIGHTS</div>
                <h1 style={{ fontSize:26, fontWeight:700, color:"#E2EEF8", fontFamily:"'Space Grotesk', sans-serif" }}>Analytics</h1>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
                {[
                  { label:"Successful", value:successCount, color:"#48BB78", pct:successRate },
                  { label:"Failed", value:failCount, color:"#FC8181", pct:100-successRate },
                  { label:"Avg per User", value:users.length>0?(stats.totalVolume/users.length).toFixed(1):0, color:"#F6AD55", pct:null },
                  { label:"Total Volume", value:`${stats.totalVolume} HELA`, color:"#63B3ED", pct:null },
                ].map(item => (
                  <div key={item.label} className="stat-card" style={{ padding:"20px", borderRadius:12, background:"rgba(99,179,237,0.03)", border:"1px solid rgba(99,179,237,0.08)" }}>
                    <div style={{ fontSize:10, color:"#2A4060", letterSpacing:2, marginBottom:10 }}>{item.label.toUpperCase()}</div>
                    <div style={{ fontSize:28, fontWeight:700, color:item.color, fontFamily:"'Space Grotesk', sans-serif", marginBottom:item.pct!==null?10:0 }}>{item.value}</div>
                    {item.pct !== null && (
                      <div style={{ height:3, borderRadius:2, background:"rgba(99,179,237,0.08)", overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${item.pct}%`, background:item.color, borderRadius:2, transition:"width 0.5s ease" }}/>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Transaction Timeline */}
              <div style={{ borderRadius:14, border:"1px solid rgba(99,179,237,0.08)", overflow:"hidden" }}>
                <div style={{ padding:"14px 20px", borderBottom:"1px solid rgba(99,179,237,0.06)", fontSize:11, letterSpacing:3, color:"#63B3ED" }}>TRANSACTION TIMELINE</div>
                <div style={{ padding:"20px" }}>
                  {txs.slice(0,10).map((tx, i) => (
                    <div key={tx.id} style={{ display:"flex", gap:14, marginBottom:16, alignItems:"flex-start" }}>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
                        <div style={{ width:10, height:10, borderRadius:"50%", background:tx.status==="success"?"#48BB78":"#FC8181", marginTop:2 }}/>
                        {i < txs.slice(0,10).length-1 && <div style={{ width:1, height:24, background:"rgba(99,179,237,0.08)", marginTop:4 }}/>}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:11, color:"#C8D8E8", marginBottom:2 }}>
                          <span style={{ color:"#68D391" }}>{shortAddr(tx.fromPhone)}</span>
                          <span style={{ color:"#2A4060", margin:"0 6px" }}>→</span>
                          <span style={{ color:"#63B3ED" }}>{shortAddr(tx.toPhone)}</span>
                          <span style={{ color:"#F6AD55", marginLeft:8, fontWeight:600 }}>{tx.amount} HELA</span>
                        </div>
                        <div style={{ fontSize:9, color:"#2A4060" }}>{timeAgo(tx.createdAt)} · {tx.txHash ? shortHash(tx.txHash) : "no hash"}</div>
                      </div>
                    </div>
                  ))}
                  {txs.length === 0 && <div style={{ textAlign:"center", color:"#2A4060", fontSize:12, padding:"20px 0" }}>No transaction data yet</div>}
                </div>
              </div>
            </div>
          )}

          {/* ── BOT GUIDE ── */}
          {active === "bot" && (
            <div style={{ animation:"slideIn 0.3s ease" }}>
              <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:10, color:"#2A4060", letterSpacing:4, marginBottom:6 }}>WHATSAPP INTERFACE</div>
                <h1 style={{ fontSize:26, fontWeight:700, color:"#E2EEF8", fontFamily:"'Space Grotesk', sans-serif" }}>Bot Commands</h1>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {[
                  { cmd:"Hi", resp:"🎉 Welcome! Set your PIN to get started.", category:"Setup" },
                  { cmd:"1234 (your PIN)", resp:"✅ PIN verified! Session active for 10 mins.", category:"Auth" },
                  { cmd:"Deposit 10 HELA", resp:"✅ Deposited 10 HELA successfully!", category:"Finance" },
                  { cmd:"Send 5 HELA to +91XXXXXXXXXX", resp:"✅ Transfer Successful! Sent 5 HELA.", category:"Transfer" },
                  { cmd:"Check balance", resp:"💰 Your Balance: 250 HELA", category:"Info" },
                  { cmd:"Withdraw 10 HELA", resp:"✅ Withdrew 10 HELA successfully!", category:"Finance" },
                  { cmd:"Transaction history", resp:"📋 Last 5 transactions...", category:"Info" },
                  { cmd:"My wallet", resp:"👛 Address: 0xABC123...", category:"Info" },
                  { cmd:"Daily limit", resp:"📊 995 HELA left today", category:"Info" },
                  { cmd:"Send 5 HELA to Rahul", resp:"✅ Sent 5 HELA to Rahul!", category:"Transfer" },
                  { cmd:"Open dashboard", resp:"📊 Live Dashboard: https://...", category:"Info" },
                ].map(item => (
                  <div key={item.cmd} style={{ padding:"16px", borderRadius:12, background:"rgba(99,179,237,0.02)", border:"1px solid rgba(99,179,237,0.08)", transition:"all 0.2s" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                      <div style={{ fontSize:9, padding:"2px 8px", borderRadius:20, background:"rgba(99,179,237,0.1)", color:"#63B3ED", letterSpacing:1 }}>{item.category.toUpperCase()}</div>
                    </div>
                    <div style={{ fontSize:12, color:"#68D391", marginBottom:8, padding:"6px 10px", background:"rgba(104,211,145,0.06)", borderRadius:6, fontFamily:"monospace" }}>"{item.cmd}"</div>
                    <div style={{ fontSize:10, color:"#3A5060", padding:"6px 10px", background:"rgba(0,0,0,0.2)", borderRadius:6, borderLeft:"2px solid rgba(99,179,237,0.2)" }}>
                      {item.resp}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* FOOTER */}
      <footer style={{ padding:"10px 32px", borderTop:"1px solid rgba(99,179,237,0.06)", display:"flex", justifyContent:"space-between", fontSize:9, color:"#1A3040", letterSpacing:2, background:"rgba(4,8,16,0.6)" }}>
        <span>ZAPPAY v1.0 · HACKJKLU v5.0 · BLOCKCHAIN-XIII</span>
        <span>HELA TESTNET · CHAIN ID 666888 · © 2025</span>
      </footer>

      {/* TX DETAIL MODAL */}
      {selectedTx && (
        <div className="modal-overlay" onClick={() => setSelectedTx(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <div>
                <div style={{ fontSize:9, color:"#2A4060", letterSpacing:3, marginBottom:4 }}>TRANSACTION DETAILS</div>
                <h2 style={{ fontSize:18, color:"#E2EEF8", fontFamily:"'Space Grotesk', sans-serif" }}>
                  {selectedTx.amount} HELA
                </h2>
              </div>
              <div style={{ padding:"4px 12px", borderRadius:20, background:selectedTx.status==="success"?"rgba(72,187,120,0.1)":"rgba(252,129,129,0.1)", color:selectedTx.status==="success"?"#48BB78":"#FC8181", fontSize:10 }}>
                {selectedTx.status?.toUpperCase()}
              </div>
            </div>

            {[
              { label:"From", value:selectedTx.fromPhone },
              { label:"To", value:selectedTx.toPhone },
              { label:"Amount", value:`${selectedTx.amount} HELA` },
              { label:"TX Hash", value:selectedTx.txHash || "—" },
              { label:"Time", value:selectedTx.createdAt ? new Date(selectedTx.createdAt).toLocaleString() : "—" },
            ].map(row => (
              <div key={row.label} style={{ padding:"12px 0", borderBottom:"1px solid rgba(99,179,237,0.06)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:10, color:"#2A4060", letterSpacing:1 }}>{row.label.toUpperCase()}</span>
                <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <span style={{ fontSize:11, color:"#C8D8E8", fontFamily:"monospace", maxWidth:260, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.value}</span>
                  {row.value && row.value !== "—" && (
                    <button className="copy-btn" onClick={() => navigator.clipboard.writeText(row.value)}>COPY</button>
                  )}
                </div>
              </div>
            ))}

            <button onClick={() => setSelectedTx(null)} style={{ marginTop:20, width:"100%", padding:"10px", borderRadius:8, background:"rgba(99,179,237,0.08)", border:"1px solid rgba(99,179,237,0.15)", color:"#63B3ED", cursor:"pointer", fontFamily:"inherit", fontSize:11, letterSpacing:2 }}>
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
