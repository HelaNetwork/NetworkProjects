"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useWallet } from "@/context/WalletContext";
import { useRouter } from "next/navigation";

type SidebarProps = {
  active: "vault" | "assets" | "strategy-market" | "leaderboard";
  variant?: "default" | "strategy" | "assets-view" | "leaderboard-view";
};

export function Sidebar({ active, variant = "default" }: SidebarProps) {
  const { disconnectWallet } = useWallet();
  const router = useRouter();

  const handleDisconnect = (e: React.MouseEvent) => {
    e.preventDefault();
    disconnectWallet();
    router.push("/connect-wallet");
  };

  // Vault
  // <nav class="hidden md:flex flex-col p-4 gap-1 bg-[#0D0E10] text-[#4F7EFF] font-['Inter'] antialiased tracking-tight fixed left-0 top-0 h-full w-[220px] border-r border-[#1A1C1F] shadow-none z-50">
  // Strategy Market
  // <nav class="hidden md:flex flex-col p-4 gap-1 bg-[#0D0E10] fixed left-0 top-0 h-full w-[220px] border-r border-[#1A1C1F] shadow-none z-50">
  // Leaderboard
  // <nav class="hidden md:flex flex-col p-4 gap-1 bg-[#0D0E10] border-r border-[#1A1C1F] font-['Inter'] antialiased tracking-tight fixed left-0 top-0 h-full w-[220px] z-50">
  // Assets
  // <nav class="fixed left-0 top-0 h-full w-[220px] bg-[#0D0E10] border-r border-[#1A1C1F] flex flex-col p-4 gap-1 z-50">

  const navClasses = cn(
    "fixed left-0 top-0 h-full w-[220px] bg-[#0D0E10] border-r border-[#1A1C1F] flex flex-col p-4 gap-1 z-50",
    variant === "default" && "hidden md:flex text-[#4F7EFF] font-['Inter'] antialiased tracking-tight shadow-none",
    variant === "strategy" && "hidden md:flex shadow-none",
    variant === "leaderboard-view" && "hidden md:flex font-['Inter'] antialiased tracking-tight",
    variant === "assets-view" && ""
  );

  const headerDivClasses = cn(
    "mb-8",
    variant === "assets-view" ? "px-2" : "px-4"
  );

  const pClasses = cn(
    "mt-1",
    variant === "default" ? "text-secondary text-xs" : 
    variant === "strategy" ? "text-xs text-secondary" :
    variant === "leaderboard-view" ? "text-xs text-[#A0A3A8] font-body" :
    "text-xs text-[#A0A3A8] font-['Inter'] antialiased tracking-tight"
  );

  const listDivClasses = cn(
    variant === "default" ? "flex flex-col gap-1 flex-1" :
    variant === "strategy" ? "flex-1 space-y-1" :
    variant === "leaderboard-view" ? "flex-1 flex flex-col gap-1 text-sm" :
    "flex-1 flex flex-col gap-1"
  );

  const getLinkClasses = (isActive: boolean, isStrategyVariant: boolean, isAssetsVariant: boolean) => {
    if (isStrategyVariant) {
      if (isActive) return "flex items-center gap-3 px-4 py-2.5 text-sm text-white font-medium bg-[#1F2022] rounded-lg scale-[0.98] active:opacity-80";
      return "flex items-center gap-3 px-4 py-2.5 text-sm text-[#A0A3A8] hover:text-white hover:bg-[#1F2022] transition-all duration-100 rounded-lg scale-[0.98] active:opacity-80";
    }
    if (isAssetsVariant) {
      if (isActive) return "flex items-center gap-3 px-3 py-2 text-white font-medium bg-[#1F2022] rounded-lg scale-[0.98] active:opacity-80";
      return "flex items-center gap-3 px-3 py-2 text-[#A0A3A8] hover:text-white hover:bg-[#1F2022] transition-all duration-100 rounded-lg scale-[0.98] active:opacity-80";
    }
    // Default & Leaderboard
    if (isActive) return "flex items-center gap-3 px-4 py-3 text-white font-medium bg-[#1F2022] rounded-lg scale-[0.98] active:opacity-80";
    return "flex items-center gap-3 px-4 py-3 text-[#A0A3A8] hover:text-white transition-colors hover:bg-[#1F2022] duration-100 rounded-lg scale-[0.98] active:opacity-80";
  };

  const footerDivClasses = cn(
    variant === "default" ? "mt-auto flex flex-col gap-1 border-t border-[#1A1C1F] pt-4" :
    variant === "strategy" ? "mt-auto space-y-1 pt-4 border-t border-[#1A1C1F]/50" :
    variant === "leaderboard-view" ? "mt-auto flex flex-col gap-1 border-t border-[#1A1C1F] pt-4 text-sm" :
    "mt-auto flex flex-col gap-1 pt-4 border-t border-[#1A1C1F]"
  );

  const getFooterLinkClasses = (isStrategyVariant: boolean, isAssetsVariant: boolean) => {
    if (isStrategyVariant) return "flex items-center gap-3 px-4 py-2.5 text-sm text-[#A0A3A8] hover:text-white hover:bg-[#1F2022] transition-all duration-100 rounded-lg scale-[0.98] active:opacity-80";
    if (isAssetsVariant) return "flex items-center gap-3 px-3 py-2 text-[#A0A3A8] hover:text-white hover:bg-[#1F2022] transition-all duration-100 rounded-lg scale-[0.98] active:opacity-80";
    return "flex items-center gap-3 px-4 py-3 text-[#A0A3A8] hover:text-white transition-colors hover:bg-[#1F2022] duration-100 rounded-lg scale-[0.98] active:opacity-80";
  };

  const navItems = [
    { id: "vault", label: "Vault", icon: "account_balance_wallet", href: "/vault" },
    { id: "assets", label: "Assets", icon: "database", href: "/assets" },
    { id: "strategy-market", label: "Strategy Market", icon: "storefront", href: "/strategy-market" },
    { id: "leaderboard", label: "Agent Leaderboard", icon: "leaderboard", href: "/leaderboard" },
  ];

  return (
    <nav className={navClasses}>
      <div className={headerDivClasses}>
        <h1 className="text-base font-bold text-white uppercase tracking-wider">Propex</h1>
        <p className={pClasses}>AI Execution Platform</p>
      </div>
      
      <div className={listDivClasses}>
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <Link key={item.id} href={item.href} className={getLinkClasses(isActive, variant === "strategy", variant === "assets-view")}>
              <span 
                className={cn(
                  "material-symbols-outlined", 
                  variant === "strategy" ? "text-lg" : "text-[20px]"
                )}
                {...(isActive && item.id === "strategy-market" && variant === "strategy" ? { style: { fontVariationSettings: "'FILL' 1" } } : {})}
              >
                {item.icon}
              </span>
              {variant === "assets-view" ? (
                <span className="text-sm font-['Inter'] antialiased tracking-tight">{item.label}</span>
              ) : (
                <span>{item.label}</span>
              )}
            </Link>
          );
        })}
      </div>
      
      <div className={footerDivClasses}>
        <button onClick={handleDisconnect} className={cn("w-full text-left", getFooterLinkClasses(variant === "strategy", variant === "assets-view"))}>
          <span className={cn("material-symbols-outlined", variant === "strategy" ? "text-lg" : "text-[20px]")}>logout</span>
          {variant === "assets-view" ? (
                <span className="text-sm font-['Inter'] antialiased tracking-tight">Disconnect Wallet</span>
              ) : (
                <span>Disconnect Wallet</span>
              )}
        </button>
      </div>
    </nav>
  );
}
