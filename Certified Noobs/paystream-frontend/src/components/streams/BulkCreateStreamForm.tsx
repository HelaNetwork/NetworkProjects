"use client";

import { useState, useMemo, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatUnits } from "viem";
import { NativePayStreamABI } from "@/abis/NativePayStream";
import { PAYSTREAM_ADDRESS } from "@/config/wagmi";

const SYMBOL = "HEA";

function isValidAddress(addr: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}

/** Parse CSV text: each line "address,monthlySalary". Returns { employees, rates } or error. */
function parseBulkCsv(text: string): {
  employees: `0x${string}`[];
  rates: bigint[];
  error?: string;
} {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const employees: `0x${string}`[] = [];
  const rates: bigint[] = [];

  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].split(/[\t,]/).map((p) => p.trim());
    if (parts.length < 2) {
      return { employees: [], rates: [], error: `Line ${i + 1}: need address,monthlySalary` };
    }
    const [addr, salaryStr] = parts;
    if (!isValidAddress(addr)) {
      return { employees: [], rates: [], error: `Line ${i + 1}: invalid address` };
    }
    const salary = parseFloat(salaryStr);
    if (Number.isNaN(salary) || salary <= 0) {
      return { employees: [], rates: [], error: `Line ${i + 1}: invalid salary` };
    }

    // Rate = Salary(Wei) / 30 days
    try {
      const salaryWei = parseEther(salaryStr);
      const secondsPerMonth = BigInt(30 * 24 * 3600);
      const rate = salaryWei / secondsPerMonth;
      if (rate === BigInt(0)) {
        return { employees: [], rates: [], error: `Line ${i + 1}: salary too low` };
      }
      employees.push(addr as `0x${string}`);
      rates.push(rate);
    } catch {
      return { employees: [], rates: [], error: `Line ${i + 1}: invalid salary format` };
    }
  }

  if (employees.length === 0) {
    return { employees: [], rates: [], error: "Add at least one line" };
  }
  return { employees, rates };
}

type BulkCreateStreamFormProps = {
  onSuccess?: () => void;
};

export function BulkCreateStreamForm({ onSuccess }: BulkCreateStreamFormProps) {
  const [csv, setCsv] = useState("");
  const [error, setError] = useState("");

  const parsed = useMemo(() => parseBulkCsv(csv), [csv]);
  const totalMonthlyValue = useMemo(
    () => {
      if (!parsed.rates.length) return BigInt(0);
      const totalRate = parsed.rates.reduce((a, b) => a + b, BigInt(0));
      return totalRate * BigInt(30 * 24 * 3600);
    },
    [parsed.rates]
  );

  const writeBatch = useWriteContract();
  const { isLoading: batchLoading } = useWaitForTransactionReceipt({
    hash: writeBatch.data,
  });
  useEffect(() => {
    if (batchLoading === false && writeBatch.data) onSuccess?.();
  }, [batchLoading, writeBatch.data, onSuccess]);

  const canSubmit =
    !parsed.error &&
    parsed.employees.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (parsed.error) {
      setError(parsed.error);
      return;
    }
    try {
      // ratesPerSecond was computed in parseBulkCsv now
      writeBatch.writeContract({
        address: PAYSTREAM_ADDRESS,
        abi: NativePayStreamABI,
        functionName: "createStreamBatch",
        args: [parsed.employees, parsed.rates],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-400">
          CSV: address, monthlySalary ({SYMBOL})
        </label>
        <textarea
          placeholder={"0x1234...\t5000\n0x5678...\t3000"}
          value={csv}
          onChange={(e) => {
            setCsv(e.target.value);
            setError("");
          }}
          rows={5}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
        />
        <p className="mt-1 text-xs text-zinc-500">
          One stream per line. Creates {parsed.employees.length} Endless Salary streams.
        </p>
      </div>
      {(parsed.error || error) && (
        <p className="text-sm text-red-400">{parsed.error || error}</p>
      )}
      <button
        type="submit"
        disabled={!canSubmit || writeBatch.isPending || batchLoading}
        className="w-full rounded-xl bg-emerald-500 py-3 font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-50"
      >
        {writeBatch.isPending || batchLoading ? (
          <span className="inline-flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Creating {parsed.employees.length} streams…
          </span>
        ) : (
          `Start ${parsed.employees.length || 0} Salary Streams (Total Monthly: ${totalMonthlyValue ? formatUnits(totalMonthlyValue, 18) : "0"} ${SYMBOL})`
        )}
      </button>
    </form>
  );
}
