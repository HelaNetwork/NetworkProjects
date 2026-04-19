"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatEther } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import { CONTRACTS, PAYSTREAM_ABI, HLUSD_ABI } from "../../config/contracts";
import {
    IconLock, IconSearch, IconStream, IconChart, IconDollar,
    IconClock, IconCreditCard, IconCheck, IconDownload, IconShield
} from "../../components/Icons";
import { TiltCard } from "../../components/TiltCard";

type StreamData = {
    employee: string; status: number; taxBps: number; startTime: bigint; endTime: bigint;
    pausedAt: bigint; totalPaused: bigint; ratePerSecond: bigint; deposited: bigint;
    withdrawn: bigint; remainder: bigint;
};

const STATUS_LABELS = ["None", "Active", "Paused", "Canceled"];
const STATUS_BADGE = ["", "badge-active", "badge-paused", "badge-canceled"];

const fade = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.45, ease: "easeOut" as const },
});

export default function EmployeePortal() {
    const { address, isConnected } = useAccount();
    const [now, setNow] = useState(Math.floor(Date.now() / 1000));
    const [txStatus, setTxStatus] = useState("");

    useEffect(() => {
        const interval = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
        return () => clearInterval(interval);
    }, []);

    const { data: stream, refetch: refetchStream } = useReadContract({
        address: CONTRACTS.PAY_STREAM, abi: PAYSTREAM_ABI, functionName: "getStream",
        args: address ? [address] : undefined,
    }) as { data: StreamData | undefined; refetch: () => void };

    const { data: earnedAmt, refetch: refetchEarned } = useReadContract({
        address: CONTRACTS.PAY_STREAM, abi: PAYSTREAM_ABI, functionName: "earned",
        args: address ? [address] : undefined,
    });
    const { data: withdrawableAmt, refetch: refetchWithdrawable } = useReadContract({
        address: CONTRACTS.PAY_STREAM, abi: PAYSTREAM_ABI, functionName: "withdrawable",
        args: address ? [address] : undefined,
    });
    const { data: hlusdBalance } = useReadContract({
        address: CONTRACTS.HLUSD, abi: HLUSD_ABI, functionName: "balanceOf",
        args: address ? [address] : undefined,
    });

    useEffect(() => {
        const interval = setInterval(() => { refetchStream(); refetchEarned(); refetchWithdrawable(); }, 5000);
        return () => clearInterval(interval);
    }, [refetchStream, refetchEarned, refetchWithdrawable]);

    const { writeContract, data: txHash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

    useEffect(() => {
        if (isSuccess) {
            setTxStatus("Withdrawal successful");
            refetchStream(); refetchEarned(); refetchWithdrawable();
            setTimeout(() => setTxStatus(""), 5000);
        }
    }, [isSuccess, refetchStream, refetchEarned, refetchWithdrawable]);

    const handleWithdraw = () => {
        setTxStatus("Processing withdrawal...");
        writeContract({ address: CONTRACTS.PAY_STREAM, abi: PAYSTREAM_ABI, functionName: "withdraw" });
    };

    const hasStream = stream && stream.status !== 0;
    const status = stream?.status ?? 0;

    const localEarned = (() => {
        if (!stream || status === 0) return 0n;
        const effectiveNow = status === 2
            ? (stream.pausedAt < stream.endTime ? stream.pausedAt : stream.endTime)
            : BigInt(now) < stream.endTime ? BigInt(now) : stream.endTime;
        if (effectiveNow <= stream.startTime) return 0n;
        const elapsed = effectiveNow - stream.startTime;
        const activeElapsed = elapsed > stream.totalPaused ? elapsed - stream.totalPaused : 0n;
        let e = activeElapsed * stream.ratePerSecond;
        if (e > stream.deposited) e = stream.deposited;
        return e;
    })();

    const localWithdrawable = localEarned > (stream?.withdrawn ?? 0n) ? localEarned - (stream?.withdrawn ?? 0n) : 0n;
    const streamedProgress = stream && stream.deposited > 0n ? Number((localEarned * 10000n) / stream.deposited) / 100 : 0;

    const timeRemaining = (() => {
        if (!stream || status === 0) return "";
        const diff = Number(stream.endTime) - now;
        if (diff <= 0) return "Completed";
        const d = Math.floor(diff / 86400), h = Math.floor((diff % 86400) / 3600), m = Math.floor((diff % 3600) / 60), s = diff % 60;
        if (d > 0) return `${d}d ${h}h ${m}m remaining`;
        if (h > 0) return `${h}h ${m}m ${s}s remaining`;
        return `${m}m ${s}s remaining`;
    })();

    // ─── Empty states ──────────────────────────────────
    if (!isConnected) {
        return (
            <div className="relative min-h-[70vh] flex items-center justify-center">
                <motion.div className="relative z-10 text-center space-y-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="icon-box icon-box-xl icon-accent mx-auto"><IconLock size={28} /></div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">Connect Your Wallet</h2>
                    <p className="text-[var(--text-secondary)] max-w-sm">Connect your employee wallet to view your salary stream and withdraw funds</p>
                </motion.div>
            </div>
        );
    }

    if (!hasStream) {
        return (
            <div className="relative min-h-[70vh] flex items-center justify-center">
                <motion.div className="relative z-10 text-center space-y-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="icon-box icon-box-xl icon-muted mx-auto"><IconSearch size={28} /></div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">No Stream Found</h2>
                    <p className="text-[var(--text-secondary)]">No active salary stream exists for this wallet</p>
                    <p className="text-sm text-[var(--text-muted)] font-mono bg-[var(--bg-secondary)] px-4 py-2 rounded-lg inline-block">{address}</p>
                </motion.div>
            </div>
        );
    }

    // ─── Main Portal ──────────────────────────────────
    return (
        <div className="relative">
            <div className="relative z-10 space-y-5 max-w-3xl mx-auto">
                {/* Header */}
                <motion.div className="flex items-center justify-between" {...fade(0)}>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Employee Portal</h1>
                        <p className="text-[var(--text-muted)] mt-1 font-mono text-sm">{address?.slice(0, 14)}...{address?.slice(-6)}</p>
                    </div>
                    <span className={`badge ${STATUS_BADGE[status]}`}>
                        {status === 1 && <span className="pulse-dot" style={{ marginRight: 4 }}><span /></span>}
                        {STATUS_LABELS[status]}
                    </span>
                </motion.div>

                {/* Toast */}
                <AnimatePresence>
                    {txStatus && (
                        <motion.div className="toast flex items-center justify-center gap-2" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                            {txStatus.includes("successful") ? <IconCheck size={14} className="text-[var(--success)]" /> : <IconClock size={14} className="text-[var(--accent)]" />}
                            {txStatus}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ═══ Earnings Card ═══ */}
                <TiltCard intensity={5}>
                    <motion.div className="card-highlight p-8" {...fade(0.1)}>
                        <div className="text-center space-y-6">
                            {/* Live label */}
                            <div className="flex items-center justify-center gap-2 text-sm text-[var(--text-muted)]">
                                <span className="pulse-dot"><span /></span>
                                <span>Live Streaming Earnings</span>
                            </div>

                            {/* Big counter */}
                            <div className="text-5xl md:text-6xl font-bold text-gradient tracking-tight" style={{ fontVariantNumeric: "tabular-nums" }}>
                                {Number(formatEther(localEarned)).toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}
                            </div>
                            <p className="text-sm text-[var(--text-muted)] -mt-2">HLUSD earned</p>

                            {/* Shimmer */}
                            <div className="max-w-xs mx-auto stream-shimmer" />

                            {/* Progress */}
                            <div className="space-y-2 max-w-md mx-auto">
                                <div className="progress-track progress-track-lg">
                                    <motion.div
                                        className="progress-fill progress-fill-accent"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(streamedProgress, 100)}%` }}
                                        transition={{ duration: 1.2, ease: "easeOut" }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-[var(--accent-light)] font-medium">{streamedProgress.toFixed(2)}% streamed</span>
                                    <span className="text-[var(--text-muted)]">{timeRemaining}</span>
                                </div>
                            </div>

                            {/* Stats row */}
                            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
                                {[
                                    { label: "Withdrawable", value: Number(formatEther(localWithdrawable)).toFixed(4), color: "text-[var(--accent-light)]", icon: IconDownload },
                                    { label: "Withdrawn", value: Number(formatEther(stream?.withdrawn ?? 0n)).toFixed(4), color: "text-[var(--success)]", icon: IconCheck },
                                    { label: "Total Salary", value: Number(formatEther(stream?.deposited ?? 0n)).toFixed(4), color: "text-[var(--text-primary)]", icon: IconDollar },
                                ].map((s, i) => (
                                    <motion.div key={i} className="stat-card text-center" {...fade(0.3 + i * 0.08)}>
                                        <div className="icon-box icon-box-sm icon-accent mx-auto mb-2"><s.icon size={14} /></div>
                                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-0.5">{s.label}</p>
                                        <p className={`text-base font-semibold ${s.color}`}>{s.value}</p>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Withdraw */}
                            <motion.button
                                onClick={handleWithdraw}
                                disabled={isPending || isConfirming || localWithdrawable === 0n}
                                className="w-full max-w-md mx-auto btn-success py-3.5 text-base font-semibold relative z-50"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isPending || isConfirming ? (
                                    <><IconClock size={16} /> Processing...</>
                                ) : (
                                    <><IconDownload size={16} /> Withdraw {Number(formatEther(localWithdrawable)).toFixed(4)} HLUSD</>
                                )}
                            </motion.button>
                            <p className="text-xs text-[var(--text-muted)]">
                                {(stream?.taxBps ?? 0) / 100}% tax automatically withheld to TaxVault
                            </p>
                        </div>
                    </motion.div>
                </TiltCard>

                {/* ═══ Stream Details ═══ */}
                <TiltCard intensity={6}>
                    <motion.div className="card p-6" {...fade(0.2)}>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="icon-box icon-box-md icon-accent"><IconChart size={18} /></div>
                            <h3 className="font-semibold text-[var(--text-primary)]">Stream Details</h3>
                        </div>
                        <div className="space-y-0">
                            {[
                                ["Rate / second", `${Number(formatEther(stream?.ratePerSecond ?? 0n)).toFixed(12)} HLUSD`, "text-[var(--accent-light)]"],
                                ["Rate / hour", `${Number(formatEther((stream?.ratePerSecond ?? 0n) * 3600n)).toFixed(6)} HLUSD`, "text-[var(--accent)]"],
                                ["Rate / day", `${Number(formatEther((stream?.ratePerSecond ?? 0n) * 86400n)).toFixed(4)} HLUSD`, "text-[var(--accent-dark)]"],
                                ["Start", new Date(Number(stream?.startTime ?? 0) * 1000).toLocaleString(), "text-[var(--text-secondary)]"],
                                ["End", new Date(Number(stream?.endTime ?? 0) * 1000).toLocaleString(), "text-[var(--text-secondary)]"],
                                ["Tax Rate", `${(stream?.taxBps ?? 0) / 100}%`, "text-[var(--warning)]"],
                                ["Remainder", `${formatEther(stream?.remainder ?? 0n)} HLUSD`, "text-[var(--text-muted)]"],
                            ].map(([label, value, color], i) => (
                                <div key={i} className="flex justify-between py-2.5 border-b border-[var(--border-default)] last:border-b-0">
                                    <span className="text-sm text-[var(--text-muted)]">{label}</span>
                                    <span className={`text-sm font-mono ${color}`}>{value}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </TiltCard>

                {/* ═══ Wallet Balance ═══ */}
                <TiltCard intensity={4}>
                    <motion.div className="card p-4 flex items-center justify-between" {...fade(0.3)}>
                        <div className="flex items-center gap-3">
                            <div className="icon-box icon-box-sm icon-accent"><IconCreditCard size={16} /></div>
                            <span className="text-sm text-[var(--text-muted)]">Wallet Balance</span>
                        </div>
                        <span className="text-[var(--text-primary)] font-semibold">
                            {hlusdBalance !== undefined ? Number(formatEther(hlusdBalance as bigint)).toLocaleString(undefined, { maximumFractionDigits: 4 }) : "—"}{" "}
                            <span className="text-[var(--text-muted)] text-sm">HLUSD</span>
                        </span>
                    </motion.div>
                </TiltCard>
            </div>
        </div>
    );
}
