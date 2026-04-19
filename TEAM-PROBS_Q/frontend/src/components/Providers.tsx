"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { helaTestnet } from "../config/contracts";
import "@rainbow-me/rainbowkit/styles.css";

const config = getDefaultConfig({
    appName: "PayStream",
    projectId: "paystream-demo-hackathon-2025",
    chains: [helaTestnet],
    transports: {
        [helaTestnet.id]: http("https://testnet-rpc.helachain.com"),
    },
    ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={darkTheme({
                        accentColor: "#6366f1",
                        accentColorForeground: "white",
                        borderRadius: "medium",
                    })}
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
