"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/app-store";
import { ChatInterface } from "@/components/chat-interface";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { Suspense } from "react";

function ChatContent() {
  const { isConnected, address } = useAuth();
  const searchParams = useSearchParams();
  const matchId = searchParams.get("match");
  const matches = useAppStore((s) => s.matches);

  if (!isConnected || !address) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="glass rounded-2xl p-8 text-center max-w-sm">
          <p className="text-gray-400">Connect your wallet to chat.</p>
        </div>
      </div>
    );
  }

  if (!matchId) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-white mb-1">Messages</h1>
          <p className="text-sm text-gray-500">End-to-end encrypted conversations</p>
        </motion.div>

        {matches.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-20 h-20 rounded-full glass flex items-center justify-center mb-6 animate-float">
              <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No conversations</h3>
            <p className="text-sm text-gray-500 max-w-xs">
              Match with someone to start chatting.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {matches.map((match, i) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/chat?match=${match.id}`}>
                  <div className="glass rounded-xl p-4 flex items-center gap-4 hover:border-cyber-pink/30 transition-all cursor-pointer group">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-cyber-pink/30 group-hover:border-cyber-pink/60 transition-all">
                      {match.profile?.imageUrl ? (
                        <div
                          className="w-full h-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${match.profile.imageUrl})` }}
                        />
                      ) : (
                        <div className="w-full h-full bg-dark-700" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white">
                        {match.profile?.name || "Anonymous"}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        Tap to start encrypted chat
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-cyber-green">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-glow-pulse" />
                      E2E
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const activeMatch = matches.find((m) => m.id === matchId);
  if (!activeMatch || !activeMatch.profile) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="glass rounded-2xl p-8 text-center max-w-sm">
          <p className="text-gray-400">Match not found.</p>
          <Link href="/chat" className="text-cyber-pink text-sm mt-2 inline-block">
            Back to messages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <motion.div
        className="glass rounded-2xl overflow-hidden card-glow"
        style={{ height: "calc(100vh - 160px)" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <ChatInterface
          matchId={matchId}
          recipientAddress={activeMatch.profile.address}
          recipientName={activeMatch.profile.name}
          recipientImage={activeMatch.profile.imageUrl}
          currentAddress={address}
        />
      </motion.div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="w-8 h-8 border-2 border-cyber-pink/30 border-t-cyber-pink rounded-full animate-spin" />
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
