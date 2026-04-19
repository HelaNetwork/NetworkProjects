"use client";

import { useEffect } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits } from "viem";
import { motion } from "framer-motion";
import { NativePayStreamABI } from "@/abis/NativePayStream";
import { PAYSTREAM_ADDRESS } from "@/config/wagmi";
import { useLiveAccrual } from "./useLiveAccrual";

const SYMBOL = "HEA";

type StreamCardProps = {
  streamId: bigint;
  onSuccess?: () => void;
  index?: number;
};

function StatusBadge({ active, pausedAt }: { active: boolean; pausedAt: number }) {
  if (pausedAt > 0) {
    return (
      <span className="inline-flex rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-400">
        Paused
      </span>
    );
  }
  if (active) {
    return (
      <span className="inline-flex rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-zinc-500/20 px-2.5 py-0.5 text-xs font-medium text-zinc-400">
      Cancelled
    </span>
  );
}

export function StreamCard({ streamId, onSuccess, index = 0 }: StreamCardProps) {
  const { data: stream, isLoading, error } = useReadContract({
    address: PAYSTREAM_ADDRESS,
    abi: NativePayStreamABI,
    functionName: "streams",
    args: [streamId],
  });
  const { data: accruedWei } = useReadContract({
    address: PAYSTREAM_ADDRESS,
    abi: NativePayStreamABI,
    functionName: "accrued",
    args: [streamId],
  });

  const { data: taxBps } = useReadContract({
    address: PAYSTREAM_ADDRESS,
    abi: NativePayStreamABI,
    functionName: "taxBps",
  });
  const hasTax = taxBps != null && taxBps > BigInt(0);

  const writeWithdraw = useWriteContract();
  const { isLoading: withdrawLoading } = useWaitForTransactionReceipt({ hash: writeWithdraw.data });
  useEffect(() => {
    if (withdrawLoading === false && writeWithdraw.data) onSuccess?.();
  }, [withdrawLoading, writeWithdraw.data, onSuccess]);

  const s = stream as any;
  const employee = s?.[0] || s?.employee;
  const ratePerSecond = s?.[1] || s?.ratePerSecond;
  const startTime = s?.[2] || s?.startTime;
  const withdrawn = s?.[3] ?? s?.withdrawn;
  const totalDeposit = s?.[4] ?? s?.totalDeposit;
  const active = s?.[5] ?? s?.active;
  const pausedAt = s?.[6] ?? s?.pausedAt;
  const totalBonusAdded = s?.[7] ?? s?.totalBonusAdded;
  const bonusWithdrawn = s?.[8] ?? s?.bonusWithdrawn;

  const startTimeNum = startTime != null ? Number(startTime) : 0;
  const pausedAtNum = pausedAt != null ? Number(pausedAt) : 0;

  const liveAccrued = useLiveAccrual({
    startTime: startTimeNum,
    ratePerSecondWei: ratePerSecond ?? BigInt(0),
    withdrawnWei: withdrawn ?? BigInt(0),
    totalDepositWei: totalDeposit ?? BigInt(0),
    active: !!active,
    pausedAt: pausedAtNum,
    totalBonusAddedWei: totalBonusAdded,
    bonusWithdrawnWei: bonusWithdrawn,
  });

  const isCancelled = !active && pausedAtNum === 0;
  const withdrawable = isCancelled ? "0" : (accruedWei != null ? formatUnits(accruedWei, 18) : liveAccrued);
  const canWithdraw = parseFloat(withdrawable) > 0;

  if (stream && employee === "0x0000000000000000000000000000000000000000") return null;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/5 p-6 animate-pulse">
        <div className="h-5 w-32 rounded bg-white/10" />
        <div className="mt-4 h-8 w-24 rounded bg-white/10" />
        <p className="mt-2 text-xs text-zinc-500">Loading stream {streamId.toString()}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-red-400">
        <p className="font-medium">Error loading stream {streamId.toString()}</p>
        <p className="mt-1 text-sm text-red-300/80 break-words">{error.message}</p>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-zinc-500">
        Stream {streamId.toString()} unavailable
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-zinc-400">Stream #{streamId.toString()}</h3>
        <StatusBadge active={!!active} pausedAt={pausedAtNum} />
      </div>
      <p className="mt-4 text-2xl font-bold tabular-nums text-emerald-400">
        {liveAccrued} <span className="text-lg font-medium text-zinc-500">{SYMBOL}</span>
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        {formatUnits(ratePerSecond ?? BigInt(0), 18)} {SYMBOL}/s
        {hasTax && (
          <span className="ml-1 text-amber-400/90">· You receive ~{(100 - Number(taxBps) / 100).toFixed(0)}% on withdraw ({(Number(taxBps) / 100).toFixed(0)}% to tax vault). You can always collect.</span>
        )}
      </p>
      <button
        type="button"
        onClick={() => {
          writeWithdraw.writeContract({
            address: PAYSTREAM_ADDRESS,
            abi: NativePayStreamABI,
            functionName: "withdraw",
            args: [streamId],
          });
        }}
        disabled={!canWithdraw || writeWithdraw.isPending || withdrawLoading}
        className="mt-4 w-full rounded-xl bg-emerald-500 py-2.5 font-semibold text-white hover:bg-emerald-400 disabled:opacity-50"
      >
        {writeWithdraw.isPending || withdrawLoading ? (
          <span className="inline-flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Withdrawing…
          </span>
        ) : (
          "Withdraw " + SYMBOL
        )}
      </button>
    </motion.div>
  );
}
