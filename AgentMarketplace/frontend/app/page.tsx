"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const agents = [
  { 
    id: 1, 
    name: "Alpha TradeBot", 
    type: "Financial / Trading", 
    price: "0.5 HELA/mo", 
    accent: "from-cyan-400 to-blue-600",
    shadow: "shadow-cyan-500/20",
    icon: (
      <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3v18h18M7 14l5-5 4 4 5-5" />
      </svg>
    ),
    description: "High-frequency crypto trading agent utilizing advanced ML models. Specializes in arbitrage and swing trading.",
    stats: { roi: "+42% APY", uptime: "99.9%" }
  },
  { 
    id: 2, 
    name: "Yield Harvester", 
    type: "DeFi / Farming", 
    price: "0.3 HELA/mo", 
    accent: "from-emerald-400 to-teal-600",
    shadow: "shadow-emerald-500/20",
    icon: (
      <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    description: "Automates smart contract staking and liquidity farming across multiple chains. Identifies highest risk-adjusted yield.",
    stats: { tvl: "$2.4M Managed", network: "Multi-Chain" }
  },
  { 
    id: 3, 
    name: "Chrono Sync", 
    type: "Assistant / Scheduling", 
    price: "0.1 HELA/mo", 
    accent: "from-purple-400 to-indigo-600",
    shadow: "shadow-purple-500/20",
    icon: (
      <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    description: "Your decentralized personal assistant. Completely private, AI-driven calendar optimization and dispute resolution.",
    stats: { privacy: "Zero-Knowledge", integrations: "12+ Tools" }
  },
  { 
    id: 4, 
    name: "Equilibrium", 
    type: "Asset Management", 
    price: "0.4 HELA/mo", 
    accent: "from-amber-400 to-orange-600",
    shadow: "shadow-amber-500/20",
    icon: (
      <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
    description: "Dynamically rebalances your portfolio across various assets based on algorithmic risk tolerance and market sentiment.",
    stats: { strategy: "Delta-Neutral", trades: "2k+/mo" }
  },
  { 
    id: 5, 
    name: "Social Echo", 
    type: "Community / Social", 
    price: "0.15 HELA/mo", 
    accent: "from-pink-400 to-rose-600",
    shadow: "shadow-pink-500/20",
    icon: (
      <svg className="w-8 h-8 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    ),
    description: "Generates context-aware, human-like replies for your decentralized social platforms and community channels.",
    stats: { latency: "<200ms", sentiment: "Adaptive" }
  },
  { 
    id: 6, 
    name: "BizConnect", 
    type: "Enterprise Automation", 
    price: "0.6 HELA/mo", 
    accent: "from-blue-400 to-indigo-600",
    shadow: "shadow-blue-500/20",
    icon: (
      <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    description: "Automates email drafting, smart contract summarization, invoicing, and cross-functional team coordination.",
    stats: { tasks: "Unlimited", docs: "PDF, TXT, SC" }
  },
];

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const HELA_TESTNET_CHAIN_ID = "0xa2c28"; // 666888 in hex

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const switchToHelaTestnet = async (ethereum: any) => {
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: HELA_TESTNET_CHAIN_ID }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: HELA_TESTNET_CHAIN_ID,
                chainName: 'Hela Testnet',
                nativeCurrency: {
                  name: 'HELA',
                  symbol: 'HLUSD', // or HELA
                  decimals: 18,
                },
                rpcUrls: ['https://testnet-rpc.helachain.com'],
                blockExplorerUrls: ['https://testnet-blockscout.helachain.com'],
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add Hela Testnet", addError);
        }
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const ethereum = (window as any).ethereum;
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        setWalletAddress(accounts[0]);
        
        // Enforce Hela Testnet
        const currentChainId = await ethereum.request({ method: 'eth_chainId' });
        if (currentChainId !== HELA_TESTNET_CHAIN_ID) {
          await switchToHelaTestnet(ethereum);
        }
      } catch (error) {
        console.error("Wallet connection failed:", error);
      }
    } else {
      alert("Please install MetaMask to use this dApp.");
    }
  };

  return (
    <main className="bg-hero-gradient min-h-screen relative font-sans">
      
      {/* Background Graphic Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-purple-600/10 blur-[150px] animate-float-slow"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-cyan-600/10 blur-[150px] animate-float-fast"></div>
        <div className="absolute inset-0 bg-grid opacity-20"></div>
      </div>

      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center text-xl font-bold shadow-[0_0_15px_rgba(0,243,255,0.5)]">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Smart<span className="text-gradient">MP</span></h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link href="#discover" className="hover:text-white transition-colors">Discover</Link>
            <Link href="#categories" className="hover:text-white transition-colors">Categories</Link>
            <Link href="#creators" className="hover:text-white transition-colors">For Creators</Link>
          </nav>

          <button 
            onClick={connectWallet}
            className="group relative px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_infinite]"></div>
            <span className="relative z-10 flex items-center gap-2 text-sm font-bold text-white">
              <svg className={`w-4 h-4 ${walletAddress ? 'text-emerald-400' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              {walletAddress ? (
                <span>
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              ) : (
                "Connect Wallet"
              )}
            </span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center min-h-[85vh] justify-center">
        <div className="glass-pill px-4 py-1.5 rounded-full mb-8 text-sm font-medium text-cyan-300 border border-cyan-500/30 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          Live on Hela Testnet
        </div>
        
        <h2 className="text-6xl md:text-8xl font-extrabold mb-8 tracking-tighter text-white leading-tight">
          Your Autonomous <br />
          <span className="text-gradient">Digital Workforce</span>
        </h2>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mb-12 leading-relaxed">
          The first decentralized marketplace for specialized AI agents. Hire trading bots, personal assistants, and yield farmers, all executed immutably on the Hela Network.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-5">
          <a href="#discover" className="px-8 py-4 bg-white text-black hover:bg-slate-200 rounded-xl font-bold text-lg transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] transform hover:-translate-y-1">
            Explore Agents
          </a>
          <button className="px-8 py-4 glass hover:bg-white/10 text-white rounded-xl font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 group">
            Publish an Agent
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>

        {/* Global Stats */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 pt-10 border-t border-white/5 w-full max-w-4xl">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-white mb-1">14.2k</span>
            <span className="text-sm text-slate-400 font-medium uppercase tracking-wider">Agents Deployed</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-white mb-1">$84M</span>
            <span className="text-sm text-slate-400 font-medium uppercase tracking-wider">Volume Managed</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-white mb-1">620+</span>
            <span className="text-sm text-slate-400 font-medium uppercase tracking-wider">Active Creators</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-white mb-1">100%</span>
            <span className="text-sm text-slate-400 font-medium uppercase tracking-wider">On-Chain Exec</span>
          </div>
        </div>
      </section>

      {/* Agents Grid Section */}
      <section id="discover" className="relative z-10 py-24 px-6 md:px-12 bg-black/40 backdrop-blur-3xl border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h3 className="text-4xl font-bold mb-4 text-white">Trending Agents</h3>
              <p className="text-slate-400 text-lg">Top-performing autonomous workers verified by the community.</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-colors">Most Popular</button>
              <button className="px-4 py-2 rounded-lg bg-transparent text-slate-400 font-medium hover:text-white transition-colors">Highest Yield</button>
              <button className="px-4 py-2 rounded-lg bg-transparent text-slate-400 font-medium hover:text-white transition-colors">Newest</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {agents.map((agent) => (
              <div key={agent.id} className="agent-card glass rounded-2xl p-1 relative group cursor-pointer">
                {/* Animated gradient border effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${agent.accent} opacity-20 group-hover:opacity-100 transition-opacity duration-500`} style={{ zIndex: -1 }}></div>
                
                <div className="bg-[#0a0a0f] rounded-xl p-6 h-full flex flex-col justify-between border border-white/5">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className={`agent-icon-wrapper w-14 h-14 rounded-xl bg-gradient-to-br ${agent.accent} bg-opacity-10 flex items-center justify-center shadow-lg ${agent.shadow}`}>
                        <div className="bg-black/50 w-full h-full rounded-xl flex items-center justify-center backdrop-blur-sm">
                          {agent.icon}
                        </div>
                      </div>
                      <div className="bg-white/5 px-3 py-1 rounded-full text-xs font-semibold text-slate-300 border border-white/10">
                        {agent.price}
                      </div>
                    </div>
                    
                    <h4 className="text-2xl font-bold mb-1 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all">{agent.name}</h4>
                    <p className="text-xs font-semibold tracking-widest text-[#a8b1c4] uppercase mb-4">{agent.type}</p>
                    
                    <p className="text-sm text-slate-400 mb-6 leading-relaxed min-h-[60px]">
                      {agent.description}
                    </p>

                    {/* Dynamic Stats Row */}
                    <div className="flex gap-4 mb-6">
                      {Object.entries(agent.stats).map(([k, v]) => (
                        <div key={k} className="bg-black/50 rounded-lg px-3 py-2 border border-white/5 flex-1">
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">{k}</p>
                          <p className="text-sm text-white font-medium">{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button className="w-full py-3.5 bg-white/5 hover:bg-white text-white hover:text-black rounded-xl font-bold transition-all duration-300 border border-white/10 hover:border-transparent flex justify-center items-center gap-2 group/btn relative overflow-hidden">
                    <span className="relative z-10">Hire Protocol</span>
                    <svg className="w-4 h-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <button className="px-8 py-3 rounded-full border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors">
              View All 1,420 Agents
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 pt-20 pb-10 border-t border-white/10 bg-black text-slate-400 font-sans">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                  A
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">SmartMP</h2>
              </div>
              <p className="text-sm leading-relaxed max-w-sm mb-6">
                The decentralized API logic hub. Empowering digital autonomy securely on the HeLa Testnet. 
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <span className="sr-only">GitHub</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">Marketplace</h4>
              <ul className="space-y-3text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Explore Agents</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Categories</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Top Earners</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">For Developers</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">SDK Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Submit Agent</a></li>
                <li><a href="#" className="hover:text-white transition-colors">HeLa Testnet Faucet</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs">
            <p>&copy; 2026 SmartMP. Powered by HeLa Network.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
