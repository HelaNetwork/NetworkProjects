"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, LineChart, Repeat, Shield, Wallet } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FindHuntLogo } from "@/components/brand/findhunt-logo";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const features = [
  {
    title: "Trading agent graphs",
    desc: "OHLC candles, volume bars, and cumulative profit / loss curves with a dedicated trading desk.",
    icon: LineChart,
  },
  {
    title: "Crypto SIP",
    desc: "Systematic plans like traditional SIPs — interval, horizon, and projected growth chart.",
    icon: Repeat,
  },
  {
    title: "Bills & subs",
    desc: "Netflix, Spotify, ChatGPT, SaaS, rent, school & college fees — templates plus auto-bill reminders.",
    icon: Shield,
  },
  {
    title: "Hela wallet",
    desc: "RainbowKit + Wagmi on Hela Testnet for vaults, LP, budgets, and AI suggestions.",
    icon: Wallet,
  },
];

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-6 sm:px-6">
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
          <FindHuntLogo size="md" animated />
        </motion.div>
        <ConnectButton />
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-4 pb-24 pt-4 sm:px-6 sm:pt-8">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <motion.p
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-white/50 px-4 py-1.5 text-xs font-medium text-emerald-800 backdrop-blur-md dark:border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-200"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              FindHunt · find clarity, hunt better outcomes
            </motion.p>
            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white"
            >
              Your crypto finances,
              <span className="block bg-gradient-to-r from-emerald-600 via-teal-500 to-slate-600 bg-clip-text text-transparent dark:from-emerald-300 dark:via-teal-300 dark:to-slate-300">
                charted and automated.
              </span>
            </motion.h1>
            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-6 max-w-xl text-lg text-slate-600 dark:text-slate-300"
            >
              Trading-style charts, SIP projections, subscription templates for streaming and GPT-class tools,
              rent and school fees, plus an AI layer — all in one mint-and-grey workspace.
            </motion.p>
            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-8 flex flex-wrap gap-4"
            >
              <Button asChild size="lg" className="rounded-2xl">
                <Link href="/dashboard">
                  Open dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="rounded-2xl">
                <Link href="/trading">Trading desk</Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="rounded-2xl">
                <Link href="/sip">Crypto SIP</Link>
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald-400/20 via-white/0 to-slate-300/20 blur-2xl" />
            <Card className="relative overflow-hidden border-emerald-200/50 bg-white/60 dark:bg-slate-900/50">
              <CardContent className="space-y-6 p-8">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    FindHunt snapshot
                  </span>
                  <span className="rounded-lg bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                    Hela · 666888
                  </span>
                </div>
                <p className="text-4xl font-bold text-slate-900 dark:text-white">$12,480.00</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="rounded-xl bg-emerald-500/10 p-4">
                    <p className="text-slate-500 dark:text-slate-400">SIP + savings</p>
                    <p className="mt-1 font-semibold text-emerald-800 dark:text-emerald-200">38%</p>
                  </div>
                  <div className="rounded-xl bg-slate-500/10 p-4">
                    <p className="text-slate-500 dark:text-slate-400">Trading P&L</p>
                    <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">+385 HLUSD</p>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                    initial={{ width: 0 }}
                    animate={{ width: "72%" }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        <section>
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-8 text-center text-2xl font-bold text-slate-900 dark:text-white"
          >
            Built for real recurring life
          </motion.h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.06 * i, duration: 0.45 }}
              >
                <Card className="h-full border-emerald-100/80 bg-white/50 transition-shadow hover:shadow-xl hover:shadow-emerald-500/10 dark:border-white/10 dark:bg-slate-900/40">
                  <CardContent className="flex gap-4 p-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-700 dark:text-emerald-300">
                      <f.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{f.title}</h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{f.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
