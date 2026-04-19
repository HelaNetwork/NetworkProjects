"use client";

import { motion } from "framer-motion";
import { Wallet, Plus } from "lucide-react";

interface TreasuryCardProps {
  treasuryBalance: string;
  depositAmount: string;
  onDepositAmountChange: (v: string) => void;
  onDeposit: () => void;
  onAddYield?: (amount: string) => void;
  simulatedYieldAmount?: string;
  onSimulatedYieldChange?: (v: string) => void;
  isDepositPending?: boolean;
  displayYield?: string;
}

const QUICK_AMOUNTS = [100, 500, 1000];

export function TreasuryCard({
  treasuryBalance,
  depositAmount,
  onDepositAmountChange,
  onDeposit,
  onAddYield,
  simulatedYieldAmount = "",
  onSimulatedYieldChange,
  isDepositPending,
  displayYield = "0",
}: TreasuryCardProps) {
  const handleQuick = (n: number) => {
    const next = (parseFloat(depositAmount) || 0) + n;
    onDepositAmountChange(next.toString());
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
    >
      <div className="flex items-center gap-2 text-zinc-400">
        <Wallet className="h-5 w-5 text-emerald-400/80" />
        <h2 className="text-lg font-semibold text-white">Treasury</h2>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-white">
        {treasuryBalance || "0"} <span className="text-lg font-medium text-zinc-500">HLUSD</span>
      </p>
      {parseFloat(displayYield) > 0 && (
        <p className="mt-1 text-sm text-emerald-400/90">+{displayYield} yield (simulated)</p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {QUICK_AMOUNTS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => handleQuick(n)}
            className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-zinc-300 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-white transition"
          >
            <Plus className="h-4 w-4" /> +{n}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Amount (HLUSD)"
          value={depositAmount}
          onChange={(e) => onDepositAmountChange(e.target.value)}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
        />
        <button
          type="button"
          onClick={onDeposit}
          disabled={isDepositPending || !depositAmount}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white hover:bg-emerald-400 disabled:opacity-50 transition"
        >
          {isDepositPending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            "Deposit"
          )}
        </button>
      </div>
      {onAddYield && onSimulatedYieldChange && (
        <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Simulated yield (HLUSD)"
            value={simulatedYieldAmount}
            onChange={(e) => onSimulatedYieldChange(e.target.value)}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-zinc-500"
          />
          <button
            type="button"
            onClick={() => onAddYield(simulatedYieldAmount)}
            disabled={!simulatedYieldAmount}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/10"
          >
            Add yield
          </button>
        </div>
      )}
    </motion.section>
  );
}
