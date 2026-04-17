"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { parseEther, formatEther, zeroAddress } from "viem";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { abis, addresses } from "@/lib/contracts";

type RecRes = { actions: string[]; executionHints?: string[]; source?: string };

export default function AgentPage() {
  const { address, isConnected } = useAccount();
  const [goals, setGoals] = useState("Save 20% monthly, minimize risk, modest yield.");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecRes | null>(null);

  const vault = addresses.vault;
  const enabled = Boolean(address && vault);

  const { data: vaultBal, refetch } = useReadContract({
    address: vault,
    abi: abis.treasurerVault,
    functionName: "balances",
    args: [address ?? zeroAddress],
    query: { enabled },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) void refetch();
  }, [isSuccess, refetch]);

  async function getRecommendations() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goals,
          walletAddress: address,
          context: {
            vaultBalance: vaultBal !== undefined ? formatEther(vaultBal as bigint) : undefined,
          },
        }),
      });
      const json = (await res.json()) as RecRes;
      setResult(json);
    } catch {
      setResult({ actions: ["Could not reach AI endpoint — check dev server."], source: "error" });
    } finally {
      setLoading(false);
    }
  }

  function executeStrategy() {
    if (!vault || !address || !vaultBal) return;
    const v = vaultBal as bigint;
    if (v === 0n) return;
    const tenPct = v / 10n;
    if (tenPct === 0n) return;
    writeContract({
      address: vault,
      abi: abis.treasurerVault,
      functionName: "allocateToYield",
      args: [tenPct],
    });
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
          <Sparkles className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">FindHunt AI agent</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Goals in plain language → actions for SIP, trading, and savings. One-click moves 10% vault → yield sleeve.
          </p>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="min-h-[420px] border-emerald-200/50">
          <CardHeader>
            <CardTitle>Your goals</CardTitle>
            <CardDescription>Natural language — backend uses OpenAI if configured, else heuristics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goals">Instructions</Label>
              <Input
                id="goals"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                className="min-h-[44px]"
              />
            </div>
            <Button onClick={getRecommendations} disabled={loading}>
              {loading ? "Thinking…" : "Get recommendations"}
            </Button>

            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  key="out"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-2xl border border-emerald-100/80 bg-white/60 p-4 dark:border-white/10 dark:bg-slate-900/50"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      Suggested actions
                    </span>
                    {result.source && <Badge variant="secondary">{result.source}</Badge>}
                  </div>
                  <ul className="list-inside list-disc space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    {result.actions?.map((a, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.04 * i }}
                      >
                        {a}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Execute strategy</CardTitle>
            <CardDescription>On-chain: allocate 10% of vault to yield sleeve</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConnected && <p className="text-sm text-slate-500">Connect wallet on Hela Testnet.</p>}
            <Button
              className="w-full"
              disabled={!vault || !isConnected || isPending || confirming || !vaultBal || (vaultBal as bigint) === 0n}
              onClick={() => executeStrategy()}
            >
              {isPending || confirming ? "Confirm in wallet…" : "Execute strategy"}
            </Button>
            <p className="text-xs text-slate-500">
              For full agent execution via hot wallet, deploy StrategyExecutor and set vault executor (see README).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
