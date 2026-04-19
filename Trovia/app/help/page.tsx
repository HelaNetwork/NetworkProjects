'use client';

import Link from 'next/link';
import { TopNavBar } from '@/components/TopNavBar';
import { useReveal, useStaggerReveal } from '@/hooks/useScrollAnimation';

export default function HelpPage() {
  const headerRef = useReveal(0);
  const guidesRef = useStaggerReveal(100);
  const issuesRef = useReveal(0);
  const ctaRef = useReveal(0);

  const guides = [
    { title: "Getting Started", desc: "Connect your wallet and explore the agent marketplace", items: ["Connect MetaMask", "Switch to HeLa testnet", "Browse agents"] },
    { title: "Activating Agents", desc: "How to activate and configure AI agents", items: ["Select an agent", "Configure parameters", "Approve payment", "Monitor execution"] },
    { title: "Managing Your Dashboard", desc: "Track your active agents and execution history", items: ["View active agents", "Check execution logs", "Edit configurations", "Deactivate agents"] },
    { title: "Publishing Your Agent", desc: "List your own AI agent on the marketplace", items: ["Complete the form", "Define config schema", "Set pricing", "Submit for review"] },
    { title: "Troubleshooting", desc: "Solutions to common issues", items: ["Wallet connection", "Network switching", "Transaction errors", "Agent failures"] },
    { title: "Security Best Practices", desc: "Keep your funds and data safe", items: ["Never share private keys", "Verify contracts", "Use testnet first", "Enable 2FA"] }
  ];

  const issues = [
    { q: "MetaMask Not Connecting?", a: "Make sure MetaMask is installed and unlocked. Refresh the page and try again. Clear browser cache if issues persist." },
    { q: "Wrong Network?", a: "Click [CONNECT WALLET] to see a prompt to switch to HeLa testnet. Approve the network addition in MetaMask." },
    { q: "Agent Not Executing?", a: "Check your HLUSD balance. Some agents have minimum requirements. View execution logs for error details." },
    { q: "High Gas Fees?", a: "HeLa testnet has minimal fees. If fees seem high, check you're on the correct network (Chain ID 666888)." },
    { q: "Transaction Stuck?", a: "Wait 5-10 minutes for confirmation. If still pending, you may need to replace the transaction in MetaMask." },
  ];

  return (
    <>
      <TopNavBar />
      <div className="min-h-screen bg-black text-white pt-24 pb-16 px-8">
        <div className="max-w-4xl mx-auto">
          <div ref={headerRef} className="reveal-up mb-12">
            <span className="text-sm opacity-60 uppercase">[ HELP CENTER ]</span>
            <h1 className="font-headline text-5xl font-bold mt-4 mb-8">Help Center</h1>
            <p className="font-body text-lg opacity-80">Learn how to use Trovia and get the most out of AI agents.</p>
          </div>

          <div ref={guidesRef} className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {guides.map((guide, idx) => (
              <div key={idx} data-item className="border border-white/20 p-6 hover:border-white/60 transition-all duration-500 group hover:bg-white/[0.04]">
                <h3 className="font-bold text-lg text-white mb-2">{guide.title}</h3>
                <p className="font-body text-xs opacity-60 mb-4">{guide.desc}</p>
                <ul className="space-y-2">
                  {guide.items.map((item, i) => (
                    <li key={i} className="font-body text-sm opacity-70 flex items-center group-hover:opacity-90 transition-opacity"><span className="mr-2">→</span> {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div ref={issuesRef} className="border border-white/20 p-8 mb-12 reveal-left hover:border-white/60 transition-all duration-500">
            <h2 className="font-bold text-2xl mb-6">Common Issues & Solutions</h2>
            <div className="space-y-6">
              {issues.map((issue, i) => (
                <div key={i}>
                  <h3 className="font-bold text-white mb-2">{issue.q}</h3>
                  <p className="font-body text-sm opacity-70">{issue.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div ref={ctaRef} className="mt-12 pt-8 border-t border-white/20 reveal-up">
            <p className="font-body text-sm opacity-60 mb-4">Can&apos;t find what you&apos;re looking for?</p>
            <Link href="/contact" className="text-white hover:opacity-60 transition">Contact Support →</Link>
          </div>
        </div>
      </div>
    </>
  );
}
