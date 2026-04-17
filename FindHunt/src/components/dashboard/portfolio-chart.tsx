"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";

const data = [
  { t: "Mon", v: 8200 },
  { t: "Tue", v: 9100 },
  { t: "Wed", v: 8800 },
  { t: "Thu", v: 10200 },
  { t: "Fri", v: 11100 },
  { t: "Sat", v: 11800 },
  { t: "Sun", v: 12480 },
];

export function PortfolioChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-64 min-h-[256px] w-full min-w-0"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="fillMint" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200/80 dark:stroke-slate-700/80" />
          <XAxis dataKey="t" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v / 1000}k`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgb(167 243 208 / 0.5)",
              background: "rgba(255,255,255,0.92)",
            }}
            formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, "Simulated"]}
          />
          <Area
            type="monotone"
            dataKey="v"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#fillMint)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
