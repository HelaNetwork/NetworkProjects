"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Clock, ShieldCheck, Globe } from "lucide-react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B0F19] text-white selection:bg-emerald-500/30">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute left-1/2 top-0 h-[80vh] w-[80vw] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Navigation / Header */}

        {/* Hero Section */}
        <div className="py-20 lg:py-28 text-center max-w-5xl mx-auto">
          <motion.h1
            className="text-5xl font-bold tracking-tight text-white sm:text-7xl mb-8 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            The Future of Payroll is <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Continuous & Instant
            </span>
          </motion.h1>

          <motion.div
            className="text-lg text-zinc-400 leading-relaxed max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <p>
              PayStream reimagines how value moves in an organization. By replacing stagnant monthly paychecks with fluid, second-by-second salary streaming, we unlock financial freedom for employees and automated efficiency for enterprises.
            </p>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 pb-24">
          <FeatureCard
            icon={Clock}
            title="Real-Time Earning"
            desc="Why wait 30 days for money you've already earned? Watch your balance grow every second and withdraw instantly."
          />
          <FeatureCard
            icon={Zap}
            title="Built on HeLa"
            desc="Powered by HeLa Network's stablecoin-native architecture (HLUSD), ensuring zero volatility and negligible gas fees."
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Tax Compliant"
            desc="Automated tax withholding ensures compliance without the administrative headache. Smart vaults handle the rest."
          />
          <FeatureCard
            icon={Globe}
            title="Global Off-Ramp"
            desc="Integrated fiat off-ramps allow employees to convert crypto earnings to local currency (USD, EUR, INR, etc.) seamlessly."
          />
        </div>

        {/* Deep Dive Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center pb-32">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Why Streaming Money Matters</h2>
            <div className="space-y-6 text-zinc-400 leading-relaxed">
              <p>
                In the traditional economy, employees provide labor daily but essentially lend that value to their employers interest-free for weeks. <strong>PayStream</strong> balances this equation.
              </p>
              <p>
                For employers, it signifies a shift towards automated, smart-contract-driven operations that eliminate payroll errors and banking delays. For employees, it means liquidity on demand—solving cash flow issues without predatory loans.
              </p>
              <p>
                Leveraging the <strong>HeLa Layer 1 Blockchain</strong>, we achieve the throughput and stability necessary for this financial revolution, executing thousands of micro-transactions at a fraction of the cost of legacy networks.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
            <div className="relative rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <div className="animate-pulse">●</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Status</div>
                  <div className="text-white font-bold">Streaming Active</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Rate</span>
                  <span className="text-white font-mono">0.000385 HLUSD/s</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Unclaimed</span>
                  <span className="text-emerald-400 font-mono font-bold">452.1932 HLUSD</span>
                </div>
                <div className="bg-white/10 h-1.5 w-full rounded-full overflow-hidden mt-2">
                  <div className="bg-emerald-500 h-full w-[65%]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="border-t border-white/5 py-12 text-center text-zinc-600 text-xs">
          <p>PAYSTREAM • POWERED BY HELA LABS</p>
        </footer>

      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
      <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
    </div>
  );
}
