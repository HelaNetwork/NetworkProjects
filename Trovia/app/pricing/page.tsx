'use client';

import Link from 'next/link';
import { TopNavBar } from '@/components/TopNavBar';
import { useReveal, useStaggerReveal } from '@/hooks/useScrollAnimation';
import { PLATFORM_FEE_PERCENT } from '@/lib/platformFee';

export default function PricingPage() {
  const headerRef = useReveal(0);
  const gridRef = useStaggerReveal(100);
  const tiersRef = useReveal(0);
  const infoRef = useStaggerReveal(120);
  const ctaRef = useReveal(0);

  const agents = [
    { name: "Trading Agent", price: "5", period: "per activation", features: ["Price monitoring", "Automated swaps", "Slippage protection"] },
    { name: "Farming Agent", price: "5", period: "per activation", features: ["LP yield tracking", "Auto-compound", "Risk alerts"] },
    { name: "Scheduling Agent", price: "3", period: "per activation", features: ["Recurring payments", "Flexible scheduling", "Low fees"] },
    { name: "Portfolio Rebalancing Agent", price: "4", period: "per activation", features: ["Allocation drift checks", "Real swap rebalancing", "Guardrail controls"] },
    { name: "Content Reply Agent", price: "2", period: "per activation", features: ["Content generation", "Multi-option replies", "Tone control"] },
    { name: "Business Assistant Agent", price: "2", period: "per activation", features: ["Business insights", "Market analysis", "Strategic advice"] }
  ];

  return (
    <>
      <TopNavBar />
      <div className="min-h-screen bg-black text-white pt-24 pb-16 px-8">
        <div className="max-w-6xl mx-auto">
          <div ref={headerRef} className="reveal-up">
            <span className="text-sm opacity-60 uppercase">[ PRICING ]</span>
            <h1 className="font-headline text-5xl font-bold mt-4 mb-4">Agent Pricing</h1>
            <p className="font-body text-lg opacity-80 mb-12">Simple, transparent pricing. Pay only for what you use.</p>
            <p className="font-mono text-xs uppercase opacity-50 mb-12">
              {PLATFORM_FEE_PERCENT}% platform fee is included inside each activation price.
            </p>
          </div>

          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {agents.map((agent, idx) => (
              <div key={idx} data-item className="border border-white/20 p-8 hover:border-white/60 transition-all duration-500 flex flex-col group hover:bg-white/[0.04] glow-effect">
                <h3 className="font-bold text-lg text-white mb-2">{agent.name}</h3>
                <div className="mb-6 flex-1">
                  <span className="font-headline text-3xl font-bold">{agent.price}</span>
                  <span className="font-body text-xs opacity-60 ml-2">HLUSD {agent.period}</span>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {agent.features.map((feature, i) => (
                    <li key={i} className="font-body text-sm opacity-70 flex items-center"><span className="mr-2">✓</span> {feature}</li>
                  ))}
                </ul>
                <Link href={`/agent/${idx + 1}`} className="w-full border border-white text-white py-2 text-center hover:bg-white hover:text-black transition font-bold">[ ACTIVATE ]</Link>
              </div>
            ))}
          </div>

          <div ref={tiersRef} className="border border-white/20 p-8 mb-12 reveal-left hover:border-white/60 transition-all duration-500">
            <h2 className="font-bold text-2xl mb-6">Pricing Tiers</h2>
            <div className="space-y-4">
              {[
                ["Single Agent Activation", "Agent-specific price"],
                ["Multiple Agents", "Stack discounts available"],
                ["Execution Fees", "Included in activation"],
                ["Platform Fee", `${PLATFORM_FEE_PERCENT}% included in activation price`],
                ["Refunds", "Pro-rata based on usage"],
              ].map(([label, value], i, arr) => (
                <div key={i} className={`flex justify-between items-center py-3 ${i < arr.length - 1 ? "border-b border-white/10" : ""}`}>
                  <span className="font-body">{label}</span>
                  <span className="font-bold">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div ref={infoRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Free Testnet", desc: "Get HLUSD from faucet and experiment risk-free" },
              { title: "No Gas Fees", desc: "HeLa testnet has minimal transaction costs" },
              { title: "Transparent", desc: "See exact costs before activating any agent" },
            ].map((item, i) => (
              <div key={i} data-item className="border border-white/20 p-6 text-center hover:border-white/60 transition-all duration-500 hover:bg-white/[0.04]">
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="font-body text-sm opacity-70">{item.desc}</p>
              </div>
            ))}
          </div>

          <div ref={ctaRef} className="mt-12 pt-8 border-t border-white/20 reveal-up">
            <Link href="/marketplace" className="text-white hover:opacity-60 transition">Browse Agents →</Link>
          </div>
        </div>
      </div>
    </>
  );
}
