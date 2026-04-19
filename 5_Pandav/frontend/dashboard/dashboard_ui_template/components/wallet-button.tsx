"use client"

import { useState } from "react"
import { Wallet, LogOut, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { useWallet } from "@/components/wallet-provider"
import { truncateAddress } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export function WalletButton() {
  const { address, isConnecting, connect, disconnect } = useWallet()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleConnect = async () => {
    try {
      await connect()
      toast.success("Wallet connected", {
        description: "You may now review and verify agent intents.",
      })
    } catch {
      toast.error("Failed to connect wallet")
    }
  }

  const handleCopy = async () => {
    if (!address) return
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (!address) {
    return (
      <button
        type="button"
        onClick={handleConnect}
        disabled={isConnecting}
        className={cn(
          "group relative inline-flex h-9 items-center gap-2 overflow-hidden rounded-lg px-4 text-sm font-medium text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70",
          "bg-gradient-brand glow-purple hover:shadow-[0_0_40px_-8px_rgba(168,85,247,0.6)]",
        )}
      >
        <span
          aria-hidden
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        />
        {isConnecting ? (
          <>
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-white/40 border-t-white" />
            Connecting
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </>
        )}
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="glass inline-flex h-9 items-center gap-2.5 rounded-lg px-3.5 text-sm font-medium text-foreground transition hover:border-primary/30"
      >
        <span className="relative flex h-2 w-2 items-center justify-center">
          <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-success opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        <span className="font-mono text-[13px] tracking-tight">{truncateAddress(address, 5, 4)}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="glass-strong absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-xl p-2 shadow-2xl">
            <div className="px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Connected Account
              </p>
              <p className="mt-1 break-all font-mono text-xs text-foreground">{address}</p>
            </div>
            <div className="my-1 h-px bg-border" />
            <button
              type="button"
              onClick={handleCopy}
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/[0.04] hover:text-foreground"
            >
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy Address"}
            </button>
            <button
              type="button"
              onClick={() => {
                disconnect()
                setOpen(false)
                toast.message("Wallet disconnected")
              }}
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </button>
          </div>
        </>
      )}
    </div>
  )
}
