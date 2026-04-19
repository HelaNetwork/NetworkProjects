"use client";

import { useState, useMemo, useEffect } from "react";
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt, useBalance } from "wagmi";
import { formatUnits, parseEther } from "viem";
import { useRouter } from "next/navigation";
import { Wallet, TrendingUp, Users, AlertTriangle, Layers, Sprout, ShieldCheck, Landmark } from "lucide-react";
import { NativePayStreamABI } from "@/abis/NativePayStream";
import { TaxVaultABI } from "@/abis/TaxVault";
import { PAYSTREAM_ADDRESS } from "@/config/wagmi";
import { NewStatsCard } from "./components/NewStatsCard";
import { NewTreasuryCard } from "./components/NewTreasuryCard";
import { NewCreateStream } from "./components/NewCreateStream";
import { NewBonusStream } from "./components/NewBonusStream";
import { ManageHR } from "./components/ManageHR";
import { StreamRow } from "./components/StreamRow";

export default function HRDashboard() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [streamsRefetchTrigger, setStreamsRefetchTrigger] = useState(0);
  const [yieldAmount, setYieldAmount] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // READS
  const { data: ownerAddress } = useReadContract({
    address: PAYSTREAM_ADDRESS,
    abi: NativePayStreamABI,
    functionName: "owner",
  });

  const { data: hrAddress } = useReadContract({
    address: PAYSTREAM_ADDRESS,
    abi: NativePayStreamABI,
    functionName: "deployer",
  });

  const { data: isHRFromContract } = useReadContract({
    address: PAYSTREAM_ADDRESS,
    abi: NativePayStreamABI,
    functionName: "isHR",
    args: address ? [address] : undefined,
  });

  const { data: treasuryBalance, refetch: refetchTreasury } = useReadContract({
    address: PAYSTREAM_ADDRESS,
    abi: NativePayStreamABI,
    functionName: "treasuryBalance",
  });

  const { data: nextStreamId, refetch: refetchNextId } = useReadContract({
    address: PAYSTREAM_ADDRESS,
    abi: NativePayStreamABI,
    functionName: "nextStreamId",
  });

  const { data: taxBps } = useReadContract({
    address: PAYSTREAM_ADDRESS,
    abi: NativePayStreamABI,
    functionName: "taxBps",
  });

  const { data: taxVaultAddress } = useReadContract({
    address: PAYSTREAM_ADDRESS,
    abi: NativePayStreamABI,
    functionName: "taxVault",
  });

  // Tax Vault Balance (only fetched if address exists and is not zero)
  const isValidVault = taxVaultAddress && taxVaultAddress !== "0x0000000000000000000000000000000000000000";
  const { data: taxVaultBalance, refetch: refetchTaxVault } = useBalance({
    address: isValidVault ? (taxVaultAddress as `0x${string}`) : undefined,
  });

  // Roles
  const isOwner = !!address && !!ownerAddress && address.toLowerCase() === ownerAddress.toLowerCase();
  const isHR = !!address && (
    isHRFromContract === true ||
    (isHRFromContract === undefined && hrAddress && address.toLowerCase() === hrAddress.toLowerCase())
  );

  // Access Control Redirect
  useEffect(() => {
    if (mounted && isConnected && !isHR && !isOwner && isHRFromContract !== undefined) {
      router.push("/");
    }
  }, [mounted, isConnected, isHR, isOwner, isHRFromContract, router]);

  const streamIdsForCount = useMemo(
    () => Array.from({ length: nextStreamId ? Number(nextStreamId) : 0 }, (_, i) => i),
    [nextStreamId]
  );

  const { data: streamsBatch } = useReadContracts({
    contracts: streamIdsForCount.map((id) => ({
      address: PAYSTREAM_ADDRESS,
      abi: NativePayStreamABI,
      functionName: "streams",
      args: [BigInt(id)],
    })),
  });

  const activeCount = useMemo(() => {
    if (!streamsBatch) return 0;
    const now = Date.now() / 1000;
    return streamsBatch.filter((r) => {
      if (r.status !== "success" || !r.result) return false;
      const s = r.result as any;
      const rate = BigInt(s[1] || s.ratePerSecond || 0);
      const startTime = BigInt(s[2] || s.startTime || 0);
      const totalDeposited = BigInt(s[4] || s.totalDeposited || 0);
      const active = s[5] ?? s.active;
      const pausedAt = BigInt(s[6] || s.pausedAt || 0);
      if (!active) return false;
      if (pausedAt > BigInt(0)) return false;
      const maxDuration = rate > BigInt(0) ? totalDeposited / rate : BigInt(0);
      const endTime = startTime + maxDuration;
      if (BigInt(Math.floor(now)) >= endTime) return false;
      return true;
    }).length;
  }, [streamsBatch]);

  // WRITES
  const { writeContract: writePause, data: pauseData, isPending: isPausePending } = useWriteContract();
  const { writeContract: writeResume, data: resumeData, isPending: isResumePending } = useWriteContract();
  const { writeContract: writeCancel, data: cancelData, isPending: isCancelPending } = useWriteContract();
  const { writeContract: writeAddYield, data: yieldData, isPending: isYieldPending } = useWriteContract();
  const { writeContract: writeWithdraw, data: withdrawData, isPending: isWithdrawPending } = useWriteContract();
  const { writeContract: writeTaxWithdraw, data: taxWithdrawData, isPending: isTaxWithdrawPending } = useWriteContract();

  const { isLoading: isPauseConfirming, isSuccess: isPauseSuccess } = useWaitForTransactionReceipt({ hash: pauseData });
  const { isLoading: isResumeConfirming, isSuccess: isResumeSuccess } = useWaitForTransactionReceipt({ hash: resumeData });
  const { isLoading: isCancelConfirming, isSuccess: isCancelSuccess } = useWaitForTransactionReceipt({ hash: cancelData });
  const { isLoading: isYieldConfirming, isSuccess: isYieldSuccess } = useWaitForTransactionReceipt({ hash: yieldData });
  const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({ hash: withdrawData });
  const { isLoading: isTaxWithdrawConfirming, isSuccess: isTaxWithdrawSuccess } = useWaitForTransactionReceipt({ hash: taxWithdrawData });

  useEffect(() => {
    if (isPauseSuccess || isResumeSuccess || isCancelSuccess || isYieldSuccess || isWithdrawSuccess) {
      setStreamsRefetchTrigger(prev => prev + 1);
      refetchTreasury();
      setYieldAmount("");
      setToast("Transaction confirmed.");
      setTimeout(() => setToast(""), 3000);
    }
  }, [isPauseSuccess, isResumeSuccess, isCancelSuccess, isYieldSuccess, isWithdrawSuccess, refetchTreasury]);

  useEffect(() => {
    if (isTaxWithdrawSuccess) {
      refetchTaxVault();
      setToast("Tax funds withdrawn.");
      setTimeout(() => setToast(""), 3000);
    }
  }, [isTaxWithdrawSuccess, refetchTaxVault]);


  const handleRefetch = () => {
    setStreamsRefetchTrigger(prev => prev + 1);
    refetchNextId();
    refetchTreasury();
    refetchTaxVault();
  };

  const handleAddYield = () => {
    if (!yieldAmount) return;
    writeAddYield({
      address: PAYSTREAM_ADDRESS,
      abi: NativePayStreamABI,
      functionName: "addYield",
      value: parseEther(yieldAmount),
    });
  };

  const handleWithdrawTreasury = async () => {
    if (!treasuryBalance || treasuryBalance === BigInt(0)) return;
    writeWithdraw({
      address: PAYSTREAM_ADDRESS,
      abi: NativePayStreamABI,
      functionName: "withdrawTreasury",
      args: [treasuryBalance],
    });
  };

  const handleWithdrawTax = () => {
    if (!isValidVault || !taxVaultBalance || taxVaultBalance.value === BigInt(0) || !address) return;
    writeTaxWithdraw({
      address: taxVaultAddress as `0x${string}`,
      abi: TaxVaultABI,
      functionName: "withdrawNative",
      args: [address, taxVaultBalance.value],
    });
  };

  // Hydration Fix
  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0B0F19] text-white">
        {/* Render simple loading state on server/initial client to match */}
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  // Access check post-mount
  if (isConnected && !isHR && !isOwner) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0B0F19] text-white">
        <p>Access Denied. Checking permissions...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white selection:bg-indigo-500/30">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10 z-10">
        {/* Header */}
        <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
              {isOwner && <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">Owner</span>}
            </div>
            <p className="text-zinc-400">Manage treasury, streams, and tax configuration.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-emerald-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              HeLa Testnet
            </div>
          </div>
        </header>

        {toast && (
          <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
            {toast}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          <NewStatsCard
            title="Total Treasury"
            value={`${treasuryBalance ? formatUnits(treasuryBalance as bigint, 18) : "0"} HLUSD`}
            icon={Wallet}
            gradient="bg-indigo-500"
          />
          <NewStatsCard
            title="Active Streams"
            value={String(activeCount)}
            icon={TrendingUp}
            gradient="bg-emerald-500"
          />
          <NewStatsCard
            title="Total Streams"
            value={String(nextStreamId ? Number(nextStreamId) : 0)}
            icon={Layers}
            gradient="bg-blue-500"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3 mb-10">
          {/* Left Column: Actions */}
          <div className="space-y-6 lg:col-span-2">
            <div className="grid gap-6 md:grid-cols-2">
              <NewTreasuryCard
                treasuryBalance={treasuryBalance ? formatUnits(treasuryBalance as bigint, 18) : "0"}
                symbol="HLUSD"
                onSuccess={handleRefetch}
              />

              {/* Read-Only Tax Vault Display */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-lg bg-purple-500/20 p-2 text-purple-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h2 className="font-semibold text-white">Tax Configuration</h2>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Vault Address</span>
                    <span className="font-mono text-zinc-300">
                      {taxVaultAddress ? `${taxVaultAddress.slice(0, 6)}...${taxVaultAddress.slice(-4)}` : "Not Configured"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Tax Rate</span>
                    <span className="font-mono text-zinc-300">
                      {taxBps ? (Number(taxBps) / 100).toFixed(2) : "0.00"}%
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 mt-2">
                    Configured via environment variables.
                  </p>
                </div>
              </div>
            </div>

            {/* Stream List */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <h2 className="font-semibold text-white">Active Streams</h2>
                <button onClick={handleRefetch} className="text-xs text-zinc-400 hover:text-white transition-colors">
                  Refresh
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/5 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                      <th className="px-6 py-3">ID</th>
                      <th className="px-6 py-3">Employee</th>
                      <th className="px-6 py-3">Total</th>
                      <th className="px-6 py-3">Rate</th>
                      <th className="px-6 py-3">Accrued</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {streamIdsForCount.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-zinc-500 text-sm">
                          No streams created yet.
                        </td>
                      </tr>
                    ) : (
                      streamIdsForCount.map((id) => (
                        <StreamRow
                          key={id}
                          streamId={id}
                          onPause={(id) => writePause({ address: PAYSTREAM_ADDRESS, abi: NativePayStreamABI, functionName: 'pauseStream', args: [BigInt(id)] })}
                          onResume={(id) => writeResume({ address: PAYSTREAM_ADDRESS, abi: NativePayStreamABI, functionName: 'resumeStream', args: [BigInt(id)] })}
                          onCancel={(id) => writeCancel({ address: PAYSTREAM_ADDRESS, abi: NativePayStreamABI, functionName: 'cancelStream', args: [BigInt(id)] })}
                          isPausePending={isPausePending || isPauseConfirming}
                          isResumePending={isResumePending || isResumeConfirming}
                          isCancelPending={isCancelPending || isCancelConfirming}
                          index={id}
                          refetchTrigger={streamsRefetchTrigger}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <NewCreateStream onSuccess={handleRefetch} />
            <NewBonusStream onSuccess={handleRefetch} />
          </div>
        </div>

        {/* OWNER ZONE - Bottom of Page */}
        {isOwner && (
          <div className="mt-16 border-t border-emerald-500/20 pt-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <h2 className="text-xl font-bold text-white">Owner Zone</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Add Yield */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-lg bg-emerald-500/20 p-2 text-emerald-400">
                    <Sprout className="h-5 w-5" />
                  </div>
                  <h2 className="font-semibold text-white">Inject Yield</h2>
                </div>
                <p className="text-sm text-emerald-200/70 mb-4">
                  Add extra funds to the treasury to simulate yield or top up the protocol.
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Amount (HLUSD)"
                    value={yieldAmount}
                    onChange={(e) => setYieldAmount(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-emerald-500/50 focus:outline-none"
                  />
                  <button
                    onClick={handleAddYield}
                    disabled={!yieldAmount || isYieldPending || isYieldConfirming}
                    className="whitespace-nowrap rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {isYieldPending ? "Adding..." : "Add Yield"}
                  </button>
                </div>
              </div>

              {/* Tax Vault Management (New) */}
              <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-lg bg-purple-500/20 p-2 text-purple-400">
                    <Landmark className="h-5 w-5" />
                  </div>
                  <h2 className="font-semibold text-white">Tax Vault Funds</h2>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-zinc-400">Current Balance</p>
                  <p className="text-2xl font-bold text-white">
                    {taxVaultBalance ? formatUnits(taxVaultBalance.value, 18) : "0"} <span className="text-sm font-normal text-zinc-500">HLUSD</span>
                  </p>
                </div>
                <button
                  onClick={handleWithdrawTax}
                  disabled={!taxVaultBalance || taxVaultBalance.value === BigInt(0) || isTaxWithdrawPending || isTaxWithdrawConfirming}
                  className="w-full rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-50"
                >
                  {isTaxWithdrawPending ? "Withdrawing..." : "Withdraw Tax to Wallet"}
                </button>
              </div>

              {/* Withdraw Treasury */}
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-lg bg-amber-500/20 p-2 text-amber-400">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <h2 className="font-semibold text-white">Withdraw Treasury</h2>
                </div>
                <p className="text-sm text-amber-200/70 mb-4">
                  Drain the entire treasury balance to your wallet. Use with caution.
                </p>
                <button
                  onClick={handleWithdrawTreasury}
                  disabled={isWithdrawPending || isWithdrawConfirming || !treasuryBalance}
                  className="w-full rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-50"
                >
                  {isWithdrawPending ? "Withdrawing..." : `Withdraw ${treasuryBalance ? formatUnits(treasuryBalance as bigint, 18) : "0"} HLUSD`}
                </button>
              </div>

              {/* Manage HR */}
              <div className="md:col-span-2">
                <ManageHR isOwner={true} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
