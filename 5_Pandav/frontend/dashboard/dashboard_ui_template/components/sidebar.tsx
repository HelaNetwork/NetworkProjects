"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Zap, Scroll, Scale, FlaskConical, ShieldCheck, Radio } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/command-center", label: "Command Center", icon: Zap },
  { href: "/audit-history", label: "Audit History", icon: Scroll },
  { href: "/dispute-center", label: "Dispute Center", icon: Scale },
  { href: "/agent-sandbox", label: "Agent Sandbox", icon: FlaskConical },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="glass fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r md:flex">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 pb-6 pt-7">
        <div className="relative">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand glow-purple">
            <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div
            aria-hidden
            className="absolute -inset-1 -z-10 rounded-xl bg-gradient-brand opacity-40 blur-md"
          />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            TAAP
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Guardian Protocol
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3">
        <div className="mb-2 px-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Navigation
          </p>
        </div>
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <li key={item.href} className="relative">
                {active && (
                  <span
                    aria-hidden
                    className="absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-r-full bg-gradient-brand glow-purple"
                  />
                )}
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                    active
                      ? "bg-gradient-brand-soft text-foreground"
                      : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px] transition-colors",
                      active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                    )}
                    strokeWidth={2}
                  />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Status footer */}
      <div className="mx-4 mb-5 mt-4">
        <div className="glass flex items-center gap-3 rounded-xl px-3.5 py-3">
          <div className="relative flex h-2 w-2 items-center justify-center">
            <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </div>
          <div className="flex flex-1 flex-col leading-tight">
            <span className="text-xs font-medium text-foreground">Network Live</span>
            <span className="font-mono text-[10px] text-muted-foreground">HeLa · Block 18,492,301</span>
          </div>
          <Radio className="h-3.5 w-3.5 text-success" />
        </div>
      </div>
    </aside>
  )
}
