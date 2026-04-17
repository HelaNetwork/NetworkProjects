"use client";

import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Candle } from "@/lib/mock-trading-data";

export function TradingVolumeChart({ data }: { data: Candle[] }) {
  const chartData = data.map((d) => ({ t: d.t, vol: d.v }));
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="h-36 w-full min-w-0 min-h-[144px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200/80 dark:stroke-slate-700/80" />
          <XAxis dataKey="t" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={32} />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: "1px solid rgb(167 243 208 / 0.5)",
              background: "rgba(255,255,255,0.95)",
              fontSize: 12,
            }}
            formatter={(v) => [Number(v).toLocaleString(), "Volume"]}
          />
          <Bar dataKey="vol" fill="#94a3b8" fillOpacity={0.55} radius={[4, 4, 0, 0]} name="Volume" />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
