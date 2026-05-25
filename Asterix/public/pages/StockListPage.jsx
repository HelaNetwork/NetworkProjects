const StockListPage = ({ stocks = [] }) => {
    const riskColor = (val) => {
        if (val >= 70) return "var(--accent-critical)";
        if (val >= 50) return "var(--accent-high)";
        if (val >= 30) return "var(--accent-med)";
        return "var(--accent-low)";
    };

    const defaultStocks = [
        { name: "HDFC Bank", symbol: "HDFCBANK.NS", price: "1850.50", change: -2.3, risk: 65 },
        { name: "Infosys", symbol: "INFY.NS", price: "1620.75", change: 1.2, risk: 42 },
        { name: "TCS", symbol: "TCS.NS", price: "3950.00", change: -0.8, risk: 38 },
        { name: "Reliance", symbol: "RELIANCE.NS", price: "2100.25", change: 3.1, risk: 71 },
        { name: "ICICI Bank", symbol: "ICICIBANK.NS", price: "950.60", change: -1.5, risk: 68 },
    ];

    const data = stocks && stocks.length > 0 ? stocks : defaultStocks;

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
                    MARKET MONITOR
                </div>

                <h1 style={{ fontWeight: 800, fontSize: 24 }}>
                    Stock Risk Watchlist
                </h1>
            </div>

            <div className="glass-card" style={{ padding: 16, overflowX: "auto" }}>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1.8fr 1.2fr 1fr 1fr 1fr",
                    fontSize: 11,
                    color: "var(--text-muted)",
                    paddingBottom: 12,
                    borderBottom: "1px solid var(--border)",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 600,
                    letterSpacing: "0.08em"
                }}>
                    <div>SYMBOL</div>
                    <div>PRICE</div>
                    <div>CHANGE</div>
                    <div>RISK</div>
                    <div>STATUS</div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                    {data.map((s, i) => (
                        <div key={i} style={{
                            display: "grid",
                            gridTemplateColumns: "1.8fr 1.2fr 1fr 1fr 1fr",
                            alignItems: "center",
                            padding: "12px 0",
                            borderBottom: "1px solid rgba(255,255,255,.04)"
                        }}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                                <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                                    {s.symbol}
                                </div>
                            </div>

                            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600 }}>
                                ₹{s.price}
                            </div>

                            <div style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: s.change >= 0 ? "var(--accent-low)" : "var(--accent-high)",
                                fontFamily: "var(--font-mono)"
                            }}>
                                {s.change >= 0 ? "▲" : "▼"} {Math.abs(s.change)}%
                            </div>

                            <div style={{
                                fontSize: 12,
                                fontFamily: "var(--font-mono)",
                                fontWeight: 700,
                                color: riskColor(s.risk)
                            }}>
                                {s.risk}
                            </div>

                            <div style={{
                                fontSize: 10,
                                padding: "4px 8px",
                                borderRadius: 4,
                                background: s.risk >= 70 ? "rgba(255,23,68,0.1)" : s.risk >= 50 ? "rgba(255,77,109,0.1)" : "rgba(0,229,153,0.1)",
                                color: riskColor(s.risk),
                                fontWeight: 600,
                                textAlign: "center"
                            }}>
                                {s.risk >= 70 ? "ALERT" : s.risk >= 50 ? "WATCH" : "NORMAL"}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
