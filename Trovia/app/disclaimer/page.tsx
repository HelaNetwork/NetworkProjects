'use client';

import Link from 'next/link';
import { TopNavBar } from '@/components/TopNavBar';
import { useReveal, useStaggerReveal } from '@/hooks/useScrollAnimation';

export default function DisclaimerPage() {
  const headerRef = useReveal(0);
  const sectionsRef = useStaggerReveal(100);
  const ctaRef = useReveal(0);

  return (
    <>
      <TopNavBar />
      <div className="min-h-screen bg-black text-white pt-24 pb-16 px-8">
        <div className="max-w-4xl mx-auto">
          <div ref={headerRef} className="reveal-up mb-12">
            <span className="text-sm opacity-60 uppercase">[ DISCLAIMER ]</span>
            <h1 className="font-headline text-5xl font-bold mt-4 mb-8">Risk Disclaimer</h1>
          </div>

          <div ref={sectionsRef} className="space-y-8 font-body text-sm opacity-80 leading-relaxed">
            <section data-item className="border-l-4 border-red-500 pl-6 py-4">
              <h2 className="font-bold text-lg text-white mb-3">High-Risk Activity Warning</h2>
              <p>Trading and investing in cryptocurrency, including through automated agents, is extremely risky. You may lose all of your investment. Do not invest more than you can afford to lose.</p>
            </section>

            <section data-item>
              <h2 className="font-bold text-lg text-white mb-3">No Investment Advice</h2>
              <p>Trovia provides technology and tools, not investment advice. We do not recommend any specific investments. All trading decisions are your responsibility. Consult a financial advisor before making investment decisions.</p>
            </section>

            <section data-item>
              <h2 className="font-bold text-lg text-white mb-3">Agent Performance</h2>
              <p>Past agent performance does not guarantee future results. Market conditions, contract vulnerabilities, and unforeseen events may negatively impact agent execution. No agent is guaranteed to be profitable.</p>
            </section>

            <section data-item>
              <h2 className="font-bold text-lg text-white mb-3">Smart Contract Risks</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Smart contracts may contain bugs or vulnerabilities</li>
                <li>Blockchain networks may experience outages or congestion</li>
                <li>Gas fees may be higher than anticipated</li>
                <li>Smart contract behavior may not match documentation</li>
              </ul>
            </section>

            <section data-item>
              <h2 className="font-bold text-lg text-white mb-3">Market Risks</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Extreme market volatility can cause significant losses</li>
                <li>Liquidity may be insufficient to execute trades</li>
                <li>Slippage may occur during large trades</li>
                <li>Flash crashes and manipulation may occur</li>
              </ul>
            </section>

            <section data-item>
              <h2 className="font-bold text-lg text-white mb-3">Regulatory Risks</h2>
              <p>Cryptocurrency regulations are evolving and may change. Your use of Trovia may become illegal in your jurisdiction. Trovia is not responsible for regulatory compliance in your location.</p>
            </section>

            <section data-item>
              <h2 className="font-bold text-lg text-white mb-3">Security Risks</h2>
              <p>Despite security measures, hacking, theft, and fraud may occur. Trovia is not responsible for losses due to security breaches or user negligence (e.g., sharing private keys).</p>
            </section>

            <section data-item>
              <h2 className="font-bold text-lg text-white mb-3">Acknowledgment</h2>
              <p>By using Trovia, you acknowledge that you have read, understood, and accept all risks associated with trading and using AI agents. You agree to hold Trovia harmless from any losses incurred.</p>
            </section>
          </div>

          <div ref={ctaRef} className="mt-12 pt-8 border-t border-white/20 reveal-up">
            <Link href="/" className="text-white hover:opacity-60 transition">← Back to Home</Link>
          </div>
        </div>
      </div>
    </>
  );
}
