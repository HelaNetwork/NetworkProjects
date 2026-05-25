const { useState, useEffect, useRef } = React;

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const style = document.createElement("style");
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg-void: #060810;
    --bg-deep: #0b0f1a;
    --bg-card: #0f1422;
    --bg-surface: #141928;
    --bg-hover: #1a2035;
    --border: rgba(99,132,255,0.12);
    --border-bright: rgba(99,132,255,0.3);
    --accent-blue: #6384ff;
    --accent-cyan: #00d4ff;
    --accent-low: #00e599;
    --accent-med: #f5a623;
    --accent-high: #ff4d6d;
    --accent-critical: #ff1744;
    --text-primary: #e8eaf6;
    --text-secondary: #8892b0;
    --text-muted: #4a5568;
    --glow-blue: 0 0 40px rgba(99,132,255,0.15);
    --glow-red: 0 0 40px rgba(255,77,109,0.2);
    --font-display: 'Syne', sans-serif;
    --font-mono: 'Space Mono', monospace;
  }

  body {
    background: var(--bg-void);
    color: var(--text-primary);
    font-family: var(--font-display);
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg-deep); }
  ::-webkit-scrollbar-thumb { background: var(--border-bright); border-radius: 2px; }

  /* Grid bg pattern */
  .grid-bg {
    background-image: linear-gradient(rgba(99,132,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,132,255,0.03) 1px, transparent 1px);
    background-size: 32px 32px;
  }

  /* Glassmorphism card */
  .glass-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    transition: all 0.3s ease;
  }
  .glass-card:hover { border-color: var(--border-bright); box-shadow: var(--glow-blue); }

  /* Input styles */
  .crisis-input {
    width: 100%;
    background: var(--bg-deep);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px 16px;
    color: var(--text-primary);
    font-family: var(--font-display);
    font-size: 14px;
    outline: none;
    transition: all 0.25s;
    letter-spacing: 0.02em;
  }
  .crisis-input:focus { border-color: var(--accent-blue); box-shadow: 0 0 0 3px rgba(99,132,255,0.1); }
  .crisis-input::placeholder { color: var(--text-muted); }

  /* Button */
  .btn-primary {
    width: 100%;
    padding: 13px;
    background: linear-gradient(135deg, var(--accent-blue), #8b6fff);
    border: none;
    border-radius: 10px;
    color: #fff;
    font-family: var(--font-display);
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.25s;
    position: relative;
    overflow: hidden;
  }
  .btn-primary::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
    opacity: 0;
    transition: opacity 0.25s;
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(99,132,255,0.4); }
  .btn-primary:hover::after { opacity: 1; }
  .btn-primary:active { transform: translateY(0); }

  /* Pulse dot */
  @keyframes pulse-ring {
    0% { transform: scale(0.8); opacity: 1; }
    100% { transform: scale(2.4); opacity: 0; }
  }
  .pulse-dot {
    position: relative;
    display: inline-block;
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--accent-high);
  }
  .pulse-dot::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: var(--accent-high);
    animation: pulse-ring 1.5s ease-out infinite;
  }

  /* Risk bar */
  @keyframes bar-fill { from { width: 0; } }
  .risk-bar-fill { animation: bar-fill 1s ease forwards; }

  /* Fade in */
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .fade-up { animation: fadeUp 0.5s ease forwards; }

  /* Scan line */
  @keyframes scan {
    0% { top: 0%; }
    100% { top: 100%; }
  }
  .scan-line {
    position: absolute;
    left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent-blue), transparent);
    animation: scan 3s linear infinite;
    opacity: 0.4;
    pointer-events: none;
  }

  /* Alert item */
  .alert-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    border-left: 2px solid transparent;
    transition: all 0.2s;
    background: rgba(255,255,255,0.02);
    margin-bottom: 6px;
  }
  .alert-item:hover { background: rgba(255,255,255,0.04); }

  /* Sidebar nav item */
  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.02em;
    color: var(--text-secondary);
  }
  .nav-item:hover { background: var(--bg-hover); color: var(--text-primary); }
  .nav-item.active { background: rgba(99,132,255,0.12); color: var(--accent-blue); border: 1px solid rgba(99,132,255,0.2); }

  /* Crisis simulate shake */
  @keyframes crisis-shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
    20%, 40%, 60%, 80% { transform: translateX(3px); }
  }
  .crisis-mode { animation: crisis-shake 0.6s ease; }

  /* Logo mark */
  @keyframes rotate-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  /* Typewriter cursor */
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
  .cursor { animation: blink 1s ease infinite; }

  /* Number counter */
  @keyframes count-up { from { opacity: 0; } to { opacity: 1; } }
`;
document.head.appendChild(style);

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 16, color = "currentColor" }) => {
    const icons = {
        shield: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z" /></svg>,
        dashboard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
        globe: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
        bell: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
        settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
        trending: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>,
        alert: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
        bank: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><line x1="3" y1="22" x2="21" y2="22" /><line x1="6" y1="18" x2="6" y2="11" /><line x1="10" y1="18" x2="10" y2="11" /><line x1="14" y1="18" x2="14" y2="11" /><line x1="18" y1="18" x2="18" y2="11" /><polygon points="12 2 20 7 4 7" /></svg>,
        chart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
        droplet: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>,
        eye: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
        zap: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
        activity: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
        lock: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
        mail: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
        user: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
        chevronRight: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>,
        logout: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    };
    return icons[name] || null;
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const useTime = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
    return time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

const riskColor = (level) => ({
    LOW: { color: "var(--accent-low)", bg: "rgba(0,229,153,0.08)", border: "rgba(0,229,153,0.25)", label: "LOW" },
    MEDIUM: { color: "var(--accent-med)", bg: "rgba(245,166,35,0.08)", border: "rgba(245,166,35,0.25)", label: "MED" },
    HIGH: { color: "var(--accent-high)", bg: "rgba(255,77,109,0.08)", border: "rgba(255,77,109,0.3)", label: "HIGH" },
    CRITICAL: { color: "var(--accent-critical)", bg: "rgba(255,23,68,0.1)", border: "rgba(255,23,68,0.4)", label: "CRIT" },
}[level]);

const makeRiskLevel = (score) => {
    if (score >= 70) return "CRITICAL";
    if (score >= 50) return "HIGH";
    if (score >= 30) return "MEDIUM";
    return "LOW";
};

const buildSparkData = (score) => {
    const center = Math.round(score);
    return Array.from({ length: 10 }, (_, i) => {
        const offset = Math.sin(i / 2) * 6 + (i - 5) * 1.4;
        return Math.max(6, Math.min(95, Math.round(center + offset)));
    });
};

const normalizeSignalLabel = (signal) =>
    String(signal || "").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const renderActionLabel = (action) => {
    if (!action) return "MONITOR";
    return action.replace(/_/g, " ").toUpperCase();
};

// ─── LOGO MARK ────────────────────────────────────────────────────────────────
const LogoMark = ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path d="M16 2L4 8v8c0 7 5.5 13.5 12 14.5C22.5 29.5 28 23 28 16V8L16 2z" fill="url(#logo-grad)" opacity="0.9" />
        <path d="M16 2L4 8v8c0 7 5.5 13.5 12 14.5C22.5 29.5 28 23 28 16V8L16 2z" stroke="rgba(99,132,255,0.6)" strokeWidth="1" />
        <path d="M11 16l3.5 3.5L21 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
            <linearGradient id="logo-grad" x1="4" y1="2" x2="28" y2="30">
                <stop stopColor="#6384ff" />
                <stop offset="1" stopColor="#8b6fff" />
            </linearGradient>
        </defs>
    </svg>
);

// ─── MINI SPARKLINE ───────────────────────────────────────────────────────────
const Sparkline = ({ data, color, crisis }) => {
    const points = data.map((v, i) => `${(i / (data.length - 1)) * 180},${60 - v * 0.55}`).join(" ");
    return (
        <svg width="180" height="60" viewBox="0 0 180 60" fill="none" style={{ overflow: "visible" }}>
            <defs>
                <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop stopColor={color} stopOpacity="0.3" />
                    <stop offset="1" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polyline points={points} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <polygon points={`0,60 ${points} 180,60`} fill={`url(#spark-${color})`} />
        </svg>
    );
};

// ─── GLOBAL RISK CHART ────────────────────────────────────────────────────────
const GlobalRiskChart = ({ score = 50 }) => {
    const normalizedScore = Math.max(10, Math.min(95, score));
    const baseData = Array.from({ length: 20 }, (_, i) => {
        const offset = Math.sin(i / 2) * 8 + (i - 9) * ((normalizedScore - 50) / 16);
        return Math.max(10, Math.min(95, Math.round(normalizedScore + offset)));
    });
    const W = 600, H = 160;
    const max = 100, min = 0;
    const pts = baseData.map((v, i) => ({
        x: (i / (baseData.length - 1)) * W,
        y: H - ((v - min) / (max - min)) * H,
        v,
    }));
    const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
    const fill = `${path} L${W},${H} L0,${H} Z`;
    const crisis = score >= 70;

    return (
        <div style={{ position: "relative", overflow: "hidden", borderRadius: 12 }}>
            <div className="scan-line" />
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} fill="none" preserveAspectRatio="none" style={{ display: "block", height: 160 }}>
                <defs>
                    <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop stopColor={crisis ? "var(--accent-critical)" : "var(--accent-blue)"} stopOpacity="0.3" />
                        <stop offset="1" stopColor={crisis ? "var(--accent-critical)" : "var(--accent-blue)"} stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
                        <stop stopColor={crisis ? "#ff4d6d" : "var(--accent-cyan)"} />
                        <stop offset="1" stopColor={crisis ? "var(--accent-critical)" : "var(--accent-blue)"} />
                    </linearGradient>
                </defs>
                {[25, 50, 75].map(v => (
                    <line key={v} x1={0} y1={H - (v / 100) * H} x2={W} y2={H - (v / 100) * H}
                        stroke="rgba(99,132,255,0.06)" strokeWidth="1" strokeDasharray="4,4" />
                ))}
                <path d={fill} fill="url(#chart-grad)" />
                <path d={path} stroke="url(#line-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                {pts.map((p, i) => i === pts.length - 1 && (
                    <circle key={i} cx={p.x} cy={p.y} r="4" fill={crisis ? "var(--accent-critical)" : "var(--accent-cyan)"} />
                ))}
            </svg>
            <div style={{ position: "absolute", top: 8, right: 12, display: "flex", gap: 16 }}>
                {[{ label: "LOW", val: "0–33" }, { label: "MED", val: "34–66" }, { label: "HIGH", val: "67–100" }].map(({ label, val }) => (
                    <span key={label} style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>{label}: {val}</span>
                ))}
            </div>
        </div>
    );
};

// ─── RISK CARD ────────────────────────────────────────────────────────────────
const RiskCard = ({ title, icon, level, score, sparkData, delta, delay = 0 }) => {
    const rc = riskColor(level);
    return (
        <div className="glass-card fade-up" style={{ padding: 20, animationDelay: `${delay}ms`, animationFillMode: "both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <div style={{ color: rc.color }}><Icon name={icon} size={16} /></div>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{title}</span>
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1, color: rc.color, fontFamily: "var(--font-mono)" }}>
                        {score}<span style={{ fontSize: 16, fontWeight: 400 }}>%</span>
                    </div>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div style={{
                        background: rc.bg, border: `1px solid ${rc.border}`,
                        borderRadius: 6, padding: "3px 10px",
                        fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
                        color: rc.color, letterSpacing: "0.12em", marginBottom: 6
                    }}>{rc.label}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: delta > 0 ? "var(--accent-high)" : "var(--accent-low)" }}>
                        {delta > 0 ? "▲" : "▼"} {Math.abs(delta)}%
                    </div>
                </div>
            </div>

            {/* Risk bar */}
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 4, height: 4, marginBottom: 14, overflow: "hidden" }}>
                <div className="risk-bar-fill" style={{ height: "100%", width: `${score}%`, background: `linear-gradient(90deg, ${rc.color}88, ${rc.color})`, borderRadius: 4, transition: "width 1s ease" }} />
            </div>

            <Sparkline data={sparkData} color={rc.color} />
        </div>
    );
};

// ─── ALERT PANEL ──────────────────────────────────────────────────────────────
const AlertPanel = ({ headlines, crisis }) => {
    const alerts = Array.isArray(headlines) && headlines.length > 0
        ? headlines.slice(0, 6).map((item, i) => ({
            sev: item.sentiment === "negative" ? "HIGH" : "MEDIUM",
            msg: item.title || item.body || "News update",
            time: item.date || item.timestamp || `${i * 4 + 3}m ago`,
            icon: item.sentiment === "negative" ? "alert" : "activity",
        }))
        : [
            { sev: "MEDIUM", msg: "Live scan active, waiting for fresh market signals.", time: "Now", icon: "activity" },
            { sev: "LOW", msg: "News feed is stable with no immediate negative indicators.", time: "3m ago", icon: "globe" },
        ];

    const sevStyle = (sev) => ({
        CRITICAL: { color: "var(--accent-critical)", border: "var(--accent-critical)", bg: "rgba(255,23,68,0.08)" },
        HIGH: { color: "var(--accent-high)", border: "var(--accent-high)", bg: "rgba(255,77,109,0.06)" },
        MEDIUM: { color: "var(--accent-med)", border: "var(--accent-med)", bg: "rgba(245,166,35,0.06)" },
        LOW: { color: "var(--accent-low)", border: "var(--accent-low)", bg: "rgba(0,229,153,0.06)" },
    }[sev]);

    return (
        <div style={{ maxHeight: 320, overflowY: "auto", paddingRight: 4 }}>
            {alerts.map((a, i) => {
                const s = sevStyle(a.sev);
                return (
                    <div key={i} className="alert-item fade-up" style={{ borderLeftColor: s.color, background: s.bg, animationDelay: `${i * 80}ms`, animationFillMode: "both" }}>
                        <div style={{ color: s.color, marginTop: 1, flexShrink: 0 }}><Icon name={a.icon} size={14} /></div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, color: "var(--text-primary)", lineHeight: 1.4 }}>{a.msg}</div>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 3 }}>{a.time}</div>
                        </div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: s.color, background: `${s.color}18`, border: `1px solid ${s.color}40`, borderRadius: 4, padding: "2px 6px", flexShrink: 0, fontWeight: 700, letterSpacing: "0.08em" }}>{a.sev}</div>
                    </div>
                );
            })}
        </div>
    );
};

// ─── EXPLAINABILITY ───────────────────────────────────────────────────────────
const ExplainPanel = ({ chartSignals, newsSignals }) => {
    const sourceFactors = [
        ...(Array.isArray(chartSignals) ? chartSignals : []),
        ...(Array.isArray(newsSignals) ? newsSignals : []),
    ].slice(0, 6);
    const factors = sourceFactors.length > 0
        ? sourceFactors.map((item) => ({
            label: normalizeSignalLabel(item.signal || item.category || item.title || "Signal"),
            weight: Math.min(100, Math.max(20, Math.round((item.weight || item.severity === "high") ? 80 : 50))),
            delta: item.detected === false ? -5 : (item.detected === true ? 15 : 8),
        }))
        : [
            { label: "Live scan initialized", weight: 64, delta: +4 },
            { label: "Integrated market + news signals", weight: 58, delta: +2 },
            { label: "Crisis score trending", weight: 49, delta: -1 },
        ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {factors.map((f, i) => (
                <div key={i} className="fade-up" style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{f.label}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: f.delta > 0 ? "var(--accent-high)" : "var(--accent-low)" }}>
                            {f.delta > 0 ? "+" : ""}{f.delta}%
                        </span>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 4, height: 6, overflow: "hidden" }}>
                        <div className="risk-bar-fill" style={{
                            height: "100%", width: `${f.weight}%`, borderRadius: 4,
                            background: `linear-gradient(90deg, ${f.weight > 70 ? "var(--accent-high)" : f.weight > 45 ? "var(--accent-med)" : "var(--accent-blue)"}88, ${f.weight > 70 ? "var(--accent-high)" : f.weight > 45 ? "var(--accent-med)" : "var(--accent-blue)"})`
                        }} />
                    </div>
                </div>
            ))}
        </div>
    );
};

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const Sidebar = ({ activeNav, setActiveNav, onLogout }) => {
    const [simMode, setSimMode] = useState(false);
    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: "dashboard" },
        { id: "global", label: "Global Risk", icon: "globe" },
        { id: "alerts", label: "Alerts", icon: "bell" },
        { id: "stocks", label: "Market", icon: "trending" },
        { id: "settings", label: "Settings", icon: "settings" },
    ];

    return (
        <div style={{
            width: 220, height: "100vh", overflowY: "auto", background: "var(--bg-deep)",
            borderRight: "1px solid var(--border)", display: "flex",
            flexDirection: "column", padding: "20px 14px", flexShrink: 0,
        }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 4px", marginBottom: 32 }}>
                <LogoMark size={30} />
                <div>
                    <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: "0.04em" }}>CrisisGuard</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent-blue)", letterSpacing: "0.1em" }}>AI PLATFORM</div>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.15em", padding: "0 10px", marginBottom: 8 }}>NAVIGATION</div>
                {navItems.map(({ id, label, icon }) => (
                    <div key={id} className={`nav-item ${activeNav === id ? "active" : ""}`} onClick={() => setActiveNav(id)}>
                        <Icon name={icon} size={15} />
                        <span>{label}</span>
                        {activeNav === id && <div style={{ marginLeft: "auto" }}><Icon name="chevronRight" size={12} /></div>}
                    </div>
                ))}
                
                <div style={{ marginTop: "auto" }}>
                    <div className="nav-item" onClick={async () => {
                        try {
                            const newState = !simMode;
                            setSimMode(newState);
                            await fetch('/api/simulate/toggle', { 
                                method: 'POST', 
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ state: newState }) 
                            });
                        } catch(e) { console.error(e) }
                    }} style={{ 
                        background: simMode ? "rgba(255,77,109,0.1)" : "rgba(99,132,255,0.1)", 
                        color: simMode ? "var(--accent-high)" : "var(--accent-blue)", 
                        border: `1px solid ${simMode ? "rgba(255,77,109,0.3)" : "rgba(99,132,255,0.3)"}` 
                    }}>
                        <Icon name="zap" size={14} />
                        <span>{simMode ? "Simulation ON" : "Simulation OFF"}</span>
                    </div>
                </div>
            </nav>

            {/* Status */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: 16 }}>
                <div style={{ padding: "8px 10px", borderRadius: 8, background: "rgba(0,229,153,0.06)", border: "1px solid rgba(0,229,153,0.15)", marginBottom: 10 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 4 }}>SYSTEM STATUS</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div className="pulse-dot" style={{ background: "var(--accent-low)" }} />
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent-low)" }}>All systems nominal</span>
                    </div>
                </div>
                <div className="nav-item" onClick={onLogout} style={{ color: "var(--accent-high)", opacity: 0.7 }}>
                    <Icon name="logout" size={14} />
                    <span style={{ fontSize: 12 }}>Sign out</span>
                </div>
            </div>
        </div>
    );
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const Dashboard = ({ onLogout }) => {
    const [serverData, setServerData] = useState(null);
    const [activeNav, setActiveNav] = useState("dashboard");
    const [shaking, setShaking] = useState(false);
    const time = useTime();

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch("/api/status");
                const data = await res.json();
                setServerData(data);
                if (data.crisis) {
                    setShaking(true);
                    setTimeout(() => setShaking(false), 700);
                }
            } catch (err) {
                console.error("Failed to fetch status", err);
            }
        };
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const scoreToDelta = (score) => Math.round((score || 0) - 48);
    const bankingScore = serverData?.banking_score ?? 42;
    const marketScore = serverData?.market_score ?? 28;
    const liquidityScore = serverData?.liquidity_score ?? 71;
    const currentScore = serverData?.crisis_score ?? 54;
    const crisis = serverData?.crisis ?? false;
    const status = serverData?.status || "WATCH";
    const actionLabel = renderActionLabel(serverData?.message || serverData?.recommended_action || "MONITOR_CLOSELY");
    const companyName = serverData?.company_name || serverData?.ticker || "Unnamed Asset";
    const lastScan = serverData?.timestamp || "N/A";

    const d = {
        banking: { level: makeRiskLevel(bankingScore), score: bankingScore, spark: buildSparkData(bankingScore), delta: scoreToDelta(bankingScore) },
        market: { level: makeRiskLevel(marketScore), score: marketScore, spark: buildSparkData(marketScore), delta: scoreToDelta(marketScore) },
        liquidity: { level: makeRiskLevel(liquidityScore), score: liquidityScore, spark: buildSparkData(liquidityScore), delta: scoreToDelta(liquidityScore) },
    };

    const statusLabel = status.toUpperCase();
    const chartSignals = serverData?.chart_signals ?? [];
    const newsSignals = serverData?.news_signals ?? [];
    const newsHeadlines = serverData?.news_headlines ?? [];

    const refreshStatus = async () => {
        try {
            const res = await fetch("/api/status");
            const data = await res.json();
            setServerData(data);
        } catch (err) {
            console.error("Refresh failed", err);
        }
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-void)" }} className="grid-bg">
            <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} onLogout={onLogout} />

            {/* Main content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
                {/* Top bar */}
                <div style={{
                    height: 60, background: "var(--bg-deep)", borderBottom: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0 24px", position: "sticky", top: 0, zIndex: 10,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div>
                            <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "0.04em" }}>CrisisGuard AI</span>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginLeft: 10 }}>/ {activeNav.toUpperCase()}</span>
                        </div>
                        <div style={{
                            display: "flex", alignItems: "center", gap: 7,
                            background: crisis ? "rgba(255,23,68,0.12)" : "rgba(255,77,109,0.08)",
                            border: `1px solid ${crisis ? "rgba(255,23,68,0.4)" : "rgba(255,77,109,0.2)"}`,
                            borderRadius: 20, padding: "4px 12px 4px 8px",
                            transition: "all 0.3s"
                        }}>
                            <div className="pulse-dot" style={{ background: crisis ? "var(--accent-critical)" : "var(--accent-high)" }} />
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: crisis ? "var(--accent-critical)" : "var(--accent-high)", letterSpacing: "0.06em" }}>
                                {crisis ? "CRISIS DETECTED" : "LIVE MONITORING"}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>{time}</div>
                        <button
                            onClick={refreshStatus}
                            style={{
                                background: "transparent",
                                border: `1px solid ${crisis ? "var(--accent-critical)" : "var(--accent-blue)"}`,
                                color: crisis ? "var(--accent-critical)" : "var(--accent-blue)",
                                borderRadius: 8, padding: "7px 16px",
                                fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 700,
                                cursor: "pointer", letterSpacing: "0.06em",
                                transition: "all 0.3s",
                            }}
                            onMouseEnter={e => { e.target.style.background = crisis ? "rgba(255,23,68,0.1)" : "rgba(99,132,255,0.1)"; }}
                            onMouseLeave={e => { e.target.style.background = "transparent"; }}
                        >
                            REFRESH DATA
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className={shaking ? "crisis-mode" : ""} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Risk Cards */}
                    <div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.15em", marginBottom: 14 }}>REAL-TIME RISK INDICATORS</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                            <RiskCard title="Banking Instability" icon="bank" {...d.banking} sparkData={d.banking.spark} delay={0} />
                            <RiskCard title="Market Crash Risk" icon="trending" {...d.market} sparkData={d.market.spark} delay={80} />
                            <RiskCard title="Liquidity Risk" icon="droplet" {...d.liquidity} sparkData={d.liquidity.spark} delay={160} />
                        </div>
                    </div>

                    {/* Chart + Alerts */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16 }}>
                        <div className="glass-card" style={{ padding: 20 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                <div>
                                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.15em", marginBottom: 4 }}>GLOBAL RISK TREND</div>
                                    <div style={{ fontWeight: 700, fontSize: 18 }}>Composite Risk Index</div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 700, color: crisis ? "var(--accent-critical)" : "var(--accent-cyan)" }}>
                                        {currentScore}
                                    </div>
                                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>CURRENT SCORE</div>
                                </div>
                            </div>
                            <GlobalRiskChart score={currentScore} />
                            <div style={{ display: "flex", gap: 20, marginTop: 12, flexWrap: "wrap" }}>
                                {[{ label: "Latest Scan", val: lastScan }, { label: "Status", val: statusLabel }, { label: "Action", val: actionLabel }, { label: "Asset", val: companyName }].map(({ label, val }) => (
                                    <div key={label} style={{ minWidth: 120 }}>
                                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 4 }}>{label}</div>
                                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{val}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: 20 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                                <div>
                                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.15em", marginBottom: 4 }}>ACTIVE ALERTS</div>
                                    <div style={{ fontWeight: 700, fontSize: 15 }}>Alert Feed</div>
                                </div>
                                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, background: crisis ? "rgba(255,23,68,0.1)" : "rgba(245,166,35,0.1)", color: crisis ? "var(--accent-critical)" : "var(--accent-med)", border: `1px solid ${crisis ? "rgba(255,23,68,0.3)" : "rgba(245,166,35,0.3)"}`, borderRadius: 12, padding: "3px 10px" }}>
                                    {crisis ? "ALERTS ACTIVE" : "NORMAL FLOW"}
                                </div>
                            </div>
                            <AlertPanel headlines={newsHeadlines} crisis={crisis} />
                        </div>
                    </div>

                    {/* Explainability */}
                    <div className="glass-card" style={{ padding: 20 }}>
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.15em", marginBottom: 4 }}>AI EXPLAINABILITY</div>
                            <div style={{ fontWeight: 700, fontSize: 15 }}>Risk Factor Decomposition</div>
                            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>Why is this risk level being assigned?</div>
                        </div>
                        <ExplainPanel chartSignals={chartSignals} newsSignals={newsSignals} />
                    </div>

                    {/* Bottom stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                        {[
                            { label: "Ticker", val: serverData?.ticker || "N/A", icon: "globe", color: "var(--accent-blue)" },
                            { label: "Status", val: statusLabel, icon: "activity", color: crisis ? "var(--accent-critical)" : "var(--accent-cyan)" },
                            { label: "Recommended", val: actionLabel, icon: "eye", color: crisis ? "var(--accent-high)" : "var(--accent-med)" },
                            { label: "Last Scan", val: lastScan, icon: "bell", color: "var(--accent-low)" },
                        ].map(({ label, val, icon, color }) => (
                            <div key={label} className="glass-card" style={{ padding: "14px 18px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 6 }}>{label.toUpperCase()}</div>
                                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color }}>{val}</div>
                                    </div>
                                    <div style={{ color, opacity: 0.6 }}><Icon name={icon} size={20} /></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── AUTH BACKGROUND ──────────────────────────────────────────────────────────
const AuthBg = () => (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", zIndex: 0 }}>
        <svg width="100%" height="100%" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0 }}>
            <defs>
                <radialGradient id="auth-glow-1" cx="30%" cy="40%" r="60%">
                    <stop stopColor="#6384ff" stopOpacity="0.12" />
                    <stop offset="1" stopColor="#6384ff" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="auth-glow-2" cx="75%" cy="70%" r="50%">
                    <stop stopColor="#ff4d6d" stopOpacity="0.08" />
                    <stop offset="1" stopColor="#ff4d6d" stopOpacity="0" />
                </radialGradient>
            </defs>
            <rect width="1440" height="900" fill="var(--bg-void)" />
            <rect width="1440" height="900" fill="url(#auth-glow-1)" />
            <rect width="1440" height="900" fill="url(#auth-glow-2)" />
            {/* Grid lines */}
            {Array.from({ length: 20 }).map((_, i) => (
                <line key={`h${i}`} x1={0} y1={i * 48} x2={1440} y2={i * 48} stroke="rgba(99,132,255,0.04)" strokeWidth="1" />
            ))}
            {Array.from({ length: 32 }).map((_, i) => (
                <line key={`v${i}`} x1={i * 48} y1={0} x2={i * 48} y2={900} stroke="rgba(99,132,255,0.04)" strokeWidth="1" />
            ))}
        </svg>
    </div>
);

// Page components are now loaded from /pages.
const SignupPage = ({ onSignup, onGoLogin }) => {
    const [form, setForm] = useState({ name: "", email: "", pwd: "", confirm: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = "Name is required";
        if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
        if (form.pwd.length < 8) e.pwd = "Min 8 characters";
        if (form.pwd !== form.confirm) e.confirm = "Passwords do not match";
        return e;
    };

    const handleSignup = () => {
        const e = validate();
        setErrors(e);
        if (Object.keys(e).length > 0) return;
        setLoading(true);
        setTimeout(() => { setLoading(false); onSignup(); }, 1200);
    };

    const Field = ({ label, icon, type = "text", field, placeholder }) => (
        <div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 7 }}>
                <Icon name={icon} size={11} /> {label}
            </label>
            <input className="crisis-input" type={type} placeholder={placeholder} value={form[field]} onChange={set(field)}
                style={{ borderColor: errors[field] ? "rgba(255,77,109,0.5)" : undefined }} />
            {errors[field] && <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent-high)", marginTop: 5 }}>⚠ {errors[field]}</div>}
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <AuthBg />
            <div className="fade-up" style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 440, padding: "0 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 28 }}>
                    <LogoMark size={36} />
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: "0.04em" }}>CrisisGuard AI</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent-blue)", letterSpacing: "0.12em" }}>ANALYST PORTAL</div>
                    </div>
                </div>

                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: 32 }}>
                    <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Create your account</h2>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 28 }}>Join the global risk monitoring network</p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <Field label="FULL NAME" icon="user" field="name" placeholder="Jane Analyst" />
                        <Field label="WORK EMAIL" icon="mail" field="email" placeholder="analyst@firm.com" />
                        <Field label="PASSWORD" icon="lock" type="password" field="pwd" placeholder="Min 8 characters" />
                        <Field label="CONFIRM PASSWORD" icon="lock" type="password" field="confirm" placeholder="Re-enter password" />

                        {/* Password strength */}
                        {form.pwd && (
                            <div>
                                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 5 }}>
                                    PASSWORD STRENGTH
                                </div>
                                <div style={{ display: "flex", gap: 4 }}>
                                    {[1, 2, 3, 4].map(n => {
                                        const strength = [form.pwd.length >= 8, /[A-Z]/.test(form.pwd), /[0-9]/.test(form.pwd), /[^a-zA-Z0-9]/.test(form.pwd)].filter(Boolean).length;
                                        const colors = ["var(--accent-high)", "var(--accent-med)", "var(--accent-med)", "var(--accent-low)"];
                                        return <div key={n} style={{ flex: 1, height: 3, borderRadius: 2, background: n <= strength ? colors[strength - 1] : "rgba(255,255,255,0.06)", transition: "all 0.3s" }} />;
                                    })}
                                </div>
                            </div>
                        )}

                        <button className="btn-primary" onClick={handleSignup} style={{ marginTop: 6 }}>
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>
                    </div>

                    <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-muted)" }}>
                        Already have an account?{" "}
                        <span onClick={onGoLogin} style={{ color: "var(--accent-blue)", cursor: "pointer", fontWeight: 600 }}>Sign in</span>
                    </div>
                </div>

                <div style={{ textAlign: "center", marginTop: 16, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.06em" }}>
                    BY SIGNING UP YOU AGREE TO OUR TERMS OF SERVICE
                </div>
            </div>
        </div>
    );
};

// App root is bootstrapped separately in /app.jsx.
