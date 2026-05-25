"use client"

import { useState } from "react"
import { AlertOctagon, Flame, Timer, CheckCircle2, Search } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { disputes, truncateAddress, type Dispute } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

type StatusFilter = "all" | "Executed" | "Disputed" | "Timelocked"

export default function DisputeCenterPage() {
  const [rows, setRows] = useState<Dispute[]>(disputes)
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [query, setQuery] = useState("")

  const filtered = rows.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false
    if (query && !`${r.id} ${r.action} ${r.agentAddress}`.toLowerCase().includes(query.toLowerCase())) {
      return false
    }
    return true
  })

  const challenge = (id: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Disputed" as const } : r)),
    )
    toast.warning("Challenge submitted to HeLa", {
      description: "Assets have been frozen pending DAO vote. Resolution in 24h.",
    })
  }

  return (
    <div>
      <PageHeader
        eyebrow="DAO · Challenge hub"
        title="Dispute Center"
        description="Challenge executed or timelocked agent transactions within the 24-hour dispute window. Challenges freeze associated assets until DAO resolution."
      />

      {/* Filter bar */}
      <div className="glass mb-4 flex flex-col gap-3 rounded-xl p-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {(["all", "Executed", "Timelocked", "Disputed"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                filter === f
                  ? "bg-gradient-brand-soft text-foreground ring-1 ring-primary/30"
                  : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
              )}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>

        <div className="relative md:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by action, agent, or ID…"
            className="w-full rounded-md border border-border bg-white/[0.02] py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden rounded-2xl">
        <div className="overflow-x-auto thin-scroll">
          <table className="w-full min-w-[880px] border-collapse">
            <thead>
              <tr className="border-b border-border text-left">
                <Th>ID</Th>
                <Th>Action</Th>
                <Th>Agent Addr</Th>
                <Th>Value</Th>
                <Th>Status</Th>
                <Th className="text-right">Action</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <tr
                  key={row.id}
                  className={cn(
                    "group border-b border-border/70 transition-colors last:border-b-0 hover:bg-white/[0.02]",
                    idx % 2 === 1 && "bg-white/[0.008]",
                  )}
                >
                  <Td>
                    <span className="font-mono text-xs text-muted-foreground">
                      {truncateAddress(row.id, 6, 4)}
                    </span>
                  </Td>
                  <Td>
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white/[0.03] px-2 py-1 font-mono text-[11px] font-medium text-foreground">
                      {row.action}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-mono text-xs text-muted-foreground">
                      {truncateAddress(row.agentAddress, 8, 6)}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-semibold text-foreground">{row.amount}</span>
                      <span className="text-xs text-muted-foreground">{row.asset}</span>
                    </div>
                  </Td>
                  <Td>
                    <StatusBadge status={row.status} hint={row.executedAt} />
                  </Td>
                  <Td className="text-right">
                    {row.status === "Disputed" ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Timer className="h-3 w-3" />
                        Awaiting vote
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => challenge(row.id)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-destructive/25 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition hover:border-destructive/40 hover:bg-destructive/15 active:scale-[0.98]"
                      >
                        <Flame className="h-3.5 w-3.5" />
                        Challenge via HeLa
                      </button>
                    )}
                  </Td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-sm text-muted-foreground">
                    No disputes match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <th
      className={cn(
        "px-5 py-3.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </th>
  )
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <td className={cn("px-5 py-4 align-middle", className)}>{children}</td>
}

function StatusBadge({
  status,
  hint,
}: {
  status: Dispute["status"]
  hint?: string
}) {
  const config = {
    Executed: {
      cls: "border-success/25 bg-success/10 text-success",
      dot: "bg-success",
      icon: CheckCircle2,
    },
    Disputed: {
      cls: "border-destructive/25 bg-destructive/10 text-destructive",
      dot: "bg-destructive",
      icon: AlertOctagon,
    },
    Timelocked: {
      cls: "border-warning/25 bg-warning/10 text-warning",
      dot: "bg-warning",
      icon: Timer,
    },
  }[status]

  const Icon = config.icon

  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={cn(
          "inline-flex w-fit items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium",
          config.cls,
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
        <Icon className="h-3 w-3" />
        {status}
      </span>
      {hint && <span className="font-mono text-[10px] text-muted-foreground">{hint}</span>}
    </div>
  )
}
