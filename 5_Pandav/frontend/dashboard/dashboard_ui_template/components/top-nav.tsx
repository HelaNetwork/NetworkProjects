"use client"

import { usePathname } from "next/navigation"
import { WalletButton } from "@/components/wallet-button"
import { MobileNav } from "@/components/mobile-nav"

const titles: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Command Center",
    subtitle: "Review high-risk agent intents paused by the protocol",
  },
  "/command-center": {
    title: "Command Center",
    subtitle: "Review high-risk agent intents paused by the protocol",
  },
  "/audit-history": {
    title: "Audit History",
    subtitle: "Immutable ledger of executed agent actions",
  },
  "/dispute-center": {
    title: "Dispute Center",
    subtitle: "Challenge transactions within the 24-hour timelock window",
  },
  "/agent-sandbox": {
    title: "Agent Sandbox",
    subtitle: "Simulate agent intents to stress-test the protocol",
  },
}

export function TopNav() {
  const pathname = usePathname()
  const meta = titles[pathname] ?? titles["/"]

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/60 px-5 backdrop-blur-xl md:px-8 lg:px-10">
      <MobileNav />
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <h1 className="truncate text-[15px] font-semibold tracking-tight text-foreground">
          {meta.title}
        </h1>
        <p className="truncate text-xs text-muted-foreground">{meta.subtitle}</p>
      </div>
      <WalletButton />
    </header>
  )
}
