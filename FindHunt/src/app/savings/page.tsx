"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { parseEther, formatEther, zeroAddress } from "viem";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { abis, addresses } from "@/lib/contracts";

export default function SavingsPage() {
  const { address, isConnected } = useAccount();
  const [depositEth, setDepositEth] = useState("0.01");
  const [withdrawEth, setWithdrawEth] = useState("0.005");
  const [autoBps, setAutoBps] = useState("2000");

  const vault = addresses.vault;
  const enabled = Boolean(address && vault);

  const { data: bal } = useReadContract({
    address: vault,
    abi: abis.treasurerVault,
    functionName: "balances",
    args: [address ?? zeroAddress],
    query: { enabled },
  });

  const { data: bps } = useReadContract({
    address: vault,
    abi: abis.treasurerVault,
    functionName: "autoSaveBps",
    args: [address ?? zeroAddress],
    query: { enabled },
  });

  const { data: yld } = useReadContract({
    address: vault,
    abi: abis.treasurerVault,
    functionName: "yieldAllocated",
    args: [address ?? zeroAddress],
    query: { enabled },
  });

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: confirming } = useWaitForTransactionReceipt({ hash });

  const busy = isPending || confirming;

  const vaultEth = bal !== undefined ? parseFloat(formatEther(bal as bigint)) : 0;
  const yieldEth = yld !== undefined ? parseFloat(formatEther(yld as bigint)) : 0;
  const bpsNum = bps !== undefined ? Number(bps) : 0;
  const autoPct = bpsNum / 100;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Savings</h1>
        <p className="text-slate-600 dark:text-slate-400">
          FindHunt vault — deposits, withdrawals, and auto-save (basis points) on Hela.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vault balance</CardTitle>
            <CardDescription>On-chain savings in the deployed vault contract</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-emerald-500/10 p-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">Deposited</p>
              <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                {isConnected && vault ? `${vaultEth.toFixed(4)} HLUSD` : "—"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-500/10 p-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">Yield sleeve (tracked)</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                {isConnected && vault ? `${yieldEth.toFixed(4)} HLUSD` : "—"}
              </p>
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span>Auto-save target</span>
                <span className="font-medium text-emerald-700">{autoPct.toFixed(1)}%</span>
              </div>
              <Progress value={Math.min(autoPct, 100)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deposit & withdraw</CardTitle>
            <CardDescription>Native HLUSD into the vault</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isConnected && <p className="text-sm text-slate-500">Connect your wallet to transact.</p>}
            <div className="space-y-2">
              <Label htmlFor="dep">Deposit amount (HLUSD)</Label>
              <Input
                id="dep"
                value={depositEth}
                onChange={(e) => setDepositEth(e.target.value)}
                placeholder="0.01"
              />
              <Button
                disabled={!vault || !isConnected || busy}
                onClick={() =>
                  vault &&
                  writeContract({
                    address: vault,
                    abi: abis.treasurerVault,
                    functionName: "deposit",
                    value: parseEther(depositEth || "0"),
                  })
                }
              >
                {busy ? "Confirming…" : "Deposit"}
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wdr">Withdraw amount (wei as ETH string)</Label>
              <Input
                id="wdr"
                value={withdrawEth}
                onChange={(e) => setWithdrawEth(e.target.value)}
              />
              <Button
                variant="secondary"
                disabled={!vault || !isConnected || busy}
                onClick={() =>
                  vault &&
                  writeContract({
                    address: vault,
                    abi: abis.treasurerVault,
                    functionName: "withdraw",
                    args: [parseEther(withdrawEth || "0")],
                  })
                }
              >
                Withdraw
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bps">Auto-save (basis points, max 10000)</Label>
              <Input id="bps" value={autoBps} onChange={(e) => setAutoBps(e.target.value)} />
              <Button
                variant="outline"
                disabled={!vault || !isConnected || busy}
                onClick={() =>
                  vault &&
                  writeContract({
                    address: vault,
                    abi: abis.treasurerVault,
                    functionName: "setAutoSaveBps",
                    args: [BigInt(autoBps || "0")],
                  })
                }
              >
                Update auto-save
              </Button>
            </div>
            {error && (
              <p className="text-sm text-red-600">{error.message?.slice(0, 200) ?? "Transaction error"}</p>
            )}
            {hash && (
              <p className="break-all text-xs text-slate-500">
                Tx: {hash}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
