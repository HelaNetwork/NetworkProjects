'use client'

import { wagmiAdapter, projectId, networks } from '@/config/reown'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'

const queryClient = new QueryClient()

// Initialize AppKit. 
// Most modern Reown/Wagmi versions handle SSR internally. 
// However, we ensure it only runs once and has a fallback for Project ID.
createAppKit({
  adapters: [wagmiAdapter],
  projectId: projectId || 'dummy_id_for_ssr',
  networks,
  metadata: {
    name: 'AI Wallet Assistant',
    description: 'Crypto brutalism analysis terminal',
    url: 'http://localhost:3000',
    icons: []
  },
  themeMode: 'dark',
  features: {
    email: true,
    socials: ['google', 'github'],
    analytics: false
  }
})

export function ReownProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
