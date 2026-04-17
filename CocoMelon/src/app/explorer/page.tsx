"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/app-store";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

const EVENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  like: { bg: "bg-cyber-pink/10", text: "text-cyber-pink", border: "border-cyber-pink/20" },
  match: { bg: "bg-cyber-green/10", text: "text-cyber-green", border: "border-cyber-green/20" },
  payment: { bg: "bg-cyber-yellow/10", text: "text-cyber-yellow", border: "border-cyber-yellow/20" },
  message_proof: { bg: "bg-cyber-blue/10", text: "text-cyber-blue", border: "border-cyber-blue/20" },
};

export default function ExplorerPage() {
  const { isConnected } = useAuth();
  const events = useAppStore((s) => s.events);
  const notifications = useAppStore((s) => s.notifications);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);
  const [tab, setTab] = useState<"events" | "notifications">("events");
  const [filter, setFilter] = useState<string>("all");

  const filteredEvents =
    filter === "all" ? events : events.filter((e) => e.type === filter);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="glass rounded-2xl p-8 text-center max-w-sm">
          <p className="text-gray-400">Connect your wallet to view on-chain activity.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-white mb-1">Proof Explorer</h1>
        <p className="text-sm text-gray-500">
          All on-chain proofs and events
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["events", "notifications"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? "bg-linear-to-r from-cyber-pink/20 to-cyber-purple/20 text-white border border-cyber-pink/30"
                : "glass text-gray-400 hover:text-white"
            }`}
          >
            {t === "events" ? "On-Chain Events" : "Notifications"}
            {t === "notifications" && notifications.filter((n) => !n.read).length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-cyber-pink text-white text-[10px] font-bold">
                {notifications.filter((n) => !n.read).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "events" && (
        <>
          {/* Filters */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {["all", "like", "match", "payment", "message_proof"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filter === f
                    ? "bg-cyber-pink/20 text-cyber-pink border border-cyber-pink/40"
                    : "glass text-gray-500 hover:text-gray-300"
                }`}
              >
                {f === "all" ? "All" : f.replace("_", " ").toUpperCase()}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total Events", value: events.length, color: "text-white" },
              { label: "Likes", value: events.filter((e) => e.type === "like").length, color: "text-cyber-pink" },
              { label: "Matches", value: events.filter((e) => e.type === "match").length, color: "text-cyber-green" },
              { label: "Msg Proofs", value: events.filter((e) => e.type === "message_proof").length, color: "text-cyber-blue" },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-xl p-3 text-center">
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Events list */}
          {filteredEvents.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center">
              <p className="text-gray-500 text-sm">No events recorded yet. Start swiping!</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {[...filteredEvents].reverse().map((event, i) => {
                  const colors = EVENT_COLORS[event.type] || EVENT_COLORS.like;
                  return (
                    <motion.div
                      key={`${event.txHash}-${i}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`glass rounded-xl p-4 border ${colors.border}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors.bg} ${colors.text}`}
                        >
                          {event.type.replace("_", " ")}
                        </span>
                        <span className="text-[10px] text-gray-600">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 w-16">TX Hash</span>
                          <span className="text-xs text-cyber-blue font-mono truncate">
                            {event.txHash}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 w-16">Block</span>
                          <span className="text-xs text-gray-300">
                            #{event.blockNumber.toLocaleString()}
                          </span>
                        </div>
                        {Object.entries(event.data).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500 w-16 capitalize">{key}</span>
                            <span className="text-xs text-gray-400 font-mono truncate">
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {tab === "notifications" && (
        <div className="space-y-2">
          {notifications.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center">
              <p className="text-gray-500 text-sm">No notifications yet.</p>
            </div>
          ) : (
            [...notifications].reverse().map((notif, i) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`glass rounded-xl p-4 cursor-pointer transition-all ${
                  !notif.read ? "border border-cyber-pink/30" : ""
                }`}
                onClick={() => markNotificationRead(notif.id)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      notif.type === "match"
                        ? "bg-cyber-pink/20 text-cyber-pink"
                        : notif.type === "message"
                        ? "bg-cyber-blue/20 text-cyber-blue"
                        : "bg-cyber-purple/20 text-cyber-purple"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={
                          notif.type === "match"
                            ? "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            : "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        }
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{notif.title}</p>
                    <p className="text-xs text-gray-500">{notif.message}</p>
                    <p className="text-[10px] text-gray-600 mt-1">
                      {new Date(notif.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-cyber-pink animate-glow-pulse" />
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
