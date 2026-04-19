'use client';

import Link from 'next/link';
import { TopNavBar } from '@/components/TopNavBar';
import { useReveal, useStaggerReveal } from '@/hooks/useScrollAnimation';

export default function TermsPage() {
  const headerRef = useReveal(0);
  const sectionsRef = useStaggerReveal(100);
  const ctaRef = useReveal(0);

  const sections = [
    { title: "1. Agreement to Terms", content: "By accessing and using Trovia, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service." },
    { title: "2. Use License", content: "Permission is granted to temporarily download one copy of the materials (information or software) on Trovia for personal, non-commercial transitory viewing only.", list: ["Modify or copy the materials", "Use the materials for any commercial purpose or for any public display", "Attempt to decompile or reverse engineer any software contained on Trovia", "Remove any copyright or other proprietary notations from the materials", "Transfer the materials to another person or \"mirror\" the materials on any other server"] },
    { title: "3. Disclaimer", content: "The materials on Trovia are provided on an 'as is' basis. Trovia makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights." },
    { title: "4. Limitations", content: "In no event shall Trovia or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Trovia." },
    { title: "5. Accuracy of Materials", content: "The materials appearing on Trovia could include technical, typographical, or photographic errors. Trovia does not warrant that any of the materials on its website are accurate, complete, or current." },
    { title: "6. Financial Disclaimer", content: "Trading and using AI agents involves substantial risk of loss. Past performance is not indicative of future results. You are solely responsible for your investment decisions. Trovia is not a financial advisor." },
    { title: "7. Smart Contract Risks", content: "Users acknowledge and accept the risks associated with blockchain technology and smart contracts, including but not limited to smart contract vulnerabilities, network failures, and market volatility." },
    { title: "8. User Responsibilities", content: null, list: ["You are responsible for maintaining your wallet security", "You must not use Trovia for illegal activities", "You agree not to interfere with platform operations", "You accept liability for all actions taken through your wallet"] },
    { title: "9. Termination", content: "Trovia may terminate or suspend your access immediately, without prior notice or liability, for any reason whatsoever, including if you breach the Terms." },
    { title: "10. Governing Law", content: "These terms and conditions are governed by and construed in accordance with the laws of your jurisdiction, and you irrevocably submit to the exclusive jurisdiction of the courts in that location." },
    { title: "11. Contact Information", content: "For inquiries about these Terms, please contact: legal@trovia.ai" },
  ];

  return (
    <>
      <TopNavBar />
      <div className="min-h-screen bg-black text-white pt-24 pb-16 px-8">
        <div className="max-w-4xl mx-auto">
          <div ref={headerRef} className="reveal-up mb-12">
            <span className="text-sm opacity-60 uppercase">[ TERMS OF SERVICE ]</span>
            <h1 className="font-headline text-5xl font-bold mt-4 mb-8">Terms of Service</h1>
            <p className="font-body text-xs opacity-60">Last Updated: April 2026</p>
          </div>

          <div ref={sectionsRef} className="space-y-8 font-body text-sm opacity-80 leading-relaxed">
            {sections.map((section, i) => (
              <section key={i} data-item>
                <h2 className="font-bold text-lg text-white mb-3">{section.title}</h2>
                {section.content && <p className={section.list ? "mb-3" : ""}>{section.content}</p>}
                {section.list && (
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    {section.list.map((item, j) => <li key={j}>{item}</li>)}
                  </ul>
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
