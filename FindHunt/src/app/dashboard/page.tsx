"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatEther, zeroAddress } from "viem";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { Bell, PiggyBank, TrendingUp, Wallet } from "lucide-react";
import { PortfolioChart } from "@/components/dashboard/portfolio-chart";
import { TradingCandleChart } from "@/components/dashboard/trading-candle-chart";
import { TradingVolumeChart } from "@/components/dashboard/trading-volume-chart";
import { PnLChart } from "@/components/dashboard/pnl-chart";
import { MOCK_CANDLES, MOCK_PNL } from "@/lib/mock-trading-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { abis, addresses } from "@/lib/contracts";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { data: bal, isLoading: balLoading } = useBalance({
    address,
    query: { enabled: !!address },
  });

  const vaultEnabled = Boolean(address && addresses.vault);
  const { data: vaultBal, isLoading: vaultLoading } = useReadContract({
    address: addresses.vault,
    abi: abis.treasurerVault,
    functionName: "balances",
    args: [address ?? zeroAddress],
    query: { enabled: vaultEnabled },
  });

  const { data: yieldAlloc } = useReadContract({
    address: addresses.vault,
    abi: abis.treasurerVault,
    functionName: "yieldAllocated",
    args: [address ?? zeroAddress],
    query: { enabled: vaultEnabled },
  });

  const nativeEth = bal ? parseFloat(formatEther(bal.value)) : 0;
  const vaultEth = vaultBal !== undefined ? parseFloat(formatEther(vaultBal as bigint)) : 0;
  const yieldEth = yieldAlloc !== undefined ? parseFloat(formatEther(yieldAlloc as bigint)) : 0;
  const totalLive = nativeEth + vaultEth + yieldEth;
  const savingsPct =
    totalLive > 0 ? Math.min(100, Math.round((vaultEth / totalLive) * 100)) : isConnected ? 0 : 32;
  const yieldPct =
    totalLive > 0 ? Math.min(100, Math.round((yieldEth / totalLive) * 100)) : isConnected ? 0 : 12;
  const budgetUsed = 68;

  const notifications = [
    { title: "Daily budget", body: "You are at 68% of today’s limit.", type: "budget" },
    { title: "Yield opportunity", body: "Simulated pool APY ticked up — review allocation.", type: "yield" },
    { title: "Subscription", body: "0.01 HLUSD recurring due in 3 days (example).", type: "sub" },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">
            FindHunt — wealth, trading agent charts, SIP, bills, and Hela wallet in one place.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!isConnected && (
            <Badge variant="outline" className="w-fit">
              Connect wallet for live reads
            </Badge>
          )}
          <Button variant="secondary" size="sm" asChild className="rounded-xl">
            <Link href="/budget">Daily budget</Link>
          </Button>
          <Button variant="secondary" size="sm" asChild className="rounded-xl">
            <Link href="/trading">Trading desk</Link>
          </Button>
          <Button variant="secondary" size="sm" asChild className="rounded-xl">
            <Link href="/sip">Crypto SIP</Link>
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Wallet}
          label="Native balance"
          loading={balLoading && !!address}
          value={
            address && bal
              ? `${parseFloat(formatEther(bal.value)).toFixed(4)} ${bal.symbol}`
              : isConnected
                ? "—"
                : "Connect wallet"
          }
        />
        <StatCard
          icon={PiggyBank}
          label="Vault savings"
          loading={vaultLoading && vaultEnabled}
          value={
            vaultEnabled && vaultBal !== undefined
              ? `${vaultEth.toFixed(4)} HLUSD`
              : addresses.vault
                ? "0.0000 HLUSD"
                : "Not deployed"
          }
        />
        <StatCard
          icon={TrendingUp}
          label="Yield (tracked)"
          loading={vaultLoading && vaultEnabled}
          value={
            vaultEnabled && yieldAlloc !== undefined ? `${yieldEth.toFixed(4)} HLUSD` : "—"
          }
        />
        <StatCard
          icon={Bell}
          label="Notifications"
          value={`${notifications.length} active`}
          hint="Budget · yield · subs"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-emerald-200/50 lg:col-span-2">
          <CardHeader>
            <CardTitle>Wealth timeline</CardTitle>
            <CardDescription>Long-horizon balance curve — connect live portfolio feeds when ready.</CardDescription>
          </CardHeader>
          <CardContent>
            <PortfolioChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Allocations</CardTitle>
            <CardDescription>Savings vs yield vs spend headroom</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Savings target</span>
                <span className="font-medium text-emerald-700 dark:text-emerald-300">{savingsPct}%</span>
              </div>
              <Progress value={savingsPct} />
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Yield sleeve</span>
                <span className="font-medium text-teal-700 dark:text-teal-300">{yieldPct}%</span>
              </div>
              <Progress value={Math.max(yieldPct, 8)} />
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Daily budget used</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{budgetUsed}%</span>
              </div>
              <Progress value={budgetUsed} />
            </div>
            <Separator />
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Active subscriptions</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Example: streaming · 0.01 / 30d</p>
              <Badge>2 mock plans</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-emerald-200/60">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Trading agent · charts</CardTitle>
            <CardDescription>OHLC, volume, and profit / loss — same view as the full trading desk</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild className="w-fit shrink-0 rounded-xl">
            <Link href="/trading">Open trading desk</Link>
          </Button>
        </CardHeader>
        <CardContent className="grid gap-8 xl:grid-cols-2">
          <div className="space-y-4">
            <TradingCandleChart data={MOCK_CANDLES} title="Simulated OHLC" />
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Volume</p>
              <TradingVolumeChart data={MOCK_CANDLES} />
            </div>
          </div>
          <PnLChart data={MOCK_PNL} title="Trading & budget P&L (cumulative)" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-emerald-600" />
            Notifications
          </CardTitle>
          <CardDescription>Budget exceeded, subscription due, yield nudges, AI tips</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {notifications.map((n, i) => (
            <motion.div
              key={n.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className={cn(
                "rounded-xl border border-emerald-100/80 bg-white/50 p-4 dark:border-white/10 dark:bg-slate-900/40"
              )}
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{n.title}</p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{n.body}</p>
              <Badge variant="secondary" className="mt-3">
                {n.type}
              </Badge>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
  hint,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  loading?: boolean;
  hint?: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="h-full border-emerald-100/90 bg-white/55 dark:border-white/10 dark:bg-slate-900/45">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {label}
              </p>
              {loading ? (
                <Skeleton className="mt-2 h-6 w-24" />
              ) : (
                <p className="truncate text-lg font-semibold text-slate-900 dark:text-white">{value}</p>
              )}
              {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
