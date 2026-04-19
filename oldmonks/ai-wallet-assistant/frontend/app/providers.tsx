'use client';

import React from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';

// Create a simple wagmi config
const wagmiConfig = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
});

// Initialize React Query client
const queryClient = new QueryClient();

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Root providers wrapper for Web3 functionality
 * Wraps app with WagmiProvider and QueryClientProvider
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
