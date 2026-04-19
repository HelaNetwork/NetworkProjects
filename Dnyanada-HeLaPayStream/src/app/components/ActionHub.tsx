"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, Zap, Send, Gift, Pause, Play, Database, Loader2, AlertTriangle 
} from 'lucide-react';

interface ActionHubProps {
  role: 'employer' | 'employee';
  isPaused?: boolean;
  onTogglePause?: () => void;
  onRefill?: (amount: string) => void;      
  onCreateStream?: (recipient: string, amount: string) => void; 
  onInjectBonus?: (streamId: number, amount: string) => void;  
  onClaim?: (streamId: number) => Promise<void>;
  onDownloadPDF?: () => void;  
}

export default function ActionHub({ 
  role, isPaused, onTogglePause, onRefill, 
  onCreateStream, onInjectBonus, onClaim, onDownloadPDF 
}: ActionHubProps) {
  
  const [bonusStreamId, setBonusStreamId] = useState("1");
  const [bonusAmount, setBonusAmount] = useState("0.001");
  const [refillAmount, setRefillAmount] = useState("0.001");
  const [recipientAddr, setRecipientAddr] = useState("");
  const [streamAmount, setStreamAmount] = useState("1.0");
  const [claimStreamId, setClaimStreamId] = useState("1");
  const [isClaiming, setIsClaiming] = useState(false);

  // 💡 Debugging Wrapper for Stream Initialization
  const handleCreateStream = () => {
    console.log("🚀 Initialize Stream Clicked!");
    console.log("Recipient:", recipientAddr);
    console.log("Amount:", streamAmount);
    
    if (!recipientAddr || !streamAmount) {
      alert("Please enter both recipient address and amount!");
      return;
    }
    
    onCreateStream?.(recipientAddr, streamAmount);
  };

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      await onClaim?.(Number(claimStreamId));
    } finally {
      setIsClaiming(false);
    }
  };

  if (role === 'employer') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        
        {/* Create Stream Card */}
        <motion.div whileHover={{ y: -5 }} className="glass-card p-8 border-[#2DD4BF]/20 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="w-12 h-12 rounded-full bg-[#2DD4BF]/10 flex items-center justify-center mb-4">
              <Send className="text-[#2DD4BF]" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Create New Stream</h3>
            
            {/* 💡 Pause Warning for Demo Safety */}
            {isPaused && (
              <div className="flex items-center gap-2 bg-red-500/20 text-red-400 p-2 rounded-lg mt-2 mb-2 text-[10px] font-bold uppercase">
                <AlertTriangle size={14} /> Protocol Paused: Resume below to enable creation
              </div>
            )}

            <div className="flex flex-col gap-3 mt-4 mb-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#2DD4BF] font-bold uppercase tracking-wider">Recipient Address</label>
                <input 
                  type="text"
                  placeholder="0x..."
                  className="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-[#2DD4BF]"
                  value={recipientAddr}
                  onChange={(e) => setRecipientAddr(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#2DD4BF] font-bold uppercase tracking-wider">Total Amount (HLUSD)</label>
                <input 
                  type="number"
                  placeholder="1.0"
                  className="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-[#2DD4BF]"
                  value={streamAmount}
                  onChange={(e) => setStreamAmount(e.target.value)}
                />
              </div>
            </div>
          </div>
          <button 
            onClick={handleCreateStream} // 💡 Connected to our new debug handler
            disabled={isPaused}
            className="w-full py-4 bg-[#2DD4BF] text-black font-black rounded-2xl shadow-lg hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase tracking-wider"
          >
            {isPaused ? "Paused" : "Initialize Stream"}
          </button>
        </motion.div>

        {/* Bonus Injection Card */}
        <motion.div whileHover={{ y: -5 }} className="glass-card p-8 border-purple-500/20 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
              <Gift className="text-purple-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Instant Bonus</h3>
            <div className="grid grid-cols-2 gap-2 mt-4 mb-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Stream ID</label>
                <input 
                  type="number"
                  placeholder="ID"
                  className="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-purple-500"
                  value={bonusStreamId}
                  onChange={(e) => setBonusStreamId(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Amount (HLUSD)</label>
                <input 
                  type="number"
                  placeholder="0.001"
                  className="bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-purple-500"
                  value={bonusAmount}
                  onChange={(e) => setBonusAmount(e.target.value)}
                />
              </div>
            </div>
          </div>
          <button 
            onClick={() => {
              console.log("Injecting Bonus for ID:", bonusStreamId);
              onInjectBonus?.(Number(bonusStreamId), bonusAmount);
            }} 
            className="w-full py-4 bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold rounded-2xl hover:bg-purple-500/30 transition-all uppercase tracking-wider"
          >
            Inject Bonus
          </button>
        </motion.div>

        {/* Emergency Pause Card */}
        <motion.div whileHover={{ y: -5 }} className="glass-card p-8 border-red-500/20 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              {isPaused ? <Play className="text-red-400" /> : <Pause className="text-red-400" />}
            </div>
            <h3 className="text-xl font-bold text-white">{isPaused ? "Resume Protocol" : "Emergency Pause"}</h3>
            <p className="text-slate-400 text-sm mt-2">Immediately freeze all active outgoing streams to rescue vault funds.</p>
          </div>
          <button 
            onClick={onTogglePause} 
            className={`w-full py-4 font-bold rounded-2xl transition-all uppercase tracking-wider border ${
              isPaused 
                ? "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20" 
                : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
            }`}
          >
            {isPaused ? "Unfreeze Streams" : "Execute Rescue"}
          </button>
        </motion.div>

        {/* Treasury Refill Card */}
        <motion.div whileHover={{ y: -5 }} className="glass-card p-8 border-cyan-500/20 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4">
              <Database className="text-cyan-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Refill Gas Tank</h3>
            <div className="flex flex-col gap-1 mt-4 mb-4">
              <label className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Top-up Amount (HLUSD)</label>
              <input 
                type="number"
                placeholder="0.001"
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-cyan-500"
                value={refillAmount}
                onChange={(e) => setRefillAmount(e.target.value)}
              />
            </div>
          </div>
          <button 
            onClick={() => onRefill?.(refillAmount)} 
            className="w-full py-4 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold rounded-2xl hover:bg-cyan-500/20 transition-all uppercase tracking-wider"
          >
            Top Up Tank
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
      <motion.div whileHover={{ y: -5 }} className="glass-card p-8 border-[#2DD4BF]/20 flex flex-col justify-between h-72">
        <div>
          <div className="w-12 h-12 rounded-full bg-[#2DD4BF]/10 flex items-center justify-center mb-4">
            <Zap className="text-[#2DD4BF]" size={24} />
          </div>
          <h3 className="text-xl font-bold text-white">Claim Earnings</h3>
          
          <div className="flex flex-col gap-1 mt-3">
            <label className="text-[10px] text-[#2DD4BF] font-bold uppercase tracking-wider">Stream ID to Claim</label>
            <input 
              type="number"
              className="w-20 bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-[#2DD4BF]"
              value={claimStreamId}
              onChange={(e) => setClaimStreamId(e.target.value)}
            />
          </div>
        </div>
        
        <button 
          onClick={handleClaim}
          disabled={isClaiming}
          className="w-full py-4 bg-[#2DD4BF] text-black font-black rounded-2xl shadow-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 uppercase"
        >
          {isClaiming ? (
            <><Loader2 className="animate-spin h-5 w-5" /> Processing Claim...</>
          ) : (
            "WITHDRAW NOW (GASLESS)"
          )}
        </button>
      </motion.div>

      <motion.div whileHover={{ y: -5 }} className="glass-card p-8 border-white/5 flex flex-col justify-between h-72">
        <div>
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Download className="text-white" size={24} />
          </div>
          <h3 className="text-xl font-bold text-white">Verified Pay-Stub</h3>
          <p className="text-slate-400 text-sm mt-2">Generate a cryptographically signed proof of income.</p>
        </div>
        <button 
          onClick={onDownloadPDF}
          className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-xs"
        >
          GENERATE PDF
        </button>
      </motion.div>
    </div>
  );
}