const { useState } = React;

const SettingsPage = () => {
    const [saved, setSaved] = useState(false);

    const [cfg, setCfg] = useState({
        emailAlerts: true,
        smsAlerts: false,
        pushAlerts: true,
        criticalOnly: false,
        autoRefresh: true,
        refreshRate: "30",
        riskThreshold: "65",
        timezone: "UTC",
        darkMode: true,
        dataDensity: "standard",
        apiKey: "cg-api-●●●●●●●●●●●●●●●●",
        name: "Jane Analyst",
        email: "analyst@globalrisk.com",
        role: "Senior Risk Analyst",
        twoFA: true,
        sessionTimeout: "60",
    });

    const set = k => v => setCfg(c => ({ ...c, [k]: v }));
    const tog = k => () => setCfg(c => ({ ...c, [k]: !c[k] }));
    const save = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2200);
    };

    const Tog = ({ k }) => (
        <div
            style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                background: cfg[k] ? "var(--accent-low)" : "rgba(255,255,255,.1)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                padding: "0 3px",
                transition: "all 0.2s"
            }}
            onClick={tog(k)}
        >
            <div
                style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "#fff",
                    transition: "all 0.2s",
                    marginLeft: cfg[k] ? 20 : 0
                }}
            />
        </div>
    );

    const Row = ({ lbl, sub, children }) => (
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "13px 0",
            borderBottom: "1px solid rgba(255,255,255,.03)"
        }}>
            <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{lbl}</div>
                {sub && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{sub}</div>}
            </div>
            {children}
        </div>
    );

    return (
        <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 18 }}>
            <h1 style={{ fontWeight: 800, fontSize: 24 }}>Settings</h1>

            <div className="glass-card" style={{ padding: 20 }}>
                <div style={{ marginBottom: 16, fontWeight: 700, fontSize: 12 }}>Notifications</div>
                <Row lbl="Email Alerts"><Tog k="emailAlerts" /></Row>
                <Row lbl="SMS Alerts"><Tog k="smsAlerts" /></Row>
                <Row lbl="Push Notifications"><Tog k="pushAlerts" /></Row>
            </div>

            <div className="glass-card" style={{ padding: 20 }}>
                <div style={{ marginBottom: 16, fontWeight: 700, fontSize: 12 }}>Display</div>
                <Row lbl="Auto Refresh"><Tog k="autoRefresh" /></Row>
                <Row lbl="Dark Mode"><Tog k="darkMode" /></Row>
                <Row lbl="Data Density">
                    <select value={cfg.dataDensity} onChange={e => set("dataDensity")(e.target.value)} style={{
                        background: "var(--bg-deep)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                        borderRadius: 6,
                        padding: "6px 10px",
                        cursor: "pointer"
                    }}>
                        <option>standard</option>
                        <option>compact</option>
                        <option>spacious</option>
                    </select>
                </Row>
            </div>

            <div className="glass-card" style={{ padding: 20 }}>
                <div style={{ marginBottom: 16, fontWeight: 700, fontSize: 12 }}>Security</div>
                <Row lbl="Two-Factor Auth"><Tog k="twoFA" /></Row>
                <Row lbl="Session Timeout (minutes)">
                    <input type="number" value={cfg.sessionTimeout} onChange={e => set("sessionTimeout")(e.target.value)} style={{
                        background: "var(--bg-deep)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                        borderRadius: 6,
                        padding: "6px 10px",
                        width: 80
                    }} />
                </Row>
            </div>

            <button onClick={save} style={{
                width: "100%",
                padding: "13px",
                background: "linear-gradient(135deg, var(--accent-blue), #8b6fff)",
                border: "none",
                borderRadius: "10px",
                color: "#fff",
                fontFamily: "var(--font-display)",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.3s"
            }}>
                Save Settings
            </button>

            {saved && <div style={{ color: "var(--accent-low)", textAlign: "center", fontWeight: 600 }}>✓ Settings saved</div>}
        </div>
    );
};
