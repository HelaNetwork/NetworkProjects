"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useEffect } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'
import { wagmiAdapter } from '@/config/wagmi'
import { WalletProvider } from '@/context/WalletContext'
import { initAppKit } from '@/lib/appkit'

// Set up queryClient
const queryClient = new QueryClient()

export function Providers({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  useEffect(() => {
    initAppKit()
  }, [])

  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          {children}
        </WalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
