"use client";

import { motion } from "framer-motion";
import { Activity, TrendingDown, TrendingUp } from "lucide-react";
import { FindHuntLogo } from "@/components/brand/findhunt-logo";
import { TradingCandleChart } from "@/components/dashboard/trading-candle-chart";
import { TradingVolumeChart } from "@/components/dashboard/trading-volume-chart";
import { PnLChart } from "@/components/dashboard/pnl-chart";
import { MOCK_CANDLES, MOCK_PNL } from "@/lib/mock-trading-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TradingPage() {
  const weekPnL = MOCK_PNL.reduce((s, r) => s + r.pnl, 0);
  const winRate = Math.round((MOCK_PNL.filter((r) => r.pnl > 0).length / MOCK_PNL.length) * 100);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <FindHuntLogo size="sm" showWordmark={false} />
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Trading agent</h1>
            <p className="text-slate-600 dark:text-slate-400">
              OHLC + volume + cumulative P&L — wire to your signals or exchange APIs later.
            </p>
          </div>
        </div>
        <Badge variant="outline" className="w-fit">
          Demo data · Hela wallet
        </Badge>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Cumulative P&L (demo)</p>
              <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                {weekPnL >= 0 ? "+" : ""}
                {weekPnL} HLUSD
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-500/15 text-slate-700">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Win weeks (mock)</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{winRate}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-700">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Trading budget cap</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">40% of free cash</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border-emerald-200/50">
          <CardHeader>
            <CardTitle>Price action (agent view)</CardTitle>
            <CardDescription>Simulated candles — swap for live market data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TradingCandleChart data={MOCK_CANDLES} />
            <TradingVolumeChart data={MOCK_CANDLES} />
          </CardContent>
        </Card>

        <Card className="border-emerald-200/50">
          <CardHeader>
            <CardTitle>Profit &amp; loss curve</CardTitle>
            <CardDescription>Budget vs trading sleeve — track drawdowns and recoveries</CardDescription>
          </CardHeader>
          <CardContent>
            <PnLChart data={MOCK_PNL} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
