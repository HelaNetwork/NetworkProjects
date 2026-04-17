"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatEther, parseEther, zeroAddress } from "viem";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { abis, addresses } from "@/lib/contracts";

export default function BudgetPage() {
  const { address, isConnected } = useAccount();
  const [limitEth, setLimitEth] = useState("0.5");
  const [spendEth, setSpendEth] = useState("0.05");

  const bc = addresses.budget;
  const enabled = Boolean(address && bc);

  const { data: limitWei, refetch: refetchLimit } = useReadContract({
    address: bc,
    abi: abis.budgetController,
    functionName: "dailyLimitWei",
    args: [address ?? zeroAddress],
    query: { enabled },
  });

  const { data: spentToday, refetch: refetchSpent } = useReadContract({
    address: bc,
    abi: abis.budgetController,
    functionName: "spentToday",
    args: [address ?? zeroAddress],
    query: { enabled },
  });

  const { data: can } = useReadContract({
    address: bc,
    abi: abis.budgetController,
    functionName: "canSpend",
    args: [address ?? zeroAddress, parseEther("0.001")],
    query: { enabled },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      void refetchLimit();
      void refetchSpent();
    }
  }, [isSuccess, refetchLimit, refetchSpent]);

  const busy = isPending || confirming;

  const limit = limitWei !== undefined ? parseFloat(formatEther(limitWei as bigint)) : 0;
  const spent = spentToday !== undefined ? parseFloat(formatEther(spentToday as bigint)) : 0;
  const pct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;

  const bills = [
    { label: "Rent / workspace", due: "Apr 14", amount: "0.12 HLUSD" },
    { label: "API credits", due: "Apr 18", amount: "0.03 HLUSD" },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Daily budget</h1>
        <p className="text-slate-600 dark:text-slate-400">
          FindHunt — on-chain daily limit and spend tracker; pairs with trading desk risk caps.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today</CardTitle>
            <CardDescription>BudgetController state for your address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <div className="rounded-xl bg-emerald-500/10 px-4 py-3">
                <p className="text-xs text-slate-600 dark:text-slate-400">Limit / day</p>
                <p className="text-lg font-semibold">{enabled ? `${limit.toFixed(4)} HLUSD` : "—"}</p>
              </div>
              <div className="rounded-xl bg-slate-500/10 px-4 py-3">
                <p className="text-xs text-slate-600 dark:text-slate-400">Spent today</p>
                <p className="text-lg font-semibold">{enabled ? `${spent.toFixed(4)} HLUSD` : "—"}</p>
              </div>
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span>Usage</span>
                <span>{pct}%</span>
              </div>
              <Progress value={pct} />
            </div>
            {can != null ? (
              <p className="text-xs text-slate-500">
                Can spend 0.001 more?{" "}
                {(can as readonly [boolean, bigint])[0] ? "Yes" : "No"} (sample check)
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Controls</CardTitle>
            <CardDescription>Set limit and record spend</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConnected && <p className="text-sm text-slate-500">Connect wallet.</p>}
            <div className="space-y-2">
              <Label>Daily limit (HLUSD)</Label>
              <Input value={limitEth} onChange={(e) => setLimitEth(e.target.value)} />
              <Button
                disabled={!bc || !isConnected || busy}
                onClick={() =>
                  bc &&
                  writeContract({
                    address: bc,
                    abi: abis.budgetController,
                    functionName: "setDailyLimit",
                    args: [parseEther(limitEth || "0")],
                  })
                }
              >
                Set daily limit
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Record spend (HLUSD)</Label>
              <Input value={spendEth} onChange={(e) => setSpendEth(e.target.value)} />
              <Button
                variant="secondary"
                disabled={!bc || !isConnected || busy}
                onClick={() =>
                  bc &&
                  writeContract({
                    address: bc,
                    abi: abis.budgetController,
                    functionName: "recordSpend",
                    args: [parseEther(spendEth || "0")],
                  })
                }
              >
                Record outflow
              </Button>
            </div>
            {hash && <p className="break-all text-xs text-slate-500">Tx: {hash}</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming bills</CardTitle>
          <CardDescription>Example schedule — wire to DB / automation later</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {bills.map((b) => (
            <div
              key={b.label}
              className="flex items-center justify-between rounded-xl border border-emerald-100/80 bg-white/50 p-4 dark:border-white/10 dark:bg-slate-900/40"
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{b.label}</p>
                <p className="text-sm text-slate-500">Due {b.due}</p>
              </div>
              <Badge>{b.amount}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
