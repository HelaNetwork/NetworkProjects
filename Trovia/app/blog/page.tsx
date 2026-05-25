'use client';

import Link from 'next/link';
import { TopNavBar } from '@/components/TopNavBar';
import { useReveal, useStaggerReveal } from '@/hooks/useScrollAnimation';

export default function BlogPage() {
  const headerRef = useReveal(0);
  const postsRef = useStaggerReveal(100);
  const ctaRef = useReveal(0);

  const posts = [
    { title: "Getting Started with Trading Agents", date: "April 15, 2026", category: "Tutorial", excerpt: "Learn how to activate and configure your first trading agent to automate crypto trading strategies." },
    { title: "Understanding Yield Farming Risks", date: "April 12, 2026", category: "Education", excerpt: "A deep dive into the risks and rewards of automated yield farming with AI agents." },
    { title: "How Smart Contracts Protect Your Funds", date: "April 10, 2026", category: "Security", excerpt: "Explore how Trovia's escrow contracts ensure your HLUSD is always safe and protected." },
    { title: "Marketplace Updates: New Features in v2.1", date: "April 8, 2026", category: "Updates", excerpt: "We've released new agent types, improved dashboard analytics, and faster execution times." },
    { title: "AI Agents vs Manual Trading: A Comparison", date: "April 5, 2026", category: "Analysis", excerpt: "Compare the pros and cons of automated agents versus traditional manual trading strategies." },
    { title: "Roadmap Preview: What's Coming Next", date: "April 1, 2026", category: "Roadmap", excerpt: "Sneak peek at upcoming features including mainnet deployment and new agent types." }
  ];

  return (
    <>
      <TopNavBar />
      <div className="min-h-screen bg-black text-white pt-24 pb-16 px-8">
        <div className="max-w-4xl mx-auto">
          <div ref={headerRef} className="reveal-up mb-12">
            <span className="text-sm opacity-60 uppercase">[ BLOG ]</span>
            <h1 className="font-headline text-5xl font-bold mt-4 mb-8">Resources & Articles</h1>
            <p className="font-body text-lg opacity-80">Learn about AI agents, blockchain, and automated trading.</p>
          </div>

          <div ref={postsRef} className="space-y-6">
            {posts.map((post, idx) => (
              <article key={idx} data-item className="border border-white/20 p-8 hover:border-white/60 transition-all duration-500 cursor-pointer group hover:bg-white/[0.04] glow-effect">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-bold text-xl text-white mb-2 group-hover:text-white/90">{post.title}</h2>
                    <div className="flex items-center gap-4 font-body text-xs opacity-60">
                      <span>{post.date}</span>
                      <span className="px-2 py-1 border border-white/20 group-hover:border-white/40 transition-colors">[ {post.category} ]</span>
                    </div>
                  </div>
                </div>
                <p className="font-body text-sm opacity-70 mb-4 group-hover:opacity-90 transition-opacity">{post.excerpt}</p>
                <a href="#" className="text-white hover:opacity-60 transition text-sm">Read more →</a>
              </article>
            ))}
          </div>

          <div ref={ctaRef} className="mt-12 pt-8 border-t border-white/20 reveal-scale">
            <div className="text-center">
              <p className="font-body text-sm opacity-60 mb-4">Subscribe to get updates on new articles</p>
              <div className="flex gap-2 max-w-sm mx-auto">
                <input type="email" placeholder="your@email.com" className="flex-1 bg-black border border-white/20 text-white px-4 py-2 text-sm focus:border-white transition outline-none" />
                <button className="bg-white text-black px-6 py-2 font-bold text-sm hover:opacity-80 transition glow-effect">[ SUBSCRIBE ]</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
