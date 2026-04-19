'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, Zap, LogOut, Database, Shield, Users, Activity, 
  DollarSign, Clock 
} from 'lucide-react';

// Modular Component Imports
import ActionHub from './components/ActionHub';
import { LiveTicker } from "./components/LiveTicker";
import { AditiAI } from './components/AditiAI'; 
import { TransactionFeed } from './components/TransactionFeed';
import { useWeb3 } from './hooks/useWeb3'; 

// 💡 Professional PDF logic
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type AppView = 'landing' | 'role-selection' | 'dashboard';

export default function HelaPayStreamPage() {
  const { 
    account, stats, transactions, connectWallet, disconnectWallet, 
    loading, claimEarnings, createNewStream, refillGasTank,
    pushBonus, togglePause, isPaused 
  } = useWeb3();

  const [view, setView] = useState<AppView>('landing');
  const [role, setRole] = useState<'employer' | 'employee' | null>(null);
  const [liveBalance, setLiveBalance] = useState<string>("0");

  // 📈 Logic to find the most recent active stream for the employee
  const activeStreamId = useMemo(() => {
    const lastStream = transactions.find(tx => tx.type === "New Stream Created");
    return lastStream ? 1 : 0; 
  }, [transactions]);

  // Sync initial balance whenever the blockchain stats refresh
  useEffect(() => {
    if (stats.tvl) setLiveBalance(stats.tvl);
  }, [stats.tvl]);

  useEffect(() => {
    if (account && view === 'landing') setView('role-selection');
    if (!account) {
      setView('landing');
      setRole(null);
    }
  }, [account, view]);

  // 📄 Professional Verified Pay-Stub Logic
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(45, 212, 191); 
    doc.text("HeLa PayStream", 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Cryptographically Verified Proof of Income", 14, 30);

    autoTable(doc, {
      startY: 45,
      head: [['Protocol Detail', 'Verification Status']],
      body: [
        ['Employee Wallet', account || 'Unknown'],
        ['Protocol State', isPaused ? 'PAUSED/COMPLIANCE' : 'ACTIVE/STREAMING'],
        ['Network', 'HeLa Testnet (Chain ID: 8668)'],
        ['Asset Type', 'HLUSD (Stablecoin)']
      ],
      theme: 'striped',
      headStyles: { fillColor: [45, 212, 191] }
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Description', 'Amount']],
      body: [
        ['Calculated Stream Rate', `$${stats.activeStreams !== "0" ? "0.005787" : "0"}/sec`],
        ['Total Cumulative Earnings', `$${liveBalance} HLUSD`],
        ['Tax Deduction (10%)', `$${(parseFloat(liveBalance) * 0.1).toFixed(4)}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [168, 85, 247] } 
    });

    doc.save(`HeLa_PayStub_${account?.slice(0, 6)}.pdf`);
  };

  return (
    <div className="min-h-screen text-slate-100 selection:bg-teal-500/30 font-sans">
      <AuroraBackground />
      <AnimatePresence mode="wait">
        
        {view === 'landing' && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 flex min-h-screen items-center justify-center">
            <div className="max-w-3xl text-center px-6">
              <div className="p-4 bg-teal-500/20 rounded-3xl inline-block mb-8 shadow-[0_0_30px_rgba(45,212,191,0.2)]">
                <Zap className="w-12 h-12 text-teal-400" />
              </div>
              <h1 className="text-8xl font-black mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">
                HeLa PayStream
              </h1>
              <p className="text-xl text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
                Stream salaries per-second on the HeLa Network. Zero gas, zero anxiety.
              </p>
              <button 
                onClick={connectWallet} 
                className="px-10 py-5 bg-teal-500 text-black font-black rounded-2xl hover:scale-105 transition-all shadow-2xl shadow-teal-500/20 flex items-center gap-4 mx-auto uppercase tracking-widest"
              >
                <Wallet /> {loading ? "CONNECTING..." : "CONNECT PROTOCOL"}
              </button>
            </div>
          </motion.div>
        )}

        {view === 'role-selection' && (
          <motion.div key="role" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 flex min-h-screen items-center justify-center px-6">
            <div className="max-w-5xl w-full">
              <h2 className="text-4xl font-black text-center mb-16 tracking-tight text-white/90 uppercase italic">Access Gateway</h2>
              <div className="grid md:grid-cols-2 gap-10">
                <RoleCard title="Employer" icon={<Users size={40}/>} desc="Manage organization streams, TVL, and compliance tax vaults." onClick={() => { setRole('employer'); setView('dashboard'); }} />
                <RoleCard title="Employee" icon={<Activity size={40}/>} desc="Watch wealth grow in real-time. Claim earnings gaslessly." onClick={() => { setRole('employee'); setView('dashboard'); }} highlight />
              </div>
            </div>
          </motion.div>
        )}

        {view === 'dashboard' && role && (
          <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
            <header className="border-b border-white/5 bg-slate-950/50 backdrop-blur-2xl sticky top-0 z-50 p-6 px-12 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Zap className="text-teal-400" />
                <h1 className="text-2xl font-black uppercase tracking-tighter">PayStream</h1>
                {isPaused && (
                  <span className="ml-4 px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-400 text-[10px] font-bold rounded-full animate-pulse">
                    PROTOCOL PAUSED
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl font-mono text-teal-400">{account?.slice(0,6)}...{account?.slice(-4)}</div>
                <button onClick={disconnectWallet} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:text-red-400 transition-colors">
                  <LogOut size={20}/>
                </button>
              </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-12 py-12 space-y-12">
              <AditiAI transactions={transactions} />

              <div className="grid grid-cols-12 gap-12">
                <div className="col-span-12 space-y-12">
                  <div className="flex justify-between items-end">
                    <h2 className="text-6xl font-black tracking-tighter">
                      {role === 'employer' ? 'Employer Command' : 'Wealth Tracker'}
                    </h2>
                    <button onClick={() => setView('role-selection')} className="text-xs font-bold text-slate-500 hover:text-teal-400 border border-white/10 rounded-xl px-4 py-2 bg-white/5 transition-all">
                      SWITCH PORTAL
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    {role === 'employer' ? (
                      <>
                        <StatCard title="Total Value Locked" value={`$${stats.tvl}`} icon={<Database/>} trend="+12% runway" />
                        <StatCard title="Tax Reserves (10%)" value={`$${stats.taxVault}`} icon={<Shield/>} glowColor="purple" />
                        <StatCard title="Employer Gas Tank" value={`${stats.gasTank} HLUSD`} icon={<Zap/>} glowColor="cyan" />
                      </>
                    ) : (
                      <>
                        <StatCard title="Available to Withdraw" value={`$${liveBalance}`} icon={<DollarSign/>} glowColor="teal" />
                        <StatCard title="Hourly Rate" value="$20.83" icon={<Clock/>} glowColor="cyan" />
                        <StatCard title="Streams Active" value={stats.activeStreams} icon={<Activity/>} />
                      </>
                    )}
                  </div>

                  {role === 'employee' && (
                    <LiveTicker 
                      balance={stats.tvl} 
                      rate={stats.activeStreams !== "0" ? "0.005787" : "0"} 
                      onTick={(newVal) => setLiveBalance(newVal)} 
                    />
                  )}
                  
                  {/* 🚀 FIXED: Fully dynamic props passing UI inputs to createBatchStreams hook */}
                  <ActionHub 
                    role={role} 
                    isPaused={isPaused} 
                    onTogglePause={togglePause} 
                    onRefill={(amount) => refillGasTank(amount)} 
                    // 💡 Corrected: Now accepting dynamic recipient and amount from UI
                    onCreateStream={(recipient, amount) => createNewStream(recipient, amount)} 
                    // 💡 Corrected: Now accepting dynamic bonus ID and amount
                    onInjectBonus={(id, amount) => pushBonus(id, amount)} 
                    onClaim={async (id) => {
                       await claimEarnings(id || activeStreamId);
                    }} 
                    onDownloadPDF={handleDownloadPDF} 
                  />

                  <TransactionFeed txs={transactions} />
                </div>
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Helper Components ---

const StatCard = ({ title, value, icon, trend, glowColor = 'teal' }: any) => (
  <motion.div whileHover={{ scale: 1.02 }} className="relative bg-white/5 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 transition-all hover:border-white/20">
    <div className="flex justify-between items-start mb-6">
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{title}</p>
        <h3 className="text-4xl font-black font-mono text-white">{value}</h3>
      </div>
      <div className={`p-4 bg-${glowColor}-500/10 rounded-2xl text-${glowColor}-400`}>{icon}</div>
    </div>
    {trend && <div className="text-[10px] text-teal-400 font-bold flex items-center gap-1 uppercase tracking-widest">{trend}</div>}
  </motion.div>
);

const AuroraBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden bg-[#020617]">
    <div className="absolute top-[-10%] left-[-10%] w-[60vmax] h-[60vmax] rounded-full bg-teal-500/10 blur-[120px] animate-pulse" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[50vmax] h-[50vmax] rounded-full bg-cyan-500/10 blur-[120px] animate-pulse delay-700" />
  </div>
);

const RoleCard = ({ title, icon, desc, onClick, highlight = false }: any) => (
  <button onClick={onClick} className={`group relative p-12 rounded-[2.5rem] border text-left transition-all hover:-translate-y-3 ${highlight ? 'bg-teal-500/10 border-teal-500/50 shadow-[0_20px_50px_rgba(45,212,191,0.1)]' : 'bg-white/5 border-white/10'}`}>
    <div className={`mb-8 p-6 inline-block rounded-3xl ${highlight ? 'bg-teal-500/20 text-teal-400' : 'bg-white/10 text-slate-400'}`}>{icon}</div>
    <h3 className="text-3xl font-black mb-4 uppercase">{title}</h3>
    <p className="text-slate-400 text-lg leading-relaxed">{desc}</p>
  </button>
);