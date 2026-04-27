import Link from "next/link";
import { useRouter } from "next/router";

export default function Navbar({ walletAddress, onConnect }) {
  const router = useRouter();

  return (
    <nav style={{
      borderBottom: "1px solid var(--border)",
      background: "rgba(8,12,16,0.92)",
      backdropFilter: "blur(12px)",
      position: "sticky", top: 0, zIndex: 50,
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 30, height: 30, borderRadius: 6,
            border: "1px solid rgba(0,229,160,0.3)",
            background: "rgba(0,229,160,0.06)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "var(--accent)", fontWeight: 500 }}>RV</span>
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text)", letterSpacing: "0.02em" }}>
            Research<span style={{ color: "var(--accent)" }}>Verify</span>
          </span>
        </Link>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <NavLink href="/" active={router.pathname === "/"}>Papers</NavLink>
          <NavLink href="/upload" active={router.pathname === "/upload"}>Upload</NavLink>

          {/* Wallet button */}
          <button
            onClick={onConnect}
            style={{
              fontFamily: "'Fira Code', monospace",
              fontSize: "0.7rem",
              padding: "6px 14px",
              borderRadius: 6,
              border: walletAddress ? "1px solid rgba(0,229,160,0.35)" : "1px solid var(--border2)",
              background: walletAddress ? "rgba(0,229,160,0.07)" : "transparent",
              color: walletAddress ? "var(--accent)" : "var(--text-dim)",
              cursor: "pointer",
              letterSpacing: "0.04em",
              transition: "all 0.2s",
            }}
          >
            {walletAddress
              ? `${walletAddress.slice(0, 6)}···${walletAddress.slice(-4)}`
              : "connect wallet"}
          </button>
        </div>
      </div>

      {/* Bottom accent line */}
      <div style={{
        height: 1,
        background: "linear-gradient(90deg, transparent 0%, rgba(0,229,160,0.15) 40%, rgba(0,229,160,0.15) 60%, transparent 100%)",
      }} />
    </nav>
  );
}

function NavLink({ href, active, children }) {
  return (
    <Link href={href} style={{
      fontFamily: "'Syne', sans-serif",
      fontSize: "0.82rem",
      fontWeight: 500,
      color: active ? "var(--accent)" : "var(--text-dim)",
      textDecoration: "none",
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      transition: "color 0.2s",
    }}>
      {children}
    </Link>
  );
}
