"use client";

import { motion } from "framer-motion";
import type { Match } from "@/lib/types";
import Link from "next/link";

interface MatchCardProps {
  match: Match;
  index: number;
}

export function MatchCard({ match, index }: MatchCardProps) {
  const profile = match.profile;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
    >
      <Link href={`/chat?match=${match.id}`}>
        <div className="glass rounded-2xl overflow-hidden card-glow hover:border-cyber-pink/30 transition-all duration-300 group cursor-pointer">
          <div className="relative h-48 overflow-hidden">
            {profile?.imageUrl ? (
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${profile.imageUrl})` }}
              />
            ) : (
              <div className="absolute inset-0 bg-linear-to-br from-cyber-pink/20 to-cyber-purple/20" />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-dark-900 to-transparent" />

            {/* Online indicator */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full glass text-[10px] font-medium text-cyber-green">
              <div className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-glow-pulse" />
              Active
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white">
                {profile?.name || "Anonymous"}
              </h3>
              <span className="text-xs text-gray-500">
                {new Date(match.timestamp).toLocaleDateString()}
              </span>
            </div>

            {profile?.interests && (
              <div className="flex flex-wrap gap-1 mb-3">
                {profile.interests.slice(0, 3).map((i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyber-purple/15 text-cyber-purple border border-cyber-purple/20"
                  >
                    {i}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <svg className="w-3.5 h-3.5 text-cyber-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                ZK Verified Match
              </div>
              <div className="text-cyber-pink text-xs font-medium group-hover:underline">
                Open Chat &rarr;
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function MatchNotification({ profile }: { profile: { name: string; imageUrl: string } }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: -50 }}
      className="fixed inset-0 z-100 flex items-center justify-center bg-dark-900/80 backdrop-blur-sm"
    >
      <motion.div
        className="flex flex-col items-center text-center"
        animate={{ rotate: [0, -3, 3, -3, 0] }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="relative mb-6">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-cyber-pink shadow-[0_0_40px_rgba(255,45,149,0.5)]">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${profile.imageUrl})` }}
            />
          </div>
          <motion.div
            className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-cyber-pink flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </motion.div>
        </div>
        <h2 className="text-3xl font-black gradient-text mb-2">It&apos;s a Match!</h2>
        <p className="text-gray-400">You and {profile.name} liked each other</p>
      </motion.div>
    </motion.div>
  );
}
