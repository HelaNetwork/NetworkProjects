"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: number;
  icon: LucideIcon;
  delay?: number;
}

export function StatsCard(props: StatsCardProps) {
  const { title, value, subtitle, change, icon: Icon, delay = 0 } = props;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.08)]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-400">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">{value}</p>
          {subtitle != null && <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>}
          {change !== undefined && (
            <span className={`mt-2 inline-flex text-xs font-medium ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {change >= 0 ? "↑" : "↓"} {Math.abs(change).toFixed(1)}% vs 24h
            </span>
          )}
        </div>
        <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10 transition-all duration-300 group-hover:bg-emerald-500/10 group-hover:ring-emerald-500/20">
          <Icon className="h-6 w-6 text-emerald-400/90 sm:h-7 sm:w-7" />
        </div>
      </div>
    </motion.div>
  );
}
