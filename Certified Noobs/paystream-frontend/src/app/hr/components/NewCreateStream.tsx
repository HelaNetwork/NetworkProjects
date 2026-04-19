"use client";

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { Plus, Users, Clock, Coins } from "lucide-react";
import { NativePayStreamABI } from "@/abis/NativePayStream";
import { PAYSTREAM_ADDRESS } from "@/config/wagmi";

export function NewCreateStream({ onSuccess }: { onSuccess?: () => void }) {
    const [employee, setEmployee] = useState("");
    const [amount, setAmount] = useState("");
    const [duration, setDuration] = useState("");
    const [durationUnit, setDurationUnit] = useState<"minutes" | "hours" | "days">("days");

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

        let seconds = BigInt(duration);
        if (durationUnit === "minutes") seconds *= BigInt(60);
        if (durationUnit === "hours") seconds *= BigInt(3600);
        if (durationUnit === "days") seconds *= BigInt(86400);

        if (seconds === BigInt(0)) return;

        const totalAmount = parseEther(amount);
        const ratePerSecond = totalAmount / seconds;

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
                <div className="rounded-lg bg-blue-500/20 p-2 text-blue-400">
                    <Plus className="h-5 w-5" />
                </div>
                <h2 className="font-semibold text-white">Create New Stream</h2>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-xs text-zinc-500 mb-1 block flex items-center gap-1"><Users className="w-3 h-3" /> Employee Address</label>
                    <input
                        type="text"
                        placeholder="0x..."
                        value={employee}
                        onChange={(e) => setEmployee(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-zinc-500 mb-1 block flex items-center gap-1"><Coins className="w-3 h-3" /> Total Amount (HLUSD)</label>
                        <input
                            type="number"
                            placeholder="0.0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-zinc-500 mb-1 block flex items-center gap-1"><Clock className="w-3 h-3" /> Duration</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="30"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                            />
                            <select
                                value={durationUnit}
                                onChange={(e) => setDurationUnit(e.target.value as any)}
                                className="rounded-xl border border-white/10 bg-black/20 px-2 py-2.5 text-sm text-white focus:border-blue-500/50 focus:outline-none"
                            >
                                <option value="minutes">Mins</option>
                                <option value="hours">Hours</option>
                                <option value="days">Days</option>
                            </select>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleCreate}
                    disabled={isPending || isConfirming || !employee || !amount || !duration}
                    className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition-hover hover:bg-blue-400 disabled:opacity-50"
                >
                    {isPending || isConfirming ? "Creating..." : "Create Stream"}
                </button>
            </div>
        </div>
    );
}
