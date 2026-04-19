const { useState } = React;

const AlertsPage = ({ crisis, alerts, setAlerts }) => {
    const [filter, setFilter] = useState("ALL");
    const sevs = ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

    const sevStyle = s => ({
        CRITICAL: { c: "var(--accent-critical)", bg: "rgba(255,23,68,.08)", br: "rgba(255,23,68,.3)" },
        HIGH: { c: "var(--accent-high)", bg: "rgba(255,77,109,.07)", br: "rgba(255,77,109,.22)" },
        MEDIUM: { c: "var(--accent-med)", bg: "rgba(245,166,35,.07)", br: "rgba(245,166,35,.22)" },
        LOW: { c: "var(--accent-low)", bg: "rgba(0,229,153,.07)", br: "rgba(0,229,153,.22)" },
    }[s] || { c: "var(--text-muted)", bg: "transparent", br: "var(--border)" });

    const dismiss = id => setAlerts(a => a.filter(x => x.id !== id));
    const dismissAll = () => setAlerts([]);
    const markRead = id => setAlerts(a => a.map(x => x.id === id ? { ...x, read: true } : x));

    const filtered = filter === "ALL" ? alerts : alerts.filter(a => a.sev === filter);
    const unread = alerts.filter(a => !a.read).length;

    return (
        <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-muted)", letterSpacing: ".15em", marginBottom: 3 }}>
                        ALERT MANAGEMENT
                    </div>
                    <h1 style={{ fontWeight: 800, fontSize: 20 }}>
                        Active Alerts
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--text-muted)", fontWeight: 400 }}>
                            ({alerts.length})
                        </span>
                    </h1>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    {unread > 0 && (
                        <span style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            color: "var(--accent-med)",
                            background: "rgba(245,166,35,.1)",
                            border: "1px solid rgba(245,166,35,.25)",
                            borderRadius: 6,
                            padding: "4px 10px"
                        }}>
                            {unread} UNREAD
                        </span>
                    )}

                    <button onClick={dismissAll} style={{
                        background: "transparent",
                        border: "1px solid var(--border)",
                        color: "var(--text-muted)",
                        borderRadius: 8,
                        padding: "6px 13px",
                        fontSize: 12,
                        cursor: "pointer"
                    }}>
                        Clear All
                    </button>
                </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
                {sevs.map(s => (
                    <button key={s} onClick={() => setFilter(s)} style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        background: filter === s ? "var(--accent-blue)" : "transparent",
                        color: filter === s ? "#fff" : "var(--text-muted)",
                        cursor: "pointer",
                        fontSize: 11
                    }}>
                        {s}
                    </button>
                ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filtered.length > 0 ? filtered.map(a => {
                    const st = sevStyle(a.sev);
                    return (
                        <div key={a.id} className="glass-card" style={{
                            padding: 14,
                            background: st.bg,
                            border: `1px solid ${st.br}`
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{a.title}</div>
                                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                                        {a.desc}
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: 6 }}>
                                    {!a.read && (
                                        <button onClick={() => markRead(a.id)} style={{ cursor: "pointer", background: "transparent", border: "none", color: st.c }}>
                                            Mark Read
                                        </button>
                                    )}
                                    <button onClick={() => dismiss(a.id)} style={{ cursor: "pointer", background: "transparent", border: "none", color: st.c }}>
                                        ✕
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)" }}>
                        No alerts
                    </div>
                )}
            </div>
        </div>
    );
};
