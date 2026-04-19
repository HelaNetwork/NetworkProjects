"use client";

import { BlockchainFloating } from "./BlockchainFloating";

export function Background() {
  return (
    <>
      <BlockchainFloating />
      <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* Full-page grid */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(20, 184, 166, 0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(20, 184, 166, 0.6) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />
      {/* Secondary finer grid */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(20, 184, 166, 0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(20, 184, 166, 0.8) 1px, transparent 1px)
          `,
          backgroundSize: "16px 16px",
        }}
      />
      {/* Gradient orbs */}
      <div className="absolute -left-32 top-0 h-[500px] w-[500px] rounded-full bg-[var(--accent)] opacity-[0.07] blur-[120px]" />
      <div className="absolute -right-32 top-1/3 h-[400px] w-[400px] rounded-full bg-[var(--accent)] opacity-[0.06] blur-[100px]" />
      <div className="absolute bottom-0 left-1/2 h-[350px] w-[600px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.05] blur-[100px]" />
      <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] opacity-[0.03] blur-[80px]" />
      {/* Corner gradients */}
      <div className="absolute right-0 top-0 h-96 w-96 bg-gradient-to-bl from-[var(--accent)]/12 to-transparent opacity-40" />
      <div className="absolute bottom-0 left-0 h-80 w-80 bg-gradient-to-tr from-[var(--accent)]/10 to-transparent opacity-30" />
      <div className="absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 bg-gradient-to-b from-[var(--accent)]/8 to-transparent opacity-20" />
      {/* Subtle radial vignette */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, transparent 0%, var(--bg) 70%)",
        }}
      />
      {/* Floating shapes - very subtle */}
      <div className="absolute left-[15%] top-[20%] h-2 w-2 rounded-full bg-[var(--accent)] opacity-20" />
      <div className="absolute right-[20%] top-[60%] h-1.5 w-1.5 rounded-full bg-[var(--accent)] opacity-15" />
      <div className="absolute bottom-[30%] left-[25%] h-1 w-1 rounded-full bg-[var(--accent)] opacity-10" />
      <div className="absolute right-[30%] bottom-[15%] h-2.5 w-2.5 rounded-full border border-[var(--accent)] opacity-10" />
      <div className="absolute left-[40%] top-[75%] h-px w-24 bg-gradient-to-r from-transparent via-[var(--accent)]/20 to-transparent opacity-60" />
      <div className="absolute right-[10%] top-[15%] h-px w-16 bg-gradient-to-r from-transparent via-[var(--accent)]/15 to-transparent opacity-50" />
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
    </>
  );
}
