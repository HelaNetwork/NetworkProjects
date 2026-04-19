"use client";

import { motion } from "framer-motion";
import { Wallet, Plus } from "lucide-react";

const SYMBOL = "HEA";
const QUICK_AMOUNTS = ["0.1", "0.5", "1", "5"];

type NativeTreasuryCardProps = {
  treasuryBalance: string;
  depositAmount: string;
  onDepositAmountChange: (v: string) => void;
  onDeposit: () => void;
  isDepositPending?: boolean;
};

export function NativeTreasuryCard({
  treasuryBalance,
  depositAmount,
  onDepositAmountChange,
  onDeposit,
  isDepositPending,
}: NativeTreasuryCardProps) {
  const handleQuick = (val: string) => {
    const next = (parseFloat(depositAmount) || 0) + parseFloat(val);
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
        <h2 className="text-lg font-semibold text-white">Treasury ({SYMBOL})</h2>
      </div>
      <p className="mt-2 text-xs text-zinc-500">Deposits fund the treasury. Streams are created from this balance; employees withdraw from it (minus tax to vault if configured).</p>
      <p className="mt-4 text-3xl font-bold tracking-tight text-white">
        {treasuryBalance || "0"} <span className="text-lg font-medium text-zinc-500">{SYMBOL}</span>
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {QUICK_AMOUNTS.map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => handleQuick(val)}
            className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-zinc-300 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-white transition"
          >
            <Plus className="h-4 w-4" /> +{val}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder={`Amount (${SYMBOL})`}
          value={depositAmount}
          onChange={(e) => onDepositAmountChange(e.target.value)}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
        />
        <button
          type="button"
          onClick={onDeposit}
          disabled={isDepositPending || !depositAmount || parseFloat(depositAmount) <= 0}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white hover:bg-emerald-400 disabled:opacity-50 transition"
        >
          {isDepositPending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            "Deposit"
          )}
        </button>
      </div>
    </motion.section>
  );
}
