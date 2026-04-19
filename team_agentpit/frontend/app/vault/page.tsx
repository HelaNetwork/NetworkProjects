"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useWallet } from "@/context/WalletContext";
import { api, type ProposalResponse, type VaultBalanceResponse, type VaultSignalResponse } from "@/lib/api";
import { resolveVaultAddress } from "../../lib/vault";

// Base Sepolia USDC — used to query the ERC20 vault balance with proper decimals
const USDC_ADDRESS =
  process.env.NEXT_PUBLIC_USDC_ADDRESS ?? "0xba50Cd2A20f6DA35D788639E581bca8d0B5d4D5f";

type PendingApproval = {
  id: string;
  name: string;
  agent: string;
  apy: string;
};

type TransactionRow = {
  id: string;
  type: string;
  asset: string;
  amount: string;
  amountClassName: string;
  status: string;
  statusClassName: string;
  date: string;
};

function toNumber(value: string | number | undefined | null) {
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

/**
 * Safely parse a balance that may be either:
 *  - A raw on-chain atomic integer string (e.g. "101000000000000000" for 0.101 WETH)
 *  - An already human-readable decimal string (e.g. "0.101")
 * Uses BigInt arithmetic to avoid floating-point overflow on large wei values.
 */
function parseContractBalance(raw: string | undefined | null, decimals: number): number {
  if (!raw || raw === "0") return 0;
  // Already human-readable — has a decimal point
  if (raw.includes(".")) {
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : 0;
  }
  // Raw integer string — divide by 10^decimals using BigInt to avoid overflow
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

function formatCurrency(value: number) {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function mapStatusBadge(status: VaultSignalResponse["status"]) {
  if (status === "ready-for-strategy") {
    return {
      text: "Confirmed",
      className: "bg-[#4ade80]/10 text-[#4ade80]",
      type: "Strategy Allocation",
    };
  }
  if (status === "vault-funded") {
    return {
      text: "Pending",
      className: "bg-tertiary/10 text-tertiary",
      type: "Deposit",
    };
  }
  return {
    text: "Pending",
    className: "bg-tertiary/10 text-tertiary",
    type: "Vault Created",
  };
}

function buildPendingApprovals(proposals: ProposalResponse[] | undefined): PendingApproval[] {
  if (!proposals?.length) {
    return [];
  }

  return proposals
    .filter((proposal) => proposal.status === "pending")
    .map((proposal) => ({
      id: proposal.id,
      name: proposal.title,
      agent: proposal.proposerAgentId,
      apy: `${(proposal.expectedApyBps / 100).toFixed(1)}% APY`,
    }));
}

function buildTransactionRows(signals: VaultSignalResponse[] | undefined): TransactionRow[] {
  if (!signals?.length) {
    return [];
  }

  return [...signals]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((signal) => {
      const amount = parseTokenAmount(signal.fundedAmount, signal.assetSymbol === "WETH" ? 18 : 6);
      const badge = mapStatusBadge(signal.status);
      return {
        id: signal.id,
        type: badge.type,
        asset: signal.assetSymbol || "-",
        amount: `${amount >= 0 ? "+" : ""}${amount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        amountClassName: amount >= 0 ? "text-white" : "text-error",
        status: badge.text,
        statusClassName: badge.className,
        date: formatDate(signal.createdAt),
      };
    });
}

export default function VaultPage() {
  const { address, isConnected } = useWallet();
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("1000.00");
  const [balanceDelta, setBalanceDelta] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState({
    symbol: "USDC",
    color: "bg-primary/20",
    textClass: "text-primary",
  });

  const tokens = [
    { symbol: "USDC", color: "bg-primary/20", textClass: "text-primary" },
    { symbol: "ETH", color: "bg-[#627eea]/20", textClass: "text-[#627eea]" },
    { symbol: "DAI", color: "bg-[#f4b731]/20", textClass: "text-[#f4b731]" },
  ];

  const dropdownRef = useRef<HTMLDivElement>(null);

  const vaultBalanceQuery = useQuery({
    queryKey: ["vault-balance", address, USDC_ADDRESS],
    queryFn: async () => {
      const vaultAddress = await resolveVaultAddress(address as string);
      return vaultAddress
        ? api.getVaultBalance(vaultAddress, USDC_ADDRESS)
        : ({ vault: address as string, balance: "0", assetAddress: USDC_ADDRESS } as VaultBalanceResponse);
    },
    enabled: isConnected && !!address,
    staleTime: 30_000,
  });

  const vaultSignalsQuery = useQuery({
    queryKey: ["vault-signals", address],
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
    queryKey: ["proposals", address],
    queryFn: async () => {
      const vaultAddress = await resolveVaultAddress(address as string);
      return vaultAddress ? api.getProposals(vaultAddress) : { proposals: [] };
    },
    enabled: isConnected && !!address,
    staleTime: 30_000,
  });

  const pendingApprovals = useMemo(
    () => buildPendingApprovals(proposalsQuery.data?.proposals),
    [proposalsQuery.data?.proposals],
  );

  const transactionRows = useMemo(
    () => buildTransactionRows(vaultSignalsQuery.data),
    [vaultSignalsQuery.data],
  );

  const allocated = useMemo(() => {
    if (!vaultSignalsQuery.data?.length) {
      return 0;
    }
    return vaultSignalsQuery.data
      .filter((signal) => signal.status === "ready-for-strategy")
      .reduce((sum, signal) => sum + parseTokenAmount(signal.fundedAmount, signal.assetSymbol === "WETH" ? 18 : 6), 0);
  }, [vaultSignalsQuery.data]);

  // decimals: 6 for ERC20 (USDC), 18 for native WETH from VaultFactory
  const balanceDecimals = vaultBalanceQuery.data?.decimals ?? (vaultBalanceQuery.data?.assetAddress ? 6 : 18);
  const baseBalance = parseContractBalance(vaultBalanceQuery.data?.balance, balanceDecimals);
  const balance = baseBalance + balanceDelta;

  const allocatedPercent = balance > 0 ? Math.min((allocated / balance) * 100, 100) : 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (vaultBalanceQuery.error) {
      console.error("Failed to fetch vault balance", vaultBalanceQuery.error);
    }
  }, [vaultBalanceQuery.error]);

  useEffect(() => {
    if (vaultSignalsQuery.error) {
      console.error("Failed to fetch vault signals", vaultSignalsQuery.error);
    }
  }, [vaultSignalsQuery.error]);

  useEffect(() => {
    if (proposalsQuery.error) {
      console.error("Failed to fetch proposals", proposalsQuery.error);
    }
  }, [proposalsQuery.error]);

  const handleAction = () => {
    setError("");
    setSuccess("");
    const numAmount = parseFloat(amount);

    if (!amount || Number.isNaN(numAmount)) {
      setError("Please enter a valid amount.");
      return;
    }

    if (numAmount <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    if (mode === "withdraw" && numAmount > balance) {
      setError("Insufficient balance.");
      return;
    }

    if (mode === "deposit") {
      setBalanceDelta((prev) => prev + numAmount);
      setSuccess(`Successfully deposited $${numAmount.toFixed(2)} ${selectedToken.symbol}`);
    } else {
      setBalanceDelta((prev) => prev - numAmount);
      setSuccess(`Successfully withdrew $${numAmount.toFixed(2)} ${selectedToken.symbol}`);
    }
  };

  const handleApprove = (id: string) => {
    console.log(`Approved strategy ${id}`);
  };

  const handleReject = (id: string) => {
    console.log(`Rejected strategy ${id}`);
  };

  return (
    <div className="bg-surface-container-lowest text-on-surface font-body antialiased min-h-screen flex">
      <Sidebar active="vault" variant="default" />
      <main className="flex-1 ml-0 md:ml-[220px] flex flex-col min-h-screen">
        <Topbar variant="vault" />
        <div className="p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface p-6 rounded-[16px] flex flex-col justify-between border-l-2 border-primary-container">
              <span className="text-secondary text-sm font-medium mb-4">Total Balance</span>
              <div className="text-[28px] font-bold text-white tabular-nums tracking-tight">
                {vaultBalanceQuery.isLoading ? "Loading..." : formatCurrency(balance)}
              </div>
            </div>
            <div className="bg-surface p-6 rounded-[16px] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute right-0 bottom-0 w-32 h-32 bg-primary/5 rounded-tl-full -mr-8 -mb-8"></div>
              <span className="text-secondary text-sm font-medium mb-4 relative z-10">Allocated</span>
              <div className="flex items-baseline gap-3 relative z-10">
                <div className="text-[28px] font-bold text-white tabular-nums tracking-tight">
                  {vaultSignalsQuery.isLoading ? "Loading..." : formatCurrency(allocated)}
                </div>
                <span className="text-xs text-secondary">{allocatedPercent.toFixed(1)}% of vault</span>
              </div>
            </div>
            <div className="bg-surface p-6 rounded-[16px] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-secondary text-sm font-medium">Pending Approvals</span>
                <div
                  className={`w-2.5 h-2.5 rounded-full bg-tertiary ${
                    pendingApprovals.length > 0 ? "animate-pulse" : ""
                  }`}
                ></div>
              </div>
              <div className="text-[28px] font-bold text-white tabular-nums tracking-tight">
                {proposalsQuery.isLoading ? "..." : pendingApprovals.length}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 bg-surface rounded-[16px] p-6 flex flex-col gap-6">
              <div className="flex p-1 bg-surface-container-low rounded-lg">
                <button
                  onClick={() => {
                    setMode("deposit");
                    setError("");
                    setSuccess("");
                  }}
                  className={`flex-1 py-2 text-sm font-medium transition-all ${
                    mode === "deposit"
                      ? "text-white bg-surface-container rounded-md shadow-sm"
                      : "text-secondary hover:text-white"
                  }`}
                >
                  Deposit
                </button>
                <button
                  onClick={() => {
                    setMode("withdraw");
                    setError("");
                    setSuccess("");
                  }}
                  className={`flex-1 py-2 text-sm font-medium transition-all ${
                    mode === "withdraw"
                      ? "text-white bg-surface-container rounded-md shadow-sm"
                      : "text-secondary hover:text-white"
                  }`}
                >
                  Withdraw
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 bg-surface-container-low border border-[rgba(67,70,84,0.15)] rounded-lg px-4 py-3 hover:bg-surface-container transition-colors active:scale-95"
                    >
                      <div
                        className={`w-6 h-6 rounded-full ${selectedToken.color} flex items-center justify-center text-[10px] font-bold ${selectedToken.textClass}`}
                      >
                        {selectedToken.symbol}
                      </div>
                      <span className="font-medium text-sm w-8 text-left">{selectedToken.symbol}</span>
                      <span className="material-symbols-outlined text-[16px] text-secondary">expand_more</span>
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-full min-w-[120px] bg-surface-container-highest border border-[rgba(67,70,84,0.15)] rounded-lg overflow-hidden z-50 shadow-lg">
                        {tokens.map((token) => (
                          <button
                            key={token.symbol}
                            onClick={() => {
                              setSelectedToken(token);
                              setIsDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-3 hover:bg-surface-container transition-colors text-left"
                          >
                            <div
                              className={`w-6 h-6 rounded-full ${token.color} flex items-center justify-center text-[10px] font-bold ${token.textClass}`}
                            >
                              {token.symbol}
                            </div>
                            <span className="font-medium text-sm text-white">{token.symbol}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 relative">
                    <input
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setError("");
                        setSuccess("");
                      }}
                      className="w-full bg-surface-container-lowest border border-[rgba(67,70,84,0.15)] rounded-lg px-4 py-3 text-right text-white font-medium tabular-nums focus:border-primary/100 focus:ring-0 transition-colors"
                      placeholder="0.00"
                      type="text"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-secondary">
                    Vault Balance:{" "}
                    <span className="text-white tabular-nums">
                      {vaultBalanceQuery.isLoading ? "Loading..." : formatCurrency(balance)}
                    </span>
                  </span>
                  <button
                    onClick={() => {
                      setAmount(balance.toString());
                      setError("");
                      setSuccess("");
                    }}
                    className="text-primary hover:text-primary-container font-medium transition-colors active:scale-95"
                  >
                    Max
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-auto">
                {error && <p className="text-error text-xs text-center">{error}</p>}
                {success && <p className="text-[#4ade80] text-xs text-center">{success}</p>}
                <button
                  onClick={handleAction}
                  className="w-full bg-primary text-on-primary font-bold py-3.5 rounded-[12px] hover:bg-primary-fixed-dim transition-colors active:scale-[0.98]"
                >
                  {mode === "deposit" ? "Deposit" : "Withdraw"}
                </button>
              </div>
            </div>

            <div className="lg:col-span-8 bg-surface rounded-[16px] p-6 flex flex-col">
              <h3 className="text-sm font-medium text-secondary mb-6 tracking-wide">PENDING APPROVALS</h3>
              {proposalsQuery.isLoading ? (
                <div className="text-sm text-secondary flex-1 flex items-center justify-center min-h-[150px]">
                  Loading pending approvals...
                </div>
              ) : proposalsQuery.isError ? (
                <div className="text-sm text-secondary flex-1 flex items-center justify-center min-h-[150px]">
                  Unable to load pending approvals.
                </div>
              ) : pendingApprovals.length === 0 ? (
                <div className="text-sm text-secondary flex-1 flex items-center justify-center min-h-[150px]">
                  No pending approvals.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {pendingApprovals.map((approval) => (
                    <div
                      key={approval.id}
                      className="bg-surface-container-low hover:bg-surface-container p-4 rounded-[12px] flex items-center justify-between transition-colors border-l-2 border-tertiary"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-white">{approval.name}</span>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-secondary">{approval.agent}</span>
                          <span className="text-[#4ade80] font-medium tabular-nums">{approval.apy}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(approval.id)}
                          className="px-4 py-1.5 border border-error/30 text-error rounded-md text-xs font-medium hover:bg-error/10 transition-colors active:scale-95"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(approval.id)}
                          className="px-4 py-1.5 border border-[#4ade80]/30 text-[#4ade80] rounded-md text-xs font-medium hover:bg-[#4ade80]/10 transition-colors active:scale-95"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-surface rounded-[16px] p-6">
            <h3 className="text-sm font-medium text-secondary mb-6 tracking-wide">TRANSACTION HISTORY</h3>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] uppercase tracking-[0.05em] text-secondary border-b border-[#1A1C1F]">
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Asset</th>
                    <th className="pb-3 font-medium text-right">Amount</th>
                    <th className="pb-3 font-medium text-center">Status</th>
                    <th className="pb-3 font-medium text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {vaultSignalsQuery.isLoading && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-secondary">
                        Loading transactions...
                      </td>
                    </tr>
                  )}
                  {vaultSignalsQuery.isError && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-secondary">
                        Unable to load transactions.
                      </td>
                    </tr>
                  )}
                  {!vaultSignalsQuery.isLoading &&
                    !vaultSignalsQuery.isError &&
                    transactionRows.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-secondary">
                          No transaction activity yet.
                        </td>
                      </tr>
                    )}
                  {!vaultSignalsQuery.isLoading &&
                    !vaultSignalsQuery.isError &&
                    transactionRows.map((row) => (
                      <tr key={row.id} className="hover:bg-surface-container-low transition-colors group">
                        <td className="py-4 font-medium text-white">{row.type}</td>
                        <td className="py-4 text-secondary">{row.asset}</td>
                        <td className={`py-4 text-right tabular-nums ${row.amountClassName}`}>{row.amount}</td>
                        <td className="py-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${row.statusClassName}`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="py-4 text-right text-secondary tabular-nums">{row.date}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
