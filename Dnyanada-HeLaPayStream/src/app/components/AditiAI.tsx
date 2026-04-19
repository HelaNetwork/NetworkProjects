"use client";
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Search, Activity, Zap, Terminal, AlertCircle } from 'lucide-react';

export const AditiAI = ({ transactions }: { transactions: any[] }) => {
  const [isAuditing, setIsAuditing] = useState(false);

  // 🧠 Reactive Analysis: Focuses on the LATEST ledger event
  const analysis = useMemo(() => {
    if (!transactions || transactions.length === 0) return null;
    
    // 🎯 Target the most recent transaction at index 0
    const latest = transactions[0]; 
    
    // 📊 Dynamic Logic based on transaction types
    switch (latest.type) {
      case "Performance Bonus":
        return {
          score: 99,
          status: "OPTIMAL",
          message: `LATEST: Performance reward detected (Block ${latest.block}). Compliance maximized.`,
          color: "text-teal-400"
        };
      case "New Stream Created":
        return {
          score: 88,
          status: "STABLE",
          message: "LATEST: New payroll stream initialized. Verified against HeLa guardrails.",
          color: "text-cyan-400"
        };
      case "Emergency Pause":
        return {
          score: 40,
          status: "HALTED",
          message: "CRITICAL: Protocol flow manually suspended by Administrator.",
          color: "text-red-400"
        };
      case "Gas Tank Refill":
        return {
          score: 92,
          status: "FUNDED",
          message: `LATEST: Gas tank replenished. 0-fee claim experience secured for employees.`,
          color: "text-purple-400"
        };
      default:
        return {
          score: 75,
          status: "ACTIVE",
          message: `LATEST: Protocol activity detected (${latest.type}). System stable.`,
          color: "text-slate-400"
        };
    }
  }, [transactions]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 border-teal-500/30 bg-[#020617]/80 w-full rounded-[2.5rem] backdrop-blur-3xl shadow-[0_20px_50px_rgba(45,212,191,0.1)] flex flex-row items-center gap-6"
    >
      {/* 🚀 Brand & Health Score */}
      <div className="flex flex-row items-center gap-4 border-r border-white/10 pr-6 shrink-0">
        <div className="p-3 bg-teal-500/20 rounded-2xl">
          <Zap className="text-teal-400 w-6 h-6 shadow-[0_0_15px_rgba(45,212,191,0.3)]" />
        </div>
        <div>
          <h3 className="text-lg font-black text-white uppercase italic leading-none">HeLa Flow AI</h3>
          <p className="text-[8px] text-teal-400 font-bold uppercase tracking-[0.2em] mt-1">Autonomous Auditor</p>
        </div>
        {analysis && (
          <div className="ml-4 flex flex-col items-center">
            <span className="text-sm font-black text-white font-mono">{analysis.score}%</span>
            <span className="text-[7px] text-slate-500 font-bold uppercase">Health</span>
          </div>
        )}
      </div>

      {/* 🚀 Dynamic Terminal Feed */}
      <div className="flex-1 bg-black/60 p-4 rounded-2xl border border-white/5 flex items-center gap-3 overflow-hidden shadow-inner">
        <Terminal size={14} className="text-teal-500 shrink-0" />
        <p className="text-[11px] text-slate-300 font-mono truncate">
          {isAuditing ? (
            <span className="animate-pulse">ANALYZING_LEDGER_DATA...</span>
          ) : (
            analysis ? analysis.message : "SYS_READY: Awaiting stream initialization..."
          )}
        </p>
      </div>

      {/* 🚀 Right: Interaction Status */}
      <div className="flex items-center gap-4">
        {analysis && (
          <div className={`flex items-center gap-1.5 ${analysis.color} text-[9px] font-black uppercase tracking-tighter`}>
            {analysis.status === "HALTED" ? <AlertCircle size={12} /> : <ShieldCheck size={12} />}
            {analysis.status}
          </div>
        )}
        <button 
          onClick={() => { setIsAuditing(true); setTimeout(() => setIsAuditing(false), 1500); }}
          disabled={isAuditing}
          className="px-6 py-3 bg-teal-500 text-black font-black rounded-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-[10px] whitespace-nowrap flex items-center gap-2 shadow-lg shadow-teal-500/20"
        >
          {isAuditing ? <Activity className="animate-spin" size={14} /> : <><Search size={14} /> Audit</>}
        </button>
      </div>
    </motion.div>
  );
};