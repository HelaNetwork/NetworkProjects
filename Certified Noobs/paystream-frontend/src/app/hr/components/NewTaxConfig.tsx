"use client";

import { useState, useEffect } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { NativePayStreamABI } from "@/abis/NativePayStream";
import { PAYSTREAM_ADDRESS } from "@/config/wagmi";
import { Settings, Save } from "lucide-react";

export function NewTaxConfig() {
    const [vault, setVault] = useState("");
    const [bps, setBps] = useState("");

    const { data: currentVault } = useReadContract({
        address: PAYSTREAM_ADDRESS,
        abi: NativePayStreamABI,
        functionName: "taxVault",
    });

    const { data: currentBps } = useReadContract({
        address: PAYSTREAM_ADDRESS,
        abi: NativePayStreamABI,
        functionName: "taxBps",
    });

    useEffect(() => {
        if (currentVault) setVault(currentVault as string);
        if (currentBps) setBps(currentBps.toString());
    }, [currentVault, currentBps]);

    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const handleUpdate = () => {
        if (!vault || !bps) return;
        writeContract({
            address: PAYSTREAM_ADDRESS,
            abi: NativePayStreamABI,
            functionName: "setTaxConfig",
            args: [vault as `0x${string}`, BigInt(bps)],
        });
    };

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="rounded-lg bg-orange-500/20 p-2 text-orange-400">
                    <Settings className="h-5 w-5" />
                </div>
                <h2 className="font-semibold text-white">Tax Configuration</h2>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Tax Vault Address</label>
                    <input
                        type="text"
                        value={vault}
                        onChange={(e) => setVault(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                    />
                </div>

                <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Tax BPS (Basis Points, 100 = 1%)</label>
                    <input
                        type="number"
                        value={bps}
                        onChange={(e) => setBps(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                    />
                </div>

                <button
                    onClick={handleUpdate}
                    disabled={isPending || isConfirming}
                    className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-hover hover:bg-orange-400 disabled:opacity-50"
                >
                    {isPending || isConfirming ? "Updating..." : "Save Configuration"} <Save className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
