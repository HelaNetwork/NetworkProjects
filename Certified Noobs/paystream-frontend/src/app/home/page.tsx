"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { ScrollReveal, ScrollRevealStagger, ScrollRevealItem } from "@/components/ScrollReveal";

export default function HomeContent() {
  const { isConnected } = useAccount();

  return (
    <div>
      <section className="hero-pattern border-b border-[var(--border)]">
        <ScrollReveal className="mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-28" delay={0.1}>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--text)] sm:text-5xl md:text-6xl">
            Salary streaming,
            <br />
            <span className="text-[var(--accent)]">every second.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-[var(--muted)]">
            PayStream streams payroll in native HEA on HeLa. Employees see earnings in real time and claim when they want. Optional tax, one-time bonuses, and bulk CSV.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/" className="btn-primary inline-flex items-center gap-2">
              Login / Sign up
              <span className="text-lg">→</span>
            </Link>
            <Link href="/hr" className="btn-secondary inline-flex items-center gap-2">
              HR Dashboard
            </Link>
            <Link href="/employee" className="btn-secondary inline-flex items-center gap-2">
              Employee Portal
            </Link>
          </div>
          {!isConnected && (
            <p className="mt-6 text-sm text-[var(--muted)]">
              Connect your wallet on the dashboard. Use <strong>HeLa Testnet</strong> if you’ve deployed there.
            </p>
          )}
        </ScrollReveal>
      </section>

      <section className="section-pattern border-b border-[var(--border)] py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-[var(--text)]">How it works</h2>
          </ScrollReveal>
          <ScrollRevealStagger className="mt-8 grid gap-8 sm:grid-cols-3" staggerDelay={0.12}>
            <ScrollRevealItem>
              <div className="card">
                <div className="text-3xl font-bold text-[var(--accent)]">1</div>
                <h3 className="mt-3 font-semibold text-[var(--text)]">HR funds treasury</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Deposit HEA. Add employees (single or CSV bulk), set total + duration; optional tax (e.g. 10%) on withdraw.
                </p>
              </div>
            </ScrollRevealItem>
            <ScrollRevealItem>
              <div className="card">
                <div className="text-3xl font-bold text-[var(--accent)]">2</div>
                <h3 className="mt-3 font-semibold text-[var(--text)]">Salary accrues every second</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  On-chain: elapsed × rate. Tax deducted. No floating point.
                </p>
              </div>
            </ScrollRevealItem>
            <ScrollRevealItem>
              <div className="card">
                <div className="text-3xl font-bold text-[var(--accent)]">3</div>
                <h3 className="mt-3 font-semibold text-[var(--text)]">Employee claims</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Net → employee, tax → vault. Reentrancy-safe.
                </p>
              </div>
            </ScrollRevealItem>
          </ScrollRevealStagger>
        </div>
      </section>

      <section className="section-pattern py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-[var(--text)]">Features</h2>
          </ScrollReveal>
          <ScrollRevealStagger className="mt-6 grid gap-3 sm:grid-cols-2" staggerDelay={0.08}>
            <ScrollRevealItem>
              <span className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
                <span className="text-[var(--accent)]">✓</span>
                Per-second streaming, integer math
              </span>
            </ScrollRevealItem>
            <ScrollRevealItem>
              <span className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
                <span className="text-[var(--accent)]">✓</span>
                Tax vault: automatic split on claim
              </span>
            </ScrollRevealItem>
            <ScrollRevealItem>
              <span className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
                <span className="text-[var(--accent)]">✓</span>
                Pause, resume, cancel streams
              </span>
            </ScrollRevealItem>
            <ScrollRevealItem>
              <span className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3">
                <span className="text-[var(--accent)]">✓</span>
                One-time bonus & CSV bulk add
              </span>
            </ScrollRevealItem>
          </ScrollRevealStagger>
        </div>
      </section>
    </div>
  );
}
