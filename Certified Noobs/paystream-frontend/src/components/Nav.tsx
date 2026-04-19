"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "./ConnectButton";
import { useAuth } from "@/context/AuthContext";
import { Wallet } from "lucide-react";

const nav = [
  { href: "/hr", label: "HR", title: "HR Dashboard" },
  { href: "/employee", label: "Employee", title: "Employee Portal" },
];

export function Nav() {
  const pathname = usePathname();
  const { role, isLoggedIn } = useAuth(); // User and signOut removed

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0B0F19]/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 min-h-[3.5rem] max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white hover:text-emerald-400 transition-colors">
            <span className="text-2xl text-emerald-500">◇</span>
            PayStream
          </Link>
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
            {nav.map(({ href, label, title }) => (
              <Link
                key={href}
                href={href}
                title={title}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium tracking-tight transition ${pathname === href
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4">
          {isLoggedIn && role && (
            <div className="hidden items-center gap-3 sm:flex">
              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${role === "hr" ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"}`}>
                {role === "hr" ? "HR Admin" : "Employee"}
              </span>
            </div>
          )}

          <div className="shrink-0">
            <ConnectButton />
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <nav className="flex items-center gap-1 border-t border-white/5 bg-[#0B0F19]/90 px-4 py-3 sm:hidden text-white" aria-label="Mobile">
        {nav.map(({ href, label, title }) => (
          <Link
            key={href}
            href={href}
            title={title}
            className={`rounded-lg px-3 py-2 text-xs font-medium ${pathname === href ? "bg-white/10 text-white" : "text-zinc-400"
              }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
