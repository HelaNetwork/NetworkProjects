"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, getDefaultConfig, lightTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider } from "wagmi";
import { helaTestnet } from "@/lib/hela-chain";
import { useState, type ReactNode } from "react";

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  "demo-replace-in-env"; // Injected wallets still work; WalletConnect needs a real ID from cloud.reown.com

const config = getDefaultConfig({
  appName: "FindHunt",
  projectId,
  chains: [helaTestnet],
  ssr: true,
});

const rkTheme = lightTheme({
  accentColor: "#10b981",
  accentColorForeground: "white",
  borderRadius: "large",
  fontStack: "system",
});

export function Web3Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rkTheme} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
