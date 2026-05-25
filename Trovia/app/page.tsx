'use client';

import Link from "next/link";
import { TopNavBar } from "@/components/TopNavBar";
import { useReveal, useStaggerReveal, useParallax, useCountUp } from "@/hooks/useScrollAnimation";

export default function Home() {
  // Section reveals — each with different direction
  const howItWorksStagger = useStaggerReveal(150);
  const aboutHeadRef = useReveal(0);
  const aboutCardsStagger = useStaggerReveal(120);
  const aboutValuesStagger = useStaggerReveal(100);
  const pricingHeadRef = useReveal(0);
  const pricingStagger = useStaggerReveal(100);
  const faqHeadRef = useReveal(0);
  const faqStagger = useStaggerReveal(100);
  const roadmapHeadRef = useReveal(0);
  const roadmapStagger = useStaggerReveal(120);
  const statsReveal = useStaggerReveal(150);
  const devHeadRef = useReveal(0);
  const devCtaRef = useReveal(200);
  const footerRef = useReveal(0);

  // Parallax for background elements
  const heroBgRef = useParallax(0.15);
  const devBgRef = useParallax(-0.1);

  // Counter refs for stats
  const stat1 = useCountUp("6");
  const stat2 = useCountUp("100");
  const stat3 = useCountUp("666888", 2000);

  return (
    <main className="min-h-screen bg-black">
      <TopNavBar />

      {/* ============================================================
          HERO SECTION
          ============================================================ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center border-b border-white/12 pt-24 overflow-hidden">
        {/* Parallax floating blurs */}
        <div ref={heroBgRef} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-white/[0.04] rounded-full blur-[100px] pulse-glow"></div>
          <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-white/[0.04] rounded-full blur-[80px] pulse-glow" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Corner brackets */}
        <div className="absolute top-20 left-8 text-6xl font-thin text-white/15 select-none hero-cta">&#91;</div>
        <div className="absolute top-20 right-8 text-6xl font-thin text-white/15 select-none hero-cta">&#93;</div>

        {/* Background circles */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06] flex items-center justify-center overflow-hidden">
          <div className="w-[800px] h-[800px] border border-white rounded-full flex items-center justify-center float-slow">
            <div className="w-[600px] h-[600px] border border-white rounded-full rotate-45"></div>
            <div className="w-[600px] h-[600px] border border-white rounded-full -rotate-45 absolute"></div>
          </div>
        </div>

        {/* Main hero content */}
        <h1 className="font-headline text-[14vw] leading-none text-white whitespace-nowrap mb-8 select-none hero-title">TROVIA</h1>

        <div className="relative z-10 flex flex-col items-center gap-6">
          <h2 className="font-headline text-4xl md:text-6xl text-center max-w-4xl tracking-tight text-white hero-subtitle">BRINGING AI AGENTS ON-CHAIN</h2>

          <div className="flex flex-col items-center gap-6 hero-cta">
            <Link
              href="/marketplace"
              className="bg-primary text-black px-12 py-4 font-headline text-2xl hover:bg-black hover:text-primary border border-primary transition-all duration-300 flex items-center gap-4 uppercase hover:shadow-lg hover:shadow-primary/50 glow-effect glitch-hover"
            >
              [ START NOW ↗ ]
            </Link>
            <div className="font-mono text-white/25 text-[10px] tracking-[0.5em] scroll-indicator">▽ SCROLL ▽</div>
          </div>
        </div>

        {/* HeLa Chain card — sleek dark floating card */}
        <div className="absolute bottom-10 right-10 z-20 hero-card hidden md:block">
          <div className="hela-floating-card group relative">
            {/* Animated border glow */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-white/30 via-white/10 to-white/30 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[1px]"></div>

            <div className="relative bg-black/70 backdrop-blur-xl border border-white/15 p-5 flex flex-col gap-3 w-[220px] rounded-sm group-hover:border-white/30 transition-all duration-500">
              {/* Top accent line */}
              <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>

              <div className="flex items-center gap-2">
                <span className="text-lg text-white/80 group-hover:text-white transition-colors">⬡</span>
                <span className="font-mono font-bold uppercase text-xs text-white tracking-wider">HeLa Chain</span>
                <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>

              <p className="text-[10px] uppercase font-bold text-white/40 leading-snug tracking-wide group-hover:text-white/60 transition-colors">L1 Optimized for Autonomous Logic</p>

              <div className="h-[1px] bg-white/10"></div>

              <Link href="/publish" className="font-mono text-[11px] text-white/50 hover:text-white uppercase tracking-wider transition-colors duration-300 flex items-center gap-1">
                <span>Deploy Agent</span>
                <span className="text-white/30 group-hover:translate-x-1 transition-transform duration-300">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          HOW IT WORKS — staggered card reveal
          ============================================================ */}
      <section ref={howItWorksStagger} className="grid grid-cols-1 md:grid-cols-3 border-b border-white/12 bg-black relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/[0.03] rounded-full blur-[80px]"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/[0.03] rounded-full blur-[80px]"></div>
        </div>
        {[
          { number: "01", title: "BROWSE", description: "Access the repository of pre-trained, on-chain autonomous entities specialized in DeFi, Data mining, and Social orchestrations.", link: "/marketplace", linkText: "EXPLORE AGENTS" },
          { number: "02", title: "ACTIVATE", description: "Stake HLUSD to fund your agent's compute budget. Immutable contracts ensure execution remains persistent and verifiable.", link: "/marketplace", linkText: "STAKE & DEPLOY" },
          { number: "03", title: "RUNS FOR YOU", description: "Your agent executes 24/7 on the HeLa network, delivering results directly to your wallet via cross-chain messaging.", link: "/dashboard", linkText: "VIEW DASHBOARD" },
        ].map((item, idx) => (
          <div key={idx} data-item className={`p-12 flex flex-col gap-8 ${idx < 2 ? "border-b md:border-b-0 md:border-r" : ""} border-white/12 relative group hover:bg-white/[0.04] transition-all duration-500`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <div className="font-headline text-4xl text-white relative z-10 glitch-hover">[ {item.number} ↗ ]</div>
            <div className="relative z-10">
              <h3 className="font-headline text-3xl mb-4 text-white uppercase">{item.title}</h3>
              <p className="text-white/60 font-body text-sm leading-relaxed uppercase">{item.description}</p>
            </div>
            <Link href={item.link} className="font-mono text-xs text-white/40 hover:text-white uppercase relative z-10 transition-colors duration-300">[ {item.linkText} ↗ ]</Link>
          </div>
        ))}
      </section>

      {/* ============================================================
          ABOUT SECTION — fade up + stagger cards
          ============================================================ */}
      <section className="bg-black border-b border-white/12 px-8 py-24">
        <div className="max-w-4xl mx-auto">
          <div ref={aboutHeadRef} className="reveal-up">
            <span className="text-sm opacity-60 uppercase">[ ABOUT ]</span>
            <h2 className="font-headline text-5xl font-bold mt-4 mb-12">Decentralized AI Agent Marketplace</h2>
          </div>
          <div ref={aboutCardsStagger} className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div data-item className="border border-white/20 p-8 hover:border-white/60 transition-all duration-500 group hover:bg-white/[0.04] scanline-hover">
              <h3 className="font-headline text-2xl font-bold mb-4">Mission</h3>
              <p className="font-body text-sm opacity-80 group-hover:opacity-100 transition-opacity">To empower users with autonomous, AI-driven agents that execute complex tasks across finance, trading, and business intelligence with trust, transparency, and decentralization at their core.</p>
            </div>
            <div data-item className="border border-white/20 p-8 hover:border-white/60 transition-all duration-500 group hover:bg-white/[0.04] scanline-hover">
              <h3 className="font-headline text-2xl font-bold mb-4">Vision</h3>
              <p className="font-body text-sm opacity-80 group-hover:opacity-100 transition-opacity">A future where intelligent agents handle routine tasks, enabling humans to focus on strategy and growth while blockchain technology ensures security and transparency.</p>
            </div>
          </div>
          <div ref={aboutValuesStagger} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Decentralization", desc: "No central authority. Full user control." },
              { title: "Transparency", desc: "All logic auditable on-chain." },
              { title: "Security", desc: "Smart contract escrow protection." },
            ].map((val, i) => (
              <div key={i} data-item className="border border-white/20 p-6 hover:border-white/60 transition-all duration-500 group hover:bg-white/[0.04]">
                <h3 className="font-bold text-lg mb-2">{val.title}</h3>
                <p className="font-body text-sm opacity-70 group-hover:opacity-90 transition-opacity">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          PRICING SECTION — stagger grid
          ============================================================ */}
      <section className="bg-black border-b border-white/12 px-8 py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-white/[0.03] rounded-full blur-[80px]"></div>
          <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-white/[0.03] rounded-full blur-[80px]"></div>
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div ref={pricingHeadRef} className="reveal-left">
            <span className="text-sm opacity-60 uppercase">[ PRICING ]</span>
            <h2 className="font-headline text-5xl font-bold mt-4 mb-12">Agent Pricing</h2>
          </div>
          <div ref={pricingStagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Trading Agent", price: "50 HLUSD", features: ["Price monitoring", "Automated swaps", "Slippage protection"] },
              { name: "Yield Orchestrator", price: "40 HLUSD", features: ["LP yield tracking", "Auto-compound", "Risk alerts"] },
              { name: "Social Sentinel", price: "30 HLUSD", features: ["Content generation", "AI-powered", "Multi-option replies"] },
              { name: "Arb Master Z", price: "60 HLUSD", features: ["Arbitrage detection", "Cross-chain", "Fast execution"] },
              { name: "Schedule Master", price: "25 HLUSD", features: ["Recurring payments", "Flexible scheduling", "Low fees"] },
              { name: "Business Assistant", price: "35 HLUSD", features: ["Business insights", "Market analysis", "Strategic advice"] },
            ].map((agent, idx) => (
              <div key={idx} data-item className="border border-white/20 p-6 hover:border-white/60 transition-all duration-500 group hover:bg-white/[0.04] backdrop-blur-sm relative glow-effect">
                <h3 className="font-bold text-lg mb-2 relative z-10">{agent.name}</h3>
                <div className="mb-4 relative z-10"><span className="text-2xl font-bold">{agent.price}</span></div>
                <ul className="space-y-2 mb-4 relative z-10">
                  {agent.features.map((f, i) => (
                    <li key={i} className="font-body text-sm opacity-70">✓ {f}</li>
                  ))}
                </ul>
                <Link href="/marketplace" className="text-white hover:opacity-60 text-sm relative z-10 transition-opacity duration-300">[ ACTIVATE ] →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          FAQ SECTION — slide from left + stagger
          ============================================================ */}
      <section className="bg-black border-b border-white/12 px-8 py-24">
        <div className="max-w-4xl mx-auto">
          <div ref={faqHeadRef} className="reveal-left">
            <span className="text-sm opacity-60 uppercase">[ FAQ ]</span>
            <h2 className="font-headline text-5xl font-bold mt-4 mb-12">Frequently Asked Questions</h2>
          </div>
          <div ref={faqStagger} className="space-y-4">
            {[
              { q: "What is Trovia?", a: "A decentralized marketplace for AI agents that automate trading, yield farming, content, and business tasks." },
              { q: "How do I activate an agent?", a: "Browse marketplace, select an agent, configure settings, approve HLUSD payment via MetaMask." },
              { q: "What is HLUSD?", a: "The stablecoin used on HeLa testnet for agent payments and escrow." },
              { q: "Is my money safe?", a: "Funds are held in smart contract escrow. Always test with small amounts first." },
              { q: "Can I cancel an agent?", a: "Yes, deactivate from dashboard. Unused fees may be refunded." },
            ].map((faq, i) => (
              <div key={i} data-item className="border border-white/20 p-4 hover:border-white/60 transition-all duration-500 group hover:bg-white/[0.04]">
                <h3 className="font-bold mb-2">{faq.q}</h3>
                <p className="font-body text-sm opacity-70 group-hover:opacity-90 transition-opacity">{faq.a}</p>
              </div>
            ))}
            <Link href="/faq" className="text-white hover:opacity-60 text-sm mt-4 block transition-opacity duration-300">View all FAQs →</Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          ROADMAP — slide from right + stagger
          ============================================================ */}
      <section className="bg-black border-b border-white/12 px-8 py-24">
        <div className="max-w-4xl mx-auto">
          <div ref={roadmapHeadRef} className="reveal-right">
            <span className="text-sm opacity-60 uppercase">[ ROADMAP ]</span>
            <h2 className="font-headline text-5xl font-bold mt-4 mb-12">Product Roadmap</h2>
          </div>
          <div ref={roadmapStagger} className="space-y-6">
            {[
              { q: "Q2 2026", items: ["HeLa testnet launch", "6 initial agents", "MetaMask integration", "Agent marketplace"] },
              { q: "Q3 2026", items: ["Mainnet deployment", "10+ new agents", "Advanced analytics", "Community governance"] },
              { q: "Q4 2026", items: ["Mobile app", "API integration", "Backtesting tools", "Enterprise features"] },
            ].map((phase, i) => (
              <div key={i} data-item className="border border-white/20 p-6 hover:border-white/60 transition-all duration-500 group hover:bg-white/[0.04] glow-effect">
                <h3 className="font-bold text-lg mb-4">{phase.q}</h3>
                <ul className="space-y-2">
                  {phase.items.map((item, ii) => (
                    <li key={ii} className="font-body text-sm opacity-70 group-hover:opacity-90 transition-opacity">→ {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          STATS — scale + count-up numbers
          ============================================================ */}
      <section ref={statsReveal} className="bg-white text-black py-20 px-8 border-b border-white/12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-transparent pointer-events-none"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-0 relative z-10">
          {[
            { ref: stat1, number: "6", suffix: "", label: "Agent Types" },
            { ref: stat2, number: "100", suffix: "%", label: "On-Chain" },
            { ref: null, number: "HLUSD", suffix: "", label: "Stable Gas" },
            { ref: stat3, number: "666888", suffix: "", label: "Chain ID" },
          ].map((stat, idx) => (
            <div key={idx} data-item className={`flex flex-col items-center md:items-start ${idx < 3 ? "md:border-r" : ""} border-black/10 px-8 group hover:opacity-60 transition-opacity duration-300`}>
              <div ref={stat.ref} className="font-headline text-[96px] leading-none uppercase group-hover:scale-110 transition-transform duration-300 reveal-scale">{stat.number === "HLUSD" ? "HLUSD" : "0"}{stat.suffix}</div>
              <div className="font-mono text-sm font-bold uppercase">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          DEVELOPER CTA — blur-in + parallax bg
          ============================================================ */}
      <section className="p-8 md:p-24 bg-black border-t border-white/12 relative overflow-hidden">
        <div ref={devBgRef} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/[0.04] rounded-full blur-[80px] float-anim"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/[0.04] rounded-full blur-[80px] float-anim" style={{ animationDelay: '1.5s' }}></div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-headline text-[25vw] text-white/[0.03] pointer-events-none select-none uppercase">BUILD</div>
        <div className="relative z-10 flex flex-col items-center text-center gap-8">
          <div ref={devHeadRef} className="reveal-blur">
            <div className="font-headline text-4xl md:text-5xl border border-white/20 px-6 py-2 text-white hover:border-white/60 hover:bg-white/[0.04] transition-all duration-300 glitch-hover">[ FOR DEVELOPERS ↗ ]</div>
          </div>
          <div ref={devCtaRef} className="reveal-up flex flex-col items-center gap-8">
            <h2 className="font-headline text-6xl md:text-8xl max-w-5xl text-white uppercase">BUILD AGENTS. EARN HLUSD.</h2>
            <div className="flex flex-col md:flex-row gap-6 mt-4">
              <Link href="/publish" className="bg-white text-black px-12 py-4 font-headline text-2xl hover:bg-black hover:text-white border border-white transition-all duration-300 uppercase hover:shadow-lg hover:shadow-white/20 glow-effect">[ PUBLISH ↗ ]</Link>
              <Link href="/marketplace" className="bg-transparent text-white px-12 py-4 font-headline text-2xl border border-white hover:bg-white hover:text-black transition-all duration-300 uppercase hover:shadow-lg hover:shadow-white/20 glitch-hover">[ LEARN MORE ↗ ]</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FOOTER
          ============================================================ */}
      <footer ref={footerRef} className="bg-black border-t border-white/12 px-8 py-16 reveal-up">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="font-bold mb-4">PRODUCT</h3>
              <ul className="space-y-2 text-sm opacity-60">
                <li><Link href="/marketplace">Marketplace</Link></li>
                <li><Link href="/dashboard">Dashboard</Link></li>
                <li><Link href="/publish">Publish</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">COMPANY</h3>
              <ul className="space-y-2 text-sm opacity-60">
                <li><a href="#about">About</a></li>
                <li><a href="#roadmap">Roadmap</a></li>
                <li><a href="https://www.linkedin.com/in/aman-choudhary-01a836329/?lipi=urn%3Ali%3Apage%3Ad_flagship3_feed%3Bh0Fd%2B%2BwYTr6DXMLAJ4A9Fw%3D%3D" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">SUPPORT</h3>
              <ul className="space-y-2 text-sm opacity-60">
                <li><Link href="/help">Help Center</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">LEGAL</h3>
              <ul className="space-y-2 text-sm opacity-60">
                <li><Link href="/privacy">Privacy</Link></li>
                <li><Link href="/terms">Terms</Link></li>
                <li><Link href="/security">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/12 pt-8 text-center text-sm opacity-60">
            <p>© 2026 Trovia. All rights reserved. | Built for DevClash 2026</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
