"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Pause, Play, XCircle, User } from "lucide-react";

type EmployeeRow = {
  address: string;
  rate?: string;
  accrued?: string;
  status: "active" | "paused";
};

type StreamsTableProps = {
  employees: string[];
  onPause: (address: string) => void;
  onResume: (address: string) => void;
  onCancel: (address: string) => void;
  isPausePending?: boolean;
  isResumePending?: boolean;
  isCancelPending?: boolean;
  rateMap?: Record<string, string>;
  accruedMap?: Record<string, string>;
  statusMap?: Record<string, "active" | "paused">;
};

export function StreamsTable({
  employees,
  onPause,
  onResume,
  onCancel,
  isPausePending,
  isResumePending,
  isCancelPending,
  rateMap = {},
  accruedMap = {},
  statusMap = {},
}: StreamsTableProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "paused">("all");

  const rows: EmployeeRow[] = useMemo(
    () =>
      employees.map((addr) => ({
        address: addr,
        rate: rateMap[addr] ?? "—",
        accrued: accruedMap[addr] ?? "—",
        status: statusMap[addr] ?? "active",
      })),
    [employees, rateMap, accruedMap, statusMap]
  );

  const filtered = useMemo(() => {
    let list = rows.filter(
      (r) =>
        r.address.toLowerCase().includes(search.toLowerCase()) ||
        r.address.slice(0, 10).toLowerCase().includes(search.toLowerCase())
    );
    if (filter === "active") list = list.filter((r) => r.status === "active");
    if (filter === "paused") list = list.filter((r) => r.status === "paused");
    return list;
  }, [rows, search, filter]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
    >
      <div className="flex flex-col gap-4 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-white">Streams</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 sm:w-56"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as "all" | "active" | "paused")}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs font-medium uppercase tracking-wider text-zinc-400">
              <th className="p-4">Employee</th>
              <th className="p-4">Wallet</th>
              <th className="p-4">Rate /s</th>
              <th className="p-4">Accrued</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-zinc-500">
                    No streams match. Add employees above or adjust filters.
                  </td>
                </tr>
              ) : (
                filtered.map((row, i) => (
                  <motion.tr
                    key={row.address}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 transition hover:bg-white/5"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-medium text-emerald-400">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="font-mono text-sm text-white">
                          {row.address.slice(0, 6)}...{row.address.slice(-4)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs text-zinc-400">
                      {row.address.slice(0, 10)}...{row.address.slice(-8)}
                    </td>
                    <td className="p-4 text-sm text-zinc-300">{row.rate} HLUSD</td>
                    <td className="p-4 text-sm font-medium text-emerald-400">{row.accrued} HLUSD</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          row.status === "active"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {row.status === "active" ? "Active" : "Paused"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        {row.status === "active" ? (
                          <button
                            type="button"
                            onClick={() => onPause(row.address)}
                            disabled={isPausePending}
                            className="rounded-lg p-2 text-amber-400 transition hover:bg-amber-500/20 disabled:opacity-50"
                            title="Pause"
                          >
                            <Pause className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onResume(row.address)}
                            disabled={isResumePending}
                            className="rounded-lg p-2 text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-50"
                            title="Resume"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onCancel(row.address)}
                          disabled={isCancelPending}
                          className="rounded-lg p-2 text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                          title="Cancel"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
