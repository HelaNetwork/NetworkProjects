"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const STREAM_COLORS = ["#10b981", "#06b6d4", "#34d399"];
const PIE_COLORS = ["#10b981", "#06b6d4", "#6366f1"];

function generateStreamData(treasury: number, activeStreams: number): { day: string; amount: number }[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day, i) => ({
    day,
    amount: Math.max(0, treasury * 0.6 + (treasury * 0.4 * (i + 1)) / 7 - activeStreams * 50 * (i + 1)),
  }));
}

export interface AnalyticsSectionProps {
  treasuryBalance: string;
  taxVaultBalance: string;
  activeStreamsCount: number;
  totalEmployees: number;
}

export function AnalyticsSection({
  treasuryBalance,
  taxVaultBalance,
  activeStreamsCount,
  totalEmployees,
}: AnalyticsSectionProps) {
  const treasuryNum = parseFloat(treasuryBalance) || 0;
  const taxNum = parseFloat(taxVaultBalance) || 0;
  const streamedEst = activeStreamsCount * 120;

  const areaData = useMemo(
    () => generateStreamData(treasuryNum, activeStreamsCount),
    [treasuryNum, activeStreamsCount]
  );

  const pieData = useMemo(
    () => [
      { name: "Active Payroll", value: Math.min(streamedEst, treasuryNum), color: PIE_COLORS[0] },
      { name: "Tax Allocation", value: taxNum, color: PIE_COLORS[1] },
      { name: "Available Treasury", value: Math.max(0, treasuryNum - streamedEst - taxNum), color: PIE_COLORS[2] },
    ].filter((d) => d.value > 0),
    [treasuryNum, taxNum, streamedEst]
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
    >
      <h2 className="mb-6 text-lg font-semibold text-white">Payroll Analytics</h2>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="streamGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v.toFixed(0)}`} />
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                labelStyle={{ color: "#a1a1aa" }}
                formatter={(value: any) => [`${typeof value === 'number' ? value.toFixed(2) : value} HLUSD`, "Streamed"]}
              />
              <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} fill="url(#streamGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="h-[260px] w-full">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={{ stroke: "#71717a" }}
                  animationBegin={0}
                  animationDuration={800}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12 }} formatter={(value: any) => <span className="text-zinc-400">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-500">No allocation data yet.</div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
