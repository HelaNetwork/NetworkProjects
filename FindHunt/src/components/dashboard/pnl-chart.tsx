"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Row = { t: string; pnl: number };

export function PnLChart({ data, title }: { data: Row[]; title?: string }) {
  let run = 0;
  const cumulative = data.map((row) => {
    run += row.pnl;
    return { t: row.t, pnl: run };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full min-w-0"
    >
      {title && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {title}
        </p>
      )}
      <div className="h-56 min-h-[224px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={cumulative} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="pnlUp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200/80 dark:stroke-slate-700/80" />
            <XAxis dataKey="t" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={40} />
            <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: "1px solid rgb(167 243 208 / 0.5)",
                background: "rgba(255,255,255,0.95)",
                fontSize: 12,
              }}
              formatter={(v) => [`${Number(v).toFixed(0)} HLUSD`, "Cumulative P&L"]}
            />
            <Area
              type="monotone"
              dataKey="pnl"
              stroke="#059669"
              strokeWidth={2}
              fill="url(#pnlUp)"
              dot={{ r: 3, fill: "#059669", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-400">
        <span>
          Week P&amp;L sum:{" "}
          <strong className="text-emerald-700 dark:text-emerald-300">
            {data.reduce((s, r) => s + r.pnl, 0) >= 0 ? "+" : ""}
            {data.reduce((s, r) => s + r.pnl, 0).toFixed(0)} HLUSD
          </strong>
        </span>
        <span className="text-slate-400">|</span>
        <span>Green = cumulative profit path (FindHunt demo)</span>
      </div>
    </motion.div>
  );
}
