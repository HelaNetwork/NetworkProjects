// GlobalRiskPage (from your code)
const GlobalRiskPage = ({ crisis }) => {

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
          GLOBAL RISK OVERVIEW
        </div>

        <h1 style={{ fontWeight: 800, fontSize: 20 }}>
          Crisis Intelligence Dashboard
        </h1>
      </div>

      {/* Global Risk Score */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
          Global Risk Score
        </div>

        <div style={{
          fontSize: 42,
          fontWeight: 800,
          color: riskColor(crisis.globalRisk)
        }}>
          {crisis.globalRisk}
        </div>

        <div style={{
          marginTop: 10,
          height: 8,
          borderRadius: 6,
          background: "rgba(255,255,255,.06)",
          overflow: "hidden"
        }}>
          <div style={{
            width: `${crisis.globalRisk}%`,
            height: "100%",
            background: riskColor(crisis.globalRisk),
            transition: "width .4s ease"
          }} />
        </div>
      </div>

      {/* Sector Risks */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
          Sector Risk Breakdown
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {crisis.sectors.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 120, fontSize: 12 }}>{s.name}</div>

              <div style={{
                flex: 1,
                height: 6,
                borderRadius: 6,
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
                fontSize: 11,
                fontFamily: "var(--font-data)",
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

      {/* AI Insight */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>
          AI Insight
        </div>

        <div style={{ fontSize: 13, lineHeight: 1.6 }}>
          {crisis.insight}
        </div>
      </div>

    </div>
  );
};