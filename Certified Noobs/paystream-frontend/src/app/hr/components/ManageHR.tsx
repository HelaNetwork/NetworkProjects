"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { UserPlus, UserMinus, ShieldAlert } from "lucide-react";
import { NativePayStreamABI } from "@/abis/NativePayStream";
import { PAYSTREAM_ADDRESS } from "@/config/wagmi";

export function ManageHR({ isOwner }: { isOwner: boolean }) {
    const [hrAddress, setHrAddress] = useState("");
    const [action, setAction] = useState<"add" | "remove">("add");

    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    if (!isOwner) return null;

    const handleExecute = () => {
        if (!hrAddress) return;
        writeContract({
            address: PAYSTREAM_ADDRESS,
            abi: NativePayStreamABI,
            functionName: action === "add" ? "addHR" : "removeHR",
            args: [hrAddress as `0x${string}`],
        });
    };

    return (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-red-500/20 p-2 text-red-400">
                    <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="font-semibold text-white">Manage HR Permissions</h2>
                    <p className="text-xs text-zinc-400">Owner-only controls.</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex gap-2 p-1 bg-black/20 rounded-lg">
                    <button
                        onClick={() => setAction("add")}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${action === "add" ? "bg-emerald-500/20 text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
                            }`}
                    >
                        Add HR
                    </button>
                    <button
                        onClick={() => setAction("remove")}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${action === "remove" ? "bg-red-500/20 text-red-400" : "text-zinc-500 hover:text-zinc-300"
                            }`}
                    >
                        Remove HR
                    </button>
                </div>

                <div>
                    <input
                        type="text"
                        placeholder="0x..."
                        value={hrAddress}
                        onChange={(e) => setHrAddress(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                    />
                </div>

                <button
                    onClick={handleExecute}
                    disabled={!hrAddress || isPending || isConfirming}
                    className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50 ${action === "add" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-600 hover:bg-red-500"
                        }`}
                >
                    {isPending || isConfirming ? "Processing..." : action === "add" ? "Grant Permission" : "Revoke Permission"}
                    {action === "add" ? <UserPlus className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
}
