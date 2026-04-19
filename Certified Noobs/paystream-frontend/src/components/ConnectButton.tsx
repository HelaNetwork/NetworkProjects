"use client";

import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { useCallback, useState, useEffect } from "react";
import { helaTestnet } from "@/config/chains";

function hasInjectedProvider(): boolean {
  if (typeof window === "undefined") return false;
  const ethereum = (window as unknown as { ethereum?: unknown }).ethereum;
  return Boolean(ethereum);
}

export function ConnectButton() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending, error, reset: resetConnect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const [noProvider, setNoProvider] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setNoProvider(!hasInjectedProvider());
  }, []);

  const connector = connectors[0] ?? connectors.find((c) => (c as { type?: string }).type === "injected" || (c as { id?: string }).id === "injected");

  const handleConnect = useCallback(() => {
    if (!hasInjectedProvider()) {
      setNoProvider(true);
      return;
    }
    setNoProvider(false);
    resetConnect?.();
    if (connector) connect({ connector, chainId: helaTestnet.id });
  }, [connector, connect, resetConnect]);

  const handleSwitchToHeLa = useCallback(() => {
    switchChainAsync?.({ chainId: helaTestnet.id });
  }, [switchChainAsync]);

  if (mounted && isConnected && address) {
    const isWrongChain = chain && chain.id !== helaTestnet.id;
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-zinc-400 font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        {isWrongChain && (
          <button
            type="button"
            onClick={handleSwitchToHeLa}
            disabled={isSwitching}
            className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-50"
          >
            {isSwitching ? "Switching…" : "Switch to HeLa"}
          </button>
        )}
        <button
          type="button"
          onClick={() => disconnect()}
          className="rounded-lg bg-zinc-700 px-3 py-1.5 text-sm hover:bg-zinc-600"
        >
          Disconnect
        </button>
      </div>
    );
  }

  const isProviderNotFound =
    error?.message?.toLowerCase().includes("provider not found") ||
    (error as { name?: string })?.name === "ProviderNotFoundError" ||
    noProvider;

  const friendlyMessage = isProviderNotFound
    ? "No wallet detected. Install MetaMask or another browser wallet, then refresh."
    : error?.message;

  const showMessage = friendlyMessage || (!connector && !noProvider);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={isPending || !connector || noProvider}
        onClick={handleConnect}
        className="rounded-lg bg-[var(--accent)] px-4 py-2 font-medium text-black hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Connecting…" : noProvider ? "No wallet" : "Connect Wallet"}
      </button>
      {showMessage && (
        <p className="max-w-[260px] text-right text-xs text-red-400">
          {friendlyMessage || "No wallet found. Install MetaMask or another Web3 wallet."}
        </p>
      )}
      {(noProvider || isProviderNotFound) && (
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-right text-xs text-[var(--accent)] hover:underline"
        >
          Get MetaMask →
        </a>
      )}
    </div>
  );
}
