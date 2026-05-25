"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Zap, Scroll, Scale, FlaskConical, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/command-center", label: "Command Center", icon: Zap },
  { href: "/audit-history", label: "Audit History", icon: Scroll },
  { href: "/dispute-center", label: "Dispute Center", icon: Scale },
  { href: "/agent-sandbox", label: "Agent Sandbox", icon: FlaskConical },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white/[0.02] text-muted-foreground transition hover:bg-white/[0.05] hover:text-foreground md:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={() => setOpen(false)}
          />
          <div className="glass-strong absolute inset-y-0 left-0 flex w-72 flex-col border-r">
            <div className="flex items-center justify-between px-5 pb-5 pt-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand">
                  <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-[15px] font-semibold text-foreground">TAAP</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Guardian Protocol
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 px-3">
              <ul className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = pathname === item.href || pathname.startsWith(item.href + "/")
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                          active
                            ? "bg-gradient-brand-soft text-foreground"
                            : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground",
                        )}
                      >
                        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
