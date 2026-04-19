"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Zap, User, Wallet } from "lucide-react";

export type NotificationItem = {
  id: string;
  type: "stream_started" | "withdrawal" | "treasury_deposit";
  title: string;
  time: string;
};

const icons: Record<NotificationItem["type"], typeof Bell> = {
  stream_started: Zap,
  withdrawal: User,
  treasury_deposit: Wallet,
};

export interface NotificationDropdownProps {
  items?: NotificationItem[];
}

const DEFAULT_ITEMS: NotificationItem[] = [
  { id: "1", type: "stream_started", title: "Stream started for 0x7099...79C8", time: "2m ago" },
  { id: "2", type: "withdrawal", title: "Employee withdrew 12.50 HLUSD", time: "15m ago" },
  { id: "3", type: "treasury_deposit", title: "Treasury deposited 1,000 HLUSD", time: "1h ago" },
];

export function NotificationDropdown({ items = DEFAULT_ITEMS }: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-xl p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {items.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
            {items.length}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a]/95 shadow-xl backdrop-blur-xl"
          >
            <div className="border-b border-white/10 px-4 py-3">
              <h3 className="font-semibold text-white">Notifications</h3>
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {items.map((n) => {
                const Icon = icons[n.type];
                return (
                  <li
                    key={n.id}
                    className="flex gap-3 border-b border-white/5 px-4 py-3 transition hover:bg-white/5"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">{n.title}</p>
                      <p className="text-xs text-zinc-500">{n.time}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
