const GlobalRiskPage = ({ serverData }) => {
    const crisis = serverData || { crisis_score: 50 };
    const globalRisk = crisis.crisis_score || 50;

    const riskColor = (val) => {
        if (val >= 70) return "var(--accent-critical)";
        if (val >= 50) return "var(--accent-high)";
        if (val >= 30) return "var(--accent-med)";
        return "var(--accent-low)";
    };

    const sectors = [
        { name: "Banking", risk: crisis.banking_score || 40 },
        { name: "Markets", risk: crisis.market_score || 35 },
        { name: "Liquidity", risk: crisis.liquidity_score || 60 },
    ];

    return (
        <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
                <div style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--text-muted)",
                    letterSpacing: ".15em",
                    marginBottom: 4
                }}>
                    GLOBAL RISK OVERVIEW
                </div>

                <h1 style={{ fontWeight: 800, fontSize: 24 }}>
                    Crisis Intelligence
                </h1>
            </div>

            <div className="glass-card" style={{ padding: 20 }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>
                    Global Risk Score
                </div>

                <div style={{
                    fontSize: 48,
                    fontWeight: 800,
                    color: riskColor(globalRisk)
                }}>
                    {globalRisk}
                </div>

                <div style={{
                    marginTop: 12,
                    height: 8,
                    borderRadius: 6,
                    background: "rgba(255,255,255,.06)",
                    overflow: "hidden"
                }}>
                    <div style={{
                        width: `${globalRisk}%`,
                        height: "100%",
                        background: riskColor(globalRisk),
                        transition: "width .4s ease"
                    }} />
                </div>
            </div>

            <div className="glass-card" style={{ padding: 20 }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
                    Sector Risk Breakdown
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {sectors.map((s, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 100, fontSize: 12 }}>{s.name}</div>

                            <div style={{
                                flex: 1,
                                height: 6,
                                borderRadius: 4,
                                background: "rgba(255,255,255,.05)",
                                overflow: "hidden"
                            }}>
                                <div style={{
                                    width: `${s.risk}%`,
                                    height: "100%",
                                    background: riskColor(s.risk)
                                }} />
                            </div>

                            <div style={{
                                fontSize: 12,
                                fontFamily: "var(--font-mono)",
                                color: riskColor(s.risk),
                                width: 35,
                                textAlign: "right"
                            }}>
                                {s.risk}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
