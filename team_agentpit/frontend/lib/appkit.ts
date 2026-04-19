"use client";

import { createAppKit } from "@reown/appkit/react";
import { mainnet, arbitrum, base, baseSepolia } from "@reown/appkit/networks";
import { projectId, wagmiAdapter } from "@/config/wagmi";

let initialized = false;
let appKitOpen: (() => void) | null = null;

const metadata = {
  name: "Propex",
  description: "Institutional DeFi. AI-Executed.",
  url: "http://localhost:3000",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

export function initAppKit() {
  if (initialized || typeof window === "undefined") {
    return;
  }

  if (!projectId) {
    console.warn("NEXT_PUBLIC_PROJECT_ID is missing. Wallet modal will be unavailable.");
    initialized = true;
    return;
  }

  try {
    const modal = createAppKit({
      adapters: [wagmiAdapter],
      projectId,
      networks: [baseSepolia, base, mainnet, arbitrum],
      defaultNetwork: baseSepolia,
      metadata,
      features: {
        analytics: false,
      },
    });

    appKitOpen = () => modal.open();
  } catch (error) {
    console.error("Failed to initialize AppKit", error);
  } finally {
    initialized = true;
  }
}

export function openWalletModal() {
  if (!initialized) {
    initAppKit();
  }

  if (appKitOpen) {
    appKitOpen();
    return;
  }

  console.warn("Wallet modal is not available. Check NEXT_PUBLIC_PROJECT_ID/AppKit config.");
}

