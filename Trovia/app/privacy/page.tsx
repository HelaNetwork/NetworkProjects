'use client';

import Link from 'next/link';
import { TopNavBar } from '@/components/TopNavBar';
import { useReveal, useStaggerReveal } from '@/hooks/useScrollAnimation';

export default function PrivacyPage() {
  const headerRef = useReveal(0);
  const sectionsRef = useStaggerReveal(100);
  const ctaRef = useReveal(0);

  const sections = [
    { title: "1. Introduction", content: "Trovia (\"we,\" \"our,\" \"us,\" or \"Company\") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and otherwise handle your information when you visit our website and use our decentralized agent marketplace." },
    { title: "2. Information We Collect", content: null, list: ["Wallet address and transaction history (via MetaMask connection)", "Agent configuration preferences and selections", "Execution logs and interaction data", "Email address (if voluntarily provided for support)", "Browser and device information (automatically collected)"] },
    { title: "3. How We Use Your Information", content: null, list: ["To provide and improve our marketplace services", "To process agent activations and executions", "To send transactional notifications", "To comply with legal obligations", "To prevent fraud and maintain security"] },
    { title: "4. Data Retention", content: "We retain your information for as long as necessary to provide our services. Execution logs are stored on-chain indefinitely. Account data may be deleted upon request, subject to legal requirements." },
    { title: "5. Security", content: "We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure. You are responsible for maintaining the confidentiality of your wallet private keys." },
    { title: "6. Third-Party Services", content: "We use third-party services including Google Gemini API for agent intelligence and blockchain networks for transaction processing. These services have their own privacy policies." },
    { title: "7. Contact Us", content: "For privacy inquiries, please contact us at: privacy@trovia.ai" },
  ];

  return (
    <>
      <TopNavBar />
      <div className="min-h-screen bg-black text-white pt-24 pb-16 px-8">
        <div className="max-w-4xl mx-auto">
          <div ref={headerRef} className="reveal-up mb-12">
            <span className="text-sm opacity-60 uppercase">[ PRIVACY POLICY ]</span>
            <h1 className="font-headline text-5xl font-bold mt-4 mb-8">Privacy Policy</h1>
            <p className="font-body text-xs opacity-60">Last Updated: April 2026</p>
          </div>

          <div ref={sectionsRef} className="space-y-8 font-body text-sm opacity-80 leading-relaxed">
            {sections.map((section, i) => (
              <section key={i} data-item>
                <h2 className="font-bold text-lg text-white mb-3">{section.title}</h2>
                {section.content && <p>{section.content}</p>}
                {section.list && (
                  <>
                    {section.title.includes("Collect") && <p className="mb-3">We collect information in the following ways:</p>}
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      {section.list.map((item, j) => <li key={j}>{item}</li>)}
                    </ul>
                  </>
                )}
              </section>
            ))}
          </div>

          <div ref={ctaRef} className="mt-12 pt-8 border-t border-white/20 reveal-up">
            <Link href="/contact" className="text-white hover:opacity-60 transition">← Back to Contact</Link>
          </div>
        </div>
      </div>
    </>
  );
}
