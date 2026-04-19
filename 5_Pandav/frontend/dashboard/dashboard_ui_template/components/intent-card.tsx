"use client"

import { useState } from "react"
import { Shield, Clock, Hash, ArrowUpRight, CheckCircle2, Bot } from "lucide-react"
import { toast } from "sonner"
import { RiskBadge } from "@/components/risk-badge"
import { truncateAddress, type Intent } from "@/lib/mock-data"
import { useWallet } from "@/components/wallet-provider"

export function IntentCard({
  intent,
  onVerified,
}: {
  intent: Intent
  onVerified?: (id: string) => void
}) {
  const { address, connect } = useWallet()
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)

  const handleVerify = async () => {
    if (!address) {
      toast.error("Wallet not connected", {
        description: "Connect a wallet to sign and release this intent.",
      })
      await connect()
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1400))
    setLoading(false)
    setVerified(true)
    toast.success("Intent verified & released", {
      description: `Signed by ${truncateAddress(address)}`,
    })
    setTimeout(() => onVerified?.(intent.id), 600)
  }

  return (
    <article className="glass hover-lift relative flex flex-col overflow-hidden rounded-2xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 pb-4 pt-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] font-medium tracking-tight text-foreground">
            <Bot className="h-3 w-3 text-primary" />
            {intent.action}
          </span>
        </div>
        <RiskBadge score={intent.riskScore} />
      </div>

      {/* Amount */}
      <div className="px-5 pb-4 pt-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Value at risk
        </p>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-[30px] font-semibold leading-none tracking-tight text-foreground">
            {intent.amount}
          </span>
          <span className="text-sm font-medium text-muted-foreground">{intent.asset}</span>
        </div>
      </div>

      {/* Agent reason */}
      <div className="px-5 pb-4">
        <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Agent&apos;s stated reason
        </p>
        <p className="text-sm italic leading-relaxed text-muted-foreground">
          &ldquo;{intent.agentReason}&rdquo;
        </p>
      </div>

      {/* AI Auditor Assessment — hero box */}
      <div className="mx-5 mb-5 rounded-xl border border-primary/20 bg-gradient-brand-soft p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/15 ring-1 ring-primary/25">
            <Shield className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">
            AI Auditor Assessment
          </span>
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">{intent.auditorAssessment}</p>
      </div>

      {/* Footer */}
      <div className="mt-auto flex flex-col gap-3 border-t border-border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {intent.timestamp}
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono">
            <Hash className="h-3 w-3" />
            {truncateAddress(intent.id, 6, 6)}
          </span>
        </div>

        <button
          type="button"
          onClick={handleVerify}
          disabled={loading || verified}
          className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-80 glow-purple hover:shadow-[0_0_36px_-8px_rgba(168,85,247,0.7)]"
        >
          <span
            aria-hidden
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
          />
          {loading ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-white/40 border-t-white" />
              Signing
            </>
          ) : verified ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Released
            </>
          ) : (
            <>
              Verify &amp; Release
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </>
          )}
        </button>
      </div>
    </article>
  )
}
