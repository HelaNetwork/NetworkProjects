'use client';

import Link from 'next/link';
import { TopNavBar } from '@/components/TopNavBar';
import { useReveal, useStaggerReveal } from '@/hooks/useScrollAnimation';

export default function CookiesPage() {
  const headerRef = useReveal(0);
  const sectionsRef = useStaggerReveal(100);
  const ctaRef = useReveal(0);

  return (
    <>
      <TopNavBar />
      <div className="min-h-screen bg-black text-white pt-24 pb-16 px-8">
        <div className="max-w-4xl mx-auto">
          <div ref={headerRef} className="reveal-up mb-12">
            <span className="text-sm opacity-60 uppercase">[ COOKIE POLICY ]</span>
            <h1 className="font-headline text-5xl font-bold mt-4 mb-8">Cookie Policy</h1>
            <p className="font-body text-xs opacity-60">Last Updated: April 2026</p>
          </div>

          <div ref={sectionsRef} className="space-y-8 font-body text-sm opacity-80 leading-relaxed">
            <section data-item>
              <h2 className="font-bold text-lg text-white mb-3">1. What Are Cookies?</h2>
              <p>Cookies are small text files stored on your device when you visit a website. They help us improve your experience, remember your preferences, and analyze how you use Trovia.</p>
            </section>

            <section data-item>
              <h2 className="font-bold text-lg text-white mb-3">2. Types of Cookies We Use</h2>
              <div className="space-y-4 ml-4">
                {[
                  { type: "Essential Cookies", desc: "Required for basic site functionality (authentication, security). Cannot be disabled." },
                  { type: "Functional Cookies", desc: "Remember your preferences, wallet connection state, and theme settings." },
                  { type: "Analytics Cookies", desc: "Help us understand how users interact with Trovia (via Google Analytics)." },
                  { type: "Marketing Cookies", desc: "Used to track and personalize marketing content (optional)." },
                ].map((cookie, i) => (
                  <div key={i}>
                    <h3 className="font-bold text-white mb-2">{cookie.type}</h3>
                    <p>{cookie.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section data-item>
              <h2 className="font-bold text-lg text-white mb-3">3. Specific Cookies</h2>
              <div className="border border-white/20 p-4 space-y-3">
                <div className="grid grid-cols-3 gap-4 pb-3 border-b border-white/10">
                  <span className="font-bold">Name</span>
                  <span className="font-bold">Purpose</span>
                  <span className="font-bold">Expiry</span>
                </div>
                {[
                  ["session_id", "User authentication", "Session"],
                  ["wallet_address", "Connected wallet tracking", "30 days"],
                  ["theme_preference", "Dark/light mode setting", "1 year"],
                  ["_ga", "Google Analytics tracking", "2 years"],
                ].map(([name, purpose, expiry], i) => (
                  <div key={i} className="grid grid-cols-3 gap-4"><span>{name}</span><span>{purpose}</span><span>{expiry}</span></div>
                ))}
              </div>
            </section>

            <section data-item>
              <h2 className="font-bold text-lg text-white mb-3">4. Cookie Consent</h2>
              <p>When you first visit Trovia, we ask for your consent to use non-essential cookies. You can manage your preferences at any time by updating your cookie settings.</p>
            </section>

            <section data-item>
              <h2 className="font-bold text-lg text-white mb-3">5. Third-Party Cookies</h2>
              <p>We may allow third-party services (Google Analytics, MetaMask, blockchain explorers) to set cookies. These services have their own cookie policies.</p>
            </section>

            <section data-item>
              <h2 className="font-bold text-lg text-white mb-3">6. Managing Cookies</h2>
              <p>You can disable cookies in your browser settings, but this may affect Trovia functionality. Most browsers allow you to refuse cookies or alert you when cookies are being sent.</p>
            </section>

            <section data-item>
              <h2 className="font-bold text-lg text-white mb-3">7. Changes to This Policy</h2>
              <p>We may update this Cookie Policy periodically. We&apos;ll notify you of significant changes via email or a prominent notice on our website.</p>
            </section>

            <section data-item>
              <h2 className="font-bold text-lg text-white mb-3">8. Contact Us</h2>
              <p>Questions about cookies? Contact us at: <span className="text-white">privacy@trovia.ai</span></p>
            </section>
          </div>

          <div ref={ctaRef} className="mt-12 pt-8 border-t border-white/20 reveal-up">
            <Link href="/privacy" className="text-white hover:opacity-60 transition">← Back to Privacy Policy</Link>
          </div>
        </div>
      </div>
    </>
  );
}
