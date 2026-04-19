"use client";

import { useEffect, useState, useRef } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Clock, Ban, CheckCircle2, TrendingUp, RefreshCw } from "lucide-react";
import { NativePayStreamABI } from "@/abis/NativePayStream";
import { PAYSTREAM_ADDRESS } from "@/config/wagmi";

const SYMBOL = "HEA";

interface EmployeeStreamCardProps {
    streamId: bigint;
    onSuccess?: () => void;
}

export function EmployeeStreamCard({ streamId, onSuccess }: EmployeeStreamCardProps) {
    const [now, setNow] = useState(Date.now() / 1000);
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    // FETCH STREAM DATA
    const { data: stream, refetch: refetchStream } = useReadContract({
        address: PAYSTREAM_ADDRESS,
        abi: NativePayStreamABI,
        functionName: "streams",
        args: [streamId],
    });

    const { data: accruedChain, refetch: refetchAccrued } = useReadContract({
        address: PAYSTREAM_ADDRESS,
        abi: NativePayStreamABI,
        functionName: "accrued",
        args: [streamId],
    });

    // WRITE
    const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (isSuccess) {
            onSuccess?.();
            refetchStream();
            refetchAccrued();
        }
    }, [isSuccess, onSuccess, refetchStream, refetchAccrued]);

    // LIVE TICKER
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now() / 1000), 100); // 10fps update
        return () => clearInterval(interval);
    }, []);

    if (!stream) return <div className="animate-pulse h-48 rounded-2xl bg-white/5" />;

    const s = stream as any;

    // Safely parse
    const rate = BigInt(s[1] || s.ratePerSecond || 0);
    const startTime = BigInt(s[2] || s.startTime || 0);
    const lastClaimTime = BigInt(s[3] || s.lastClaimTime || 0);
    const totalDeposited = BigInt(s[4] || s.totalDeposited || 0);
    const active = s[5] ?? s.active;
    const isEndless = s[6] ?? s.isEndless;
    const pausedAt = BigInt(s[7] || s.pausedAt || 0);
    const totalBonus = BigInt(s[8] || s.totalBonusAdded || 0);
    const bonusWithdrawn = BigInt(s[9] || s.bonusWithdrawn || 0);

    // CALCULATE LIVE CLAIMABLE
    let claimable = BigInt(0);

    const isActive = active;
    const effectiveNow = BigInt(Math.floor(now));

    // Determine effective time for accrual end
    let currentTime = isActive ? effectiveNow : pausedAt;

    // Cap at max duration if NOT endless
    const maxDuration = !isEndless && rate > BigInt(0) ? totalDeposited / rate : BigInt(0);
    const endTime = startTime + maxDuration;

    if (!isEndless && currentTime > endTime) currentTime = endTime;

    if (currentTime > lastClaimTime) {
        const elapsed = currentTime - lastClaimTime;
        const baseAccrued = elapsed * rate;
        const bonusRemaining = totalBonus > bonusWithdrawn ? totalBonus - bonusWithdrawn : BigInt(0);
        claimable = baseAccrued + bonusRemaining;
    } else {
        // Just bonus?
        const bonusRemaining = totalBonus > bonusWithdrawn ? totalBonus - bonusWithdrawn : BigInt(0);
        claimable = bonusRemaining;
    }

    const handleWithdraw = () => {
        if (claimable <= BigInt(0)) return;
        writeContract({
            address: PAYSTREAM_ADDRESS,
            abi: NativePayStreamABI,
            functionName: "withdraw",
            args: [streamId],
        });
    };

    const isPending = isWritePending || isConfirming;
    const displayAmount = formatUnits(claimable, 18);
    // Format to 6 decimals
    const formattedDisplay = parseFloat(displayAmount).toFixed(6);

    const progress = !isEndless && maxDuration > BigInt(0) ? Number(currentTime - startTime) / Number(maxDuration) : 0;
    const progressPercent = Math.min(100, Math.max(0, progress * 100));

    // Completed Logic
    const isCompleted = !isEndless && isActive && now >= Number(endTime);

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all hover:border-white/20">
            <div className="absolute top-0 right-0 p-4 opacity-50">
                <div className={`h-24 w-24 rounded-full blur-3xl ${isActive ? 'bg-emerald-500/20' : 'bg-zinc-500/20'}`} />
            </div>

            <div className="relative">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-zinc-400 font-mono">#{streamId.toString()}</span>
                    <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider 
                        ${isCompleted ? 'bg-blue-500/10 text-blue-400'
                                : isActive ? 'bg-emerald-500/10 text-emerald-400'
                                    : 'bg-zinc-500/10 text-zinc-400'}`}
                    >
                        {isCompleted ? 'Completed' : isActive ? 'Streaming' : 'Inactive'}
                    </span>
                </div>

                <div className="mb-6">
                    <p className="text-sm text-zinc-400 mb-1">Unclaimed Earnings</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-white tracking-tight tabular-nums">{formattedDisplay}</span>
                        <span className="text-lg font-medium text-zinc-500">{SYMBOL}</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                        {Number(formatUnits(rate, 18)).toFixed(6)} {SYMBOL}/sec
                    </p>
                </div>

                {/* Progress Bar (Only for fixed, non-salary streams) */}
                {!isEndless && (
                    <div className="mb-6">
                        <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                            <span>Progress</span>
                            <span>{progressPercent.toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                className={`h-full rounded-full ${isCompleted ? 'bg-blue-500' : isActive ? 'bg-emerald-500' : 'bg-zinc-500'}`}
                            />
                        </div>
                    </div>
                )}
                {isEndless && (
                    <div className="mb-6">
                        <div className="flex items-center gap-2 text-xs text-emerald-400/80 bg-emerald-500/5 px-3 py-2 rounded-lg border border-emerald-500/10">
                            <Clock className="w-3 h-3" />
                            <span>Salary Stream (Endless)</span>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleWithdraw}
                    disabled={isPending || claimable <= BigInt(0)}
                    className="w-full group/btn relative flex items-center justify-center gap-2 rounded-xl bg-white text-black px-4 py-3 text-sm font-bold transition-transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none hover:bg-zinc-200"
                >
                    {isPending ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                        <>
                            Withdraw Funds <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
