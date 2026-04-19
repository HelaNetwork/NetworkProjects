"use client"

import { useState } from "react"
import { AlertTriangle, Activity, ShieldCheck, Bot, RefreshCw } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { IntentCard } from "@/components/intent-card"
import { AllCaughtUp } from "@/components/all-caught-up"
import { pendingIntents } from "@/lib/mock-data"

export default function CommandCenterPage() {
  const [intents, setIntents] = useState(pendingIntents)

  const critical = intents.filter((i) => i.riskScore >= 8).length
  const elevated = intents.filter((i) => i.riskScore >= 5 && i.riskScore < 8).length
  const activeAgents = new Set(intents.map((i) => i.agentAddress)).size

  return (
    <div>
      <PageHeader
        eyebrow="Guardian · Live queue"
        title="Pending Guardian Review"
        description="High-risk intents intercepted by the protocol. Each request is paused on-chain until a guardian signs a verification transaction via MetaMask."
        actions={
          <button
            type="button"
            onClick={() => setIntents(pendingIntents)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-white/[0.02] px-3 text-sm text-muted-foreground transition hover:border-primary/30 hover:bg-white/[0.04] hover:text-foreground"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh queue
          </button>
        }
      />

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatCard
          icon={Activity}
          label="Pending review"
          value={String(intents.length)}
          trend="intents queued"
        />
        <StatCard
          icon={AlertTriangle}
          label="Critical risk"
          value={String(critical)}
          trend="≥ 8 score"
          tone="danger"
        />
        <StatCard
          icon={ShieldCheck}
          label="Elevated"
          value={String(elevated)}
          trend="5–7 score"
          tone="warning"
        />
        <StatCard
          icon={Bot}
          label="Active agents"
          value={String(activeAgents)}
          trend="unique signers"
        />
      </div>

      {intents.length === 0 ? (
        <AllCaughtUp />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
          {intents.map((intent) => (
            <IntentCard
              key={intent.id}
              intent={intent}
              onVerified={(id) => setIntents((prev) => prev.filter((i) => i.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
