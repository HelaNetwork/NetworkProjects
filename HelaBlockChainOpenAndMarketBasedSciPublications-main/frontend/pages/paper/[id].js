import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import { getPaper, updatePaper, deletePaper } from "../../lib/api";
import { connectWallet, storeHashOnChain } from "../../lib/web3";

export default function PaperView({ walletAddress, onConnect }) {
  const router = useRouter();
  const { id } = router.query;

  const [paper,      setPaper]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [copied,     setCopied]     = useState(false);
  const [storing,    setStoring]    = useState(false);
  const [storeError, setStoreError] = useState(null);
  const [justStored, setJustStored] = useState(false);

  useEffect(() => {
    if (!id) return;
    getPaper(id)
      .then(setPaper)
      .catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, [id]);

  function copyHash() {
    navigator.clipboard.writeText(paper.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleStoreOnChain() {
    setStoreError(null);
    setStoring(true);
    try {
      if (!walletAddress) await onConnect();
      const { txHash, walletAddress: addr } = await storeHashOnChain(paper.hash);
      const updated = await updatePaper(id, { txHash, walletAddress: addr, onChain: true });
      setPaper(updated);
      setJustStored(true);
      setTimeout(() => setJustStored(false), 5000);
    } catch (err) {
      setStoreError(err.message || "Transaction failed");
    } finally {
      setStoring(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this paper?")) return;
    await deletePaper(id);
    router.push("/");
  }

  const date = paper
    ? new Date(paper.uploadedAt).toLocaleString("en-US", {
        year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "";

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 32, height: 32, border: "2px solid var(--border2)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
          <p className="section-label">loading…</p>
        </div>
      </div>
    );
  }

  if (!paper) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar walletAddress={walletAddress} onConnect={onConnect} />

      <main style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px" }}>

        {/* Back */}
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'Fira Code', monospace", fontSize: "0.75rem", color: "var(--text-faint)", textDecoration: "none", marginBottom: 32, letterSpacing: "0.04em" }}>
          ← back
        </Link>

        {/* Title row */}
        <div className="fade-up" style={{ marginBottom: 32 }}>
          <p className="section-label" style={{ marginBottom: 6 }}>paper record</p>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.6rem", color: "var(--text)", letterSpacing: "-0.02em", lineHeight: 1.25, flex: 1 }}>
              {paper.title}
            </h1>
            {paper.onChain ? (
              <span className="badge-verified glow-pulse" style={{ padding: "5px 12px", borderRadius: 5, marginTop: 4, flexShrink: 0, fontSize: "0.72rem" }}>
                ✅ Verified on-chain
              </span>
            ) : (
              <span className="badge-pending" style={{ padding: "5px 12px", borderRadius: 5, marginTop: 4, flexShrink: 0, fontSize: "0.72rem" }}>
                ⏳ Local only
              </span>
            )}
          </div>
        </div>

        {/* Success banner */}
        {justStored && (
          <div className="fade-up" style={{ border: "1px solid rgba(0,229,160,0.3)", background: "rgba(0,229,160,0.06)", borderRadius: 8, padding: "14px 18px", marginBottom: 16, fontFamily: "'Fira Code', monospace", fontSize: "0.78rem", color: "var(--accent)" }}>
            ✓ hash stored on HeLa blockchain — transaction confirmed
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* SHA-256 hash card */}
          <InfoCard className="fade-up fade-up-1">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span className="section-label">sha-256 hash</span>
              <button
                onClick={copyHash}
                style={{ fontFamily: "'Fira Code', monospace", fontSize: "0.68rem", color: copied ? "var(--accent)" : "var(--text-faint)", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.06em" }}
              >
                {copied ? "copied!" : "[copy]"}
              </button>
            </div>
            <p className="hash-text">{paper.hash}</p>
          </InfoCard>

          {/* File info */}
          <InfoCard className="fade-up fade-up-2">
            <span className="section-label" style={{ display: "block", marginBottom: 12 }}>file info</span>
            <DataRow label="filename"  value={paper.originalName} />
            <DataRow label="registered" value={date} />
          </InfoCard>

          {/* Blockchain record — shown after on-chain */}
          {paper.onChain && (
            <div className="fade-up" style={{
              background: "rgba(0,229,160,0.04)",
              border: "1px solid rgba(0,229,160,0.2)",
              borderRadius: 10,
              padding: "18px 20px",
            }}>
              <span className="section-label" style={{ display: "block", marginBottom: 12, color: "var(--accent)", opacity: 0.7 }}>blockchain record</span>
              <DataRow label="network"  value="HeLa Testnet · chain 666888" />
              <DataRow label="wallet"   value={paper.walletAddress} mono />
              <DataRow label="tx hash"  value={paper.txHash} mono />
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(0,229,160,0.12)" }}>
                <a
                  href={`https://testnet-blockexplorer.helachain.com/tx/${paper.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontFamily: "'Fira Code', monospace", fontSize: "0.72rem", color: "var(--accent)", textDecoration: "none", letterSpacing: "0.04em" }}
                >
                  view on HeLa explorer ↗
                </a>
              </div>
            </div>
          )}

          {/* Store on chain CTA */}
          {!paper.onChain && (
            <div className="fade-up fade-up-3" style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "18px 20px",
            }}>
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.88rem", color: "var(--text-dim)", marginBottom: 4 }}>
                Anchor this paper to the blockchain
              </p>
              <p style={{ fontFamily: "'Fira Code', monospace", fontSize: "0.7rem", color: "var(--text-faint)", marginBottom: 16 }}>
                Requires MetaMask · gas paid in HLUSD
              </p>

              {storeError && (
                <div style={{ border: "1px solid rgba(255,77,106,0.3)", background: "rgba(255,77,106,0.06)", borderRadius: 6, padding: "10px 14px", marginBottom: 12, fontFamily: "'Fira Code', monospace", fontSize: "0.75rem", color: "var(--danger)" }}>
                  ✗ {storeError}
                </div>
              )}

              <button
                className="btn-primary"
                onClick={handleStoreOnChain}
                disabled={storing}
                style={{ width: "100%", padding: "12px", borderRadius: 8 }}
              >
                {storing ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <span className="spinner" />
                    waiting for MetaMask…
                  </span>
                ) : "Verify on HeLa Chain ⛓"}
              </button>

              {!walletAddress && (
                <p style={{ textAlign: "center", marginTop: 8, fontFamily: "'Fira Code', monospace", fontSize: "0.68rem", color: "var(--text-faint)" }}>
                  wallet connects automatically on click
                </p>
              )}
            </div>
          )}

          {/* View PDF */}
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}${paper.filePath}`}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", borderRadius: 8, textDecoration: "none" }}
          >
            <span style={{ fontSize: "0.82rem" }}>View PDF ↗</span>
          </a>

          {/* Delete */}
          <button
            onClick={handleDelete}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,77,106,0.2)",
              borderRadius: 8,
              padding: "11px",
              color: "rgba(255,77,106,0.6)",
              fontFamily: "'Fira Code', monospace",
              fontSize: "0.75rem",
              cursor: "pointer",
              letterSpacing: "0.04em",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.target.style.borderColor = "var(--danger)"; e.target.style.color = "var(--danger)"; }}
            onMouseLeave={e => { e.target.style.borderColor = "rgba(255,77,106,0.2)"; e.target.style.color = "rgba(255,77,106,0.6)"; }}
          >
            [delete record]
          </button>

        </div>
      </main>
    </div>
  );
}

function InfoCard({ children, className }) {
  return (
    <div className={className} style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      padding: "18px 20px",
    }}>
      {children}
    </div>
  );
}

function DataRow({ label, value, mono }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, paddingBottom: 8, marginBottom: 8, borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontFamily: "'Fira Code', monospace", fontSize: "0.7rem", color: "var(--text-faint)", letterSpacing: "0.06em", flexShrink: 0 }}>{label}</span>
      <span style={{
        fontFamily: mono ? "'Fira Code', monospace" : "'Syne', sans-serif",
        fontSize: mono ? "0.7rem" : "0.85rem",
        color: "var(--text-dim)",
        textAlign: "right",
        wordBreak: "break-all",
        letterSpacing: mono ? "0.02em" : 0,
      }}>
        {value}
      </span>
    </div>
  );
}
