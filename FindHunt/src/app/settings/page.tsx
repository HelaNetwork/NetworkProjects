"use client";

import { motion } from "framer-motion";
import { helaTestnet } from "@/lib/hela-chain";
import { addresses } from "@/lib/contracts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const entries = [
    ["Chain", `${helaTestnet.name} (${helaTestnet.id})`],
    ["RPC", helaTestnet.rpcUrls.default.http[0]],
    ["TreasurerVault", addresses.vault ?? "unset"],
    ["BudgetController", addresses.budget ?? "unset"],
    ["SubscriptionManager", addresses.subscriptions ?? "unset"],
    ["StrategyExecutor", addresses.strategy ?? "unset"],
    ["MockLPPool", addresses.lpPool ?? "unset"],
  ] as const;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400">
          FindHunt — Hela Testnet RPC and deployed contract addresses from your environment.
        </p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Hela Testnet</CardTitle>
          <CardDescription>Add these to MetaMask / Rainbow if prompted</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {entries.map(([k, v], i) => (
            <div key={k}>
              {i > 0 && <Separator className="mb-4" />}
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{k}</span>
                <div className="flex items-center gap-2">
                  {v === "unset" ? (
                    <Badge variant="outline">unset</Badge>
                  ) : (
                    <code className="max-w-full break-all rounded-lg bg-slate-100/80 px-2 py-1 text-xs dark:bg-slate-900/80">
                      {v}
                    </code>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily budget & bills</CardTitle>
          <CardDescription>Use BudgetController on-chain; bill scheduling is tracked in-app when DB is connected</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 dark:text-slate-400">
          <p>
            Set <code className="rounded bg-emerald-500/10 px-1">NEXT_PUBLIC_BUDGET_CONTROLLER</code> after
            deploy, then call <code className="rounded bg-emerald-500/10 px-1">setDailyLimit</code> from the
            Budget page (add a small client if you extend this repo).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
