"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/context/WalletContext";
import { api, type ProposalResponse } from "@/lib/api";
import { resolveVaultAddress } from "../../../lib/vault";

// Base Sepolia USDC — used to query the ERC20 vault balance with proper decimals
const USDC_ADDRESS =
  process.env.NEXT_PUBLIC_USDC_ADDRESS ?? "0xba50Cd2A20f6DA35D788639E581bca8d0B5d4D5f";

function toRiskLabel(riskLevel: ProposalResponse["riskLevel"]) {
  if (riskLevel === "high") {
    return "High Risk";
  }
  if (riskLevel === "medium") {
    return "Medium Risk";
  }
  return "Low Risk";
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
  if (uri.length <= 42) return uri;
  return `${uri.slice(0, 22)}...${uri.slice(-14)}`;
}

/**
 * Parse a balance string that may be raw wei ("101000000000000000")
 * or already human-readable ("0.101"). Uses BigInt to avoid overflow.
 */
function parseContractBalance(raw: string | undefined | null, decimals: number): number {
  if (!raw || raw === "0") return 0;
  if (raw.includes(".")) {
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : 0;
  }
  try {
    const big = BigInt(raw);
    const divisor = BigInt(10 ** decimals);
    const whole = big / divisor;
    const fraction = big % divisor;
    const fractionStr = fraction.toString().padStart(decimals, "0").replace(/0+$/, "");
    return parseFloat(fractionStr ? `${whole}.${fractionStr}` : whole.toString());
  } catch {
    return 0;
  }
}

function toRiskScore(riskLevel: ProposalResponse["riskLevel"]) {
  if (riskLevel === "high") return 82;
  if (riskLevel === "medium") return 50;
  return 20;
}

function toPercent(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

function toDisplayAddress(address?: string) {
  if (!address || address.length < 10) {
    return "-";
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function StrategyDetailPage() {
  const params = useParams<{ id: string }>();
  const strategyId = params?.id;
  const { address, isConnected } = useWallet();

  const proposalsQuery = useQuery({
    queryKey: ["strategy-detail-proposals", address],
    queryFn: async () => {
      const vaultAddress = await resolveVaultAddress(address as string);
      return vaultAddress ? api.getProposals(vaultAddress) : { proposals: [] };
    },
    enabled: isConnected && !!address,
    staleTime: 30_000,
  });

  const strategy = useMemo(
    () => proposalsQuery.data?.proposals.find((proposal) => proposal.id === strategyId),
    [proposalsQuery.data?.proposals, strategyId],
  );

  const identityQuery = useQuery({
    queryKey: ["strategy-agent-identity", strategy?.proposerAddress],
    queryFn: () => api.getAgentIdentity(strategy?.proposerAddress as string),
    enabled: !!strategy?.proposerAddress,
    staleTime: 30_000,
  });

  const feedbackSummaryQuery = useQuery({
    queryKey: ["strategy-agent-feedback", identityQuery.data?.registryAgentId],
    queryFn: () => api.getFeedbackSummary(identityQuery.data?.registryAgentId as string),
    enabled: !!identityQuery.data?.registryAgentId,
    staleTime: 30_000,
  });

  const vaultBalanceQuery = useQuery({
    queryKey: ["strategy-vault-balance", address, USDC_ADDRESS],
    queryFn: async () => {
      const vaultAddress = await resolveVaultAddress(address as string);
      return vaultAddress
        ? api.getVaultBalance(vaultAddress, USDC_ADDRESS)
        : ({ vault: address as string, balance: "0", assetAddress: USDC_ADDRESS } as {
            vault: string;
            balance: string;
            assetAddress: string;
            decimals?: number;
          });
    },
    enabled: isConnected && !!address,
    staleTime: 30_000,
  });

  if (proposalsQuery.isLoading) {
    return (
      <div className="bg-surface-container-lowest text-on-surface min-h-screen flex font-body antialiased p-8">
        Loading strategy details...
      </div>
    );
  }

  if (proposalsQuery.isError || !strategy) {
    return (
      <div className="bg-surface-container-lowest text-on-surface min-h-screen flex font-body antialiased p-8">
        Strategy not found or unavailable.
      </div>
    );
  }

  const apy = strategy.expectedApyBps / 100;
  const riskLabel = toRiskLabel(strategy.riskLevel);
  const riskScore = toRiskScore(strategy.riskLevel);
  const agentRep = strategy.score ?? 0;
  const confidencePct = (strategy.marketSnapshot.confidence || 0) * 100;
  const utilizationPct = strategy.marketSnapshot.utilizationBps / 100;
  const supplyApr = strategy.marketSnapshot.supplyAprBps / 100;
  // decimals: 6 if ERC20 asset (USDC), 18 if native WETH from VaultFactory
  const balanceDecimals = vaultBalanceQuery.data?.decimals ?? (vaultBalanceQuery.data?.assetAddress ? 6 : 18);
  const availableBalance = parseContractBalance(vaultBalanceQuery.data?.balance, balanceDecimals);

  const executionSteps = [
    {
      title: strategy.protocolPlan.protocol,
      description: `Prepare and route strategy calls on ${strategy.protocolPlan.chain}.`,
    },
    ...strategy.calls.map((call, index) => ({
      title: `Call ${index + 1}`,
      description: call.note || `Execute call on ${call.target}.`,
    })),
  ];

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen flex font-body antialiased">
      <div className="md:hidden w-full h-16 bg-surface-container-lowest flex items-center px-4 fixed top-0 z-50 shadow-sm border-b border-surface-container">
        <span className="text-xl font-bold text-on-surface">Propex</span>
      </div>

      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 w-full max-w-[1400px] mx-auto flex flex-col gap-8">
        <Link
          className="flex items-center gap-2 text-[13px] text-secondary hover:text-primary transition-colors w-fit group"
          href="/strategy-market"
        >
          <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">
            arrow_back
          </span>
          Back to Strategy Market
        </Link>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-surface-container">
          <div className="flex flex-col gap-1">
            <h1 className="text-[22px] font-bold text-on-surface font-headline tracking-tight leading-none">
              {strategy.title}
            </h1>
            <p className="text-[13px] text-secondary flex items-center gap-1.5">
              by <span className="text-primary font-medium">{strategy.proposerAgentId}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-2.5 py-1 bg-tertiary/10 text-tertiary text-xs font-semibold rounded-sm uppercase tracking-widest">
              {riskLabel}
            </div>
            <div className="text-[24px] font-bold text-[#4ADE80] tabular-nums leading-none">
              {toPercent(apy)}
              <span className="text-xs text-secondary font-normal block text-right mt-1">APY</span>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-5 gap-0 bg-surface-container rounded-lg overflow-hidden border border-surface-container-high/50">
          <div className="p-4 flex flex-col gap-1 border-r border-b md:border-b-0 border-surface-container-high/50 hover:bg-surface-container-low transition-colors group">
            <span className="text-xs text-secondary uppercase tracking-widest font-semibold font-label">
              Expected APY
            </span>
            <span className="text-lg font-semibold text-on-surface tabular-nums group-hover:text-primary transition-colors">
              {toPercent(apy)}
            </span>
          </div>
          <div className="p-4 flex flex-col gap-1 border-r border-b md:border-b-0 border-surface-container-high/50 hover:bg-surface-container-low transition-colors group">
            <span className="text-xs text-secondary uppercase tracking-widest font-semibold font-label">
              Risk Score
            </span>
            <span className="text-lg font-semibold text-on-surface tabular-nums group-hover:text-primary transition-colors">
              {riskScore}
              <span className="text-xs text-secondary font-normal">/100</span>
            </span>
          </div>
          <div className="p-4 flex flex-col gap-1 border-r border-b md:border-b-0 border-surface-container-high/50 hover:bg-surface-container-low transition-colors group">
            <span className="text-xs text-secondary uppercase tracking-widest font-semibold font-label">
              Agent Rep
            </span>
            <span className="text-lg font-semibold text-on-surface tabular-nums group-hover:text-primary transition-colors">
              {agentRep.toLocaleString("en-US")}
            </span>
          </div>
          <div className="p-4 flex flex-col gap-1 border-r border-b md:border-b-0 border-surface-container-high/50 hover:bg-surface-container-low transition-colors group">
            <span className="text-xs text-secondary uppercase tracking-widest font-semibold font-label">
              Max Slippage
            </span>
            <span className="text-lg font-semibold text-on-surface tabular-nums group-hover:text-primary transition-colors">
              {toPercent(Math.max(100 - utilizationPct, 0), 2)}
            </span>
          </div>
          <div className="p-4 flex flex-col gap-1 hover:bg-surface-container-low transition-colors group">
            <span className="text-xs text-secondary uppercase tracking-widest font-semibold font-label">
              Min Health
            </span>
            <span className="text-lg font-semibold text-on-surface tabular-nums group-hover:text-primary transition-colors">
              {(1 + confidencePct / 100).toFixed(2)}x
            </span>
          </div>
        </section>

        <div className="bg-surface rounded-lg p-6 flex flex-col gap-4 border border-outline-variant/15 shadow-sm">
          <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider font-headline">
            Protocol Plan
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-secondary mb-1">Status</div>
              <span
                className={`inline-flex rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${toStatusClass(strategy.status)}`}
              >
                {toStatusLabel(strategy.status)}
              </span>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-secondary mb-1">Agent URI</div>
              <div className="text-on-surface font-mono text-xs break-all">
                {toDisplayUri(identityQuery.data?.agentUri)}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-secondary mb-1">Protocol</div>
              <div className="text-on-surface">{strategy.protocolPlan.protocol}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-secondary mb-1">Chain</div>
              <div className="text-on-surface">{strategy.protocolPlan.chain}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-secondary mb-1">Amount Mode</div>
              <div className="text-on-surface">{strategy.protocolPlan.amountMode}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-secondary mb-1">Asset</div>
              <div className="text-on-surface">
                {strategy.protocolPlan.assetSymbol} <span className="font-mono text-secondary">{strategy.protocolPlan.assetAddress}</span>
              </div>
            </div>
            <div className="col-span-2">
              <div className="text-[11px] uppercase tracking-wider text-secondary mb-1">Pool Address</div>
              <div className="text-on-surface font-mono break-all">{strategy.protocolPlan.poolAddress}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-secondary mb-1">Referral Code</div>
              <div className="text-on-surface tabular-nums">{strategy.protocolPlan.referralCode}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <article className="bg-surface rounded-lg p-6 flex flex-col gap-4 border border-outline-variant/15 shadow-sm">
              <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider font-headline">
                Strategy Overview
              </h2>
              <p className="text-sm text-secondary leading-relaxed">{strategy.rationale || strategy.summary}</p>
            </article>

            <div className="bg-surface rounded-lg p-6 flex flex-col gap-5 border border-outline-variant/15 shadow-sm">
              <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider font-headline">
                Execution Path
              </h2>
              <div className="flex flex-col gap-0">
                {executionSteps.map((step, index) => (
                  <div
                    key={`${step.title}-${index}`}
                    className="flex gap-4 p-3 hover:bg-surface-container-low transition-colors -mx-3 rounded"
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                          index === executionSteps.length - 1
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : "bg-surface-container text-secondary border border-outline-variant/30"
                        }`}
                      >
                        {index + 1}
                      </div>
                      {index < executionSteps.length - 1 && (
                        <div className="w-px h-full bg-outline-variant/20 mt-2"></div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 pb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-on-surface bg-surface-container-high px-2 py-0.5 rounded-sm">
                          {step.title}
                        </span>
                      </div>
                      <p className="text-sm text-secondary">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface rounded-lg p-6 flex flex-col gap-4 border border-outline-variant/15 shadow-sm">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider font-headline">
                  Performance History
                </h2>
                <div className="flex bg-surface-container rounded-sm p-0.5 border border-outline-variant/20">
                  <button className="px-3 py-1 text-xs font-medium text-secondary hover:text-on-surface transition-colors">
                    7D
                  </button>
                  <button className="px-3 py-1 text-xs font-medium bg-surface text-on-surface shadow-sm rounded-sm">
                    30D
                  </button>
                  <button className="px-3 py-1 text-xs font-medium text-secondary hover:text-on-surface transition-colors">
                    90D
                  </button>
                </div>
              </div>
              <div className="h-48 w-full bg-surface-container-lowest border border-outline-variant/10 rounded relative overflow-hidden flex flex-col">
                <div className="absolute inset-0 grid grid-rows-4 grid-cols-6 opacity-5 pointer-events-none">
                  <div className="border-b border-r border-white"></div>
                  <div className="border-b border-r border-white"></div>
                  <div className="border-b border-r border-white"></div>
                  <div className="border-b border-r border-white"></div>
                  <div className="border-b border-r border-white"></div>
                  <div className="border-b border-white"></div>
                  <div className="border-b border-r border-white"></div>
                  <div className="border-b border-r border-white"></div>
                  <div className="border-b border-r border-white"></div>
                  <div className="border-b border-r border-white"></div>
                  <div className="border-b border-r border-white"></div>
                  <div className="border-b border-white"></div>
                  <div className="border-b border-r border-white"></div>
                  <div className="border-b border-r border-white"></div>
                  <div className="border-b border-r border-white"></div>
                  <div className="border-b border-r border-white"></div>
                  <div className="border-b border-r border-white"></div>
                  <div className="border-b border-white"></div>
                  <div className="border-r border-white"></div>
                  <div className="border-r border-white"></div>
                  <div className="border-r border-white"></div>
                  <div className="border-r border-white"></div>
                  <div className="border-r border-white"></div>
                  <div></div>
                </div>
                <div className="mt-auto h-[60%] w-full bg-gradient-to-t from-primary/20 to-transparent relative border-t border-primary/50">
                  <div className="absolute -top-2 left-1/4 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(180,197,255,0.8)]"></div>
                  <div className="absolute -top-6 left-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(180,197,255,0.8)]"></div>
                  <div className="absolute -top-1 right-1/4 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(180,197,255,0.8)]"></div>
                </div>
              </div>
              <div className="flex gap-8 pt-2">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-secondary font-label">Avg APY (30D)</span>
                  <span className="text-sm font-medium text-on-surface tabular-nums">
                    {toPercent(strategy.marketSnapshot.supplyAprBps / 100)}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-secondary font-label">Peak APY</span>
                  <span className="text-sm font-medium text-on-surface tabular-nums">
                    {toPercent(Math.max(apy, supplyApr))}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-secondary font-label">Total Executions</span>
                  <span className="text-sm font-medium text-on-surface tabular-nums">
                    {feedbackSummaryQuery.data?.totalFeedback ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-surface-container rounded-lg p-6 flex flex-col gap-5 border border-primary/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider font-headline">
                Allocate Capital
              </h2>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-secondary">Amount ({strategy.protocolPlan.assetSymbol})</span>
                  <span className="text-secondary font-medium">
                    Available: <span className="text-on-surface">{availableBalance.toFixed(2)}</span>
                  </span>
                </div>
                <div className="relative flex items-center bg-surface-container-lowest border border-outline-variant/20 rounded-md focus-within:border-primary/50 transition-colors">
                  <input
                    className="w-full bg-transparent border-none text-on-surface text-lg py-3 px-4 focus:ring-0 tabular-nums placeholder-secondary/50"
                    placeholder="0.00"
                    type="text"
                  />
                  <button className="absolute right-2 text-xs font-medium text-primary hover:bg-primary/10 px-2 py-1 rounded transition-colors uppercase tracking-wide">
                    Max
                  </button>
                </div>
              </div>
              <div className="bg-surface-container-low p-4 rounded border border-outline-variant/10 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-secondary">Expected 1Y Return</span>
                  <span className="text-[#4ADE80] font-medium tabular-nums">
                    + ${(availableBalance * (apy / 100)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-secondary">Network Fee est.</span>
                  <span className="text-on-surface tabular-nums">~$1.20</span>
                </div>
              </div>
              <button className="w-full bg-gradient-to-b from-primary to-primary-container text-on-primary-container font-bold py-3.5 rounded-lg shadow-sm hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center gap-2 mt-2">
                <span className="material-symbols-outlined text-[18px]">bolt</span>
                Approve &amp; Execute
              </button>
            </div>

            <div className="bg-surface rounded-lg p-6 flex flex-col gap-5 border border-outline-variant/15 shadow-sm">
              <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider font-headline">
                Risk Profile
              </h2>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-secondary">Smart Contract Risk</span>
                    <span className="text-on-surface">{riskLabel.startsWith("Low") ? "Low" : "Medium"}</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-[#4ADE80] w-[20%]"></div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-secondary">Liquidation Risk</span>
                    <span className="text-tertiary">{riskLabel}</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-tertiary" style={{ width: `${riskScore}%` }}></div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-secondary">Market Utilization Risk</span>
                    <span className="text-on-surface">{toPercent(utilizationPct)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-[#4ADE80]" style={{ width: `${Math.min(utilizationPct, 100)}%` }}></div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-secondary">Agent Confidence</span>
                    <span className="text-on-surface">{toPercent(confidencePct)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-[#4ADE80]" style={{ width: `${Math.min(confidencePct, 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-lg p-6 flex flex-col gap-4 border border-outline-variant/15 shadow-sm">
              <div className="flex justify-between items-start">
                <h2 className="text-sm font-semibold text-on-surface uppercase tracking-wider font-headline">
                  Strategy Publisher
                </h2>
                <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div className="w-12 h-12 rounded bg-surface-container border border-outline-variant/20 flex items-center justify-center overflow-hidden">
                  <span className="material-symbols-outlined text-primary text-[24px]">robot_2</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-on-surface">
                    {identityQuery.data?.identityDocument?.name || strategy.proposerAgentId}
                  </span>
                  <span className="text-xs text-secondary tabular-nums font-mono">
                    {toDisplayAddress(strategy.proposerAddress)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2 pt-4 border-t border-outline-variant/10">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-secondary uppercase tracking-wider font-label">
                    Agent Score
                  </span>
                  <span className="text-sm font-semibold text-on-surface tabular-nums">
                    {agentRep.toLocaleString("en-US")}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-secondary uppercase tracking-wider font-label">Status</span>
                  <span
                    className={`inline-flex w-fit rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${toStatusClass(strategy.status)}`}
                  >
                    {toStatusLabel(strategy.status)}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-secondary uppercase tracking-wider font-label">Agent URI</span>
                  <span className="text-xs text-on-surface tabular-nums font-mono break-all">
                    {toDisplayUri(identityQuery.data?.agentUri)}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-secondary uppercase tracking-wider font-label">Executions</span>
                  <span className="text-sm font-semibold text-on-surface tabular-nums">
                    {feedbackSummaryQuery.data?.totalFeedback ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

