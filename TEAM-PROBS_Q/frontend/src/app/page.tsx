"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { TiltCard, Float3D } from "../components/TiltCard";
import { PayStreamLogo } from "../components/Logo";
import {
  IconStream, IconShield, IconBuilding, IconUsers, IconGas, IconLock,
  IconArrowRight, IconExternalLink, IconCheck, IconDollar, IconClock,
  IconChart, IconUpload
} from "../components/Icons";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.6, ease: "easeOut" as const },
});

const FEATURES = [
  { icon: IconStream, title: "Real-time Streaming", desc: "Per-second salary accrual with drift-free precision math for accurate payments" },
  { icon: IconShield, title: "Access Control", desc: "Role-based HR permissions built on OpenZeppelin's audited Ownable pattern" },
  { icon: IconBuilding, title: "Tax Compliance", desc: "Automatic 10% tax withholding routed directly to on-chain TaxVault" },
  { icon: IconUpload, title: "Batch Operations", desc: "Upload CSV to create payment streams for your entire workforce at once" },
  { icon: IconGas, title: "HLUSD Gas Model", desc: "Predictable USD-denominated fees eliminating volatile gas cost surprises" },
  { icon: IconLock, title: "Secure Withdrawals", desc: "ReentrancyGuard and SafeERC20 ensure bulletproof transaction safety" },
];

const STATS = [
  { value: "26", label: "Tests Passing", icon: IconCheck },
  { value: "~30%", label: "Gas Saved", icon: IconGas },
  { value: "10%", label: "Auto Tax", icon: IconChart },
  { value: "666888", label: "Chain ID", icon: IconStream },
];

const STEPS = [
  { step: "01", title: "Fund Treasury", desc: "HR deposits HLUSD into the PayrollTreasury smart contract", icon: IconDollar },
  { step: "02", title: "Create Streams", desc: "Configure employee address, salary amount, and duration", icon: IconStream },
  { step: "03", title: "Employees Withdraw", desc: "Workers claim earned salary anytime with automatic tax withholding", icon: IconUsers },
];

export default function Home() {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative overflow-hidden">



      <div className="relative z-10">
        {/* ═══ Hero Section ═══ */}
        <section className="flex flex-col items-center justify-center min-h-[86vh] text-center px-6">
          <div className="max-w-3xl space-y-8" style={{ perspective: "1200px" }}>
            {/* 3D Floating Logo */}
            <motion.div
              {...fade(0)}
              className="flex justify-center"
            >
              <Float3D duration={5} distance={8}>
                <div className="relative">
                  <PayStreamLogo size={80} />
                  {/* Shadow underneath */}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 h-3 bg-[var(--accent)]/10 blur-lg rounded-full" />
                </div>
              </Float3D>
            </motion.div>

            {/* Badge */}
            <motion.div
              {...fade(0.1)}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-card)] text-sm text-[var(--text-secondary)]"
            >
              <span className="pulse-dot"><span /></span>
              <span>Live on HeLa Testnet</span>
            </motion.div>

            {/* 3D Perspective Title */}
            <motion.div
              initial={{ opacity: 0, rotateX: 25, y: 40 }}
              animate={{ opacity: 1, rotateX: 0, y: 0 }}
              transition={{ delay: 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <h1 className="text-6xl md:text-7xl font-extrabold leading-[1.05] tracking-tight">
                <span className="text-gradient">Payroll</span>{" "}
                <span className="text-[var(--text-primary)]">that flows</span>
                <br />
                <span className="text-[var(--text-primary)]">every</span>{" "}
                <span className="text-gradient">second</span>
              </h1>
            </motion.div>

            {/* Subtitle with 3D depth */}
            <motion.p
              initial={{ opacity: 0, z: -50, y: 20 }}
              animate={{ opacity: 1, z: 0, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed"
              style={{ transformStyle: "preserve-3d" }}
            >
              Stream salaries in real-time with HLUSD on HeLa Chain.
              Replace monthly payroll with continuous, transparent payment flows.
            </motion.p>

            {/* Streaming line */}
            <motion.div {...fade(0.35)} className="max-w-sm mx-auto stream-shimmer" />

            {/* CTA with 3D press effect */}
            <motion.div {...fade(0.4)} className="flex flex-col items-center gap-4 pt-2">
              {!isConnected ? (
                <>
                  <p className="text-sm text-[var(--text-muted)]">Connect your wallet to begin</p>
                  <ConnectButton />
                </>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3" style={{ perspective: "600px" }}>
                  <motion.div
                    whileHover={{ scale: 1.04, rotateX: -3, z: 10 }}
                    whileTap={{ scale: 0.97, rotateX: 2 }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <Link href="/hr" className="btn-primary px-8 py-3 text-base">
                      <IconBuilding size={18} />
                      HR Dashboard
                      <IconArrowRight size={16} />
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.04, rotateX: -3, z: 10 }}
                    whileTap={{ scale: 0.97, rotateX: 2 }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <Link href="/employee" className="btn-outline px-8 py-3 text-base">
                      <IconUsers size={18} />
                      Employee Portal
                    </Link>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* ═══ Stats — 3D tilt cards ═══ */}
        <section className="max-w-4xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24, rotateX: 15 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <TiltCard intensity={8} className="h-full">
                  <div className="stat-card text-center py-5 h-full">
                    <div className="icon-box icon-box-sm icon-accent mx-auto mb-3">
                      <s.icon size={16} />
                    </div>
                    <p className="text-2xl font-bold text-[var(--text-primary)] mb-1">{s.value}</p>
                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{s.label}</p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══ Features — 3D tilt grid ═══ */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3">
              Built for <span className="text-gradient">Modern Payroll</span>
            </h2>
            <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
              Every feature designed for transparent, efficient, and compliant salary distribution
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30, rotateY: -8 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <TiltCard intensity={10}>
                  <div className="card p-6 h-full">
                    {/* Icon with 3D lift */}
                    <div
                      className="icon-box icon-box-lg icon-accent mb-4"
                      style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}
                    >
                      <f.icon size={22} />
                    </div>
                    <h3
                      className="font-semibold text-[var(--text-primary)] text-base mb-2"
                      style={{ transform: "translateZ(12px)", transformStyle: "preserve-3d" }}
                    >
                      {f.title}
                    </h3>
                    <p
                      className="text-sm text-[var(--text-secondary)] leading-relaxed"
                      style={{ transform: "translateZ(6px)", transformStyle: "preserve-3d" }}
                    >
                      {f.desc}
                    </p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══ How it Works — 3D step cards ═══ */}
        <section className="max-w-4xl mx-auto px-6 pb-24">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
              How it <span className="text-gradient">Works</span>
            </h2>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-5">
            {STEPS.map((s, i) => (
              <motion.div
                key={i}
                className="flex-1"
                initial={{ opacity: 0, y: 30, rotateX: 12 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <TiltCard intensity={12}>
                  <div className="card p-7 text-center relative h-full">
                    <span className="absolute top-4 right-4 text-xs font-mono text-[var(--text-muted)] opacity-40">
                      {s.step}
                    </span>
                    {/* 3D floating icon */}
                    <Float3D duration={4 + i} distance={6} delay={i * 0.5}>
                      <div className="icon-box icon-box-xl icon-accent mx-auto mb-5">
                        <s.icon size={24} />
                      </div>
                    </Float3D>
                    <h3
                      className="font-semibold text-[var(--text-primary)] text-lg mb-2"
                      style={{ transform: "translateZ(8px)", transformStyle: "preserve-3d" }}
                    >
                      {s.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">{s.desc}</p>

                    {i < STEPS.length - 1 && (
                      <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-[var(--text-muted)] opacity-30">
                        <IconArrowRight size={20} />
                      </div>
                    )}
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══ Footer ═══ */}
        <footer className="border-t border-[var(--border-default)] py-8 text-center">
          <p className="text-sm text-[var(--text-muted)] flex items-center justify-center gap-2 flex-wrap">
            <span>PayStream</span>
            <span className="opacity-30">·</span>
            <span>Built on HeLa Testnet</span>
            <span className="opacity-30">·</span>
            <span>Chain ID 666888</span>
            <span className="opacity-30">·</span>
            <a
              href="https://testnet-blockexplorer.helachain.com"
              target="_blank"
              className="text-[var(--accent)] hover:text-[var(--accent-light)] transition-colors inline-flex items-center gap-1"
            >
              Block Explorer <IconExternalLink size={12} />
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
