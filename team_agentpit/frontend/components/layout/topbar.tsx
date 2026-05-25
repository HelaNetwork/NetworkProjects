"use client";

import { cn } from "@/lib/utils";
import { useWallet } from "@/context/WalletContext";

type TopbarProps = {
  variant?: "vault" | "strategy" | "leaderboard" | "assets";
};

export function Topbar({ variant = "vault" }: TopbarProps) {
  const { address, isConnected, connectWallet } = useWallet();
  
  const displayAddress = isConnected && address
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : "Connect";

  if (variant === "strategy") {
    return (
      <header className="hidden md:flex justify-between items-center px-8 ml-[220px] w-[calc(100%-220px)] h-16 bg-[#0D0E10] border-b border-[#1A1C1F] shadow-none sticky top-0 z-40 font-['Inter'] tabular-nums">
        <div className="flex items-center gap-4">
        </div>
        <div className="flex items-center gap-4">
          <div onClick={connectWallet} className="flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-lg border border-outline-variant/15 text-sm text-secondary cursor-pointer hover:opacity-80 active:scale-95 transition-all">
            <span>{displayAddress}</span>
            <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
          </div>
        </div>
      </header>
    );
  }

  if (variant === "leaderboard") {
    return (
      <header className="flex justify-between items-center px-8 w-full h-16 bg-[#0D0E10] border-b border-[#1A1C1F] font-['Inter'] tabular-nums sticky top-0 z-40">
        <div className="text-xl font-bold text-white">Propex</div>
        <div className="flex items-center gap-4">
          <div onClick={connectWallet} className="flex items-center gap-2 bg-[#1F2022] px-3 py-1.5 rounded-full border border-outline-variant/15 text-sm text-[#A0A3A8] cursor-pointer hover:opacity-80 active:scale-95 transition-all">
            <span className="text-white font-medium">{displayAddress}</span>
            <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
          </div>
        </div>
      </header>
    );
  }

  if (variant === "assets") {
    return (
      <header className="w-full h-16 bg-[#0D0E10] border-b border-[#1A1C1F] flex justify-between items-center px-8 z-40 sticky top-0">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white font-['Inter'] tabular-nums">Assets</h2>
          <span className="text-sm text-[#A0A3A8] font-['Inter'] hidden sm:block">Overview of your vault holdings and strategy allocations</span>
        </div>
        <div className="flex items-center gap-4">
          <div onClick={connectWallet} className="flex items-center gap-2 bg-[#111214] px-3 py-1.5 rounded-full border border-white/5 cursor-pointer hover:opacity-80 active:scale-95 transition-all">
            <span className="text-sm font-medium text-white tabular-nums">{displayAddress}</span>
            <button className="text-[#A0A3A8] hover:text-white transition-colors flex items-center">
              <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  // default: vault
  return (
    <header className="flex justify-between items-center px-8 w-full h-16 border-b border-[#1A1C1F] bg-[#0D0E10] text-[#4F7EFF] font-['Inter'] tabular-nums shadow-none z-40 sticky top-0">
      <div className="text-[22px] font-bold text-white tracking-tight">Vault</div>
      <div onClick={connectWallet} className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-full border border-surface-container-high hover:opacity-80 cursor-pointer active:scale-95 transition-all">
        <span className="text-sm font-medium text-white">{displayAddress}</span>
        <span className="material-symbols-outlined text-[16px] text-[#A0A3A8]">account_balance_wallet</span>
      </div>
    </header>
  );
}
