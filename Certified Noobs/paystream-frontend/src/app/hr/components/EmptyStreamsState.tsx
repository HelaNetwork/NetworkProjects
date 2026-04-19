"use client";

import { motion } from "framer-motion";
import { Users, ArrowRight } from "lucide-react";

interface EmptyStreamsStateProps {
  onAddFirst?: () => void;
}

export function EmptyStreamsState({ onAddFirst }: EmptyStreamsStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-16 px-6 text-center"
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20"
      >
        <Users className="h-10 w-10 text-emerald-400/80" />
      </motion.div>
      <h3 className="text-lg font-semibold text-white">No employees yet</h3>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">
        Add your first employee and start a stream to see payroll activity here.
      </p>
      {onAddFirst && (
        <motion.button
          type="button"
          onClick={onAddFirst}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 font-semibold text-white transition hover:bg-emerald-400"
        >
          Add First Employee
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      )}
    </motion.div>
  );
}
