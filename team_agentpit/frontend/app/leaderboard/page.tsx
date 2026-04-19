"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useWallet } from "@/context/WalletContext";
import { api, type ProposalResponse } from "@/lib/api";
import { resolveVaultAddress } from "../../lib/vault";

type Timeframe = "7D" | "30D" | "90D" | "All Time";

type LeaderboardAgent = {
  id: number;
  agentId: string;
  agentType: "strategy" | "user";
  name: string;
  description?: string;
  address: string;
  registeredAt: string;
  metadataSource?: string;
  registryAgentId?: string;
  reputation: number;
  reputationTier: "rookie" | "trusted" | "elite";
  reputationSource: "onchain" | "mock";
  repPercent: number;
  roi: Record<Timeframe, string>;
  executions: number;
  successRate: string;
  risk: "Low" | "Med" | "High";
  status: "Active" | "Suspended";
};

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getRiskLabel(riskLevel: ProposalResponse["riskLevel"]) {
  if (riskLevel === "high") return "High";
  if (riskLevel === "medium") return "Med";
  return "Low";
}

function formatRoi(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function toDisplayAddress(address?: string) {
  if (!address || address.length < 10) return "Unknown Agent";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function LeaderboardPage() {
  const { address, isConnected } = useWallet();
  const [timeframe, setTimeframe] = useState<Timeframe>("30D");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const proposalsQuery = useQuery({
    queryKey: ["leaderboard-proposals", address],
    queryFn: async () => {
      const vaultAddress = await resolveVaultAddress(address as string);
      return vaultAddress ? api.getProposals(vaultAddress) : { proposals: [] };
    },
    enabled: isConnected && !!address,
    staleTime: 30_000,
  });

  const agentsDirectoryQuery = useQuery({
    queryKey: ["agents-directory"],
    queryFn: () => api.getAgentsDirectory(),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (proposalsQuery.error) {
      console.error("Failed to fetch leaderboard proposals", proposalsQuery.error);
    }
  }, [proposalsQuery.error]);

  useEffect(() => {
    if (agentsDirectoryQuery.error) {
      console.error("Failed to fetch agents directory", agentsDirectoryQuery.error);
    }
  }, [agentsDirectoryQuery.error]);

  const proposalStatsByAddress = useMemo(() => {
    const byAddress = new Map<string, ProposalResponse[]>();
    (proposalsQuery.data?.proposals ?? []).forEach((proposal) => {
      const key = proposal.proposerAddress.toLowerCase();
      const current = byAddress.get(key) ?? [];
      current.push(proposal);
      byAddress.set(key, current);
    });
    return byAddress;
  }, [proposalsQuery.data?.proposals]);

  const leaderboardData = useMemo<LeaderboardAgent[]>(() => {
    const base = (agentsDirectoryQuery.data?.agents ?? []).map((agent) => {
      const proposals = proposalStatsByAddress.get(agent.agentAddress.toLowerCase()) ?? [];
      const apys = proposals.map((proposal) => proposal.expectedApyBps / 100);
      const avgApy = average(apys);
      const confidence = average(
        proposals.map((proposal) => (proposal.marketSnapshot.confidence || 0) * 100),
      );
      const riskScores = proposals.map((proposal) => getRiskLabel(proposal.riskLevel));
      const highCount = riskScores.filter((risk) => risk === "High").length;
      const medCount = riskScores.filter((risk) => risk === "Med").length;
      const risk: "Low" | "Med" | "High" =
        highCount > medCount && highCount > 0 ? "High" : medCount > 0 ? "Med" : "Low";

      const isSuspended = proposals.length === 0 || proposals.every((proposal) => proposal.status !== "pending");
      const reputationValue = Number.parseFloat(agent.reputation?.score ?? "0");

      return {
        id: 0,
        agentId: agent.agentId,
        agentType: agent.agentType,
        name: agent.name || toDisplayAddress(agent.agentAddress),
        description: agent.description,
        address: agent.agentAddress,
        registeredAt: agent.registeredAt,
        metadataSource:
          typeof agent.metadata?.source === "string" ? (agent.metadata.source as string) : undefined,
        registryAgentId: agent.registryAgentId,
        reputation: reputationValue,
        reputationTier: agent.reputation?.tier ?? "rookie",
        reputationSource: agent.reputation?.source ?? "mock",
        repPercent: 0,
        roi: {
          "7D": formatRoi(avgApy * 0.25),
          "30D": formatRoi(avgApy),
          "90D": formatRoi(avgApy * 2.5),
          "All Time": formatRoi(avgApy * 5),
        },
        executions: proposals.length,
        successRate: `${Math.min(confidence || 0, 100).toFixed(1)}%`,
        risk,
        status: isSuspended ? ("Suspended" as const) : ("Active" as const),
      };
    });

    const sorted = [...base].sort((a, b) => b.reputation - a.reputation);
    const maxRep = Math.max(...sorted.map((row) => row.reputation), 1);

    return sorted.map((row, index) => ({
      ...row,
      id: index + 1,
      repPercent: Math.max(Math.min((row.reputation / maxRep) * 100, 100), 0),
    }));
  }, [agentsDirectoryQuery.data?.agents, proposalStatsByAddress]);

  const totalPages = Math.max(1, Math.ceil(leaderboardData.length / itemsPerPage));
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return leaderboardData.slice(start, start + itemsPerPage);
  }, [currentPage, leaderboardData]);

  const top3 = leaderboardData.slice(0, 3);

  return (
    <div className="bg-[#0D0E10] text-on-surface antialiased min-h-screen flex">
      <Sidebar active="leaderboard" variant="leaderboard-view" />

      <main className="flex-1 ml-0 md:ml-[220px] flex flex-col min-h-screen">
        <Topbar variant="leaderboard" />

        <div className="p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-col gap-1">
            <h1 className="text-[22px] font-bold text-white tracking-tight font-headline">Agent Leaderboard</h1>
            <p className="text-sm text-secondary font-body">
              Ranked AI strategy agents by on-chain reputation, ROI performance, and execution history.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {top3.map((agent, index) => (
              <div
                key={agent.address}
                className={`bg-[#111214] rounded-[16px] p-6 relative border border-[rgba(255,255,255,0.05)] flex flex-col items-center h-full ${
                  index === 0 ? "border-t-2 border-t-[#4F7EFF]" : ""
                }`}
              >
                <div
                  className={`absolute top-4 left-4 px-2 py-0.5 rounded text-xs font-bold font-headline tabular-nums tracking-wider ${
                    index === 0 ? "bg-[#4F7EFF]/10 text-[#4F7EFF]" : "bg-[#1A1C1F] text-secondary"
                  }`}
                >
                  #{index + 1}
                </div>
                <div className="w-16 h-16 rounded-full bg-[#1A1C1F] border border-[rgba(255,255,255,0.05)] flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary">robot_2</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-1 font-headline text-center">{agent.name}</h3>
                <div className="text-[24px] font-bold text-[#4ade80] mb-6 font-headline tabular-nums text-center">
                  {agent.roi[timeframe]}{" "}
                  <span className="text-xs text-secondary font-normal uppercase tracking-wider">ROI</span>
                </div>
                <div className="w-full space-y-3 mt-auto">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-secondary font-body">Reputation</span>
                    <span className="text-white font-medium font-body tabular-nums">
                      {agent.reputation.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-secondary font-body">Executions</span>
                    <span className="text-white font-medium font-body tabular-nums">{agent.executions}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-secondary font-body">Success Rate</span>
                    <span className="text-white font-medium font-body tabular-nums">{agent.successRate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#111214] rounded-[16px] border border-[rgba(255,255,255,0.05)] flex flex-col">
            <div className="p-6 flex justify-between items-center border-b border-[rgba(255,255,255,0.04)]">
              <h2 className="text-lg font-bold text-white font-headline">All Agents</h2>
              <div className="flex gap-2">
                {(["7D", "30D", "90D", "All Time"] as Timeframe[]).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => {
                      setTimeframe(tf);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md font-body transition-colors ${
                      timeframe === tf ? "bg-[#1A1C1F] text-white" : "hover:bg-[#1A1C1F] text-secondary"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full overflow-x-auto p-6 pt-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-secondary font-label border-b border-[rgba(255,255,255,0.04)]">
                    <th className="py-3 pr-4 font-medium w-16">Rank</th>
                    <th className="py-3 px-4 font-medium w-48">Agent</th>
                    <th className="py-3 px-4 font-medium w-56">Reputation</th>
                    <th className="py-3 px-4 font-medium text-right">ROI (30D)</th>
                    <th className="py-3 px-4 font-medium text-right">Executions</th>
                    <th className="py-3 px-4 font-medium text-right">Success Rate</th>
                    <th className="py-3 px-4 font-medium text-center">Risk Profile</th>
                    <th className="py-3 pl-4 font-medium text-right w-24">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-body tabular-nums">
                  {(proposalsQuery.isLoading || agentsDirectoryQuery.isLoading) && (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-secondary">
                        Loading leaderboard...
                      </td>
                    </tr>
                  )}
                  {(proposalsQuery.isError || agentsDirectoryQuery.isError) && (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-secondary">
                        Unable to load leaderboard data.
                      </td>
                    </tr>
                  )}
                  {!proposalsQuery.isLoading &&
                    !agentsDirectoryQuery.isLoading &&
                    !proposalsQuery.isError &&
                    !agentsDirectoryQuery.isError &&
                    currentData.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-secondary">
                        No agents found.
                      </td>
                    </tr>
                  )}
                  {!proposalsQuery.isLoading &&
                    !agentsDirectoryQuery.isLoading &&
                    !proposalsQuery.isError &&
                    !agentsDirectoryQuery.isError &&
                    currentData.map((agent) => {
                      const isSuspended = agent.status === "Suspended";
                      const isNegativeRoi = agent.roi[timeframe].startsWith("-");

                      return (
                        <tr
                          key={agent.address}
                          className={`hover:bg-[#1A1C1F]/50 transition-colors group border-b border-[rgba(255,255,255,0.04)] ${
                            isSuspended ? "opacity-60" : ""
                          }`}
                        >
                          <td className={`py-4 pr-4 font-medium ${agent.id <= 3 ? "text-white" : "text-secondary"}`}>
                            {agent.id.toString().padStart(2, "0")}
                          </td>
                          <td className="py-4 px-4 font-medium text-white">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded bg-[#1A1C1F]"></div>
                              <div className="flex flex-col min-w-0">
                                <span className="truncate">{agent.name}</span>
                                <span className="text-xs text-secondary truncate">
                                  {agent.description || `${agent.agentType} • ${agent.agentId}`}
                                </span>
                                <span className="text-[11px] text-secondary truncate">
                                  {agent.agentType} • {agent.agentId} • {toDisplayAddress(agent.address)}
                                </span>
                                <span className="text-[11px] text-secondary truncate">
                                  Registered {new Date(agent.registeredAt).toLocaleDateString("en-US")}
                                  {agent.registryAgentId ? ` • Reg# ${agent.registryAgentId.slice(0, 8)}...` : ""}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <span className={`${isSuspended ? "text-secondary" : "text-white"} w-10`}>
                                {agent.reputation.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                              </span>
                              <div className="h-1.5 w-24 bg-[#1A1C1F] rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${isSuspended ? "bg-secondary" : "bg-primary"}`}
                                  style={{ width: `${agent.repPercent}%` }}
                                ></div>
                              </div>
                              <span className="text-[11px] text-secondary uppercase w-16 text-right">
                                {agent.reputationTier}
                              </span>
                            </div>
                            <div className="text-[11px] text-secondary mt-1 text-right">
                              {agent.reputationSource}
                              {agent.metadataSource ? ` • ${agent.metadataSource}` : ""}
                            </div>
                          </td>
                          <td className={`py-4 px-4 text-right ${isNegativeRoi ? "text-error" : "text-[#4ade80]"}`}>
                            {agent.roi[timeframe]}
                          </td>
                          <td className={`py-4 px-4 text-right ${isSuspended ? "text-secondary" : "text-white"}`}>
                            {agent.executions}
                          </td>
                          <td className={`py-4 px-4 text-right ${isSuspended ? "text-secondary" : "text-white"}`}>
                            {agent.successRate}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span
                              className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest inline-block w-16 ${
                                agent.risk === "Low"
                                  ? "bg-[#1A1C1F] text-secondary"
                                  : agent.risk === "Med"
                                    ? "bg-[#1A1C1F] text-secondary"
                                    : "bg-tertiary/10 text-tertiary border border-tertiary/20"
                              }`}
                            >
                              {agent.risk}
                            </span>
                          </td>
                          <td className="py-4 pl-4 text-right">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                isSuspended ? "bg-[#1A1C1F] text-secondary" : "bg-[#4ade80]/10 text-[#4ade80]"
                              }`}
                            >
                              {agent.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-[rgba(255,255,255,0.04)] flex justify-between items-center bg-transparent">
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="text-sm text-secondary hover:text-white transition-colors flex items-center gap-1 font-body disabled:opacity-50 disabled:hover:text-secondary disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span> Prev
              </button>
              <div className="flex gap-1 font-body text-sm tabular-nums">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                      currentPage === page
                        ? "bg-[#1A1C1F] text-white"
                        : "hover:bg-[#1A1C1F] text-secondary hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="text-sm text-secondary hover:text-white transition-colors flex items-center gap-1 font-body disabled:opacity-50 disabled:hover:text-secondary disabled:cursor-not-allowed"
              >
                Next <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
