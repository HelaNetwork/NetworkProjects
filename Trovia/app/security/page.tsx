'use client';

import Link from 'next/link';
import { TopNavBar } from '@/components/TopNavBar';
import { useReveal, useStaggerReveal } from '@/hooks/useScrollAnimation';

export default function SecurityPage() {
  const headerRef = useReveal(0);
  const sectionsRef = useStaggerReveal(100);
  const linksRef = useReveal(0);

  const sections = [
    { title: "1. Smart Contract Security", items: ["All smart contracts undergo professional security audits before deployment", "Contracts are immutable once deployed, preventing unauthorized modifications", "Escrow mechanisms ensure user funds are always protected in smart contracts", "Multi-signature wallets guard contract owner functions", "Regular vulnerability assessments and bug bounties active"] },
    { title: "2. Wallet Security", items: ["We use MetaMask for industry-standard wallet integration", "Private keys never leave your device—always stored locally in MetaMask", "We never request or store your private keys or seed phrases", "Transaction signing happens locally on your device", "Always verify contract addresses before approving transactions"] },
    { title: "3. Frontend Security", items: ["HTTPS encryption for all data in transit", "Content Security Policy (CSP) prevents XSS attacks", "Regular dependency updates and security patches", "No sensitive data stored in browser local storage", "DDoS protection and rate limiting on API routes"] },
    { title: "4. Data Protection", items: ["Minimal data collection—only necessary for functionality", "Blockchain transactions are public and immutable by design", "Personal information (email) is encrypted and never shared", "GDPR compliant data handling and deletion policies", "Regular data backups with secure storage"] },
    { title: "5. Best Security Practices", items: ["✓ Use a hardware wallet (Ledger, Trezor) for large amounts", "✓ Enable 2FA on all accounts associated with crypto", "✓ Never click suspicious links or install unknown extensions", "✓ Verify URLs before entering credentials (phishing prevention)", "✓ Keep your browser and operating system updated", "✓ Use a dedicated browser or sandbox for crypto activities", "✓ Test agents with small amounts first on testnet", "✓ Monitor your wallet regularly for suspicious activity"] },
  ];

  return (
    <>
      <TopNavBar />
      <div className="min-h-screen bg-black text-white pt-24 pb-16 px-8">
        <div className="max-w-4xl mx-auto">
          <div ref={headerRef} className="reveal-up mb-12">
            <span className="text-sm opacity-60 uppercase">[ SECURITY ]</span>
            <h1 className="font-headline text-5xl font-bold mt-4 mb-8">Security & Privacy</h1>
            <p className="font-body text-lg opacity-80">How we protect your funds and data on Trovia.</p>
          </div>

          <div ref={sectionsRef} className="space-y-8 font-body text-sm opacity-80 leading-relaxed">
            {sections.map((section, i) => (
              <section key={i} data-item>
                <h2 className="font-bold text-lg text-white mb-3">{section.title}</h2>
                <div className="space-y-3 ml-4">
                  {section.items.map((item, j) => <p key={j}>• {item}</p>)}
                </div>
              </section>
            ))}

            <section data-item>
              <h2 className="font-bold text-lg text-white mb-3">6. Bug Bounty Program</h2>
              <p>We offer bounties for responsible vulnerability disclosures. If you discover a security issue, please report it to <span className="text-white">security@trovia.ai</span> rather than publicly disclosing it.</p>
            </section>

            <section data-item>
              <h2 className="font-bold text-lg text-white mb-3">7. Incident Response</h2>
              <p>In the unlikely event of a security incident, we will:</p>
              <div className="space-y-2 ml-4 mt-3">
                <p>• Immediately stop affected operations</p>
                <p>• Notify all affected users within 24 hours</p>
                <p>• Conduct a thorough investigation and post-mortem</p>
                <p>• Implement fixes and security improvements</p>
                <p>• Provide compensation where appropriate</p>
              </div>
            </section>

            <section data-item>
              <h2 className="font-bold text-lg text-white mb-3">8. Security Audit History</h2>
              <div className="border border-white/20 p-4 space-y-3">
                <div className="flex justify-between pb-2 border-b border-white/10">
                  <span className="font-bold">Audit Date</span>
                  <span className="font-bold">Auditor</span>
                  <span className="font-bold">Status</span>
                </div>
                <div className="flex justify-between"><span>April 2026</span><span>Trail of Bits</span><span className="text-green-500">Passed ✓</span></div>
                <div className="flex justify-between"><span>Q3 2026 (Planned)</span><span>Certora</span><span className="text-white/60">Scheduled</span></div>
              </div>
            </section>

            <section data-item>
              <h2 className="font-bold text-lg text-white mb-3">9. Compliance</h2>
              <p>Trovia complies with GDPR, CCPA, and other privacy regulations where applicable. We maintain security certifications and follow industry best practices.</p>
            </section>

            <section data-item>
              <h2 className="font-bold text-lg text-white mb-3">10. Questions?</h2>
              <p>For security concerns or questions, contact: <span className="text-white">security@trovia.ai</span></p>
            </section>
          </div>

          <div ref={linksRef} className="mt-12 pt-8 border-t border-white/20 reveal-up">
            <div className="flex flex-wrap gap-4">
              <Link href="/disclaimer" className="text-white hover:opacity-60 transition text-sm">[ DISCLAIMER ]</Link>
              <Link href="/privacy" className="text-white hover:opacity-60 transition text-sm">[ PRIVACY ]</Link>
              <Link href="/terms" className="text-white hover:opacity-60 transition text-sm">[ TERMS ]</Link>
              <Link href="/contact" className="text-white hover:opacity-60 transition text-sm">[ CONTACT ]</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
