'use client';

import Link from 'next/link';
import { TopNavBar } from '@/components/TopNavBar';
import { useReveal, useStaggerReveal } from '@/hooks/useScrollAnimation';

export default function AboutPage() {
  const headerRef = useReveal(0);
  const missionRef = useStaggerReveal(150);
  const valuesRef = useStaggerReveal(100);
  const techRef = useReveal(0);
  const teamRef = useStaggerReveal(120);
  const ctaRef = useReveal(0);

  return (
    <>
      <TopNavBar />
      <div className="min-h-screen bg-black text-white pt-24 pb-16 px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div ref={headerRef} className="mb-16 reveal-up">
            <span className="text-sm opacity-60 uppercase">[ ABOUT ]</span>
            <h1 className="font-headline text-7xl font-bold mt-4 mb-8">Trovia</h1>
            <p className="font-body text-lg opacity-80 leading-relaxed">
              Decentralized AI agents for automated trading, yield farming, content creation, and business intelligence.
            </p>
          </div>

          {/* Mission */}
          <div ref={missionRef} className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div data-item className="border border-white/20 p-8 hover:border-white/60 transition-all duration-500 group hover:bg-white/[0.04] scanline-hover">
              <h2 className="font-headline text-3xl font-bold mb-4">Mission</h2>
              <p className="font-body text-sm opacity-80 leading-relaxed group-hover:opacity-100 transition-opacity">
                To empower users with autonomous, AI-driven agents that execute complex tasks across finance, trading, and business intelligence with trust, transparency, and decentralization at their core.
              </p>
            </div>

            <div data-item className="border border-white/20 p-8 hover:border-white/60 transition-all duration-500 group hover:bg-white/[0.04] scanline-hover">
              <h2 className="font-headline text-3xl font-bold mb-4">Vision</h2>
              <p className="font-body text-sm opacity-80 leading-relaxed group-hover:opacity-100 transition-opacity">
                A future where intelligent agents handle routine tasks, enabling humans to focus on strategy and growth while blockchain technology ensures security and transparency.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="mb-16">
            <div ref={useReveal(0)} className="reveal-left">
              <h2 className="font-headline text-4xl font-bold mb-8">Our Values</h2>
            </div>
            <div ref={valuesRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Decentralization", desc: "No central authority. Users maintain full control of their agents and funds." },
                { title: "Transparency", desc: "All agent logic and execution is auditable on-chain with full execution logs." },
                { title: "Security", desc: "Smart contract audits and escrow mechanisms protect user funds at every step." },
                { title: "Innovation", desc: "Pushing the boundaries of what's possible with autonomous AI agents." },
                { title: "Accessibility", desc: "Making advanced agent automation available to everyone, not just institutions." },
                { title: "Community", desc: "Built by and for the community. Developer-friendly and open to contributions." },
              ].map((val, i) => (
                <div key={i} data-item className="border border-white/20 p-6 hover:border-white/60 transition-all duration-500 group hover:bg-white/[0.04]">
                  <h3 className="font-bold text-lg mb-3">{val.title}</h3>
                  <p className="font-body text-sm opacity-70 group-hover:opacity-90 transition-opacity">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div ref={techRef} className="mb-16 reveal-up">
            <h2 className="font-headline text-4xl font-bold mb-8">Technology</h2>
            <div className="border border-white/20 p-8 hover:border-white/60 transition-all duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { title: "Frontend", items: ["Next.js 14 with App Router", "React 18 + TypeScript", "Tailwind CSS", "MetaMask Integration"] },
                  { title: "Blockchain", items: ["HeLa Testnet (Chain ID 666888)", "Smart Contracts (Solidity)", "Ethers.js v6", "Agent Escrow & Execution"] },
                  { title: "AI", items: ["Google Gemini API", "Natural Language Processing", "Agent Intelligence Layer"] },
                  { title: "Infrastructure", items: ["API Routes (Next.js)", "Cloud Deployment Ready", "Health Monitoring"] },
                ].map((stack, i) => (
                  <div key={i}>
                    <h3 className="font-bold mb-4">{stack.title}</h3>
                    <ul className="font-body text-sm opacity-70 space-y-2">
                      {stack.items.map((item, j) => <li key={j}>• {item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-16">
            <div ref={useReveal(0)} className="reveal-right">
              <h2 className="font-headline text-4xl font-bold mb-8">Team</h2>
            </div>
            <div ref={teamRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Aman", role: "Frontend Engineering", specialty: "Coding", linkedin: "https://www.linkedin.com/in/aman-choudhary-01a836329/", github: "https://github.com/Aman0choudhary" },
                { name: "Nabil", role: "Smart Contracts + Blockchain", specialty: "Lead", linkedin: "https://www.linkedin.com/in/n4bi10p/", github: "https://github.com/n4bi10p" },
                { name: "Bhoomi", role: "AI Agent Execution Engine", specialty: "Core Execution", linkedin: "https://www.linkedin.com/in/bhoomi-awhad/", github: "https://github.com/Bhoomi-112" },
                { name: "Madhura", role: "Frontend Design & UX", specialty: "Design", linkedin: "https://www.linkedin.com/in/madhura-kene-a471503b4?utm_source=share_via_utm_content=profile_utm_medium=member_android", github: "https://github.com/Madhura-kene" },
                { name: "Saad", role: "Research, Testing & Content", specialty: "QA & Research", linkedin: "https://www.linkedin.com/in/saad-junedi-503470331", github: "https://github.com/Saadjunedi07" }
              ].map((member, idx) => (
                <div key={idx} data-item className="border border-white/20 p-6 hover:border-white/60 transition-all duration-500 group hover:bg-white/[0.04]">
                  <h3 className="font-headline text-2xl font-bold mb-2">{member.name}</h3>
                  <p className="font-body text-sm opacity-70 mb-1">{member.role}</p>
                  <p className="font-mono text-xs opacity-50 mb-4">[ {member.specialty} ]</p>
                  <div className="flex gap-4">
                    <Link href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors text-sm font-mono">[ LinkedIn ]</Link>
                    <Link href={member.github} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors text-sm font-mono">[ GitHub ]</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div ref={ctaRef} className="border border-white/20 p-12 text-center reveal-scale hover:border-white/60 transition-all duration-500 hover:bg-white/[0.04]">
            <h2 className="font-headline text-3xl font-bold mb-4">Join the Agent Revolution</h2>
            <p className="font-body text-sm opacity-70 mb-8">Start automating your crypto strategy with AI-powered agents today.</p>
            <Link href="/marketplace" className="inline-block bg-white text-black px-8 py-3 font-bold hover:opacity-80 transition glow-effect">
              [ BROWSE AGENTS ]
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
