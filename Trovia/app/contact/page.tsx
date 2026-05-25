'use client';

import Link from 'next/link';
import { TopNavBar } from '@/components/TopNavBar';
import { useReveal, useStaggerReveal } from '@/hooks/useScrollAnimation';

export default function ContactPage() {
  const headerRef = useReveal(0);
  const cardsRef = useStaggerReveal(100);
  const formRef = useReveal(0);
  const statsRef = useStaggerReveal(120);
  const linksRef = useReveal(0);

  return (
    <>
      <TopNavBar />
      <div className="min-h-screen bg-black text-white pt-24 pb-16 px-8">
        <div className="max-w-4xl mx-auto">
          <div ref={headerRef} className="reveal-up mb-12">
            <span className="text-sm opacity-60 uppercase">[ CONTACT & SUPPORT ]</span>
            <h1 className="font-headline text-5xl font-bold mt-4 mb-8">Get in Touch</h1>
            <p className="font-body text-lg opacity-80">Have questions? We&apos;re here to help.</p>
          </div>

          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {[
              { title: "Email Support", desc: "For inquiries and support:", link: "mailto:support@trovia.ai", text: "support@trovia.ai" },
              { title: "Business Inquiries", desc: "For partnerships and collaborations:", link: "mailto:business@trovia.ai", text: "business@trovia.ai" },
              { title: "LinkedIn", desc: "Connect with the team:", link: "https://www.linkedin.com/in/aman-choudhary-01a836329/", text: "linkedin.com/in/aman-choudhary →" },
              { title: "Security Issues", desc: "Report vulnerabilities responsibly:", link: "mailto:security@trovia.ai", text: "security@trovia.ai" },
            ].map((card, i) => (
              <div key={i} data-item className="border border-white/20 p-8 hover:border-white/60 transition-all duration-500 group hover:bg-white/[0.04]">
                <h2 className="font-bold text-lg mb-4">{card.title}</h2>
                <p className="font-body text-sm opacity-70 mb-4">{card.desc}</p>
                <a href={card.link} target={card.link.startsWith("http") ? "_blank" : undefined} rel={card.link.startsWith("http") ? "noopener noreferrer" : undefined} className="text-white hover:opacity-60 transition font-mono">{card.text}</a>
              </div>
            ))}
          </div>

          <div ref={formRef} className="border border-white/20 p-8 mb-12 reveal-up hover:border-white/60 transition-all duration-500">
            <h2 className="font-bold text-lg mb-6">Contact Form</h2>
            <form className="space-y-6">
              {[
                { label: "Name", type: "text", placeholder: "Your name" },
                { label: "Email", type: "email", placeholder: "your@email.com" },
                { label: "Subject", type: "text", placeholder: "Message subject" },
              ].map((field, i) => (
                <div key={i}>
                  <label className="block font-body text-sm font-bold mb-2">{field.label}</label>
                  <input type={field.type} className="w-full bg-black border border-white/20 text-white px-4 py-2 focus:border-white transition outline-none" placeholder={field.placeholder} />
                </div>
              ))}
              <div>
                <label className="block font-body text-sm font-bold mb-2">Message</label>
                <textarea className="w-full bg-black border border-white/20 text-white px-4 py-2 focus:border-white transition outline-none h-32" placeholder="Your message..." />
              </div>
              <button type="submit" className="bg-white text-black px-8 py-3 font-bold hover:opacity-80 transition glow-effect">[ SEND MESSAGE ]</button>
            </form>
          </div>

          <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: "RESPONSE TIME", value: "24-48 Hours" },
              { label: "SUPPORT HOURS", value: "24/7" },
              { label: "LANGUAGES", value: "English" },
            ].map((stat, i) => (
              <div key={i} data-item className="text-center">
                <p className="font-body text-xs opacity-60 mb-2">{stat.label}</p>
                <p className="font-headline text-2xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          <div ref={linksRef} className="mt-12 pt-8 border-t border-white/20 reveal-up">
            <div className="flex flex-wrap gap-4">
              <Link href="/faq" className="text-white hover:opacity-60 transition text-sm">[ FAQ ]</Link>
              <Link href="/privacy" className="text-white hover:opacity-60 transition text-sm">[ PRIVACY ]</Link>
              <Link href="/terms" className="text-white hover:opacity-60 transition text-sm">[ TERMS ]</Link>
              <Link href="/security" className="text-white hover:opacity-60 transition text-sm">[ SECURITY ]</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
