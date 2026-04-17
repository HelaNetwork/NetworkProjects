"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useAppStore } from "@/store/app-store";
import { generateIdentityHash } from "@/lib/zk";

export function useAuth() {
  const { address, isConnected: walletConnected } = useAccount();
  const {
    setAuth,
    disconnect,
    identityHash,
    isConnected,
    profile,
    hydrate,
  } = useAppStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (walletConnected && address) {
      const hash = generateIdentityHash(address);
      setAuth(address, hash);
    } else if (!walletConnected && isConnected) {
      disconnect();
    }
  }, [walletConnected, address, setAuth, disconnect, isConnected]);

  return {
    address,
    identityHash,
    isConnected: walletConnected && isConnected,
    hasProfile: !!profile,
    profile,
  };
}
