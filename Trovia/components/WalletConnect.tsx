"use client";

import { useEffect, useState } from "react";
import {
  clearConnectedAccount,
  connectWallet,
  ensureHeLaNetwork,
  getCurrentAccount
} from "@/lib/wallet";

export function WalletConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function hydrateAccount() {
      try {
        const currentAccount = await getCurrentAccount();
        if (mounted && currentAccount) {
          setAddress(currentAccount);
          setIsConnected(true);
        }
      } catch {
        // Ignore hydration failures until user clicks connect.
      }
    }

    hydrateAccount();

    return () => {
      mounted = false;
    };
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const account = await connectWallet();
      await ensureHeLaNetwork();

      setAddress(account);
      setIsConnected(true);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert(error instanceof Error ? error.message : "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    clearConnectedAccount();
    setIsConnected(false);
    setAddress(null);
  };

  return (
    <button
      onClick={isConnected ? handleDisconnect : handleConnect}
      disabled={isConnecting}
      className="font-mono text-xs hover:bg-white hover:text-black transition-colors duration-150 px-4 py-2 border border-white/20 bracket-btn"
    >
      {isConnecting
        ? "CONNECTING..."
        : isConnected && address
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : "CONNECT METAMASK"}
    </button>
  );
}
