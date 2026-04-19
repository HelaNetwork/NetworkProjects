"use client";

import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { motion } from "framer-motion";
import { Pause, Play, XCircle } from "lucide-react";
import { NativePayStreamABI } from "@/abis/NativePayStream";
import { PAYSTREAM_ADDRESS } from "@/config/wagmi";

const SYMBOL = "HEA";

type StreamRowProps = {
  streamId: number;
  onPause: (id: number) => void;
  onResume: (id: number) => void;
  onCancel: (id: number) => void;
  isPausePending: boolean;
  isResumePending: boolean;
  isCancelPending: boolean;
  index: number;
  refetchTrigger?: number;
};

export function StreamRow({
  streamId,
  onPause,
  onResume,
  onCancel,
  isPausePending,
  isResumePending,
  isCancelPending,
  index,
  refetchTrigger,
}: StreamRowProps) {
  const { data: stream, isLoading, refetch: refetchStream } = useReadContract({
    address: PAYSTREAM_ADDRESS,
    abi: NativePayStreamABI,
    functionName: "streams",
    args: [BigInt(streamId)],
  });

  const s = stream as any;
  const employee = s?.[0] || s?.employee;
  const ratePerSecond = BigInt(s?.[1] || s?.ratePerSecond || 0);
  const startTime = BigInt(s?.[2] || s?.startTime || 0);
  const totalDeposited = BigInt(s?.[4] || s?.totalDeposited || 0);
  const active = s?.[5] ?? s?.active;
  const isEndless = s?.[6] ?? s?.isEndless;
  const pausedAt = BigInt(s?.[7] || s?.pausedAt || 0);

  const { data: accrued, refetch: refetchAccrued } = useReadContract({
    address: PAYSTREAM_ADDRESS,
    abi: NativePayStreamABI,
    functionName: "accrued",
    args: [BigInt(streamId)],
  });

  // Calculate Status Logic on Client
  const [now, setNow] = useState(Date.now() / 1000);
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now() / 1000), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (refetchTrigger != null && refetchTrigger > 0) {
      refetchStream();
      refetchAccrued();
    }
  }, [refetchTrigger, refetchStream, refetchAccrued]);

  if (isLoading) {
    return (
      <tr className="border-b border-white/5">
        <td colSpan={7} className="p-4 text-center text-xs text-zinc-500 animate-pulse">
          Loading {streamId}…
        </td>
      </tr>
    );
  }

  if (!stream) {
    return (
      <tr className="border-b border-white/5">
        <td colSpan={7} className="p-4 text-center text-xs text-red-500">
          Stream {streamId} unavailable
        </td>
      </tr>
    );
  }

  const isVoid = !employee || employee === "0x0000000000000000000000000000000000000000";
  const isActive = !!active; // Active boolean from contract
  const isPaused = Number(pausedAt) > 0;

  // Custom Completed Logic
  const maxDuration = !isEndless && ratePerSecond > BigInt(0) ? totalDeposited / ratePerSecond : BigInt(0);
  const endTime = startTime + maxDuration;
  const isCompleted = !isEndless && isActive && now >= Number(endTime);
  const isCancelled = !isActive && !isPaused;

  const rateStr = ratePerSecond != null ? formatUnits(ratePerSecond, 18) : "—";
  const totalStr = isEndless ? "∞ (Salary)" : (totalDeposited != null ? formatUnits(totalDeposited, 18) : "—");
  const accruedStr = isCancelled ? "0" : (accrued != null ? formatUnits(accrued as bigint, 18) : "0");

  const displayCompleted = isCompleted;
  const displayActive = isActive && !displayCompleted;

  return (
    <motion.tr
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="border-b border-white/5 transition hover:bg-white/5"
    >
      <td className="p-4 font-mono text-sm text-white">{String(streamId)}</td>
      <td className="p-4 font-mono text-sm text-zinc-300">
        {isVoid ? "Void/Empty" : `${employee.slice(0, 6)}...${employee.slice(-4)}`}
      </td>
      <td className="p-4 text-sm font-medium text-white">{totalStr} {isEndless ? "" : SYMBOL}</td>
      <td className="p-4 text-sm text-zinc-300">{rateStr} {SYMBOL}/s</td>
      <td className="p-4 text-sm font-medium text-emerald-400">{accruedStr} {SYMBOL}</td>
      <td className="p-4">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${isPaused
            ? "bg-amber-500/20 text-amber-400"
            : displayCompleted
              ? "bg-blue-500/20 text-blue-400"
              : displayActive
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-zinc-500/20 text-zinc-400"
            }`}
        >
          {isPaused ? "Paused" : displayCompleted ? "Completed" : displayActive ? "Active" : "Cancelled"}
        </span>
      </td>
      <td className="p-4">
        <div className="flex gap-1 justify-end">
          {displayActive && (
            <button
              type="button"
              onClick={() => onPause(streamId)}
              disabled={isPausePending}
              className="rounded-lg p-2 text-amber-400 hover:bg-amber-500/20 disabled:opacity-50"
              title="Pause"
            >
              <Pause className="h-4 w-4" />
            </button>
          )}
          {isPaused && (
            <button
              type="button"
              onClick={() => onResume(streamId)}
              disabled={isResumePending}
              className="rounded-lg p-2 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
              title="Resume"
            >
              <Play className="h-4 w-4" />
            </button>
          )}
          {!isCancelled && !displayCompleted && (
            <button
              type="button"
              onClick={() => onCancel(streamId)}
              disabled={isCancelPending}
              className="rounded-lg p-2 text-red-400 hover:bg-red-500/20 disabled:opacity-50"
              title="Cancel stream"
            >
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </motion.tr>
  );
}
