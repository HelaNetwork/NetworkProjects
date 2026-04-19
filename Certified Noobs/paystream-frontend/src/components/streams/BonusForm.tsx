"use client";

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { NativePayStreamABI } from "@/abis/NativePayStream";
import { PAYSTREAM_ADDRESS } from "@/config/wagmi";

const SYMBOL = "HEA";

type BonusFormProps = {
  onSuccess?: () => void;
};

export function BonusForm({ onSuccess }: BonusFormProps) {
  const [streamId, setStreamId] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const writeStreamBonus = useWriteContract();
  const { isLoading: streamBonusLoading } = useWaitForTransactionReceipt({
    hash: writeStreamBonus.data,
  });
  const isPending = writeStreamBonus.isPending || streamBonusLoading;

  useEffect(() => {
    if (streamBonusLoading === false && writeStreamBonus.data) {
      setStreamId("");
      setAmount("");
      setError("");
      onSuccess?.();
    }
  }, [streamBonusLoading, writeStreamBonus.data, onSuccess]);

  const canSubmit =
    streamId.trim().length > 0 &&
    !Number.isNaN(parseInt(streamId.trim(), 10)) &&
    parseInt(streamId.trim(), 10) >= 0 &&
    parseFloat(amount) > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    let wei: bigint;
    try {
      wei = parseEther(amount);
    } catch {
      setError("Invalid amount.");
      return;
    }
    if (wei <= BigInt(0)) {
      setError("Amount must be greater than 0.");
      return;
    }
    if (!canSubmit) {
      setError("Invalid stream ID or amount.");
      return;
    }
    const id = parseInt(streamId.trim(), 10);
    writeStreamBonus.writeContract({
      address: PAYSTREAM_ADDRESS,
      abi: NativePayStreamABI,
      functionName: "addStreamBonus",
      args: [BigInt(id), wei],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-400">Stream ID</label>
        <input
          type="text"
          placeholder="e.g. 0"
          value={streamId}
          onChange={(e) => {
            setStreamId(e.target.value);
            setError("");
          }}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-400">Amount ({SYMBOL})</label>
        <input
          type="text"
          placeholder="e.g. 0.5"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setError("");
          }}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={!canSubmit || isPending}
        className="w-full rounded-xl bg-amber-500/90 py-3 font-semibold text-white transition hover:bg-amber-500 disabled:opacity-50"
      >
        {isPending ? (
          <span className="inline-flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Adding…
          </span>
        ) : (
          `Add ${amount || "0"} ${SYMBOL} to stream`
        )}
      </button>
    </form>
  );
}
