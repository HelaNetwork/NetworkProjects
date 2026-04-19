"use client";

import Link from "next/link";
import { useWallet } from "@/context/WalletContext";
import { AgentSkillCard } from "@/components/connect-wallet/agent-skill-card";
import { ConnectWalletSplineScene } from "@/components/connect-wallet/spline-scene";

export default function ConnectWalletPage() {
  const { connectWallet } = useWallet();

  return (
    <div className="text-on-surface min-h-screen flex flex-col relative overflow-hidden antialiased selection:bg-surface-variant selection:text-primary bg-[#0A0B0D]">
      {/* TopNavBar */}
      <header className="docked full-width top-0 no-border flat no shadows z-50 bg-[#0A0B0D]">
        <div className="flex justify-between items-center w-full px-8 md:px-12 py-6 md:py-8 max-w-[1920px] mx-auto">
          {/* Brand & Subtitle */}
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold text-white tracking-tight">Propex</span>
            <span className="text-[11px] uppercase tracking-[0.05em] text-[#A0A3A8] font-medium hidden sm:block">Trustless AI Strategy Execution</span>
          </div>
          {/* Trailing Actions */}
          <div className="flex items-center gap-4">
            <button onClick={() => connectWallet()} className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm tracking-wide uppercase hover:opacity-90 transition-opacity">
              Connect Wallet
            </button>
            <button aria-label="Wallet" className="p-2 text-primary hover:text-white transition-colors duration-150 rounded-lg hover:bg-surface-container-low flex items-center justify-center">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>account_balance_wallet</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex flex-1 items-center px-6 pb-28 pt-6 sm:px-8 md:px-12 md:pb-32 lg:pb-24">
        <div className="mx-auto grid min-h-[calc(100vh-168px)] w-full max-w-[1920px] grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16 xl:gap-20">
          <section className="order-2 flex justify-center lg:order-1 lg:justify-start">
            <div className="w-full max-w-[440px] space-y-8 text-center lg:ml-[clamp(2rem,7vw,8rem)] lg:text-left">
              <div className="space-y-4">
                <h1 className="text-[40px] leading-[1.1] font-bold tracking-tight text-primary font-headline md:text-[44px]">
                  Institutional DeFi.
                  <br />
                  AI-Executed.
                </h1>
                <p className="mx-auto max-w-[380px] text-base leading-relaxed text-secondary font-body lg:mx-0">
                  Connect your wallet to access the Propex vault, explore AI strategy agents, and execute yield strategies on-chain.
                </p>
              </div>

              <div className="w-full space-y-4">
                <button
                  onClick={() => connectWallet()}
                  className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[12px] bg-gradient-to-b from-primary to-primary-container bg-primary text-[15px] font-bold tracking-wide text-on-primary uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-opacity hover:opacity-90"
                >
                  <span>Connect Wallet</span>
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[13px] text-secondary font-label uppercase tracking-[0.05em] lg:justify-start">
                  <span className="material-symbols-outlined text-[14px]">
                    lock
                  </span>
                  <span>Non-custodial. Your keys, your funds.</span>
                </div>
              </div>

              <AgentSkillCard />
            </div>
          </section>

          <section className="order-1 flex min-h-[320px] items-center justify-center sm:min-h-[380px] lg:order-2 lg:min-h-[640px]">
            <div className="flex h-full w-full items-center justify-center">
              <ConnectWalletSplineScene className="h-[560px] w-[560px] max-h-[70vh] max-w-full" />
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="docked full-width bottom-0 bg-transparent flat z-10 w-full">
        <div className="fixed bottom-0 w-full flex justify-center items-center gap-12 pb-12">
          <Link className="text-[13px] font-medium uppercase tracking-widest font-['Inter'] text-[#A0A3A8] hover:text-white transition-opacity" href="#">Docs</Link>
          <Link className="text-[13px] font-medium uppercase tracking-widest font-['Inter'] text-[#A0A3A8] hover:text-white transition-opacity" href="#">GitHub</Link>
          <span className="hidden">Propex Institutional</span>
        </div>
      </footer>

      {/* Background Accents (Subtle Institutional Depth) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex justify-center">
        {/* Subtle radial glow behind the main text to separate from pure black slightly */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-surface-container-lowest rounded-full blur-[120px] opacity-40"></div>
      </div>
    </div>
  );
}
