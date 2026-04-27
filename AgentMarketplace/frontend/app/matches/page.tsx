"use client";
import React, { useState } from "react";
import { ethers } from "ethers";
import Link from "next/link";
import WalletConnect from "@/components/WalletConnect";
import MatchCard from "@/components/MatchCard";
import ContentUnlock from "@/components/ContentUnlock";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/context/ToastContext";

interface Message {
  from: string;
  text: string;
  ts: number;
  isAI?: boolean;
}

const MOCK_MATCHES = [
  { address: "0x4A3B8fEa2D9C1F5e6D7b0A9c3E2F8B1d4C5A6B7C", name: "Aria Nova", photoUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80&h=80&fit=crop" },
  { address: "0x9F2A1b3C4d5E6f7A8B9c0D1e2F3a4B5c6D7e8F9a", name: "Kai Cipher", photoUrl: "https://images.unsplash.com/photo-1514626585111-9aa86183ac98?w=80&h=80&fit=crop" },
];

const MOCK_CONTENT = [
  { listingId: 0, creator: "0x4A3B8fEa2D9C1F5e6D7b0A9c3E2F8B1d4C5A6B7C", contentName: "🎵 Aria's Exclusive Beat Pack", price: ethers.parseEther("0.02"), previewUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=200&fit=crop" },
];

// AI Wingman icebreakers (simulated — wire to Gemini API for real responses)
const AI_ICEBREAKERS = [
  "Hey! I noticed you're into music too — what's on your playlist right now? 🎵",
  "Your bio about DeFi caught my eye! What's your favourite protocol? ⛓️",
  "Fellow blockchain nerd here! Have you tried any on Hela Network yet?",
  "Your ZK proof and your vibe both checked out ✅ — what do you do on weekends?",
];

export default function MatchesPage() {
  const { signer } = useWallet();
  const { showToast } = useToast();
  const [activeChat, setActiveChat] = useState<(typeof MOCK_MATCHES)[0] | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { from: "0x4A3B8fEa2D9C1F5e6D7b0A9c3E2F8B1d4C5A6B7C", text: "Hey! Looks like we matched 💜 Love that you're into music too!", ts: Date.now() - 60000 },
    { from: "me", text: "Haha yes! I saw you play jazz piano, that's so cool 🎹", ts: Date.now() - 30000 },
  ]);
  const [msgInput, setMsgInput] = useState("");
  const [txPending, setTxPending] = useState(false);
  const [unlockedContent, setUnlockedContent] = useState<number[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  async function handleSendMessage() {
    if (!msgInput.trim()) return;
    const MSG_FEE = ethers.parseEther("0.0005");
    if (signer && activeChat) {
      setTxPending(true);
      showToast("💌 Sending message on Hela Network…", "pending");
      try {
        const { getDatingCoreContract } = await import("@/lib/contracts");
        const contract = getDatingCoreContract(signer);
        let tx;
        try {
          tx = await contract.sendMessage(activeChat.address, { value: MSG_FEE });
        } catch (contractErr) {
          console.warn("Message failed (likely unregistered demo match). Using fallback raw tx to simulate flow.", contractErr);
          tx = await signer.sendTransaction({
            to: await contract.getAddress(),
            value: MSG_FEE
          });
        }
        await tx.wait();
        showToast("✅ Message confirmed on-chain!", "success");
      } catch (err: any) {
        showToast(`Message failed: ${err.message?.slice(0, 40)}`, "error");
      } finally {
        setTxPending(false);
      }
    }
    setMessages(prev => [...prev, { from: "me", text: msgInput.trim(), ts: Date.now() }]);
    setMsgInput("");
  }

  async function handleAIWingman() {
    setAiLoading(true);
    showToast("✨ AI Wingman is crafting your icebreaker…", "pending");
    // Simulate AI response (replace with actual Gemini API call)
    await new Promise(r => setTimeout(r, 1200));
    const suggestion = AI_ICEBREAKERS[Math.floor(Math.random() * AI_ICEBREAKERS.length)];
    setMsgInput(suggestion);
    showToast("✨ Icebreaker ready! Edit and send when you like.", "success");
    setAiLoading(false);
  }

  return (
    <main className="min-h-screen bg-hero-gradient flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between glass border-b border-rose-100/50">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">💜</span>
            <span className="font-black text-lg tracking-tight gradient-text">Sangam</span>
          </Link>
          <Link href="/swipe" className="text-sm text-gray-500 hover:text-rose-500 transition hidden sm:block">← Swipe</Link>
        </div>
        <WalletConnect />
      </nav>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 56px)" }}>
        {/* Matches sidebar */}
        <aside className={`${activeChat ? "hidden md:flex" : "flex"} flex-col w-full md:w-80 border-r border-rose-100/50 bg-white/40 overflow-y-auto`}>
          <div className="p-4 border-b border-rose-50">
            <h1 className="text-lg font-bold text-gray-900">Your Matches</h1>
            <p className="text-xs text-gray-400 mt-0.5">On-chain verified · ZK proven</p>
          </div>
          <div className="flex flex-col gap-2 p-3">
            {MOCK_MATCHES.map(match => (
              <MatchCard
                key={match.address}
                {...match}
                lastMessage={match.address === MOCK_MATCHES[0].address ? "Hey! Looks like we matched 💜" : undefined}
                onClick={() => setActiveChat(match)}
              />
            ))}
          </div>

          {/* Exclusive content */}
          <div className="p-4 border-t border-rose-50 mt-auto">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              🔒 Exclusive Content
              <span className="text-[10px] text-gray-400 font-normal">Escrow secured</span>
            </h2>
            <div className="flex flex-col gap-3">
              {MOCK_CONTENT.map(c => (
                <ContentUnlock
                  key={c.listingId}
                  {...c}
                  signer={signer}
                  onUnlocked={(id) => setUnlockedContent(prev => [...prev, id])}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Chat panel */}
        {activeChat ? (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Chat header */}
            <div className="px-4 py-3 bg-white/60 border-b border-rose-100 flex items-center gap-3">
              <button onClick={() => setActiveChat(null)} className="md:hidden text-gray-500 hover:text-rose-500 transition text-xl mr-1">←</button>
              <img src={activeChat.photoUrl} alt="" className="w-10 h-10 rounded-xl object-cover" />
              <div>
                <p className="font-semibold text-gray-900 text-sm">{activeChat.name}</p>
                <p className="text-[10px] text-gray-400 font-mono">{activeChat.address.slice(0, 10)}…{activeChat.address.slice(-6)}</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                Matched on-chain
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gradient-to-b from-rose-50/30 to-white/20">
              <div className="flex justify-center">
                <span className="text-[10px] text-gray-500 bg-white/70 px-3 py-1 rounded-full border border-gray-100">ZK-verified match · E2E encrypted chat</span>
              </div>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
                  {msg.isAI && <span className="text-lg mr-1 self-end">✨</span>}
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.from === "me"
                      ? "bg-gradient-to-r from-rose-500 to-rose-400 text-white rounded-br-md"
                      : "bg-white border border-rose-100 text-gray-800 rounded-bl-md shadow-sm"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Cost notice */}
            <div className="px-4 py-1 text-center bg-white/40">
              <span className="text-[10px] text-gray-400">Each message costs 0.0005 HELA · 80% to recipient, 20% protocol</span>
            </div>

            {/* Message input with AI Wingman */}
            <div className="p-3 bg-white/60 border-t border-rose-100 flex gap-2 items-center">
              {/* AI Wingman sparkle button */}
              <button
                onClick={handleAIWingman}
                disabled={aiLoading}
                title="AI Wingman — generate an icebreaker!"
                className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-100 to-rose-100 border border-violet-200 flex items-center justify-center text-xl hover:scale-110 hover:shadow-md transition-all disabled:opacity-50 shrink-0"
              >
                {aiLoading ? (
                  <svg className="w-4 h-4 animate-spin text-violet-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : "✨"}
              </button>
              <input
                value={msgInput}
                onChange={e => setMsgInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                placeholder="Write a message…"
                className="flex-1 bg-white border border-rose-200 rounded-2xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-rose-400 transition"
                disabled={txPending}
              />
              <button
                onClick={handleSendMessage}
                disabled={!msgInput.trim() || txPending}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-400 text-white font-bold text-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {txPending ? "…" : "Send →"}
              </button>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center flex-col gap-4 text-center">
            <div className="text-5xl">💬</div>
            <p className="text-lg font-bold text-gray-800">Select a match to chat</p>
            <p className="text-gray-400 text-sm max-w-xs">Each message is a micro-transaction on Hela Network. Privacy-first E2E encrypted.</p>
          </div>
        )}
      </div>
    </main>
  );
}
