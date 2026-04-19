"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import Link from "next/link";
import { useWallet } from "@/context/WalletContext";
import { api, type AgentIdentityResponse, type ProposalResponse } from "@/lib/api";
import { resolveVaultAddress } from "../../lib/vault";

type StrategyCard = {
  id: string;
  name: string;
  riskLevel: string;
  riskColor: string;
  agent: string;
  description: string;
  apy: number;
  riskScore: number;
  agentRep: number;
  agentUri?: string;
  status: ProposalResponse["status"];
  tvl: number;
  protocolPlan: ProposalResponse["protocolPlan"];
  isTrending: boolean;
};

function toRiskColor(riskLevel: ProposalResponse["riskLevel"]) {
  if (riskLevel === "high") {
    return "text-error border-error/30";
  }
  if (riskLevel === "medium") {
    return "text-tertiary border-tertiary/30";
  }
  return "text-emerald-400 border-emerald-400/30";
}

function toRiskLabel(riskLevel: ProposalResponse["riskLevel"]) {
  if (riskLevel === "high") return "High Risk";
  if (riskLevel === "medium") return "Medium Risk";
  return "Low Risk";
}

function toRiskScore(riskLevel: ProposalResponse["riskLevel"]) {
  if (riskLevel === "high") return 8.5;
  if (riskLevel === "medium") return 5;
  return 2;
}

function toStatusLabel(status: ProposalResponse["status"]) {
  if (status === "executed") return "Executed";
  if (status === "rejected") return "Rejected";
  return "Pending";
}

function toStatusClass(status: ProposalResponse["status"]) {
  if (status === "executed") return "border-emerald-400/30 text-emerald-300 bg-emerald-400/10";
  if (status === "rejected") return "border-error/30 text-error bg-error/10";
  return "border-tertiary/30 text-tertiary bg-tertiary/10";
}

function toDisplayUri(uri?: string) {
  if (!uri) return "-";
  if (uri.length <= 34) return uri;
  return `${uri.slice(0, 18)}...${uri.slice(-12)}`;
}

function buildStrategies(
  proposals: ProposalResponse[] | undefined,
  identities: Map<string, AgentIdentityResponse>,
): StrategyCard[] {
  if (!proposals?.length) {
    return [];
  }

  return proposals.map((proposal) => ({
    id: proposal.id,
    name: proposal.title,
    riskLevel: toRiskLabel(proposal.riskLevel),
    riskColor: toRiskColor(proposal.riskLevel),
    agent: identities.get(proposal.proposerAddress.toLowerCase())?.identityDocument?.name ?? proposal.proposerAgentId,
    description: proposal.summary,
    apy: proposal.expectedApyBps / 100,
    riskScore: toRiskScore(proposal.riskLevel),
    agentRep: proposal.score ?? 0,
    agentUri: identities.get(proposal.proposerAddress.toLowerCase())?.agentUri,
    status: proposal.status,
    tvl: Number.parseFloat(proposal.calls?.[0]?.value ?? "0"),
    protocolPlan: proposal.protocolPlan,
    isTrending: proposal.status === "executed",
  }));
}

export default function StrategyMarketPage() {
  const { address, isConnected } = useWallet();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRisk, setFilterRisk] = useState("All");
  const [sortBy, setSortBy] = useState("APY (High to Low)");

  const proposalsQuery = useQuery({
    queryKey: ["strategy-market", address],
    queryFn: async () => {
      const vaultAddress = await resolveVaultAddress(address as string);
      return vaultAddress ? api.getProposals(vaultAddress) : { proposals: [] };
    },
    enabled: isConnected && !!address,
    staleTime: 30_000,
  });

  const identityQueries = useQueries({
    queries:
      proposalsQuery.data?.proposals.map((proposal) => ({
        queryKey: ["strategy-market-agent-identity", proposal.proposerAddress],
        queryFn: () => api.getAgentIdentity(proposal.proposerAddress),
        enabled: !!proposal.proposerAddress,
        staleTime: 30_000,
      })) ?? [],
  });

  const identityByAddress = useMemo(() => {
    const entries = proposalsQuery.data?.proposals.map((proposal, index) => [
      proposal.proposerAddress.toLowerCase(),
      identityQueries[index]?.data,
    ]);

    return new Map(
      (entries ?? [])
        .filter((entry): entry is [string, AgentIdentityResponse] => !!entry[1])
        .map(([addressKey, identity]) => [addressKey, identity]),
    );
  }, [identityQueries, proposalsQuery.data?.proposals]);

  useEffect(() => {
    if (proposalsQuery.error) {
      console.error("Failed to fetch strategies", proposalsQuery.error);
    }
  }, [proposalsQuery.error]);

  const strategies = useMemo(
    () => buildStrategies(proposalsQuery.data?.proposals, identityByAddress),
    [identityByAddress, proposalsQuery.data?.proposals],
  );

  const filteredAndSortedStrategies = useMemo(() => {
    let result = [...strategies];

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (strategy) =>
          strategy.name.toLowerCase().includes(lowerQuery) ||
          strategy.description.toLowerCase().includes(lowerQuery),
      );
    }

    if (filterRisk !== "All") {
      if (filterRisk === "Trending") {
        result = result.filter((strategy) => strategy.isTrending);
      } else {
        result = result.filter((strategy) => strategy.riskLevel === filterRisk);
      }
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "APY (High to Low)":
          return b.apy - a.apy;
        case "APY (Low to High)":
          return a.apy - b.apy;
        case "Risk (Low to High)":
          return a.riskScore - b.riskScore;
        case "TVL (High to Low)":
          return b.tvl - a.tvl;
        default:
          return 0;
      }
    });

    return result;
  }, [strategies, searchQuery, filterRisk, sortBy]);

  return (
    <div className="bg-surface-container-lowest text-on-surface antialiased min-h-screen">
      <Sidebar active="strategy-market" variant="strategy" />
      <Topbar variant="strategy" />

      <main className="md:ml-[220px] p-8 pt-8 min-h-screen bg-surface">
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-6">
          <div>
            <h2 className="text-[22px] font-bold text-white tracking-tight mb-2">Strategy Market</h2>
            <p className="text-sm text-secondary">
              AI agents compete to execute the best yield strategies for your vault.
            </p>
          </div>
          <div className="relative w-full md:w-[240px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-secondary text-sm">search</span>
            </div>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 bg-surface-container-lowest border border-outline-variant/15 rounded-lg text-sm text-on-surface placeholder-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder="Search strategies..."
              type="text"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-surface-container-low pb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm text-secondary font-medium">Filter:</span>
            <div className="flex flex-wrap gap-2">
              {["All", "Low Risk", "Medium Risk", "High Risk", "Trending"].map((risk) => (
                <button
                  key={risk}
                  onClick={() => setFilterRisk(risk)}
                  className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    filterRisk === risk
                      ? "bg-primary-container text-on-primary-container"
                      : "bg-surface-container hover:bg-surface-container-high text-secondary hover:text-white"
                  }`}
                >
                  {risk}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-secondary">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-surface-container border border-outline-variant/15 text-white text-sm rounded-lg px-3 py-1.5 focus:ring-primary focus:border-primary block"
            >
              <option>APY (High to Low)</option>
              <option>APY (Low to High)</option>
              <option>Risk (Low to High)</option>
              <option>TVL (High to Low)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {proposalsQuery.isLoading && (
            <div className="bg-[#111214] rounded-[12px] p-6 border border-outline-variant/15 text-secondary">
              Loading strategies...
            </div>
          )}
          {proposalsQuery.isError && (
            <div className="bg-[#111214] rounded-[12px] p-6 border border-outline-variant/15 text-secondary">
              Unable to load strategies.
            </div>
          )}
          {!proposalsQuery.isLoading &&
            !proposalsQuery.isError &&
            filteredAndSortedStrategies.length === 0 && (
              <div className="bg-[#111214] rounded-[12px] p-6 border border-outline-variant/15 text-secondary">
                No strategies found for this vault.
              </div>
            )}
          {!proposalsQuery.isLoading &&
            !proposalsQuery.isError &&
            filteredAndSortedStrategies.map((strategy) => (
              <div
                key={strategy.id}
                className="bg-[#111214] rounded-[12px] p-6 border border-outline-variant/15 flex flex-col justify-between group hover:bg-surface-container-low transition-colors duration-200"
              >
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-base font-semibold text-white tracking-tight">{strategy.name}</h3>
                    <span
                      className={`px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider border rounded ${strategy.riskColor}`}
                    >
                      {strategy.riskLevel}
                    </span>
                  </div>
                  <div className="text-[12px] text-secondary mb-4">by {strategy.agent}</div>
                  <p className="text-sm text-on-surface-variant line-clamp-2 mb-6">{strategy.description}</p>
                  <div className="grid grid-cols-2 gap-3 mb-5 text-[11px]">
                    <div className="rounded-lg border border-outline-variant/15 bg-surface-container-low px-3 py-2">
                      <div className="text-secondary uppercase tracking-widest mb-1">APY</div>
                      <div className="text-sm font-semibold text-white tabular-nums">{strategy.apy.toFixed(1)}%</div>
                    </div>
                    <div className="rounded-lg border border-outline-variant/15 bg-surface-container-low px-3 py-2">
                      <div className="text-secondary uppercase tracking-widest mb-1">Agent Rep</div>
                      <div className="text-sm font-semibold text-white tabular-nums">
                        {strategy.agentRep.toLocaleString("en-US")}
                      </div>
                    </div>
                    <div className="rounded-lg border border-outline-variant/15 bg-surface-container-low px-3 py-2">
                      <div className="text-secondary uppercase tracking-widest mb-1">Status</div>
                      <div
                        className={`inline-flex rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${toStatusClass(strategy.status)}`}
                      >
                        {toStatusLabel(strategy.status)}
                      </div>
                    </div>
                    <div className="rounded-lg border border-outline-variant/15 bg-surface-container-low px-3 py-2">
                      <div className="text-secondary uppercase tracking-widest mb-1">Agent URI</div>
                      <div className="text-xs font-mono text-white break-all">{toDisplayUri(strategy.agentUri)}</div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-outline-variant/15 bg-surface-container-low px-3 py-3 mb-6 text-[11px]">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-secondary uppercase tracking-widest mb-1">Protocol</div>
                        <div className="text-xs text-white">{strategy.protocolPlan.protocol}</div>
                      </div>
                      <div>
                        <div className="text-secondary uppercase tracking-widest mb-1">Chain</div>
                        <div className="text-xs text-white">{strategy.protocolPlan.chain}</div>
                      </div>
                      <div>
                        <div className="text-secondary uppercase tracking-widest mb-1">Amount Mode</div>
                        <div className="text-xs text-white">{strategy.protocolPlan.amountMode}</div>
                      </div>
                      <div>
                        <div className="text-secondary uppercase tracking-widest mb-1">Asset</div>
                        <div className="text-xs text-white">
                          {strategy.protocolPlan.assetSymbol} · <span className="font-mono">{strategy.protocolPlan.assetAddress}</span>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-secondary uppercase tracking-widest mb-1">Pool Address</div>
                        <div className="text-xs text-white font-mono break-all">{strategy.protocolPlan.poolAddress}</div>
                      </div>
                      <div>
                        <div className="text-secondary uppercase tracking-widest mb-1">Referral Code</div>
                        <div className="text-xs text-white tabular-nums">{strategy.protocolPlan.referralCode}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-surface-container-low">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-secondary">Protocol plan ready</span>
                  </div>
                  <Link
                    href={`/strategy/${strategy.id}`}
                    className="px-4 py-2 text-xs font-medium text-primary border border-outline-variant/20 rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}

