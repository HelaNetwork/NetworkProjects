"use client";

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { Wallet, ArrowRight } from "lucide-react";
import { NativePayStreamABI } from "@/abis/NativePayStream";
import { PAYSTREAM_ADDRESS } from "@/config/wagmi";

interface NewTreasuryCardProps {
    treasuryBalance: string;
    symbol: string;
    onSuccess?: () => void;
}

export function NewTreasuryCard({ treasuryBalance, symbol, onSuccess }: NewTreasuryCardProps) {
    const [depositAmount, setDepositAmount] = useState("");

    const { writeContract: writeDeposit, data: depositHash, isPending: isDepositPending } = useWriteContract();
    const { isLoading: isDepositConfirming, isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({ hash: depositHash });

    useEffect(() => {
        if (isDepositSuccess) {
            setDepositAmount("");
            onSuccess?.();
        }
    }, [isDepositSuccess, onSuccess]);

    const handleDeposit = () => {
        if (!depositAmount) return;
        writeDeposit({
            address: PAYSTREAM_ADDRESS,
            abi: NativePayStreamABI,
            functionName: "deposit",
            value: parseEther(depositAmount),
        });
    };

    const isPending = isDepositPending || isDepositConfirming;

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="rounded-lg bg-indigo-500/20 p-2 text-indigo-400">
                    <Wallet className="h-5 w-5" />
                </div>
                <h2 className="font-semibold text-white">Treasury Management</h2>
            </div>

            <div className="mb-6">
                <p className="text-sm font-medium text-zinc-400">Current Balance</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-white">
                    {treasuryBalance} <span className="text-lg font-normal text-zinc-500">{symbol}</span>
                </p>
            </div>

            <div className="space-y-3">
                <label className="text-xs text-zinc-500">Add funds to treasury to back new streams.</label>
                <div className="flex gap-2">
                    <input
                        type="number"
                        placeholder="Amount"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        disabled={isPending}
                        className="w-full flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                    />
                    <button
                        onClick={handleDeposit}
                        disabled={!depositAmount || isPending}
                        className="flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition-hover hover:bg-indigo-400 disabled:opacity-50"
                    >
                        {isPending ? "Pending..." : "Deposit"} <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
