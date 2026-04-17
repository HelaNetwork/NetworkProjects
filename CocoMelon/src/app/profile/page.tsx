"use client";

import { useAuth } from "@/hooks/use-auth";
import { ProfileForm } from "@/components/profile-form";
import { motion } from "framer-motion";

import { clearAll } from "@/lib/storage";

export default function ProfilePage() {
  const { isConnected, address, profile } = useAuth();


  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="glass rounded-2xl p-8 text-center max-w-sm">
          <p className="text-gray-400">Connect your wallet to manage your profile.</p>
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
        <h1 className="text-2xl font-bold text-white mb-1">Profile</h1>
        <p className="text-sm text-gray-500">Manage your decentralized identity</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProfileForm />
        </div>

        <div className="space-y-4">
          {/* Wallet info */}
          <motion.div
            className="glass rounded-2xl p-5 card-glow"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-cyber-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Wallet
            </h3>
            <p className="text-xs text-gray-400 font-mono break-all">{address}</p>
          </motion.div>

          {/* On-chain data info */}
          <motion.div
            className="glass rounded-2xl p-5 card-glow"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-cyber-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Data Storage
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Profile</span>
                <span className="text-cyber-green">
                  {profile ? "IPFS + Chain" : "Not created"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Likes</span>
                <span className="text-cyber-blue">On-chain (ZK)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Messages</span>
                <span className="text-cyber-purple">E2E Encrypted</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Database</span>
                <span className="text-cyber-pink">None (no DB)</span>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            className="glass rounded-2xl p-5 card-glow"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-sm font-bold text-white mb-3">Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  clearAll();
                  window.location.reload();
                }}
                className="w-full btn-secondary text-sm text-red-400 border-red-500/20 hover:border-red-500/50 hover:bg-red-500/10"
              >
                Clear Local Cache
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
