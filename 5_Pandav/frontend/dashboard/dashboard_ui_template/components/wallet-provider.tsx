"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

type WalletState = {
  address: string | null
  isConnecting: boolean
  connect: () => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletState | null>(null)

// Deterministic mock address — would be replaced by wallet SDK (wagmi, viem, etc.)
const MOCK_ADDRESS = "0x8f5a9b4c7d2e1f3a6b8c9d0e1f2a3b4c5d6e7f58"

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const connect = useCallback(async () => {
    setIsConnecting(true)
    // Simulated wallet handshake latency
    await new Promise((r) => setTimeout(r, 900))
    setAddress(MOCK_ADDRESS)
    setIsConnecting(false)
  }, [])

  const disconnect = useCallback(() => {
    setAddress(null)
  }, [])

  return (
    <WalletContext.Provider value={{ address, isConnecting, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error("useWallet must be used within WalletProvider")
  return ctx
}
