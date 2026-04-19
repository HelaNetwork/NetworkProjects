import {
  CheckCircle2,
  ExternalLink,
  Fingerprint,
  Hash,
  Wallet,
  ArrowRight,
  Clock,
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { RiskBadge } from "@/components/risk-badge"
import { auditHistory, truncateAddress } from "@/lib/mock-data"

export default function AuditHistoryPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Ledger · Immutable"
        title="Audit History"
        description="Every successfully executed agent action, cryptographically attested and anchored on-chain. Each entry links to its explanation hash and block explorer record."
        actions={
          <div className="glass inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            <span className="font-mono tracking-tight">
              {auditHistory.length} executions · last 24h
            </span>
          </div>
        }
      />

      <div className="flex flex-col gap-3">
        {auditHistory.map((entry) => (
          <article
            key={entry.id}
            className="glass hover-lift group rounded-2xl p-5"
          >
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_1fr_auto] lg:items-center">
              {/* Left block — Action + Amount */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] font-medium text-foreground">
                    {entry.action}
                  </span>
                  <RiskBadge score={entry.finalRiskScore} size="sm" />
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {entry.executedAt}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold leading-none tracking-tight text-foreground">
                    {entry.amount}
                  </span>
                  <span className="text-sm text-muted-foreground">{entry.asset}</span>
                </div>
              </div>

              {/* Middle block — Metadata */}
              <div className="flex flex-col gap-2.5 border-t border-border pt-3 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                <MetaRow
                  icon={Wallet}
                  label="Agent"
                  value={truncateAddress(entry.agentAddress, 8, 6)}
                />
                <MetaRow
                  icon={Fingerprint}
                  label="Explanation hash"
                  value={truncateAddress(entry.explanationHash, 8, 8)}
                />
                <MetaRow
                  icon={Hash}
                  label="Tx"
                  value={truncateAddress(entry.txHash, 8, 6)}
                />
              </div>

              {/* Right block — Action */}
              <div className="flex items-center justify-start lg:justify-end">
                <a
                  href="#"
                  className="group/btn inline-flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3.5 py-2 text-sm font-medium text-primary transition hover:border-primary/40 hover:bg-primary/15"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  HeLa Explorer
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-white/[0.02] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
        <span className="truncate font-mono text-xs text-foreground">{value}</span>
      </div>
    </div>
  )
}
