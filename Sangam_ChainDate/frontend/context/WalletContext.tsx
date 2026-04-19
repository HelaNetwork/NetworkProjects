"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ethers } from "ethers";
import { switchToHelaNetwork } from "@/lib/contracts";

interface WalletContextType {
  signer: ethers.Signer | null;
  address: string | null;
  loading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  signer: null,
  address: null,
  loading: false,
  error: null,
  connect: async () => {},
  disconnect: () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-reconnect if the user has already authorized MetaMask
  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return;

    // Check if already connected (no popup)
    eth.request({ method: "eth_accounts" }).then(async (accounts: string[]) => {
      if (accounts.length > 0) {
        try {
          const provider = new ethers.BrowserProvider(eth);
          const s = await provider.getSigner();
          const addr = await s.getAddress();
          setSigner(s);
          setAddress(addr);
        } catch (_) {}
      }
    });

    // Listen for account changes
    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        setSigner(null);
        setAddress(null);
      } else {
        try {
          const provider = new ethers.BrowserProvider(eth);
          const s = await provider.getSigner();
          const addr = await s.getAddress();
          setSigner(s);
          setAddress(addr);
        } catch (_) {}
      }
    };

    eth.on("accountsChanged", handleAccountsChanged);
    eth.on("chainChanged", () => window.location.reload());

    return () => {
      eth.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  async function connect() {
    const eth = (window as any).ethereum;
    if (!eth) {
      setError("No Ethereum wallet found. Install MetaMask.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await switchToHelaNetwork();
      const provider = new ethers.BrowserProvider(eth);
      await provider.send("eth_requestAccounts", []);
      const s = await provider.getSigner();
      const addr = await s.getAddress();
      setSigner(s);
      setAddress(addr);
    } catch (err: any) {
      setError(err.message || "Connection failed");
    } finally {
      setLoading(false);
    }
  }

  function disconnect() {
    setSigner(null);
    setAddress(null);
  }

  return (
    <WalletContext.Provider value={{ signer, address, loading, error, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
