'use client';

import Link from 'next/link';
import { TopNavBar } from '@/components/TopNavBar';
import { useReveal, useStaggerReveal } from '@/hooks/useScrollAnimation';

export default function FAQPage() {
  const headerRef = useReveal(0);
  const faqsRef = useStaggerReveal(80);
  const ctaRef = useReveal(0);

  const faqs = [
    { q: "What is Trovia?", a: "Trovia is a decentralized marketplace for AI-powered agents that automate trading, yield farming, content creation, and business tasks on blockchain." },
    { q: "How do I activate an agent?", a: "Browse the marketplace, click on an agent, configure its settings, and click 'Activate'. You'll need to approve the HLUSD payment via MetaMask." },
    { q: "What is HLUSD?", a: "HLUSD is the stablecoin used on HeLa testnet for agent payments and escrow. You can obtain it through faucets or testnet transactions." },
    { q: "How much do agents cost?", a: "Each agent has a different price (typically 10-100 HLUSD per activation). Check the agent details page for exact pricing." },
    { q: "Is my money safe?", a: "Your funds are held in smart contract escrow. However, always read the agent description and test with small amounts first. No system is 100% risk-free." },
    { q: "Can I cancel an agent?", a: "Yes, you can deactivate agents from your dashboard. Depending on the agent's state, you may be refunded unused fees." },
    { q: "What's the difference between agents?", a: "Trading Agent executes trades. Yield Orchestrator monitors LP yields. Social Sentinel generates content. Arb Master finds arbitrage. Schedule Master handles recurring tasks. Business Assistant provides insights." },
    { q: "Do I need a wallet?", a: "Yes, you need MetaMask (or compatible wallet) installed and connected to HeLa testnet to use Trovia." },
    { q: "How do I switch to HeLa testnet?", a: "Click the [CONNECT WALLET] button. If you're on a different network, you'll be prompted to switch. Approve the network switch in MetaMask." },
    { q: "Can I publish my own agent?", a: "Yes! Go to the [PUBLISH] page, fill in your agent details, and submit. After review, it will appear in the marketplace." },
    { q: "Are agents safe from hacking?", a: "Smart contracts are audited for security. However, no system is immune. Always use testnet first and never invest more than you can afford to lose." },
    { q: "How are agents executed?", a: "Agents run autonomously on-chain through smart contracts. You can view execution logs and results in your dashboard." },
    { q: "What if an agent loses money?", a: "You are responsible for your investment decisions. Read the disclaimer and agent description carefully. Trovia is not liable for market losses." },
    { q: "How do I get support?", a: "Visit our Contact page or join our Discord community for help from the team and other users." },
    { q: "Is Trovia available on mainnet?", a: "Currently, Trovia operates on HeLa testnet. Mainnet deployment is planned for future releases." }
  ];

  return (
    <>
      <TopNavBar />
      <div className="min-h-screen bg-black text-white pt-24 pb-16 px-8">
        <div className="max-w-4xl mx-auto">
          <div ref={headerRef} className="reveal-up mb-8">
            <span className="text-sm opacity-60 uppercase">[ FAQ ]</span>
            <h1 className="font-headline text-5xl font-bold mt-4 mb-8">Frequently Asked Questions</h1>
          </div>

          <div ref={faqsRef} className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} data-item className="border border-white/20 p-6 hover:border-white/60 transition-all duration-500 group hover:bg-white/[0.04]">
                <h3 className="font-bold text-base text-white mb-3">{faq.q}</h3>
                <p className="font-body text-sm opacity-70 group-hover:opacity-90 transition-opacity">{faq.a}</p>
              </div>
            ))}
          </div>

          <div ref={ctaRef} className="mt-12 pt-8 border-t border-white/20 reveal-up">
            <p className="font-body text-sm opacity-60 mb-4">Still have questions?</p>
            <Link href="/contact" className="text-white hover:opacity-60 transition">
              Contact Support →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
