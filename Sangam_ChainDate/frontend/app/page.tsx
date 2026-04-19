"use client";
import React from "react";
import Link from "next/link";
import WalletConnect from "@/components/WalletConnect";
import { useWallet } from "@/context/WalletContext";

export default function LandingPage() {
  const { address } = useWallet();

  const features = [
    { icon: "🔐", title: "ZK Privacy", desc: "Your identity is proven, never exposed. Matches verified via zero-knowledge proofs." },
    { icon: "⛓️", title: "Fully Onchain", desc: "Every swipe, match, and message is recorded on Hela Network with transparent logic." },
    { icon: "💸", title: "Micro-Economy", desc: "Pay-per-swipe and pay-per-message. Creators earn from exclusive content escrow unlocks." },
    { icon: "🔒", title: "Encrypted Profiles", desc: "Name and bio encrypted client-side. Only a hash ever hits the blockchain." },
  ];

  return (
    <main className="min-h-screen bg-hero-gradient flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between glass border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💜</span>
          <span className="font-black text-xl tracking-tight gradient-text">Sangam</span>
          <span className="ml-2 text-[10px] font-semibold bg-rose-500/20 border border-rose-500/30 text-violet-300 px-2 py-0.5 rounded-full">Hela Network</span>
        </div>
        <WalletConnect />
      </nav>

      {/* Hero section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 flex-1">
        {/* Abstract card stack decoration */}
        <div className="relative w-64 h-64 mb-12 float-card">
          <div className="absolute top-8 left-4 w-44 h-60 rounded-3xl bg-gradient-to-br from-violet-900 to-violet-950 border border-violet-700/30 shadow-xl rotate-[-8deg] opacity-40" />
          <div className="absolute top-4 left-8 w-44 h-60 rounded-3xl bg-gradient-to-br from-fuchsia-900 to-fuchsia-950 border border-fuchsia-700/30 shadow-xl rotate-[-3deg] opacity-60" />
          <div className="absolute top-0 left-12 w-44 h-60 rounded-3xl bg-gradient-to-br from-gray-900 to-gray-950 border border-rose-500/20 shadow-2xl shadow-violet-900/40 flex flex-col items-center justify-center gap-3 p-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-rose-400 flex items-center justify-center text-2xl shadow-lg shadow-rose-500/40">💜</div>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-900">0x4A3…f9B2</p>
              <p className="text-xs text-gray-600 mt-0.5">Age: ≥18 (ZK Proven)</p>
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                <span className="text-[10px] bg-rose-500/20 border border-rose-500/30 text-violet-300 px-2 py-0.5 rounded-full">🎵 Music</span>
                <span className="text-[10px] bg-rose-500/20 border border-rose-500/30 text-violet-300 px-2 py-0.5 rounded-full">✈️ Travel</span>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 text-xs">✕</div>
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs">♥</div>
            </div>
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-black leading-tight mb-4">
          <span className="gradient-text">Love, Onchain.</span>
          <br />
          <span className="text-gray-900">Privacy, Always.</span>
        </h1>
        <p className="text-gray-600 text-lg max-w-xl leading-relaxed mb-10">
          The world&apos;s first ZK-private dating dApp on <span className="text-rose-500 font-semibold">Hela Network</span>. 
          Swipe on-chain, prove you&apos;re a match — without revealing who you are.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {address ? (
            <>
              <Link
                href="/register"
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-400 text-gray-900 font-bold text-sm hover:from-rose-400 hover:to-rose-300 hover:shadow-lg hover:shadow-rose-500/30 transition-all active:scale-95"
              >
                Create Profile →
              </Link>
              <Link
                href="/swipe"
                className="px-8 py-3.5 rounded-2xl glass border border-rose-500/30 text-violet-300 font-bold text-sm hover:bg-violet-500/10 hover:border-violet-400/50 transition-all"
              >
                Start Swiping ♥
              </Link>
            </>
          ) : (
            <p className="text-gray-500 text-sm">Connect your wallet above to begin</p>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-4xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Built Different</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map(f => (
            <div key={f.title} className="glass rounded-2xl p-5 flex gap-4 hover:border-rose-500/30 transition border border-white/5">
              <span className="text-3xl shrink-0">{f.icon}</span>
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{f.title}</h3>
                <p className="text-gray-600 text-xs leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}




