import Link from "next/link";

export default function PaperCard({ paper, index = 0 }) {
  const date = new Date(paper.uploadedAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <Link href={`/paper/${paper.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div
        className="paper-card"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "18px 20px",
          cursor: "pointer",
          animationDelay: `${index * 0.06}s`,
        }}
      >
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <h3 style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 600,
            fontSize: "0.92rem",
            color: "var(--text)",
            lineHeight: 1.45,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {paper.title}
          </h3>

          {paper.onChain ? (
            <span className="badge-verified glow-pulse" style={{ padding: "3px 9px", borderRadius: 4, flexShrink: 0 }}>
              ✓ on-chain
            </span>
          ) : (
            <span className="badge-pending" style={{ padding: "3px 9px", borderRadius: 4, flexShrink: 0 }}>
              local
            </span>
          )}
        </div>

        {/* Hash preview */}
        <div style={{
          fontFamily: "'Fira Code', monospace",
          fontSize: "0.68rem",
          color: "var(--text-faint)",
          letterSpacing: "0.02em",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          marginBottom: 14,
        }}>
          {paper.hash}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--border)", marginBottom: 12 }} />

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'Fira Code', monospace", fontSize: "0.68rem", color: "var(--text-faint)" }}>
            {paper.originalName?.length > 24 ? paper.originalName.slice(0, 24) + "…" : paper.originalName}
          </span>
          <span style={{ fontFamily: "'Fira Code', monospace", fontSize: "0.68rem", color: "var(--text-faint)" }}>
            {date}
          </span>
        </div>
      </div>
    </Link>
  );
}
