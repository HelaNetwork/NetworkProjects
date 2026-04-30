"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Bot,
  PiggyBank,
  RefreshCw,
  Settings,
  Droplets,
  Gauge,
  LineChart,
  CalendarClock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedBackdrop } from "./animated-backdrop";
import { FindHuntLogo } from "@/components/brand/findhunt-logo";

const nav = [
  { href: "/dashboard", label: "Dashboard", short: "Home", icon: LayoutDashboard },
  { href: "/trading", label: "Trading", short: "Trade", icon: LineChart },
  { href: "/sip", label: "Crypto SIP", short: "SIP", icon: CalendarClock },
  { href: "/budget", label: "Budget", short: "Budget", icon: Gauge },
  { href: "/agent", label: "AI Agent", short: "AI", icon: Bot },
  { href: "/savings", label: "Savings", short: "Save", icon: PiggyBank },
  { href: "/subscriptions", label: "Bills & subs", short: "Bills", icon: RefreshCw },
  { href: "/liquidity", label: "LP", short: "LP", icon: Droplets },
  { href: "/settings", label: "Settings", short: "Gear", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) {
    return (
      <>
        <AnimatedBackdrop />
        {children}
      </>
    );
  }

  return (
    <>
      <AnimatedBackdrop />
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 border-b border-emerald-200/40 bg-white/50 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/50">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
            <Link href="/" className="flex min-w-0 items-center gap-2">
              <FindHuntLogo size="sm" animated className="min-w-0" />
            </Link>
            <nav className="hidden flex-1 items-center justify-center gap-0.5 overflow-x-auto lg:flex">
              {nav.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.span
                      className={cn(
                        "flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors xl:gap-2 xl:px-3 xl:text-sm",
                        active
                          ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
                          : "text-slate-600 hover:bg-white/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                      )}
                      whileHover={{ y: -1 }}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 xl:h-4 xl:w-4" />
                      <span className="max-w-[5.5rem] truncate xl:max-w-none">{item.label}</span>
                    </motion.span>
                  </Link>
                );
              })}
            </nav>
            <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-emerald-200/50 bg-white/90 backdrop-blur-xl lg:hidden dark:border-white/10 dark:bg-slate-950/90">
          <div className="flex gap-1 overflow-x-auto px-2 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {nav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-w-[4.25rem] shrink-0 flex-col items-center gap-0.5 rounded-lg px-1 py-1 text-[10px] font-medium",
                    active ? "text-emerald-600" : "text-slate-500"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.short}
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="h-[4.25rem] lg:hidden" aria-hidden />
      </div>
    </>
  );
}
