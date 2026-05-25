"use client"

import { useState } from "react"
import Link from "next/link"
import {
  FlaskConical,
  Sparkles,
  Send,
  ArrowUpRight,
  ShieldAlert,
  Bot,
  Hash,
} from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { RiskBadge, getRiskLevel } from "@/components/risk-badge"
import { sandboxTemplates } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

type InterceptedResponse = {
  id: string
  action: string
  amount: string
  riskScore: number
  rationale: string
}

function pseudoRisk(action: string, amount: string, reason: string): number {
  const risky = /(unlimited|emergency|withdraw|approve)/i
  const base =
    action.match(risky) || reason.match(risky) ? 8 : /swap|bridge/i.test(action) ? 6 : 3
  const amt = Number(amount.replace(/[^\d.]/g, "")) || 0
  const boost = amt > 100000 ? 2 : amt > 10000 ? 1 : 0
  return Math.min(10, base + boost)
}

function randomHex(len = 16) {
  const chars = "0123456789abcdef"
  let out = "0x"
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export default function AgentSandboxPage() {
  const [action, setAction] = useState("")
  const [reason, setReason] = useState("")
  const [amount, setAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [response, setResponse] = useState<InterceptedResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const applyTemplate = (t: (typeof sandboxTemplates)[number]) => {
    setAction(t.action)
    setAmount(t.amount)
    setReason(t.reason)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!action.trim() || !reason.trim() || !amount.trim()) {
      setError("All three fields are required to simulate an intent.")
      return
    }

    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1100))
    const riskScore = pseudoRisk(action, amount, reason)
    const res: InterceptedResponse = {
      id: randomHex(40),
      action: action.toUpperCase().replace(/\s+/g, "_"),
      amount,
      riskScore,
      rationale:
        riskScore >= 8
          ? "Action pattern matches known high-risk heuristics. Routed to guardian review via protocol intercept."
          : riskScore >= 5
            ? "Moderate risk detected. Intent pending additional signal verification."
            : "Low risk — within approved policy envelope. Intent auto-released to execution.",
    }
    setResponse(res)
    setSubmitting(false)
    toast.success("Intent intercepted", {
      description: `Risk score ${riskScore}/10 · ${res.action}`,
    })
  }

  return (
    <div>
      <PageHeader
        eyebrow="Simulation · Read-only"
        title="Agent Sandbox"
        description="Generate synthetic agent intents to stress-test the TAAP intercept layer. Responses mirror production risk scoring without routing to real guardians."
        actions={
          <div className="glass inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs text-muted-foreground">
            <FlaskConical className="h-3.5 w-3.5 text-primary" />
            <span>Sandbox mode active</span>
          </div>
        }
      />

      {/* Quick templates */}
      <section className="glass mb-4 rounded-2xl p-5">
        <div className="mb-3.5 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Quick templates</h3>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            one-click presets
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sandboxTemplates.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => applyTemplate(t)}
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.02] px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white/[0.05] hover:text-foreground"
            >
              <span className="h-1 w-1 rounded-full bg-primary/60 transition group-hover:bg-primary" />
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Form */}
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-5 lg:col-span-3">
          <div className="mb-4 flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Synthesize Agent Intent</h3>
          </div>

          <div className="flex flex-col gap-4">
            <Field label="Action" htmlFor="action">
              <input
                id="action"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="e.g. SWAP_ETH"
                className={inputCls}
                autoComplete="off"
              />
            </Field>

            <Field label="Agent's Stated Reason" htmlFor="reason">
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="Describe why the agent wants to perform this action…"
                className={cn(inputCls, "min-h-[110px] resize-y leading-relaxed")}
              />
            </Field>

            <Field label="Amount" htmlFor="amount">
              <input
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 42.5 or Unlimited"
                className={inputCls}
                autoComplete="off"
              />
            </Field>

            {error && (
              <div className="flex items-start gap-2.5 rounded-lg border border-destructive/25 bg-destructive/10 px-3.5 py-2.5">
                <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
                <p className="text-xs leading-relaxed text-destructive">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="group relative mt-1 inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-brand px-5 text-sm font-semibold text-white transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-80 glow-purple hover:shadow-[0_0_40px_-8px_rgba(168,85,247,0.7)]"
            >
              <span
                aria-hidden
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-[1.5px] border-white/40 border-t-white" />
                  Intercepting…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Agent Intent
                </>
              )}
            </button>
          </div>
        </form>

        {/* Response */}
        <div className="lg:col-span-2">
          {submitting && !response ? (
            <SkeletonResponse />
          ) : response ? (
            <InterceptedCard response={response} />
          ) : (
            <EmptyResponse />
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------- helpers ---------- */

const inputCls =
  "w-full rounded-lg border border-border bg-white/[0.02] px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
      >
        {label}
      </label>
      {children}
    </div>
  )
}

function InterceptedCard({ response }: { response: InterceptedResponse }) {
  const level = getRiskLevel(response.riskScore)
  const accentCls =
    level === "high"
      ? "border-destructive/30"
      : level === "medium"
        ? "border-warning/30"
        : "border-success/30"

  return (
    <div className={cn("glass-strong flex h-full flex-col rounded-2xl border p-5", accentCls)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-brand-soft ring-1 ring-primary/20">
            <ShieldAlert className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[13px] font-semibold text-foreground">Intercepted Response</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Protocol · mock
            </span>
          </div>
        </div>
        <RiskBadge score={response.riskScore} />
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-white/[0.015] p-4">
        <Row label="Action" value={response.action} mono />
        <Row label="Amount" value={response.amount} />
        <Row
          label="Intent ID"
          value={`${response.id.slice(0, 10)}…${response.id.slice(-6)}`}
          mono
          icon={Hash}
        />
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{response.rationale}</p>

      <Link
        href="/command-center"
        className="group/btn mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary/25 bg-primary/10 py-2.5 text-sm font-medium text-primary transition hover:border-primary/40 hover:bg-primary/15"
      >
        Review in Command Center
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
      </Link>
    </div>
  )
}

function Row({
  label,
  value,
  mono,
  icon: Icon,
}: {
  label: string
  value: string
  mono?: boolean
  icon?: typeof Hash
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </span>
      <span
        className={cn(
          "truncate text-xs",
          mono ? "font-mono text-foreground" : "font-medium text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  )
}

function EmptyResponse() {
  return (
    <div className="glass flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-white/[0.02]">
        <FlaskConical className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="mt-4 text-sm font-medium text-foreground">Awaiting intent</p>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground text-pretty">
        Submit an agent intent on the left and the intercepted protocol response will appear here.
      </p>
    </div>
  )
}

function SkeletonResponse() {
  return (
    <div className="glass flex h-full min-h-[280px] flex-col gap-4 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="skeleton h-7 w-40 rounded-md" />
        <div className="skeleton h-6 w-20 rounded-md" />
      </div>
      <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-white/[0.015] p-4">
        <div className="skeleton h-4 w-full rounded-md" />
        <div className="skeleton h-4 w-3/4 rounded-md" />
        <div className="skeleton h-4 w-5/6 rounded-md" />
      </div>
      <div className="skeleton h-10 w-full rounded-lg" />
    </div>
  )
}
