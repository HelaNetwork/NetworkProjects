import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import PaperCard from "../components/PaperCard";
import { getPapers } from "../lib/api";

export default function Home({ walletAddress, onConnect }) {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    getPapers()
      .then(setPapers)
      .catch(() => setError("Cannot reach backend — is it running on :4000?"))
      .finally(() => setLoading(false));
  }, []);

  const verified = papers.filter(p => p.onChain).length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar walletAddress={walletAddress} onConnect={onConnect} />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>

        {/* Page header */}
        <div className="fade-up" style={{ marginBottom: 40, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p className="section-label" style={{ marginBottom: 6 }}>research paper registry</p>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "2rem", color: "var(--text)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              Verified Papers
            </h1>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <StatPill label="total" value={papers.length} />
            <StatPill label="on-chain" value={verified} accent />
            <Link href="/upload">
              <button className="btn-primary" style={{ padding: "10px 20px", borderRadius: 8 }}>
                + Upload
              </button>
            </Link>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 32, height: 32, border: "2px solid var(--border2)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 16px" }} />
              <p className="section-label">loading registry…</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ border: "1px solid rgba(255,77,106,0.3)", background: "rgba(255,77,106,0.06)", borderRadius: 8, padding: "16px 20px", fontFamily: "'Fira Code', monospace", fontSize: "0.8rem", color: "var(--danger)" }}>
            ✗ {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && papers.length === 0 && (
          <div className="fade-up" style={{ textAlign: "center", padding: "100px 0" }}>
            <div style={{ width: 64, height: 64, border: "1px dashed var(--border2)", borderRadius: 12, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 22, color: "var(--muted)" }}>∅</span>
            </div>
            <p style={{ color: "var(--text-dim)", fontFamily: "'Syne', sans-serif", fontSize: "1rem", marginBottom: 20 }}>
              No papers registered yet
            </p>
            <Link href="/upload">
              <button className="btn-ghost" style={{ padding: "10px 24px", borderRadius: 8 }}>
                Upload first paper →
              </button>
            </Link>
          </div>
        )}

        {/* Grid */}
        {!loading && papers.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {papers.map((paper, i) => (
              <div key={paper.id} className="fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <PaperCard paper={paper} index={i} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function StatPill({ label, value, accent }) {
  return (
    <div style={{
      padding: "6px 14px",
      borderRadius: 6,
      border: `1px solid ${accent ? "rgba(0,229,160,0.25)" : "var(--border)"}`,
      background: accent ? "rgba(0,229,160,0.06)" : "var(--surface)",
    }}>
      <span style={{ fontFamily: "'Fira Code', monospace", fontSize: "0.7rem", color: "var(--text-dim)" }}>{label} </span>
      <span style={{ fontFamily: "'Fira Code', monospace", fontSize: "0.85rem", fontWeight: 500, color: accent ? "var(--accent)" : "var(--text)" }}>{value}</span>
    </div>
  );
}
