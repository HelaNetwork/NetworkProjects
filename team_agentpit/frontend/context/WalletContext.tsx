"use client";

import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { openWalletModal } from "@/lib/appkit";

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  // Hydration safety to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <WalletContext.Provider value={{
      address: mounted && isConnected && address ? address : null,
      isConnected: mounted ? isConnected : false,
      connectWallet: () => openWalletModal(),
      disconnectWallet: () => disconnect()
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
