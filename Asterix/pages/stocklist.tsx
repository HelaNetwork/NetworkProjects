// StockListPage (Global Risk - from your code style)

const StockListPage = ({ stocks }) => {

  const riskColor = (val) => {
    if (val >= 75) return "var(--crimson)";
    if (val >= 55) return "var(--red)";
    if (val >= 35) return "var(--amber)";
    return "var(--green)";
  };

  return (
    <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Header */}
      <div>
        <div style={{
          fontFamily: "var(--font-data)",
          fontSize: 8,
          color: "var(--dim)",
          letterSpacing: ".15em",
          marginBottom: 3
        }}>
          MARKET MONITOR
        </div>

        <h1 style={{ fontWeight: 800, fontSize: 20 }}>
          Stock Risk Watchlist
        </h1>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 16 }}>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
          fontSize: 11,
          color: "var(--muted)",
          paddingBottom: 8,
          borderBottom: "1px solid var(--border)"
        }}>
          <div>Stock</div>
          <div>Price</div>
          <div>Change</div>
          <div>Risk</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
          {stocks.map((s, i) => (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
              alignItems: "center",
              padding: "8px 0",
              borderBottom: "1px solid rgba(255,255,255,.04)"
            }}>

              {/* Name */}
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {s.name}
                <div style={{ fontSize: 10, color: "var(--muted)" }}>
                  {s.symbol}
                </div>
              </div>

              {/* Price */}
              <div style={{ fontFamily: "var(--font-data)", fontSize: 12 }}>
                ₹{s.price}
              </div>

              {/* Change */}
              <div style={{
                fontSize: 12,
                color: s.change >= 0 ? "var(--green)" : "var(--red)"
              }}>
                {s.change >= 0 ? "+" : ""}{s.change}%
              </div>

              {/* Risk */}
              <div style={{
                fontSize: 12,
                fontFamily: "var(--font-data)",
                color: riskColor(s.risk)
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