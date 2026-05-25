"use client";

import { useEffect, useMemo, useState } from "react";
import { TopNavBar } from "@/components/TopNavBar";
import { AgentCard } from "@/components/AgentCard";

type MarketplaceAgent = {
  id: number;
  name: string;
  description: string;
  type: string;
  agentType?: string;
  image: string;
  price: number;
  activeCount: number;
  isLive: boolean;
  developer?: string;
};

type AgentsRouteResponse = {
  agents?: MarketplaceAgent[];
  error?: string;
};

type UpcomingAgent = {
  name: string;
  type: string;
  description: string;
  value: string;
};

const AGENT_TYPES = [
  "ALL",
  "TRADING",
  "FARMING",
  "SCHEDULING",
  "REBALANCING",
  "CONTENT",
  "BUSINESS",
];

const UPCOMING_AGENTS: UpcomingAgent[] = [
  {
    name: "Treasury Guardian",
    type: "RISK OPS",
    description:
      "Monitors wallet outflows, counterparty exposure, and unusual treasury activity before capital is moved.",
    value: "Prevents silent fund leakage and gives teams a real-time treasury defense layer."
  },
  {
    name: "Grant Scout",
    type: "GROWTH",
    description:
      "Tracks ecosystem grant programs, eligibility changes, and deadlines, then drafts tailored submissions.",
    value: "Helps startups and freelancers discover non-dilutive capital faster."
  },
  {
    name: "Revenue Recovery Agent",
    type: "FINANCE OPS",
    description:
      "Detects unpaid invoices, failed subscriptions, and delayed client receivables, then drafts recovery actions.",
    value: "Turns operational chaos into measurable cash-flow recovery."
  },
  {
    name: "Vendor Negotiator",
    type: "PROCUREMENT",
    description:
      "Analyzes recurring SaaS and infra spend, benchmarks vendor pricing, and proposes negotiation scripts.",
    value: "Cuts burn by finding contracts and subscriptions worth renegotiating."
  },
  {
    name: "Reputation Shield",
    type: "BRAND OPS",
    description:
      "Detects negative mentions, low-rating surges, and hostile narratives across channels before they spread.",
    value: "Lets teams respond early instead of reacting after brand damage compounds."
  },
  {
    name: "Launch Coordinator",
    type: "PRODUCT OPS",
    description:
      "Orchestrates launch checklists, stakeholder updates, release notes, and post-launch issue triage in one flow.",
    value: "Makes product launches feel coordinated, not improvised."
  }
];

export default function MarketplacePage() {
  const [selectedType, setSelectedType] = useState("ALL");
  const [agents, setAgents] = useState<MarketplaceAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAgents() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetch("/api/agents", {
          method: "GET",
          cache: "no-store"
        });

        const data = (await response.json()) as AgentsRouteResponse;
        if (!response.ok || !Array.isArray(data.agents)) {
          throw new Error(data.error || "Failed to load marketplace agents.");
        }

        if (active) {
          setAgents(data.agents);
        }
      } catch (error: unknown) {
        if (active) {
          setLoadError(error instanceof Error ? error.message : "Failed to load marketplace agents.");
          setAgents([]);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadAgents();
    return () => {
      active = false;
    };
  }, []);

  const filteredAgents = useMemo(() => {
    if (selectedType === "ALL") {
      return agents;
    }
    return agents.filter((agent) => agent.type === selectedType);
  }, [agents, selectedType]);

  return (
    <main className="min-h-screen bg-black">
      <TopNavBar />

      {/* Page Header */}
      <header className="px-8 pt-16 pb-8 border-b border-white/10 mt-24">
        <div className="flex items-center gap-4 mb-4">
          <span className="font-mono text-sm text-white bracket-link cursor-pointer">
            MARKETPLACE
          </span>
          <span className="font-mono text-sm text-white/20 select-none">
            ░░░░░░░░░░░░░░
          </span>
        </div>
        <h1 className="font-headline text-[120px] leading-none tracking-tight text-white">
          AGENTS
        </h1>
      </header>

      {/* Filter Tabs */}
      <section className="flex flex-wrap gap-4 px-8 py-6 bg-black border-b border-white/10 sticky top-24 z-40">
        {AGENT_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-6 py-2 font-headline text-xl tracking-widest transition-all ${
              selectedType === type
                ? "bg-white text-black"
                : "bg-transparent text-white border border-white hover:bg-white/5"
            }`}
          >
            {type}
          </button>
        ))}
      </section>

      {/* Agent Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <p className="font-mono text-sm text-white/60 uppercase">Loading agents...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-8">
          {filteredAgents.map((agent) => (
            <AgentCard key={agent.id} {...agent} />
          ))}
        </div>
      )}

      {loadError && (
        <div className="px-8 pb-8">
          <div className="border border-red-500/60 bg-red-500/10 p-4">
            <p className="font-mono text-xs text-red-200 uppercase">{loadError}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !loadError && filteredAgents.length === 0 && (
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <h3 className="font-headline text-4xl text-white mb-4">
              NO AGENTS FOUND
            </h3>
            <p className="text-white/60">
              Try selecting a different agent type
            </p>
          </div>
        </div>
      )}

      <section className="border-t border-white/10 px-8 py-12">
        <div className="mb-8 flex items-center gap-4">
          <span className="font-mono text-sm uppercase text-white/60">COMING SOON</span>
          <span className="font-mono text-sm text-white/20 select-none">░░░░░░░░</span>
        </div>
        <div className="mb-8 max-w-3xl">
          <h2 className="font-headline text-5xl uppercase text-white">Next Valuable Agents</h2>
          <p className="mt-3 font-body text-xs uppercase leading-relaxed text-white/60">
            These agents are intentionally listed as upcoming concepts only. They are not live yet, but they represent
            the next tier of high-value operational automation we want to ship on Trovia.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {UPCOMING_AGENTS.map((agent) => (
            <div
              key={agent.name}
              className="flex flex-col gap-5 border border-dashed border-white/20 bg-white/[0.02] p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="font-headline text-3xl uppercase text-white">{agent.name}</div>
                <span className="border border-yellow-300/40 bg-yellow-300/10 px-2 py-1 font-mono text-[10px] uppercase text-yellow-200">
                  Coming Soon
                </span>
              </div>

              <div>
                <h3 className="mb-2 font-headline text-2xl uppercase text-white">{agent.type}</h3>
                <p className="font-body text-xs uppercase leading-relaxed text-white/60">{agent.description}</p>
              </div>

              <div className="border border-white/12 p-4">
                <p className="font-mono text-[10px] uppercase text-white/40">Why It Matters</p>
                <p className="mt-2 font-mono text-xs uppercase leading-relaxed text-white/75">{agent.value}</p>
              </div>

              <div className="border border-white/20 px-4 py-3 text-center font-headline text-xl uppercase text-white/40">
                [ NOT LIVE YET ]
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
