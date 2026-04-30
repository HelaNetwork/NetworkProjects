"use client";

import { motion } from "framer-motion";

export function AnimatedBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-slate-100 dark:from-slate-950 dark:via-emerald-950/30 dark:to-slate-900" />
      <motion.div
        className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-300/30 blur-3xl dark:bg-emerald-500/15"
        animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-24 right-0 h-[28rem] w-[28rem] rounded-full bg-teal-200/35 blur-3xl dark:bg-teal-600/10"
        animate={{ x: [0, -30, 0], y: [0, -20, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/3 top-1/2 h-64 w-64 rounded-full bg-slate-300/25 blur-3xl dark:bg-slate-500/10"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(16 185 129 / 0.12) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />
    </div>
  );
}
