"use client";
import React from "react";
import { useWallet } from "@/context/WalletContext";

export default function WalletConnect() {
  const { address, loading, error, connect, disconnect } = useWallet();

  if (address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-mono text-emerald-700">
            {address.slice(0, 6)}…{address.slice(-4)}
          </span>
          <span className="text-xs text-emerald-600/70 ml-1">Hela</span>
        </div>
        <button
          onClick={disconnect}
          className="text-xs text-gray-400 hover:text-rose-500 transition-colors px-2 py-1 rounded-lg hover:bg-rose-50"
          title="Disconnect"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={connect}
        disabled={loading}
        className="group relative px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-400 text-white font-semibold text-sm tracking-wide overflow-hidden transition-all hover:scale-105 hover:shadow-lg hover:shadow-rose-500/30 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Connecting…
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12V7H5a2 2 0 010-4h14v4" /><path d="M3 5v14a2 2 0 002 2h16v-5" /><path d="M18 12a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            Connect Wallet
          </span>
        )}
      </button>
      {error && <p className="text-rose-500 text-xs text-center max-w-xs">{error}</p>}
    </div>
  );
}
