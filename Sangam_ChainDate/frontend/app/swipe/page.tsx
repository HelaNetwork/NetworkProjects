"use client";
import React, { useState } from "react";
import Link from "next/link";
import WalletConnect from "@/components/WalletConnect";
import SwipeCard, { CardProfile } from "@/components/SwipeCard";
import { useWallet } from "@/context/WalletContext";

const DEMO_PROFILES: CardProfile[] = [
  {
    address: "0x4A3B8fEa2D9C1F5e6D7b0A9c3E2F8B1d4C5A6B7C",
    name: "Aria Nova", age: 24,
    bio: "On-chain explorer 🌐 | DeFi degen by day, jazz pianist by night. Looking for someone to HODL with.",
    interests: ["🎵 Music", "✈️ Travel", "📚 Books", "🎮 Gaming"],
    photoUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop",
    interests_ids: [1, 5, 4, 2],
  },
  {
    address: "0x9F2A1b3C4d5E6f7A8B9c0D1e2F3a4B5c6D7e8F9a",
    name: "Kai Cipher", age: 27,
    bio: "Smart contract auditor | Rock climber | Making the metaverse safer one bug at a time 🦺",
    interests: ["⛰️ Hiking", "🔐 Security", "🎨 Art", "🍳 Cooking"],
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
    interests_ids: [10, 7, 6, 3],
  },
  {
    address: "0xABC1230000000000000000000000000000000001",
    name: "Zeph Chain", age: 22,
    bio: "NFT artist 🎨 | Skateboarder | My portfolio is my heart — tokenized & on display.",
    interests: ["🎨 Art", "🎵 Music", "🎬 Movies", "🎮 Gaming"],
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop",
    interests_ids: [7, 1, 8, 2],
  },
  {
    address: "0xABC1230000000000000000000000000000000002",
    name: "Luna Vex", age: 26,
    bio: "Blockchain researcher @ ETH Foundation | Film photographer | Dog mom 🐶",
    interests: ["📚 Books", "✈️ Travel", "🎬 Movies", "♟️ Chess"],
    photoUrl: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=500&fit=crop",
    interests_ids: [4, 5, 8, 9],
  },
  {
    address: "0xABC1230000000000000000000000000000000003",
    name: "Milo Hash", age: 29,
    bio: "Layer 2 engineer | Amateur chef | Optimism maxi who's somehow also kind of realistic.",
    interests: ["🍳 Cooking", "🏋️ Fitness", "🎮 Gaming", "🎵 Music"],
    photoUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=500&fit=crop",
    interests_ids: [6, 3, 2, 1],
  },
  {
    address: "0xABC1230000000000000000000000000000000004",
    name: "Riya Stark", age: 23,
    bio: "Web3 designer ✨ | Turning blockchain UX from scary to beautiful. Matcha latte addict 🍵",
    interests: ["🎨 Art", "✈️ Travel", "🎵 Music", "📚 Books"],
    photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop",
    interests_ids: [7, 5, 1, 4],
  },
  {
    address: "0xABC1230000000000000000000000000000000005",
    name: "Dev Solana", age: 25,
    bio: "Full-stack degen | Hackathon win streak: 5 🏆 | Building the metaverse one tx at a time",
    interests: ["🎮 Gaming", "🏋️ Fitness", "🎵 Music", "⛰️ Hiking"],
    photoUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop",
    interests_ids: [2, 3, 1, 10],
  },
  {
    address: "0xABC1230000000000000000000000000000000006",
    name: "Nika Wei", age: 21,
    bio: "ZK researcher | Anime fan 🎴 | Somewhere between formal proofs and late-night ramen.",
    interests: ["📚 Books", "♟️ Chess", "🎬 Movies", "🍳 Cooking"],
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop",
    interests_ids: [4, 9, 8, 6],
  },
  {
    address: "0xABC1230000000000000000000000000000000007",
    name: "Ethan Block", age: 30,
    bio: "DAO governance nerd | Weekend surfer 🏄 | Looking for someone who appreciates decentralization IRL too.",
    interests: ["⛰️ Hiking", "🏋️ Fitness", "✈️ Travel", "🎮 Gaming"],
    photoUrl: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=400&h=500&fit=crop",
    interests_ids: [10, 3, 5, 2],
  },
  {
    address: "0xABC1230000000000000000000000000000000008",
    name: "Sana Mint", age: 24,
    bio: "Social token creator | Yoga instructor by day 🧘 | On-chain poet by night. Proof of vibe 💜",
    interests: ["🧘 Wellness", "🎵 Music", "✈️ Travel", "🎨 Art"],
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop",
    interests_ids: [3, 1, 5, 7],
  },
  {
    address: "0xABC1230000000000000000000000000000000009",
    name: "Orion Flux", age: 28,
    bio: "DeFi protocol founder | Ex-Goldman | Now doing something actually cool on Hela Network.",
    interests: ["📚 Books", "♟️ Chess", "🏋️ Fitness", "🎬 Movies"],
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop",
    interests_ids: [4, 9, 3, 8],
  },
  {
    address: "0xABC1230000000000000000000000000000000010",
    name: "Priya Ledger", age: 22,
    bio: "Computer science + art student 🖼️ | Building ZK-powered identity. Also, great at chess.",
    interests: ["🎨 Art", "♟️ Chess", "📚 Books", "🎵 Music"],
    photoUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&h=500&fit=crop",
    interests_ids: [7, 9, 4, 1],
  },
  {
    address: "0xABC1230000000000000000000000000000000011",
    name: "Jake Satoshi", age: 31,
    bio: "Bitcoin maximalist who secretly loves ETH 🤫 | Dad jokes enthusiast | Hiking > conferences.",
    interests: ["⛰️ Hiking", "🍳 Cooking", "📚 Books", "🎬 Movies"],
    photoUrl: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=400&h=500&fit=crop",
    interests_ids: [10, 6, 4, 8],
  },
  {
    address: "0xABC1230000000000000000000000000000000012",
    name: "Aiko Protocol", age: 25,
    bio: "AI + blockchain researcher 🤖 | Gaming streamer on weekends | Collector of rare NFT vibes.",
    interests: ["🎮 Gaming", "🎨 Art", "🎵 Music", "✈️ Travel"],
    photoUrl: "https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?w=400&h=500&fit=crop",
    interests_ids: [2, 7, 1, 5],
  },
  {
    address: "0xABC1230000000000000000000000000000000013",
    name: "Vera Node", age: 27,
    bio: "Smart contract engineer | Marathon runner 🏃 | Deploying on Hela Network before it's cool.",
    interests: ["🏋️ Fitness", "✈️ Travel", "🍳 Cooking", "📚 Books"],
    photoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop",
    interests_ids: [3, 5, 6, 4],
  },
];

const MY_AGE = 23;
const MY_INTERESTS = [1, 5, 7, 2];

export default function SwipePage() {
  const { signer } = useWallet();
  const [deck, setDeck] = useState<CardProfile[]>(DEMO_PROFILES);
  const [matches, setMatches] = useState<CardProfile[]>([]);
  const [showMatch, setShowMatch] = useState<CardProfile | null>(null);
  const [stats, setStats] = useState({ likes: 0, nopes: 0 });
  const [refreshing, setRefreshing] = useState(false);

  function handleSwipeDone(addr: string, liked: boolean) {
    setDeck(prev => prev.filter(p => p.address !== addr));
    setStats(prev => ({ likes: prev.likes + (liked ? 1 : 0), nopes: prev.nopes + (!liked ? 1 : 0) }));
    if (liked) {
      const profile = deck.find(p => p.address === addr)!;
      if (Math.random() < 0.4) {
        setMatches(prev => [...prev, profile]);
        setShowMatch(profile);
        setTimeout(() => setShowMatch(null), 3500);
      }
    }
  }

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      setDeck(DEMO_PROFILES);
      setStats({ likes: 0, nopes: 0 });
      setRefreshing(false);
    }, 1500);
  }

  const topCard = deck[deck.length - 1];
  const secondCard = deck[deck.length - 2];

  return (
    <main className="min-h-screen bg-hero-gradient flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between glass border-b border-rose-100/50">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">💜</span>
          <span className="font-black text-lg tracking-tight gradient-text">Sangam</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/matches" className="text-sm font-semibold text-gray-600 hover:text-rose-500 transition flex items-center gap-1">
            💬 {matches.length > 0 && (
              <span className="bg-rose-500 text-white text-xs px-1.5 py-0.5 rounded-full">{matches.length}</span>
            )}
          </Link>
          <WalletConnect />
        </div>
      </nav>

      {/* Stats bar */}
      <div className="flex justify-center gap-8 py-2.5 text-sm border-b border-rose-50">
        <span className="text-emerald-600 font-bold">♥ {stats.likes} Liked</span>
        <span className="text-gray-400 text-xs font-mono mt-0.5">0.001 HELA/swipe</span>
        <span className="text-rose-500 font-bold">✕ {stats.nopes} Noped</span>
      </div>

      {/* Card area — mobile-first centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        {deck.length === 0 ? (
          /* ── Premium empty state ── */
          <div className="flex flex-col items-center gap-6 text-center max-w-xs mx-auto">
            <div className="relative">
              <div className="text-7xl mb-2 animate-bounce">🌗</div>
              <div className="absolute -top-1 -right-1 text-2xl animate-spin" style={{animationDuration:"3s"}}>✨</div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">You&apos;ve seen them all!</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                New profiles are indexed from the Hela blockchain every hour. Come back soon, or refresh the on-chain index now.
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-400 text-white font-bold text-base hover:shadow-lg hover:shadow-rose-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {refreshing ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Indexing Hela Network…
                  </>
                ) : (
                  <>⛓️ Refresh On-Chain Index</>
                )}
              </button>
              <Link
                href="/matches"
                className="w-full py-4 rounded-2xl glass border border-rose-300/50 text-rose-600 font-bold text-base hover:bg-rose-50 transition-all text-center"
              >
                💬 View Your Matches
              </Link>
            </div>
            <p className="text-xs text-gray-400">🔐 ZK proven · ⛓️ On Hela Network</p>
          </div>
        ) : (
          /* ── Swipe deck ── */
          <div className="relative w-full max-w-sm" style={{ height: "min(72vh, 560px)" }}>
            {/* Background depth card */}
            {secondCard && (
              <div
                className="absolute inset-x-4 top-4 bottom-0 rounded-3xl bg-white/60 border border-rose-100 shadow-lg"
                style={{ transform: "scale(0.95) translateY(8px)", zIndex: 0 }}
              />
            )}
            {/* Top swipeable card */}
            {topCard && (
              <div style={{ zIndex: 10, position: "absolute", inset: 0 }}>
                <SwipeCard
                  key={topCard.address}
                  profile={topCard}
                  myInterestIds={MY_INTERESTS}
                  myAge={MY_AGE}
                  signer={signer}
                  onSwipeDone={handleSwipeDone}
                />
              </div>
            )}
          </div>
        )}

        {deck.length > 0 && (
          <p className="mt-6 text-gray-400 text-xs text-center">
            Drag the card or use the buttons · Each swipe costs 0.001 HELA
          </p>
        )}
      </div>

      {/* Match toast */}
      {showMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-4">
          <div className="pointer-events-auto glass rounded-3xl border border-rose-300/60 shadow-2xl shadow-rose-200/60 p-8 flex flex-col items-center gap-4 max-w-xs w-full animate-bounce">
            <div className="text-5xl">🎉</div>
            <div className="text-center">
              <h3 className="text-2xl font-black gradient-text mb-1">It&apos;s a Match!</h3>
              <p className="text-gray-600 text-sm">You and <span className="font-semibold text-gray-900">{showMatch.name}</span> liked each other.</p>
              <p className="text-gray-400 text-xs mt-1">ZK proof verified on Hela Network ✓</p>
            </div>
            <div className="flex -space-x-3">
              <img src={showMatch.photoUrl} alt="" className="w-14 h-14 rounded-full border-2 border-rose-500 object-cover" />
              <div className="w-14 h-14 rounded-full border-2 border-rose-300 bg-gradient-to-br from-rose-500 to-rose-400 flex items-center justify-center text-xl z-10">💜</div>
            </div>
            <Link href="/matches" className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-400 text-white font-bold text-sm hover:shadow-lg transition-all">
              Send a Message →
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
