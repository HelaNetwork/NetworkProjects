"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useSwipe } from "@/hooks/use-swipe";
import { useContractEvents } from "@/hooks/use-contract-events";
import { useContractState } from "@/hooks/use-contract-reads";
import { useAppStore } from "@/store/app-store";
import { SwipeCard, EmptySwipeState } from "@/components/swipe-card";
import { MatchNotification } from "@/components/match-card";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatEther } from "viem";
import { fetchFromIPFS } from "@/lib/ipfs";
import type { UserProfile } from "@/lib/types";

export default function DiscoverPage() {
  const { isConnected, hasProfile } = useAuth();
  const { matches, setProfiles } = useAppStore();
  const {
    currentProfile,
    hasMoreProfiles,
    handleLike,
    handlePass,
    isLoading,
    txError,
  } = useSwipe();

  const { state: contractState } = useContractState();
  useContractEvents();

  const [showMatch, setShowMatch] = useState(false);
  const [matchProfile, setMatchProfile] = useState<{
    name: string;
    imageUrl: string;
  } | null>(null);
  const [prevMatchCount, setPrevMatchCount] = useState(0);
  const [profileCids, setProfileCids] = useState("");
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  // Load profiles from IPFS CIDs (comma separated, entered by user or fetched from a registry)
  const loadProfilesFromIPFS = useCallback(async () => {
    if (!profileCids.trim()) return;
    setLoadingProfiles(true);
    try {
      const cids = profileCids.split(",").map((c) => c.trim()).filter(Boolean);
      const profiles: UserProfile[] = [];
      for (const cid of cids) {
        try {
          const data = await fetchFromIPFS<{
            name: string;
            age: number;
            bio: string;
            interests: string[];
            imageCid?: string;
            address: string;
            identityHash: string;
            createdAt: number;
          }>(cid);
          profiles.push({
            ...data,
            imageUrl: data.imageCid
              ? `https://gateway.pinata.cloud/ipfs/${data.imageCid}`
              : `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.address}`,
            ipfsCid: cid,
          });
        } catch (err) {
          console.error(`Failed to load profile CID ${cid}:`, err);
        }
      }
      if (profiles.length > 0) {
        setProfiles(profiles);
      }
    } finally {
      setLoadingProfiles(false);
    }
  }, [profileCids, setProfiles]);

  useEffect(() => {
    if (matches.length > prevMatchCount && matches.length > 0) {
      const latest = matches[matches.length - 1];
      if (latest.profile) {
        setMatchProfile({
          name: latest.profile.name,
          imageUrl: latest.profile.imageUrl,
        });
        setShowMatch(true);
        setTimeout(() => setShowMatch(false), 3000);
      }
    }
    setPrevMatchCount(matches.length);
  }, [matches, prevMatchCount]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md"
        >
          <motion.div
            className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-linear-to-br from-cyber-pink to-cyber-purple flex items-center justify-center"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <svg
              className="w-14 h-14 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-black mb-4">
            <span className="gradient-text">HelaMatch</span>
          </h1>
          <p className="text-lg text-gray-400 mb-2">
            Privacy-First Decentralized Dating
          </p>
          <p className="text-sm text-gray-500 mb-10 max-w-sm mx-auto">
            Connect your wallet to discover matches verified on the Hela
            blockchain. No backend. No database. Fully on-chain.
          </p>

          <div className="flex justify-center mb-8">
            <ConnectButton />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-12">
            {[
              {
                icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
                label: "On-Chain",
                desc: "Hela verified",
              },
              {
                icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101",
                label: "IPFS",
                desc: "Decentralized",
              },
              {
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                label: "Encrypted",
                desc: "E2E chat",
              },
            ].map((feat) => (
              <motion.div
                key={feat.label}
                className="glass rounded-xl p-4 text-center"
                whileHover={{ y: -4, borderColor: "rgba(255,45,149,0.3)" }}
              >
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-cyber-pink/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-cyber-pink"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={feat.icon}
                    />
                  </svg>
                </div>
                <p className="text-xs font-bold text-white">{feat.label}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 max-w-sm"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cyber-purple/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-cyber-purple"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Create Your Profile
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Set up your profile (stored on IPFS) to start discovering matches.
          </p>
          <a href="/profile" className="btn-primary inline-block">
            Create Profile
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-white mb-1">Discover</h1>
        <p className="text-sm text-gray-500">
          Swipe right to like (on-chain tx), left to pass
        </p>
      </motion.div>

      {/* IPFS Profile Loader */}
      <motion.div
        className="glass rounded-xl p-4 mb-6 max-w-sm mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <label className="block text-[10px] font-medium text-gray-500 mb-1.5 uppercase tracking-wider">
          Load Profiles from IPFS CIDs
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={profileCids}
            onChange={(e) => setProfileCids(e.target.value)}
            placeholder="QmXxx..., QmYyy..."
            className="flex-1 text-xs"
          />
          <button
            onClick={loadProfilesFromIPFS}
            disabled={loadingProfiles || !profileCids.trim()}
            className="btn-primary text-xs px-3 py-1.5 disabled:opacity-40"
          >
            {loadingProfiles ? "..." : "Load"}
          </button>
        </div>
      </motion.div>

      {/* Transaction error */}
      {txError && (
        <div className="max-w-sm mx-auto mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center">
          {txError}
        </div>
      )}

      {/* Swipe area */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-sm" style={{ minHeight: "520px" }}>
          <AnimatePresence mode="wait">
            {hasMoreProfiles && currentProfile ? (
              <SwipeCard
                key={currentProfile.address}
                profile={currentProfile}
                onLike={handleLike}
                onPass={handlePass}
                isLoading={isLoading}
              />
            ) : (
              <EmptySwipeState key="empty" />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* On-chain Stats */}
      <motion.div
        className="flex justify-center gap-8 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {[
          {
            label: "Like Fee",
            value: contractState
              ? `${formatEther(contractState.likeFee)} HELA`
              : "...",
            color: "text-cyber-blue",
          },
          {
            label: "On-Chain Matches",
            value: contractState
              ? contractState.totalMatches.toString()
              : "...",
            color: "text-cyber-pink",
          },
          {
            label: "Total Likes",
            value: contractState
              ? contractState.totalLikes.toString()
              : "...",
            color: "text-cyber-purple",
          },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">
              {stat.label}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Match notification overlay */}
      <AnimatePresence>
        {showMatch && matchProfile && (
          <MatchNotification profile={matchProfile} />
        )}
      </AnimatePresence>
    </div>
  );
}
