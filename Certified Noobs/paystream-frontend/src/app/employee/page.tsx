"use client";

import { useEffect, useState, useMemo } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import { NativePayStreamABI } from "@/abis/NativePayStream";
import { PAYSTREAM_ADDRESS } from "@/config/wagmi";
import { EmployeeStreamCard } from "./components/EmployeeStreamCard";
import { Wallet, ArrowRightLeft, Landmark, CheckCircle2, Globe } from "lucide-react";

// Currencies
const RATES: Record<string, number> = {
  USD: 1.02,
  EUR: 0.95,
  INR: 88.5,
  JPY: 155.0,
  GBP: 0.82,
  CAD: 1.38,
  AUD: 1.55,
  CHF: 0.90,
  CNY: 7.35,
  SGD: 1.35,
};

export default function EmployeeDashboard() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [rampAmount, setRampAmount] = useState<string>("");
  const [isRamping, setIsRamping] = useState(false);
  const [rampSuccess, setRampSuccess] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<keyof typeof RATES>("INR");
  const [now, setNow] = useState(0);

  useEffect(() => {
    setMounted(true);
    setNow(Date.now() / 1000);
    const interval = setInterval(() => setNow(Date.now() / 1000), 100); // 10fps
    return () => clearInterval(interval);
  }, []);

  const { data: streamIds } = useReadContract({
    address: PAYSTREAM_ADDRESS,
    abi: NativePayStreamABI,
    functionName: "getStreamIdsForEmployee",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    }
  });

  const ids = streamIds ? (streamIds as bigint[]).map(id => BigInt(id)) : [];

  const { data: streamsBatch } = useReadContracts({
    contracts: ids.map(id => ({
      address: PAYSTREAM_ADDRESS,
      abi: NativePayStreamABI,
      functionName: 'streams',
      args: [id]
    })),
    query: { enabled: ids.length > 0 }
  });

  // Calculate Total Claimable LIVE to match the cards
  const totalClaimable = useMemo(() => {
    if (!streamsBatch || ids.length === 0) return BigInt(0);

    let total = BigInt(0);
    const effectiveNow = BigInt(Math.floor(now));

    streamsBatch.forEach((r) => {
      if (r.status !== 'success' || !r.result) return;
      const s = r.result as any;

      const rate = BigInt(s[1] || s.ratePerSecond || 0);
      const startTime = BigInt(s[2] || s.startTime || 0);
      const lastClaimTime = BigInt(s[3] || s.lastClaimTime || 0);
      const totalDeposited = BigInt(s[4] || s.totalDeposited || 0);
      const active = s[5] ?? s.active;
      const isEndless = s[6] ?? s.isEndless;
      const pausedAt = BigInt(s[7] || s.pausedAt || 0);
      const totalBonus = BigInt(s[8] || s.totalBonusAdded || 0);
      const bonusWithdrawn = BigInt(s[9] || s.bonusWithdrawn || 0);

      let currentTime = active ? effectiveNow : pausedAt;
      const maxDuration = !isEndless && rate > BigInt(0) ? totalDeposited / rate : BigInt(0);
      const endTime = startTime + maxDuration;

      if (!isEndless && currentTime > endTime) currentTime = endTime;

      // Same logic as EmployeeStreamCard/Contract
      if (currentTime > lastClaimTime) {
        const elapsed = currentTime - lastClaimTime;
        const baseAccrued = elapsed * rate;
        const bonusRemaining = totalBonus > bonusWithdrawn ? totalBonus - bonusWithdrawn : BigInt(0);
        total += (baseAccrued + bonusRemaining);
      } else {
        const bonusRemaining = totalBonus > bonusWithdrawn ? totalBonus - bonusWithdrawn : BigInt(0);
        total += bonusRemaining;
      }
    });

    return total;
  }, [streamsBatch, now, ids.length]);


  const totalAccruedFormatted = formatUnits(totalClaimable, 18);
  const totalAccruedVal = parseFloat(totalAccruedFormatted);

  // Total Unclaimed in Selected Currency
  const unclaimedValue = (totalAccruedVal * RATES[selectedCurrency]).toFixed(2);

  const handleRamp = () => {
    if (!rampAmount) return;
    setIsRamping(true);
    // Simulate API call
    setTimeout(() => {
      setIsRamping(false);
      setRampSuccess(true);
      setTimeout(() => setRampSuccess(false), 3000);
      setRampAmount("");
    }, 2000);
  };

  const rampReceive = rampAmount ? (parseFloat(rampAmount) * RATES[selectedCurrency]).toFixed(2) : "0.00";

  // HYDRATION FIX: Only render wallet-dependent UI after mount
  if (!mounted) return <div className="min-h-screen bg-[#0B0F19]" />;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white selection:bg-emerald-500/30 font-sans">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 z-10">
        <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">My Streams</h1>
            <p className="text-zinc-400">Manage your salary streams and withdrawals.</p>
          </div>

          <div className="flex gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-md">
              <div className="flex items-center justify-between gap-4 mb-2">
                <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Total Unclaimed</p>
                <div className="flex items-center gap-1 bg-black/20 rounded-lg px-2 py-0.5">
                  <Globe className="w-3 h-3 text-zinc-500" />
                  <select
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value as any)}
                    className="bg-transparent text-xs text-zinc-300 focus:outline-none"
                  >
                    {Object.keys(RATES).map(currency => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white tabular-nums">{totalAccruedVal.toFixed(6)} <span className="text-sm font-medium text-zinc-500">HLUSD</span></span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400">
                <ArrowRightLeft className="w-3 h-3" />
                ≈ {unclaimedValue} {selectedCurrency}
              </div>
            </div>
          </div>
        </header>

        {!isConnected ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 py-24 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Wallet className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-lg font-medium text-white">Wallet Not Connected</h3>
            <p className="text-zinc-500 mt-2 max-w-sm mx-auto">Connect your wallet to view your salary streams.</p>
          </div>
        ) : ids.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 py-24 text-center">
            <h3 className="text-lg font-medium text-white">No Active Streams</h3>
            <p className="text-zinc-500 mt-2">Ask your HR manager to create a salary stream for you.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ids.map(id => (
              <EmployeeStreamCard key={id.toString()} streamId={id} />
            ))}
          </div>
        )}

        {/* Mock Off-Ramp Section */}
        <div className="mt-12 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
            <Landmark className="w-32 h-32 text-white rotating-slow" />
          </div>
          <div className="relative z-10 max-w-xl">
            <h2 className="text-2xl font-bold text-white mb-2">Instant Fiat Off-Ramp</h2>
            <p className="text-zinc-400 mb-6">Convert your HLUSD earnings directly to your local bank account via our partner Transak.</p>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <label className="absolute -top-2 left-3 bg-[#0B0F19] px-1 text-xs text-zinc-500">You Send</label>
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-1">
                  <input
                    type="number"
                    value={rampAmount}
                    onChange={(e) => setRampAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-transparent p-2 text-lg text-white font-mono focus:outline-none"
                  />
                  <span className="text-zinc-400 text-sm font-medium bg-white/5 px-2 py-1 rounded mr-1">HLUSD</span>
                </div>
              </div>
              <div className="flex items-center justify-center text-zinc-500">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div className="relative flex-1">
                <label className="absolute -top-2 left-3 bg-[#0B0F19] px-1 text-xs text-zinc-500">You Receive</label>
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-3">
                  <span className="text-white font-mono text-lg ml-2">{rampReceive}</span>
                  <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value as any)}
                      className="bg-transparent text-zinc-400 text-sm font-medium focus:outline-none"
                    >
                      {Object.keys(RATES).map(currency => (
                        <option key={currency} value={currency}>{currency}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleRamp}
              disabled={!rampAmount || isRamping}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isRamping ? "Processing..." : rampSuccess ? "Transfer Initiated!" : "Simulate Withdrawal to Bank"}
              {rampSuccess && <CheckCircle2 className="w-4 h-4 text-green-600" />}
            </button>
            <p className="mt-3 text-[10px] text-zinc-600 uppercase tracking-widest font-semibold flex items-center gap-2">
              POWERED BY TRANSAK (SIMULATION)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
