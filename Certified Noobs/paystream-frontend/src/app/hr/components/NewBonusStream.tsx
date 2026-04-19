"use client";

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { Zap, Users, Clock, ArrowRight } from "lucide-react";
import { NativePayStreamABI } from "@/abis/NativePayStream";
import { PAYSTREAM_ADDRESS } from "@/config/wagmi";

export function NewBonusStream({ onSuccess }: { onSuccess?: () => void }) {
    const [employee, setEmployee] = useState("");
    const [amount, setAmount] = useState("");
    const [duration, setDuration] = useState("");

    // One time spike logic

    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (isSuccess) {
            setEmployee("");
            setAmount("");
            setDuration("");
            onSuccess?.();
        }
    }, [isSuccess, onSuccess]);

    const handleCreate = () => {
        if (!employee || !amount || !duration) return;

        // Duration is in minutes
        const durationSeconds = BigInt(Math.floor(parseFloat(duration) * 60));
        if (durationSeconds === BigInt(0)) return;

        const totalAmount = parseEther(amount);
        const ratePerSecond = totalAmount / durationSeconds;

        writeContract({
            address: PAYSTREAM_ADDRESS,
            abi: NativePayStreamABI,
            functionName: "createStream",
            args: [employee as `0x${string}`, ratePerSecond],
        });
    };

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="rounded-lg bg-yellow-500/20 p-2 text-yellow-400">
                    <Zap className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="font-semibold text-white">One-Time Spike</h2>
                    <p className="text-xs text-zinc-400">Stream a fixed amount that ends automatically.</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Recipient Address</label>
                    <input
                        type="text"
                        placeholder="0x..."
                        value={employee}
                        onChange={(e) => setEmployee(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-yellow-500/50 focus:outline-none focus:ring-1 focus:ring-yellow-500/50"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-zinc-500 mb-1 block">Amount (HLUSD)</label>
                        <input
                            type="number"
                            placeholder="0.0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-yellow-500/50 focus:outline-none focus:ring-1 focus:ring-yellow-500/50"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-zinc-500 mb-1 block">Duration (Minutes)</label>
                        <input
                            type="number"
                            placeholder="60"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-yellow-500/50 focus:outline-none focus:ring-1 focus:ring-yellow-500/50"
                        />
                    </div>
                </div>

                <button
                    onClick={handleCreate}
                    disabled={isPending || isConfirming || !employee || !amount || !duration}
                    className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-black transition-hover hover:bg-yellow-400 disabled:opacity-50"
                >
                    {isPending || isConfirming ? "Processing..." : "Start Spike Stream"} <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
