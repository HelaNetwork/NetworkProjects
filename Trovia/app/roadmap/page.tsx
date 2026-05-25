'use client';

import Link from 'next/link';
import { TopNavBar } from '@/components/TopNavBar';
import { useReveal, useStaggerReveal } from '@/hooks/useScrollAnimation';

export default function RoadmapPage() {
  const headerRef = useReveal(0);
  const timelineRef = useStaggerReveal(150);
  const statsRef = useStaggerReveal(120);
  const ctaRef = useReveal(0);

  const roadmapItems = [
    { quarter: "Q2 2026", status: "In Progress", items: ["HeLa testnet deployment", "Agent marketplace launch", "MetaMask integration", "6 initial agent types"] },
    { quarter: "Q3 2026", status: "Planned", items: ["Mainnet deployment", "10+ new agent types", "Advanced dashboard analytics", "Agent cloning feature", "Community governance"] },
    { quarter: "Q4 2026", status: "Planned", items: ["Mobile app launch", "API for third-party integration", "Advanced backtesting tools", "Agent performance benchmarks", "Enterprise features"] },
    { quarter: "Q1 2027", status: "Planned", items: ["Multi-chain support", "Advanced AI training", "DAO governance", "Decentralized agent execution", "Institutional partnerships"] }
  ];

  return (
    <>
      <TopNavBar />
      <div className="min-h-screen bg-black text-white pt-24 pb-16 px-8">
        <div className="max-w-4xl mx-auto">
          <div ref={headerRef} className="reveal-up">
            <span className="text-sm opacity-60 uppercase">[ ROADMAP ]</span>
            <h1 className="font-headline text-5xl font-bold mt-4 mb-8">Product Roadmap</h1>
            <p className="font-body text-lg opacity-80 mb-12">Our vision for the future of decentralized AI agents.</p>
          </div>

          <div ref={timelineRef} className="space-y-8">
            {roadmapItems.map((item, idx) => (
              <div key={idx} data-item className="border border-white/20 p-8 hover:border-white/60 transition-all duration-500 group hover:bg-white/[0.04] glow-effect">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-headline text-2xl font-bold">{item.quarter}</h2>
                  <span className={`px-3 py-1 text-xs font-bold border ${item.status === 'In Progress' ? 'border-green-500 text-green-500' : 'border-white/40 text-white/60'}`}>[ {item.status} ]</span>
                </div>
                <ul className="space-y-3">
                  {item.items.map((subitem, i) => (
                    <li key={i} className="font-body text-sm opacity-70 flex items-center group-hover:opacity-90 transition-opacity"><span className="mr-3 text-green-500">→</span>{subitem}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div ref={statsRef} className="mt-12 pt-8 border-t border-white/20 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: "CURRENT PHASE", value: "Testnet" },
              { label: "AGENTS LIVE", value: "6" },
              { label: "NEXT MILESTONE", value: "Q3 2026" },
            ].map((stat, i) => (
              <div key={i} data-item className="text-center">
                <p className="font-body text-xs opacity-60 mb-2">{stat.label}</p>
                <p className="font-headline text-2xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          <div ref={ctaRef} className="mt-12 pt-8 border-t border-white/20 reveal-up">
            <p className="font-body text-sm opacity-60 mb-4">Stay updated on our progress</p>
            <div className="flex gap-4">
              <Link href="/blog" className="text-white hover:opacity-60 transition">[ BLOG ]</Link>
              <Link href="/contact" className="text-white hover:opacity-60 transition">[ CONTACT ]</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
