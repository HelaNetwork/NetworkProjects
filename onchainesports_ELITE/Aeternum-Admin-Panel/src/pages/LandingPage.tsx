import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Users, Shield, Zap, BarChart3, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/admin");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-green-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="font-bold text-black">Ⓐ</span>
              </div>
              <span className="font-bold text-2xl text-green-400">Aeternum</span>
            </div>
            <Button
              onClick={handleGetStarted}
              className="bg-green-600 hover:bg-green-700 text-black font-bold px-6 py-2 rounded-lg border-0"
            >
              {isAuthenticated ? "Dashboard" : "Connect Wallet"}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen pt-20 px-4 flex items-center">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 via-black to-black" />

        <div className="relative max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl lg:text-6xl font-black mb-6 text-white leading-tight">
                Trade Esports <span className="text-green-400">Like Never Before</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Decentralized peer-to-peer esports betting. Trade NFT-backed gaming assets with transparent bonding curves, zero intermediaries, and industry-leading transparency.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button
                  onClick={handleGetStarted}
                  className="bg-green-600 hover:bg-green-700 text-black font-bold py-6 px-8 rounded-lg text-lg border-0 group flex items-center gap-2"
                >
                  Connect Wallet <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                </Button>
                <Button
                  variant="outline"
                  className="border-green-500/50 text-green-400 hover:bg-green-900/20 font-bold py-6 px-8 rounded-lg text-lg"
                >
                  View Whitepaper
                </Button>
              </div>

              {/* Stats */}
              {/* <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-3xl font-bold text-green-400">$50M+</div>
                  <div className="text-sm text-gray-400">Total Volume</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-400">25K+</div>
                  <div className="text-sm text-gray-400">Active Traders</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-400">1000+</div>
                  <div className="text-sm text-gray-400">Markets</div>
                </div>
              </div> */}
            </motion.div>

            {/* Right - Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative h-96 lg:h-full rounded-2xl overflow-hidden border border-green-500/30"
            >
              <img
                src="https://www.riotgames.com/darkroom/2880/8d5c497da1c2eeec8cffa99b01abc64b:6066e0c7a72429cb3e6f1de9afe5fe21/ps-f2p-val-console-launch-16x9.jpg"
                alt="Valorant Esports"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-transparent to-black/40" />

              {/* Floating Cards */}
              <motion.div
                className="absolute -bottom-8 -left-8 bg-gradient-to-br from-green-600/40 to-transparent border border-green-500/30 rounded-lg p-4 backdrop-blur w-48 z-10"
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <div className="text-xs text-gray-400 mb-2">Trending Market</div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="font-bold">Valorant Pro League</span>
                </div>
                <div className="text-green-400 text-sm mt-2">+24.5%</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Supported Games Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-black to-green-900/10 border-t border-green-500/20">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-center mb-16"
          >
            <span className="text-white">Designed Fori Major </span>
            <span className="text-green-400">Esports Titles</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "League of Legends",
                description: "Worlds • LEC • Regional Leagues",
                image: "🔵",
                bgColor: "from-blue-900/30 to-blue-900/10"
              },
              {
                name: "Valorant",
                description: "Champions • International Events",
                image: "🔴",
                bgColor: "from-red-900/30 to-red-900/10"
              },
              {
                name: "Clash of Clans",
                description: "Clan War • Tournament Leagues",
                image: "🟠",
                bgColor: "from-orange-900/30 to-orange-900/10"
              },
              {
                name: "GTA 6",
                description: "Racing • Content Creator Battles",
                image: "🟡",
                bgColor: "from-yellow-900/30 to-yellow-900/10"
              },
            ].map((game, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`bg-gradient-to-br ${game.bgColor} border border-white/10 rounded-xl p-6 hover:border-white/30 transition group cursor-pointer`}
              >
                <div className="text-5xl mb-4">{game.image}</div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-green-400 transition">{game.name}</h3>
                <p className="text-sm text-gray-400">{game.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-center mb-16"
          >
            <span className="text-white">Built for </span>
            <span className="text-green-400">Transparency</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Smart Contract Security",
                description: "Every trade protected by audited contracts. Full on-chain transparency."
              },
              {
                icon: Coins,
                title: "Bonding Curves",
                description: "Algorithmic pricing ensures fair market discovery and sustainable token economics."
              },
              {
                icon: Users,
                title: "Peer-to-Peer Trading",
                description: "Direct player-to-player trades without intermediaries or market makers."
              },
              {
                icon: Zap,
                title: "Zero Lock-In",
                description: "Withdraw instantly. Your assets, your control, anytime."
              },
              {
                icon: BarChart3,
                title: "Real-Time Analytics",
                description: "Market depth, player stats, and trading signals at your fingertips."
              },
              {
                icon: Coins,
                title: "Minimal Fees",
                description: "0.25% trading fee. Keep more of your wins."
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.05 }}
                className="bg-gradient-to-br from-green-900/20 to-black border border-green-500/20 rounded-xl p-8 hover:border-green-500/50 hover:bg-gradient-to-br hover:from-green-900/30 hover:to-black transition group"
              >
                <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-600/40 transition">
                  <feature.icon className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-black to-green-900/10 border-y border-green-500/20">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-center mb-16"
          >
            <span className="text-white">How It </span>
            <span className="text-green-400">Works</span>
          </motion.h2>

          <div className="space-y-8">
            {[
              { num: 1, title: "Connect Wallet", desc: "Link your Web3 wallet (MetaMask, Phantom, etc.)" },
              { num: 2, title: "Deposit Assets", desc: "Fund your account with ETH, SOL, or supported tokens" },
              { num: 3, title: "Browse Markets", desc: "Explore thousands of esports betting opportunities" },
              { num: 4, title: "Trade & Earn", desc: "Place bets via smart contracts, profit directly" },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="flex gap-6 items-start"
              >
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center font-bold text-black flex-shrink-0">
                  {item.num}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/50 rounded-2xl p-12 text-center"
          >
            <h2 className="text-4xl font-bold mb-6 text-white">
              Start Trading <span className="text-green-400">Now</span>
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Join the future of esports betting. Low fees, high transparency, complete control.
            </p>
            <Button
              onClick={handleGetStarted}
              className="bg-green-600 hover:bg-green-700 text-black font-bold py-6 px-10 rounded-lg text-lg border-0 group flex items-center gap-2 mx-auto"
            >
              Connect Wallet Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-green-500/20 py-12 px-4 bg-black/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-green-400 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-green-400 transition">Markets</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Portfolio</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Analytics</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-green-400 mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-green-400 transition">Discord</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Twitter</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-green-400 mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-green-400 transition">Docs</a></li>
                <li><a href="#" className="hover:text-green-400 transition">API</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-green-400 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-green-400 transition">Terms</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Privacy</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Licenses</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-green-500/20 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 Aeternum. Decentralized Esports Betting Exchange.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
