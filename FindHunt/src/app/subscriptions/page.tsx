"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { parseEther, formatEther, zeroAddress, isAddress } from "viem";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import {
  Building2,
  Clapperboard,
  GraduationCap,
  Home,
  Sparkles,
  Tv,
  Zap,
} from "lucide-react";
import { FindHuntLogo } from "@/components/brand/findhunt-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { abis, addresses } from "@/lib/contracts";
import { cn } from "@/lib/utils";

type Preset = {
  id: string;
  name: string;
  description: string;
  amount: string;
  periodDays: string;
  icon: typeof Tv;
  accent: string;
};

const STREAMING: Preset[] = [
  {
    id: "netflix",
    name: "Netflix",
    description: "Streaming — set recipient to your card top-up or merchant wallet.",
    amount: "0.018",
    periodDays: "30",
    icon: Tv,
    accent: "from-red-500/20 to-slate-500/10",
  },
  {
    id: "spotify",
    name: "Spotify",
    description: "Music subscription (example amounts in HLUSD).",
    amount: "0.012",
    periodDays: "30",
    icon: Clapperboard,
    accent: "from-green-500/20 to-emerald-500/10",
  },
  {
    id: "youtube",
    name: "YouTube Premium",
    description: "Ad-free & music bundle.",
    amount: "0.014",
    periodDays: "30",
    icon: Tv,
    accent: "from-red-600/15 to-slate-500/10",
  },
];

const SAAS_AI: Preset[] = [
  {
    id: "chatgpt",
    name: "ChatGPT Plus",
    description: "OpenAI — paste billing wallet or your own hot wallet for automation.",
    amount: "0.022",
    periodDays: "30",
    icon: Sparkles,
    accent: "from-emerald-500/20 to-teal-500/10",
  },
  {
    id: "saas",
    name: "Generic SaaS",
    description: "Notion, Figma, GitHub, Slack-style recurring seat billing.",
    amount: "0.015",
    periodDays: "30",
    icon: Zap,
    accent: "from-violet-500/20 to-purple-500/10",
  },
  {
    id: "claude",
    name: "Claude / API",
    description: "AI API or pro plan — adjust amount to your invoice.",
    amount: "0.02",
    periodDays: "30",
    icon: Sparkles,
    accent: "from-orange-500/15 to-amber-500/10",
  },
];

const BILLS: Preset[] = [
  {
    id: "rent",
    name: "Rent / lease",
    description: "Monthly rent or co-living — link landlord treasury address.",
    amount: "0.35",
    periodDays: "30",
    icon: Home,
    accent: "from-sky-500/15 to-slate-500/10",
  },
  {
    id: "maintenance",
    name: "Maintenance / society fee",
    description: "Building maintenance, parking, amenities.",
    amount: "0.04",
    periodDays: "30",
    icon: Building2,
    accent: "from-slate-500/15 to-zinc-500/10",
  },
  {
    id: "school",
    name: "School fee",
    description: "K–12 tuition — term or monthly cadence.",
    amount: "0.12",
    periodDays: "90",
    icon: GraduationCap,
    accent: "from-blue-500/15 to-indigo-500/10",
  },
  {
    id: "college",
    name: "College / university",
    description: "Semester or monthly hostel + tuition split.",
    amount: "0.2",
    periodDays: "120",
    icon: GraduationCap,
    accent: "from-indigo-500/15 to-violet-500/10",
  },
  {
    id: "course",
    name: "Course / coaching",
    description: "Bootcamps, test prep, certifications.",
    amount: "0.08",
    periodDays: "60",
    icon: GraduationCap,
    accent: "from-teal-500/15 to-cyan-500/10",
  },
];

function PresetGrid({
  items,
  autoBill,
  onToggleAuto,
  onApply,
}: {
  items: Preset[];
  autoBill: Record<string, boolean>;
  onToggleAuto: (id: string) => void;
  onApply: (p: Preset) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((p) => {
        const Icon = p.icon;
        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-2xl border border-emerald-100/80 bg-white/50 p-4 dark:border-white/10 dark:bg-slate-900/40",
              "bg-gradient-to-br",
              p.accent
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70 text-emerald-800 shadow-sm dark:bg-slate-800/80 dark:text-emerald-200">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900 dark:text-white">{p.name}</p>
                  <Badge variant="secondary">
                    {p.amount} HLUSD / {p.periodDays}d
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">{p.description}</p>
                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={autoBill[p.id] ?? false}
                    onChange={() => onToggleAuto(p.id)}
                    className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Auto-bill reminder (in-app)
                </label>
                <Button size="sm" variant="secondary" className="rounded-lg" onClick={() => onApply(p)}>
                  Fill subscription form
                </Button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function SubscriptionsPage() {
  const { address, isConnected } = useAccount();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("0.01");
  const [periodDays, setPeriodDays] = useState("30");
  const [prepaid, setPrepaid] = useState("0.05");
  const [subId, setSubId] = useState("0");
  const [autoBill, setAutoBill] = useState<Record<string, boolean>>({});

  const sub = addresses.subscriptions;
  const enabled = Boolean(address && sub);

  const { data: prepaidBal, refetch } = useReadContract({
    address: sub,
    abi: abis.subscriptionManager,
    functionName: "prepaidBalance",
    args: [address ?? zeroAddress],
    query: { enabled },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) void refetch();
  }, [isSuccess, refetch]);

  const busy = isPending || confirming;
  const prepaidEth =
    prepaidBal !== undefined ? parseFloat(formatEther(prepaidBal as bigint)) : 0;

  const periodSeconds = BigInt((parseInt(periodDays, 10) || 30) * 86400);

  function applyPreset(p: Preset) {
    setAmount(p.amount);
    setPeriodDays(p.periodDays);
  }

  function toggleAuto(id: string) {
    setAutoBill((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <FindHuntLogo size="sm" showWordmark={false} hideWordmarkMobile={false} />
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Bills & subscriptions</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Netflix, SaaS, ChatGPT, rent, school & college fees — templates + on-chain prepaid automation.
            </p>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="flex w-full flex-wrap gap-1">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="onchain">On-chain control</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Streaming & entertainment</CardTitle>
              <CardDescription>One tap fills amount & cadence — add the payee 0x address, then use On-chain tab.</CardDescription>
            </CardHeader>
            <CardContent>
              <PresetGrid items={STREAMING} autoBill={autoBill} onToggleAuto={toggleAuto} onApply={applyPreset} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>AI & SaaS</CardTitle>
              <CardDescription>GPT-class tools, dev tools, productivity stacks</CardDescription>
            </CardHeader>
            <CardContent>
              <PresetGrid items={SAAS_AI} autoBill={autoBill} onToggleAuto={toggleAuto} onApply={applyPreset} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Rent, fees & education</CardTitle>
              <CardDescription>Recurring rent, society charges, school / college / course fees</CardDescription>
            </CardHeader>
            <CardContent>
              <PresetGrid items={BILLS} autoBill={autoBill} onToggleAuto={toggleAuto} onApply={applyPreset} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="onchain" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Prepaid balance</CardTitle>
                <CardDescription>Used when subscriptions execute on-chain</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                  {enabled ? `${prepaidEth.toFixed(4)} HLUSD` : "—"}
                </p>
                <div className="space-y-2">
                  <Label>Top up prepaid</Label>
                  <Input value={prepaid} onChange={(e) => setPrepaid(e.target.value)} />
                  <Button
                    disabled={!sub || !isConnected || busy}
                    onClick={() =>
                      sub &&
                      writeContract({
                        address: sub,
                        abi: abis.subscriptionManager,
                        functionName: "depositPrepaid",
                        value: parseEther(prepaid || "0"),
                      })
                    }
                  >
                    {busy ? "Confirming…" : "Deposit prepaid"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Create & execute</CardTitle>
                <CardDescription>Recipient = landlord, school treasury, or your card-bridge wallet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Recipient (0x…)</Label>
                  <Input
                    placeholder="0x…"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount per period (HLUSD)</Label>
                  <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Period (days)</Label>
                  <Input value={periodDays} onChange={(e) => setPeriodDays(e.target.value)} />
                </div>
                <Button
                  variant="secondary"
                  disabled={!sub || !isConnected || busy || !isAddress(recipient)}
                  onClick={() =>
                    sub &&
                    writeContract({
                      address: sub,
                      abi: abis.subscriptionManager,
                      functionName: "createSubscription",
                      args: [recipient as `0x${string}`, parseEther(amount || "0"), periodSeconds],
                    })
                  }
                >
                  Create subscription
                </Button>
                <div className="space-y-2 border-t border-emerald-100/80 pt-4 dark:border-white/10">
                  <Label>Subscription id to execute</Label>
                  <Input value={subId} onChange={(e) => setSubId(e.target.value)} />
                  <Button
                    variant="outline"
                    disabled={!sub || !isConnected || busy}
                    onClick={() =>
                      sub &&
                      writeContract({
                        address: sub,
                        abi: abis.subscriptionManager,
                        functionName: "executeSubscription",
                        args: [BigInt(subId || "0")],
                      })
                    }
                  >
                    Execute due payment
                  </Button>
                </div>
                {hash && <p className="break-all text-xs text-slate-500">Tx: {hash}</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
