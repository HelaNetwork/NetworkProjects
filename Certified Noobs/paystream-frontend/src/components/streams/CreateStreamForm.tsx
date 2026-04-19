"use client";

import { useState, useMemo, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatUnits } from "viem";
import { NativePayStreamABI } from "@/abis/NativePayStream";
import { PAYSTREAM_ADDRESS } from "@/config/wagmi";

const SYMBOL = "HEA";

type CreateStreamFormProps = {
  onSuccess?: () => void;
  treasuryBalance?: bigint;
};

function isValidAddress(addr: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}

export function CreateStreamForm({ onSuccess, treasuryBalance }: CreateStreamFormProps) {
  const [employee, setEmployee] = useState("");
  const [monthlySalary, setMonthlySalary] = useState("");
  const [error, setError] = useState("");

  const ratePerSecond = useMemo(() => {
    const val = parseFloat(monthlySalary);
    if (Number.isNaN(val) || val <= 0) return BigInt(0);
    // Rate = (Monthly Salary in Wei) / (30 * 24 * 3600)
    try {
      const monthlyWei = parseEther(monthlySalary);
      const secondsPerMonth = BigInt(30 * 24 * 3600); // 2,592,000
      return monthlyWei / secondsPerMonth;
    } catch {
      return BigInt(0);
    }
  }, [monthlySalary]);

  const displayRate = useMemo(() => {
    if (ratePerSecond === BigInt(0)) return "0";
    return formatUnits(ratePerSecond, 18);
  }, [ratePerSecond]);

  const writeCreate = useWriteContract();
  const { isLoading: createLoading, data: receipt } = useWaitForTransactionReceipt({ hash: writeCreate.data });

  useEffect(() => {
    if (!createLoading && receipt) {
      if (receipt.status === "success") {
        onSuccess?.();
        setEmployee("");
        setMonthlySalary("");
      } else {
        setError("Transaction reverted.");
      }
    }
  }, [createLoading, receipt, onSuccess]);

  const canSubmit =
    employee.trim().length > 0 &&
    isValidAddress(employee.trim()) &&
    parseFloat(monthlySalary) > 0 &&
    ratePerSecond > BigInt(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!canSubmit) {
      setError("Invalid address or salary.");
      return;
    }

    try {
      writeCreate.writeContract({
        address: PAYSTREAM_ADDRESS,
        abi: NativePayStreamABI,
        functionName: "createStream",
        args: [employee.trim() as `0x${string}`, ratePerSecond],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-400">Employee address</label>
        <input
          type="text"
          placeholder="0x..."
          value={employee}
          onChange={(e) => {
            setEmployee(e.target.value);
            setError("");
          }}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-400">Monthly Salary ({SYMBOL})</label>
        <input
          type="text"
          placeholder="e.g. 5000"
          value={monthlySalary}
          onChange={(e) => {
            setMonthlySalary(e.target.value);
            setError("");
          }}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Rate: <span className="font-mono text-emerald-400">{displayRate}</span> {SYMBOL}/sec (Endless Stream)
        </p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={!canSubmit || writeCreate.isPending || createLoading}
        className="w-full rounded-xl bg-emerald-500 py-3 font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-50"
      >
        {writeCreate.isPending || createLoading ? (
          <span className="inline-flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Creating stream…
          </span>
        ) : (
          `Start Salary Stream`
        )}
      </button>
    </form>
  );
}
