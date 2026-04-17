"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FindHuntLogo } from "@/components/brand/findhunt-logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function SipPage() {
  const [amount, setAmount] = useState("50");
  const [days, setDays] = useState("30");
  const [horizon, setHorizon] = useState("24");
  const [apy, setApy] = useState("8");

  const series = useMemo(() => {
    const a = parseFloat(amount) || 0;
    const d = Math.max(1, parseInt(days, 10) || 30);
    const months = Math.max(1, parseInt(horizon, 10) || 12);
    const r = parseFloat(apy) || 0;
    const monthlyAdd = a * (30 / d);
    const monthlyRate = r / 100 / 12;
    let bal = 0;
    const points: { t: string; contributed: number; value: number }[] = [];
    for (let m = 1; m <= months; m++) {
      bal = (bal + monthlyAdd) * (1 + monthlyRate);
      points.push({
        t: `M${m}`,
        contributed: monthlyAdd * m,
        value: bal,
      });
    }
    return points;
  }, [amount, days, horizon, apy]);

  const dNum = Math.max(1, parseInt(days, 10) || 30);
  const hNum = Math.max(1, parseInt(horizon, 10) || 0);
  const aNum = parseFloat(amount) || 0;
  const totalIn = aNum * (30 / dNum) * hNum;

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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Crypto SIP</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Systematic plans — like mutual-fund SIPs, but for your wallet (demo projection).
            </p>
          </div>
        </div>
        <Badge variant="default" className="w-fit">
          DCA · auto-schedule ready
        </Badge>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Plan</CardTitle>
            <CardDescription>Amount per interval, cadence, horizon, APY (illustrative)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Each installment (HLUSD)</Label>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Interval (days)</Label>
              <Input value={days} onChange={(e) => setDays(e.target.value)} placeholder="7 weekly · 30 monthly" />
            </div>
            <div className="space-y-2">
              <Label>Horizon (months)</Label>
              <Input value={horizon} onChange={(e) => setHorizon(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Expected APY % (projection only)</Label>
              <Input value={apy} onChange={(e) => setApy(e.target.value)} />
            </div>
            <p className="text-xs text-slate-500">
              Rough contributed (linear): ~{totalIn.toFixed(0)} HLUSD over {horizon} mo — chart uses compounding
              steps.
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200/50 lg:col-span-2">
          <CardHeader>
            <CardTitle>Projection graph</CardTitle>
            <CardDescription>Contributed vs projected balance (not financial advice)</CardDescription>
          </CardHeader>
          <CardContent className="h-80 min-h-[320px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200/80 dark:stroke-slate-700/80" />
                <XAxis dataKey="t" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} width={44} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid rgb(167 243 208 / 0.5)",
                    background: "rgba(255,255,255,0.95)",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="contributed" name="Contributed" stroke="#94a3b8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="value" name="Projected balance" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
