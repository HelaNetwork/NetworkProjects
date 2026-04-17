"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/store/app-store";
import { MatchCard } from "@/components/match-card";
import { useAuth } from "@/hooks/use-auth";

export default function MatchesPage() {
  const { isConnected } = useAuth();
  const matches = useAppStore((s) => s.matches);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="glass rounded-2xl p-8 text-center max-w-sm">
          <p className="text-gray-400">Connect your wallet to view matches.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white mb-1">Your Matches</h1>
        <p className="text-sm text-gray-500">
          {matches.length} verified match{matches.length !== 1 ? "es" : ""} on Hela chain
        </p>
      </motion.div>

      {matches.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center text-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-20 h-20 rounded-full glass flex items-center justify-center mb-6 animate-float">
            <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No matches yet</h3>
          <p className="text-sm text-gray-500 max-w-xs">
            Keep swiping on the Discover page. When someone likes you back, you will see the match here.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((match, i) => (
            <MatchCard key={match.id} match={match} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
