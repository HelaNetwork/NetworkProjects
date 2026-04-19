"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import Link from "next/link";
import { useWallet } from "@/context/WalletContext";
import { api, type ProposalResponse, type VaultSignalResponse } from "@/lib/api";
import { resolveVaultAddress } from "../../lib/vault";

type AssetRow = {
  symbol: string;
  name: string;
  network: string;
  networkColor: string;
  iconColor: string;
  iconBg: string;
  balance: number;
  value: number;
  allocatedValue: number;
  strategy: string;
  percentage: number;
};

const NETWORK_COLORS: Record<string, string> = {
  "base-sepolia": "bg-[#0052ff]",
  base: "bg-[#0052ff]",
  ethereum: "bg-[#627eea]",
};

const ICON_STYLES = [
  { iconColor: "text-[#2775ca]", iconBg: "bg-[#2775ca]/20 border-[#2775ca]/30" },
  { iconColor: "text-[#627eea]", iconBg: "bg-[#627eea]/20 border-[#627eea]/30" },
  { iconColor: "text-[#00a3ff]", iconBg: "bg-[#00a3ff]/20 border-[#00a3ff]/30" },
  { iconColor: "text-[#b6509e]", iconBg: "bg-[#b6509e]/20 border-[#b6509e]/30" },
  { iconColor: "text-[#ff007a]", iconBg: "bg-[#ff007a]/20 border-[#ff007a]/30" },
];

function toNumber(value: string | number | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (!value) {
    return 0;
  }
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseTokenAmount(raw: string | undefined | null, decimals: number) {
  if (!raw || raw === "0") return 0;
  if (raw.includes(".")) {
    return toNumber(raw);
  }

  try {
    const value = BigInt(raw);
    const divisor = BigInt(10) ** BigInt(decimals);
    const whole = value / divisor;
    const fraction = value % divisor;
    const fractionStr = fraction.toString().padStart(decimals, "0").replace(/0+$/, "");
    return Number.parseFloat(fractionStr ? `${whole}.${fractionStr}` : whole.toString());
  } catch {
    return 0;
  }
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatNumber(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function buildAssets(
  signals: VaultSignalResponse[] | undefined,
  proposals: ProposalResponse[] | undefined,
): AssetRow[] {
  if (!signals?.length) {
    return [];
  }

  const strategyByAsset = new Map<string, string>();
  (proposals ?? []).forEach((proposal) => {
    const symbol = proposal.protocolPlan?.assetSymbol?.trim();
    if (symbol && !strategyByAsset.has(symbol)) {
      strategyByAsset.set(symbol, proposal.title);
    }
  });

  const grouped = new Map<string, { symbol: string; chain: string; total: number; allocated: number }>();

  signals.forEach((signal) => {
    const symbol = signal.assetSymbol || "UNKNOWN";
    const key = `${signal.chain}-${symbol}`;
    const current = grouped.get(key) ?? {
      symbol,
      chain: signal.chain || "base-sepolia",
      total: 0,
      allocated: 0,
    };

    const amount = parseTokenAmount(signal.fundedAmount, signal.assetSymbol === "WETH" ? 18 : 6);
    current.total += amount;
    if (signal.status === "ready-for-strategy") {
      current.allocated += amount;
    }
    grouped.set(key, current);
  });

  const totalValue = [...grouped.values()].reduce((sum, item) => sum + item.total, 0);

  return [...grouped.values()]
    .sort((a, b) => b.total - a.total)
    .map((item, index) => {
      const style = ICON_STYLES[index % ICON_STYLES.length];
      const network = item.chain === "base-sepolia" ? "Base" : item.chain;
      return {
        symbol: item.symbol,
        name: item.symbol,
        network,
        networkColor: NETWORK_COLORS[item.chain] ?? "bg-[#0052ff]",
        iconColor: style.iconColor,
        iconBg: style.iconBg,
        balance: item.total,
        value: item.total,
        allocatedValue: item.allocated,
        strategy: strategyByAsset.get(item.symbol) ?? "Idle",
        percentage: totalValue > 0 ? (item.total / totalValue) * 100 : 0,
      };
    });
}

function buildActivePositions(proposals: ProposalResponse[] | undefined) {
  return (proposals ?? [])
    .filter((proposal) => proposal.status !== "rejected")
    .sort((a, b) => b.expectedApyBps - a.expectedApyBps)
    .slice(0, 3);
}

export default function AssetsPage() {
  const { address, isConnected } = useWallet();

  const signalsQuery = useQuery({
    queryKey: ["asset-signals", address],
    queryFn: async () => {
      const vaultAddress = await resolveVaultAddress(address as string);
      return api.getVaultSignals({
        ownerAddress: address as string,
        vaultAddress: vaultAddress ?? undefined,
      });
    },
    enabled: isConnected && !!address,
    staleTime: 30_000,
  });

  const proposalsQuery = useQuery({
    queryKey: ["asset-proposals", address],
    queryFn: async () => {
      const vaultAddress = await resolveVaultAddress(address as string);
      return vaultAddress ? api.getProposals(vaultAddress) : { proposals: [] };
    },
    enabled: isConnected && !!address,
    staleTime: 30_000,
  });

  const assets = useMemo(
    () => buildAssets(signalsQuery.data, proposalsQuery.data?.proposals),
    [signalsQuery.data, proposalsQuery.data?.proposals],
  );

  const activePositions = useMemo(
    () => buildActivePositions(proposalsQuery.data?.proposals),
    [proposalsQuery.data?.proposals],
  );

  const totalBalance = assets.reduce((sum, asset) => sum + asset.value, 0);
  const allocated = assets.reduce((sum, asset) => sum + asset.allocatedValue, 0);
  const available = totalBalance - allocated;
  const allocatedPercent = totalBalance > 0 ? (allocated / totalBalance) * 100 : 0;

  const allocationRows = assets
    .filter((asset) => asset.allocatedValue > 0)
    .sort((a, b) => b.allocatedValue - a.allocatedValue)
    .slice(0, 4);

  const allocationPalette = ["#628aff", "#ffb786", "#e07312", "#343537"];

  useEffect(() => {
    if (signalsQuery.error) {
      console.error("Failed to fetch vault assets", signalsQuery.error);
    }
  }, [signalsQuery.error]);

  useEffect(() => {
    if (proposalsQuery.error) {
      console.error("Failed to fetch strategies for assets page", proposalsQuery.error);
    }
  }, [proposalsQuery.error]);

  const handleExportCSV = () => {
    const headers = [
      "Asset Name",
      "Network",
      "Balance",
      "Value",
      "Allocated",
      "Strategy",
      "Percentage",
    ];
    const rows = assets.map((asset) => [
      asset.name,
      asset.network,
      asset.balance.toFixed(2),
      asset.value.toFixed(2),
      asset.allocatedValue.toFixed(2),
      asset.strategy,
      `${asset.percentage.toFixed(2)}%`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "assets_export.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="text-on-surface antialiased min-h-screen flex bg-[#0A0B0D]">
      <Sidebar active="assets" variant="assets-view" />

      <div className="flex-1 ml-[220px] flex flex-col min-h-screen">
        <Topbar variant="assets" />

        <main className="flex-1 p-8 space-y-8 bg-[#0A0B0D]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#111214] p-6 rounded-[16px] border border-white/5 flex flex-col justify-between h-32 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div>
                <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
                  Total Balance
                </p>
                <h3 className="text-3xl font-bold text-white tabular-nums tracking-tight">
                  {signalsQuery.isLoading ? "Loading..." : formatCurrency(totalBalance)}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center text-[#85d996] text-xs font-medium bg-[#85d996]/10 px-1.5 py-0.5 rounded">
                  <span className="material-symbols-outlined text-[12px] mr-1">trending_up</span>
                  {`${allocatedPercent.toFixed(1)}%`}
                </span>
                <span className="text-xs text-secondary">allocated</span>
              </div>
            </div>

            <div className="bg-[#111214] p-6 rounded-[16px] border border-white/5 flex flex-col justify-between h-32">
              <div className="flex justify-between items-start mb-1">
                <p className="text-xs font-semibold text-secondary uppercase tracking-wider">Allocated</p>
                <span className="text-xs font-medium text-white bg-surface-container-high px-2 py-0.5 rounded-sm border border-white/5">
                  {`${allocatedPercent.toFixed(0)}%`}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white tabular-nums tracking-tight">
                {signalsQuery.isLoading ? "Loading..." : formatCurrency(allocated)}
              </h3>
              <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: `${allocatedPercent}%` }}></div>
              </div>
            </div>

            <div className="bg-[#111214] p-6 rounded-[16px] border border-white/5 flex flex-col justify-between h-32">
              <div>
                <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1">Available</p>
                <h3 className="text-2xl font-bold text-white tabular-nums tracking-tight">
                  {signalsQuery.isLoading ? "Loading..." : formatCurrency(Math.max(available, 0))}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-secondary">Idle in Vault</span>
              </div>
            </div>
          </div>

          <div className="bg-[#111214] rounded-[16px] border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Asset Breakdown</h3>
              <button
                onClick={handleExportCSV}
                className="text-xs font-medium text-primary hover:text-primary-fixed transition-colors active:scale-95"
              >
                Export CSV
              </button>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] font-semibold text-secondary uppercase tracking-widest border-b border-white/5">
                    <th className="px-5 py-3 font-medium">Token</th>
                    <th className="px-5 py-3 font-medium text-right">Balance</th>
                    <th className="px-5 py-3 font-medium text-right">USD Value</th>
                    <th className="px-5 py-3 font-medium">Allocated</th>
                    <th className="px-5 py-3 font-medium">% of Vault</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-on-surface divide-y divide-white/5">
                  {signalsQuery.isLoading && (
                    <tr>
                      <td colSpan={5} className="px-5 py-4 text-center text-secondary">
                        Loading assets...
                      </td>
                    </tr>
                  )}
                  {signalsQuery.isError && (
                    <tr>
                      <td colSpan={5} className="px-5 py-4 text-center text-secondary">
                        Unable to load assets.
                      </td>
                    </tr>
                  )}
                  {!signalsQuery.isLoading && !signalsQuery.isError && assets.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-4 text-center text-secondary">
                        No assets found for this wallet.
                      </td>
                    </tr>
                  )}
                  {!signalsQuery.isLoading &&
                    !signalsQuery.isError &&
                    assets.map((asset) => (
                      <tr
                        key={`${asset.network}-${asset.symbol}`}
                        className="hover:bg-white/5 transition-colors group border-b border-white/5 last:border-0"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center border ${asset.iconBg}`}
                            >
                              <span className={`${asset.iconColor} text-[10px] font-bold`}>{asset.symbol}</span>
                            </div>
                            <div>
                              <div className="font-medium text-white">{asset.name}</div>
                              <div className="text-[11px] text-secondary flex items-center gap-1 mt-0.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${asset.networkColor}`}></span>{" "}
                                {asset.network}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right tabular-nums font-medium">
                          {formatNumber(asset.balance)}
                        </td>
                        <td className="px-5 py-4 text-right tabular-nums text-white font-medium">
                          {formatCurrency(asset.value)}
                        </td>
                        <td className="px-5 py-4">
                          {asset.allocatedValue > 0 ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20 tabular-nums">
                                {formatNumber(asset.allocatedValue)}
                              </span>
                              <Link
                                className="text-[11px] text-secondary hover:text-white transition-colors flex items-center"
                                href="/strategy-market"
                              >
                                {asset.strategy}{" "}
                                <span className="material-symbols-outlined text-[14px] ml-0.5">open_in_new</span>
                              </Link>
                            </div>
                          ) : (
                            <span className="text-xs text-secondary">{asset.strategy}</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-1 bg-surface-container-highest rounded-full overflow-hidden">
                              <div className="bg-primary h-full" style={{ width: `${asset.percentage}%` }}></div>
                            </div>
                            <span className="text-xs tabular-nums text-secondary w-8 text-right">
                              {asset.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 bg-[#111214] rounded-[16px] border border-white/5 p-6 flex flex-col">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">
                Allocation Breakdown
              </h3>
              <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-12">
                <div
                  className="relative w-48 h-48 rounded-full border-[24px] border-[#111214] flex items-center justify-center"
                  style={{
                    borderTopColor: allocationPalette[0],
                    borderRightColor: allocationPalette[1],
                    borderBottomColor: allocationPalette[2],
                    borderLeftColor: allocationPalette[3],
                    transform: "rotate(-45deg)",
                  }}
                >
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-[#111214] m-[-1px]"
                    style={{ transform: "rotate(45deg)" }}
                  >
                    <span className="text-xs text-secondary uppercase tracking-widest mb-1">Allocated</span>
                    <span className="text-xl font-bold text-white tabular-nums">
                      {formatCurrency(allocated)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-4 w-full sm:w-auto">
                  {allocationRows.length === 0 ? (
                    <div className="text-sm text-secondary">No allocation data yet.</div>
                  ) : (
                    allocationRows.map((row, index) => (
                      <div key={row.symbol} className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: allocationPalette[index % allocationPalette.length] }}
                          ></div>
                          <span className="text-sm text-secondary">{row.strategy}</span>
                        </div>
                        <span className="text-sm font-medium text-white tabular-nums">
                          {((row.allocatedValue / Math.max(allocated, 1)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-[#111214] rounded-[16px] border border-white/5 flex flex-col">
              <div className="p-6 border-b border-white/5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Positions</h3>
              </div>
              <div className="flex-1 flex flex-col p-2">
                {proposalsQuery.isLoading && (
                  <div className="p-4 text-sm text-secondary">Loading active positions...</div>
                )}
                {proposalsQuery.isError && (
                  <div className="p-4 text-sm text-secondary">Unable to load active positions.</div>
                )}
                {!proposalsQuery.isLoading && !proposalsQuery.isError && activePositions.length === 0 && (
                  <div className="p-4 text-sm text-secondary">No active positions yet.</div>
                )}
                {!proposalsQuery.isLoading &&
                  !proposalsQuery.isError &&
                  activePositions.map((proposal) => (
                    <div
                      key={proposal.id}
                      className="p-4 hover:bg-white/5 rounded-lg transition-colors border-b border-white/5 last:border-0 flex justify-between items-center group"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-white">{proposal.title}</h4>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-sm bg-tertiary-container/20 text-tertiary-fixed-dim border border-tertiary-container/30">
                            {proposal.proposerAgentId}
                          </span>
                        </div>
                        <div className="text-[11px] text-secondary flex gap-3">
                          <span>{proposal.protocolPlan.protocol}</span>
                          <span>{proposal.protocolPlan.chain}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-[#85d996] tabular-nums">
                          {(proposal.expectedApyBps / 100).toFixed(1)}% APY
                        </div>
                        <div className="text-xs text-secondary tabular-nums mt-0.5">
                          {proposal.status}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
