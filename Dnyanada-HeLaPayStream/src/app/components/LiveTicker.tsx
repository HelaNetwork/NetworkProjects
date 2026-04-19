"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface TickerProps {
  balance: string;
  rate: string;
  onTick?: (newBalance: string) => void;
}

export const LiveTicker = ({ balance, rate, onTick }: TickerProps) => {
  const [displayBalance, setDisplayBalance] = useState(parseFloat(balance));

  useEffect(() => {
    setDisplayBalance(parseFloat(balance));
  }, [balance]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayBalance((prev) => {
        const nextVal = prev + parseFloat(rate) / 20;
        
        // 💡 THE FIX: Defers the parent update to the next event loop tick
        setTimeout(() => {
          onTick?.(nextVal.toFixed(8)); 
        }, 0);

        return nextVal;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [rate, onTick]);

  return (
    <div className="relative bg-white/5 backdrop-blur-3xl border border-teal-500/30 rounded-[3rem] p-12 shadow-2xl overflow-hidden group">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] group-hover:bg-teal-500/20 transition-all duration-700" />
      
      <div className="relative flex items-center justify-between mb-10">
        <h3 className="text-2xl font-black flex items-center gap-4 tracking-tight">
          <div className="p-2 bg-teal-500/20 rounded-xl">
             <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
                <Zap size={20} className="text-teal-400" />
             </motion.div>
          </div>
          LIVE REVENUE STREAM
        </h3>
        
        {parseFloat(rate) > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Active Stream</span>
          </div>
        )}
      </div>

      <motion.h1 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-7xl md:text-8xl font-mono font-black text-white tracking-tighter relative z-10"
      >
        ${displayBalance.toFixed(8)}
      </motion.h1>
      
      <div className="mt-6 flex items-center gap-4 text-slate-500 text-xs font-bold uppercase tracking-widest">
        <span>Current Rate:</span>
        <span className="text-teal-400/80 font-mono">${rate}/sec</span>
      </div>
    </div>
  );
};