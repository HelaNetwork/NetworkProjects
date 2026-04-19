"use client";

import { TopNavBar } from "@/components/TopNavBar";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { parseUnits } from "ethers";
import {
  activateAgent as activateAgentOnChain,
  getPublicContractAddresses,
  isAgentActivatedByUser
} from "@/lib/contracts";
import { calculateDeveloperPayout, calculatePlatformFee, PLATFORM_FEE_PERCENT } from "@/lib/platformFee";
import { approveHLUSD, connectWallet, ensureHeLaNetwork, getConnectedAccount, transferHLUSD } from "@/lib/wallet";
import { getAgentImage, parseConfigSchema } from "@/lib/agentUi";

const AGENTS: Record<
  string,
  {
    id: number;
    name: string;
    type: string;
    description: string;
    fullDescription: string;
    image: string;
    price: number;
    activeCount: number;
    isLive: boolean;
    config: { field: string; type: string; placeholder: string }[];
  }
> = {
  "1": {
    id: 1,
    name: "Trading Bot",
    type: "TRADING",
    description:
      "Monitors price thresholds and executes swaps across multiple liquidity pools with precision timing.",
    fullDescription:
      "The Trading Bot is an advanced autonomous agent that monitors price movements across multiple liquidity pools. It can execute swaps at optimal prices, set custom alerts, and simulate trade execution. Perfect for active traders and DeFi enthusiasts.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCP9WykVHXlBO4UR2yXu_3m-9IlbFZ2gQIcMEdQEFf9kGLNUq3OsUSKEd-VP82nlecVqwhbNq-gonLvflkS3USYdgiPjK3LnO14jyjCtsyoXoWhgddIoMD7l4mDOaljT05Z6K5HXw2-DtHyNQRWIr3YVhYzViY-zmT2_q0hdYaHqqVYeK02HmzB_BbVzpyU-W444Ddm1M8nXvvT5padIoGxZGyKmLtGHJA73rLAHpMHnKxe3z179wvZf3q8lJpEHjZkxmW_IL2iOFY",
    price: 2.5,
    activeCount: 24,
    isLive: true,
    config: [
      { field: "Token Pair", type: "text", placeholder: "e.g., HLUSD/ETH" },
      { field: "Price Threshold", type: "number", placeholder: "e.g., 0.98" },
      { field: "Current Price", type: "number", placeholder: "e.g., 0.95" },
      { field: "Action Type", type: "select", placeholder: "Alert or Execute" },
      { field: "Amount", type: "number", placeholder: "HLUSD amount" }
    ]
  },
  "2": {
    id: 2,
    name: "Yield Orchestrator",
    type: "FARMING",
    description:
      "Auto-compounds yield, monitors LP positions and suggests optimal farming strategies.",
    fullDescription:
      "Yield Orchestrator automatically compounds your LP yields and monitors position health. It provides real-time APY updates and recommends rebalancing actions based on market conditions.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCsYXxIvzCasfwu0KjYNIBqyp1bFixdCnGRqahsrugyzKTdlpaGYJekeVsoCU80cL0ClsaNm1FUZV7OHNfe7ilj-_l2COB9BDtlqOfu0HEjItghJg8n2BazGMVB6NGd_jKE5p3iIUTBOuXIBCUcdRPsNbvuOncUKAoiw2vvz28Edhtyu7cNaMo24d13vtgrzJqATCd0DPQq1HH72HD6hjJ4vCZ6_nWMAJrgRtul6oDOhyJ9D95rrWRDMpXWM8gJgn5MwzQSljgigWY",
    price: 0.8,
    activeCount: 812,
    isLive: true,
    config: [
      { field: "LP Token Address", type: "text", placeholder: "0x..." },
      { field: "Current APY", type: "number", placeholder: "e.g., 12.5" },
      { field: "Threshold", type: "number", placeholder: "Min yield to compound %" }
    ]
  },
  "3": {
    id: 3,
    name: "Social Sentinel",
    type: "CONTENT",
    description:
      "Gemini-powered social media content auto-responder with tone customization.",
    fullDescription:
      "Social Sentinel uses Gemini AI to generate contextual replies to social media messages. Customize tone, brand voice, and response style. Get 3 reply options and pick your favorite.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCdvfCf5x6E9xZ1AIosqHI4a2tE0JdCcz9eA6a0Mg1XVmXbiUf9tvBcRRdtvhuLii5lPeODU7FR5BT6cbAZZOH8IW5iM6UcR9es5YxQdlDcFnKhHDEhkzm25txi8bCgKRgLbhTJdgJ4ptuZK6HaIddvX8vLhaAL8LvsrsMB3dGgrVmUAgyYqRN9SDUWaz-CfvrK2r8-dBCa57ZYpspB8HEKiGrXhWrUoI3-LDWeMc8dOjvKSHsWXCLg8frA1SnBPO4ihdmXdOGczmY",
    price: 1.2,
    activeCount: 12,
    isLive: false,
    config: [
      { field: "Sample Message", type: "textarea", placeholder: "Paste a sample incoming message..." },
      { field: "Tone", type: "select", placeholder: "Professional/Casual/Aggressive" },
      { field: "Brand Context", type: "textarea", placeholder: "Describe your brand..." },
      { field: "Language", type: "select", placeholder: "English/Other" }
    ]
  },
  "4": {
    id: 4,
    name: "Arb Master Z",
    type: "TRADING",
    description: "Advanced arbitrage detection and execution across DEX pools.",
    fullDescription:
      "The most advanced arbitrage detection system on HeLa. Monitors multiple DEX pools simultaneously for profitable opportunities and executes trades with minimal slippage.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBnv7KX2CUfHTtVNxA3N1yyGsjzDYkP_tVm03JkSp3rGuTJQF3OvgGDqR9hxevv8RomyvjQ6-OpASMXLDOTmas1e_LExvngr7iYa9-gZKbhMMtfxN2_QEUutB8pNwKVbqGnEG4pdiorgTct8ZPrxVV1m9RqZGcuRbQ1S9Pzs4Vnw9j5CXoVZVBXmQ5nwmxi5VxpPjwhUcoI6Il77MiHdn5XqHSFwI8z4rfxhVaUDWKbf80d-7E65rlm75sk4g5o6hL3I5FpuJ6K6X8",
    price: 4.2,
    activeCount: 56,
    isLive: true,
    config: [
      { field: "Min Profit Threshold %", type: "number", placeholder: "0.5" },
      { field: "DEX Whitelist", type: "text", placeholder: "Comma-separated DEX names" },
      { field: "Max Gas Price", type: "number", placeholder: "HLUSD" }
    ]
  },
  "5": {
    id: 5,
    name: "Schedule Master",
    type: "SCHEDULING",
    description:
      "Recurring HLUSD payments on customizable time-based triggers.",
    fullDescription:
      "Set up recurring HLUSD payments on a schedule of your choice. Perfect for subscriptions, recurring expenses, or automated payouts.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCP9WykVHXlBO4UR2yXu_3m-9IlbFZ2gQIcMEdQEFf9kGLNUq3OsUSKEd-VP82nlecVqwhbNq-gonLvflkS3USYdgiPjK3LnO14jyjCtsyoXoWhgddIoMD7l4mDOaljT05Z6K5HXw2-DtHyNQRWIr3YVhYzViY-zmT2_q0hdYaHqqVYeK02HmzB_BbVzpyU-W444Ddm1M8nXvvT5padIoGxZGyKmLtGHJA73rLAHpMHnKxe3z179wvZf3q8lJpEHjZkxmW_IL2iOFY",
    price: 0.5,
    activeCount: 234,
    isLive: true,
    config: [
      { field: "Recipient Address", type: "text", placeholder: "0x..." },
      { field: "Amount (HLUSD)", type: "number", placeholder: "100" },
      { field: "Frequency", type: "select", placeholder: "Daily/Weekly/Monthly" },
      { field: "Start Date", type: "date", placeholder: "YYYY-MM-DD" }
    ]
  },
  "6": {
    id: 6,
    name: "Portfolio Rebalancer",
    type: "REBALANCING",
    description:
      "Monitors wallet allocation drift and suggests rebalancing trades.",
    fullDescription:
      "Keep your portfolio allocation optimal. The Rebalancer monitors your tokens and alerts you when allocation drifts beyond your target percentages.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCsYXxIvzCasfwu0KjYNIBqyp1bFixdCnGRqahsrugyzKTdlpaGYJekeVsoCU80cL0ClsaNm1FUZV7OHNfe7ilj-_l2COB9BDtlqOfu0HEjItghJg8n2BazGMVB6NGd_jKE5p3iIUTBOuXIBCUcdRPsNbvuOncUKAoiw2vvz28Edhtyu7cNaMo24d13vtgrzJqATCd0DPQq1HH72HD6hjJ4vCZ6_nWMAJrgRtul6oDOhyJ9D95rrWRDMpXWM8gJgn5MwzQSljgigWY",
    price: 1.8,
    activeCount: 89,
    isLive: true,
    config: [
      { field: "Target Allocation", type: "text", placeholder: "HLUSD:60%, ETH:30%, OTHER:10%" },
      { field: "Current Allocation", type: "text", placeholder: "Optional: HLUSD:55%, ETH:35%, OTHER:10%" },
      { field: "Drift Tolerance %", type: "number", placeholder: "5" },
      { field: "Tokens to Monitor", type: "text", placeholder: "HLUSD,ETH,BTC" }
    ]
  },
  "7": {
    id: 7,
    name: "Business Assistant",
    type: "BUSINESS",
    description: "Gemini AI answers queries, drafts emails, and summarizes documents.",
    fullDescription:
      "Your AI-powered business assistant powered by Gemini. Ask questions, draft emails, summarize documents, generate reports. Perfect for busy entrepreneurs.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBnv7KX2CUfHTtVNxA3N1yyGsjzDYkP_tVm03JkSp3rGuTJQF3OvgGDqR9hxevv8RomyvjQ6-OpASMXLDOTmas1e_LExvngr7iYa9-gZKbhMMtfxN2_QEUutB8pNwKVbqGnEG4pdiorgTct8ZPrxVV1m9RqZGcuRbQ1S9Pzs4Vnw9j5CXoVZVBXmQ5nwmxi5VxpPjwhUcoI6Il77MiHdn5XqHSFwI8z4rfxhVaUDWKbf80d-7E65rlm75sk4g5o6hL3I5FpuJ6K6X8",
    price: 2.0,
    activeCount: 156,
    isLive: true,
    config: [
      { field: "Query", type: "textarea", placeholder: "Ask what support you need from the agent..." },
      { field: "Business Type", type: "text", placeholder: "e.g., SaaS, Agency, Retail" },
      { field: "Industry Context", type: "textarea", placeholder: "Describe your industry..." },
      { field: "Response Language", type: "select", placeholder: "English/Other" },
      { field: "Formality", type: "select", placeholder: "formal/informal" }
    ]
  }
};

const FIELD_SELECT_OPTIONS: Record<string, string[]> = {
  "Action Type": ["above", "below", "alert"],
  "Compound Frequency": ["daily", "weekly", "monthly"],
  Tone: ["professional", "casual", "aggressive"],
  Language: ["English", "Hindi", "Spanish"],
  Frequency: ["hourly", "daily", "weekly", "monthly"],
  "Response Language": ["English", "Hindi", "Spanish"],
  Formality: ["formal", "informal"]
};

const FAUCET_URL = "https://testnet-faucet.helachain.com/";

type AgentProfile = (typeof AGENTS)[string];
type AutomationFrequency = "hourly" | "daily" | "weekly" | "monthly";
type ExecutionPolicyDraft = {
  autoExecute: boolean;
  maxSpendPerRunHLUSD: string;
  maxDailySpendHLUSD: string;
  allowedTokens: string;
  allowedProtocols: string;
  slippageBps: string;
};

type RemoteAgent = {
  id: number;
  name: string;
  description: string;
  type: string;
  agentType: string;
  price: number;
  activeCount: number;
  isLive: boolean;
  image: string;
  configSchema: string;
};

type AgentRouteResponse = {
  agent?: RemoteAgent;
  error?: string;
};

type CreatedJobResponse = {
  job: {
    id: string;
    frequency: AutomationFrequency;
    nextRunAt: string;
    status: "active" | "paused" | "error";
  };
  agentWalletAddress: string;
  balanceHLUSD?: string | null;
  nativeBalanceHELA?: string | null;
  recommendedMinimumHLUSD?: string | null;
  gasFundingStatus?: "missing" | "low" | "ready" | "unknown";
  gasHint?: string;
  fundingStatus?: "empty" | "low" | "funded" | "unknown";
  fundingHint?: string;
};

type AutomationAgentState = {
  automationReady: boolean;
  storedAgent: {
    agentId: string;
    agentWalletAddress: string;
    status: "active" | "paused";
    deployedAt: string;
  } | null;
};

type AutomationJobView = {
  id: string;
  agentId: string;
  ownerAddress: string;
  frequency: AutomationFrequency;
  createdAt?: string;
  updatedAt?: string;
  nextRunAt: string;
  lastRunAt?: string;
  status: "active" | "paused" | "error";
  userConfig: Record<string, unknown>;
  lastResult?: string;
  lastError?: string;
  lastExecutionTxHash?: string;
  agentWalletAddress: string | null;
  balanceHLUSD?: string | null;
  nativeBalanceHELA?: string | null;
  recommendedMinimumHLUSD?: string | null;
  gasFundingStatus?: "missing" | "low" | "ready" | "unknown";
  gasHint?: string;
  fundingStatus?: "empty" | "low" | "funded" | "unknown";
  fundingHint?: string;
  executionPolicy?: {
    autoExecute?: boolean;
    maxSpendPerRunHLUSD?: number;
    maxDailySpendHLUSD?: number;
    allowedTokens?: string[];
    allowedProtocols?: string[];
    slippageBps?: number;
  };
};

type ActivationRequest = {
  endpoint: string;
  payload: Record<string, unknown>;
};

function toConfigFields(configSchema: string): AgentProfile["config"] {
  return parseConfigSchema(configSchema).map((field) => ({
    field: field.label,
    type: field.inputType,
    placeholder: field.placeholder
  }));
}

function findPresetByType(agentType: string) {
  const normalizedType = agentType.trim().toUpperCase();
  return Object.values(AGENTS).find((agent) => agent.type === normalizedType) || null;
}

function toAgentProfile(remoteAgent: RemoteAgent): AgentProfile {
  const fallbackType = (remoteAgent.type || remoteAgent.agentType || "agent").toUpperCase();
  const preset = findPresetByType(fallbackType);
  const parsedConfig = toConfigFields(remoteAgent.configSchema);

  return {
    id: remoteAgent.id,
    name: remoteAgent.name,
    type: fallbackType,
    description: remoteAgent.description,
    fullDescription: preset?.fullDescription || remoteAgent.description,
    image:
      remoteAgent.image ||
      preset?.image ||
      getAgentImage(remoteAgent.agentType || remoteAgent.type || "trading"),
    price: remoteAgent.price,
    activeCount: remoteAgent.activeCount,
    isLive: remoteAgent.isLive,
    config: parsedConfig.length > 0 ? parsedConfig : (preset?.config || [])
  };
}

function readField(formData: Record<string, string>, field: string): string {
  return (formData[field] || "").trim();
}

function parseRequiredNumber(formData: Record<string, string>, field: string): number {
  const raw = readField(formData, field);
  if (!raw) {
    throw new Error(`${field} is required.`);
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${field} must be a valid number.`);
  }
  return parsed;
}

function parseAllocationMap(raw: string): Record<string, number> {
  const result: Record<string, number> = {};
  const parts = raw
    .split(",")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  for (const part of parts) {
    const [token, value] = part.split(":").map((segment) => segment.trim());
    if (!token || !value) {
      continue;
    }
    const numericValue = Number(value.replace("%", "").trim());
    if (Number.isFinite(numericValue)) {
      result[token] = numericValue;
    }
  }

  return result;
}

function deriveCurrentAllocations(targetAllocations: Record<string, number>): Record<string, number> {
  const entries = Object.entries(targetAllocations);
  if (entries.length < 2) {
    return { ...targetAllocations };
  }

  const current = { ...targetAllocations };
  const [firstToken, firstValue] = entries[0];
  const [secondToken, secondValue] = entries[1];
  const drift = Math.min(5, secondValue);
  current[firstToken] = Number((firstValue + drift).toFixed(2));
  current[secondToken] = Number((secondValue - drift).toFixed(2));
  return current;
}

function normalizeDateToIso(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Start Date must be a valid date.");
  }
  return parsed.toISOString();
}

function getAutomationReadiness(job: AutomationJobView): {
  label: string;
  className: string;
} {
  if (job.fundingStatus === "funded" && job.gasFundingStatus === "ready") {
    return {
      label: "READY TO RUN",
      className: "text-emerald-300 border-emerald-300/50 bg-emerald-300/10"
    };
  }

  if (job.gasFundingStatus === "missing" || job.gasFundingStatus === "low") {
    return {
      label: "NEEDS GAS",
      className: "text-yellow-300 border-yellow-300/50 bg-yellow-300/10"
    };
  }

  if (job.fundingStatus === "empty" || job.fundingStatus === "low") {
    return {
      label: "NEEDS HLUSD",
      className: "text-red-300 border-red-300/50 bg-red-300/10"
    };
  }

  return {
    label: "CHECK FUNDING",
    className: "text-white/70 border-white/20 bg-white/5"
  };
}

function getAutomationPanelClass(job: AutomationJobView): string {
  if (job.fundingStatus === "funded" && job.gasFundingStatus === "ready") {
    return "border-emerald-300/30 bg-emerald-300/5";
  }

  if (job.gasFundingStatus === "missing" || job.gasFundingStatus === "low") {
    return "border-yellow-300/30 bg-yellow-300/5";
  }

  if (job.fundingStatus === "empty" || job.fundingStatus === "low") {
    return "border-red-300/30 bg-red-300/5";
  }

  return "border-white/12 bg-white/5";
}

function getJobSortTimestamp(job: AutomationJobView): number {
  const candidates = [job.updatedAt, job.lastRunAt, job.nextRunAt, job.createdAt].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const parsed = Date.parse(candidate);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
}

function selectLatestJobForAgent(
  jobs: AutomationJobView[] | undefined,
  agentId: string | number
): AutomationJobView | null {
  if (!jobs?.length) {
    return null;
  }

  return (
    jobs
      .filter((job) => String(job.agentId) === String(agentId))
      .sort((left, right) => getJobSortTimestamp(right) - getJobSortTimestamp(left))[0] || null
  );
}

function formatWalletBalance(job: AutomationJobView): string {
  if (job.recommendedMinimumHLUSD === "0") {
    return "N/A (not required)";
  }

  return `${job.balanceHLUSD || "0"} HLUSD`;
}

function supportsExecutionPolicy(agentType: string): boolean {
  return ["TRADING", "FARMING", "REBALANCING"].includes(agentType.toUpperCase());
}

function buildDefaultExecutionPolicy(agentType: string): ExecutionPolicyDraft {
  const normalized = agentType.toUpperCase();

  if (normalized === "TRADING") {
    return {
      autoExecute: true,
      maxSpendPerRunHLUSD: "2",
      maxDailySpendHLUSD: "5",
      allowedTokens: "BTC,USDC",
      allowedProtocols: "",
      slippageBps: "100"
    };
  }

  if (normalized === "FARMING") {
    return {
      autoExecute: true,
      maxSpendPerRunHLUSD: "100",
      maxDailySpendHLUSD: "300",
      allowedTokens: "HLUSD,USDC",
      allowedProtocols: "UNISWAP-V3",
      slippageBps: "100"
    };
  }

  if (normalized === "REBALANCING") {
    return {
      autoExecute: true,
      maxSpendPerRunHLUSD: "25",
      maxDailySpendHLUSD: "100",
      allowedTokens: "USDC,WETH",
      allowedProtocols: "",
      slippageBps: "150"
    };
  }

  return {
    autoExecute: true,
    maxSpendPerRunHLUSD: "",
    maxDailySpendHLUSD: "",
    allowedTokens: "",
    allowedProtocols: "",
    slippageBps: ""
  };
}

function buildExecutionPolicyPayload(policy: ExecutionPolicyDraft) {
  const toNumber = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const toList = (value: string) => {
    const items = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    return items.length ? items : undefined;
  };

  return {
    autoExecute: policy.autoExecute,
    maxSpendPerRunHLUSD: toNumber(policy.maxSpendPerRunHLUSD),
    maxDailySpendHLUSD: toNumber(policy.maxDailySpendHLUSD),
    allowedTokens: toList(policy.allowedTokens),
    allowedProtocols: toList(policy.allowedProtocols),
    slippageBps: toNumber(policy.slippageBps)
  };
}

function readFirstField(formData: Record<string, string>, keys: string[]): string {
  for (const key of keys) {
    const value = readField(formData, key);
    if (value) {
      return value;
    }
  }
  return "";
}

function parseNumberFromAliases(formData: Record<string, string>, keys: string[], fallback?: number): number {
  const raw = readFirstField(formData, keys);
  if (!raw) {
    if (typeof fallback === "number") {
      return fallback;
    }
    throw new Error(`${keys[0]} is required.`);
  }

  const parsed = Number(raw.replace("%", ""));
  if (!Number.isFinite(parsed)) {
    throw new Error(`${keys[0]} must be a valid number.`);
  }
  return parsed;
}

function buildActivationRequest(agentType: string, agentId: string, formData: Record<string, string>): ActivationRequest {
  const normalizedType = agentType.trim().toUpperCase();

  if (normalizedType === "TRADING") {
    const thresholdPrice = parseNumberFromAliases(formData, ["Price Threshold", "threshold", "thresholdPrice"], 60000);
    const amount = parseNumberFromAliases(formData, ["Amount", "amount"], 1);
    const currentPriceRaw = readFirstField(formData, ["Current Price", "currentPrice"]);
    const currentPrice = currentPriceRaw ? Number(currentPriceRaw) : thresholdPrice;

    if (!Number.isFinite(currentPrice)) {
      throw new Error("Current Price must be a valid number.");
    }

    const actionType = (readFirstField(formData, ["Action Type", "action", "direction"]) || "above").toLowerCase();
    const direction = actionType === "below" ? "below" : "above";
    const action = actionType === "alert" ? "alert" : "simulate-swap";

    return {
      endpoint: "/api/agents/trading",
      payload: {
        tokenPair: readFirstField(formData, ["Token Pair", "tokenPair"]) || "HLUSD/ETH",
        thresholdPrice,
        currentPrice,
        direction,
        action,
        amount
      }
    };
  }

  if (normalizedType === "FARMING") {
    const compoundThreshold = parseNumberFromAliases(formData, ["Threshold", "compoundThreshold", "amount"], 100);
    const currentAPYRaw = readFirstField(formData, ["Current APY", "currentAPY"]);
    const currentAPY = currentAPYRaw ? Number(currentAPYRaw) : compoundThreshold + 1;

    if (!Number.isFinite(currentAPY)) {
      throw new Error("Current APY must be a valid number.");
    }

    const lpAddress = readFirstField(formData, ["LP Token Address", "lpAddress", "poolType"]) || "hlusd-usdc";
    const riskLevel = currentAPY >= compoundThreshold + 10 ? "high" : currentAPY >= compoundThreshold ? "medium" : "low";

    return {
      endpoint: "/api/agents/farming",
      payload: {
        protocol: readFirstField(formData, ["protocol"]) || "yield-orchestrator",
        poolType: lpAddress,
        amount: compoundThreshold,
        durationDays: 30,
        riskLevel
      }
    };
  }

  if (normalizedType === "CONTENT") {
    return {
      endpoint: "/api/agents/content",
      payload: {
        message: readFirstField(formData, ["Sample Message", "message", "topic", "prompt"]) ||
          "Thanks for your message. Can we continue this conversation?",
        tone: (readFirstField(formData, ["Tone", "tone"]) || "professional").toLowerCase(),
        brandContext: readFirstField(formData, ["Brand Context", "brandContext", "persona"]) || "General brand context"
      }
    };
  }

  if (normalizedType === "SCHEDULING") {
    const amount = parseNumberFromAliases(
      formData,
      ["Amount (HLUSD)", "Amount", "amount", "stipendAmountHLUSD", "Monthly Stipend Amount (HLUSD)"],
      1
    );
    const frequencyRaw = readFirstField(formData, ["Frequency", "frequency"]).toLowerCase();
    const frequency = ["hourly", "daily", "weekly", "monthly"].includes(frequencyRaw)
      ? frequencyRaw
      : "daily";
    const startDate = readFirstField(formData, ["Start Date", "startDate"]);

    return {
      endpoint: "/api/agents/scheduling",
      payload: {
        recipient: readFirstField(
          formData,
          ["Recipient", "Recipient Address", "recipient", "recipientAddress", "Recipient Wallet Address"]
        ),
        amount,
        frequency,
        startDate: normalizeDateToIso(startDate || new Date().toISOString())
      }
    };
  }

  if (normalizedType === "REBALANCING") {
    const targetRaw = readFirstField(formData, ["Target Allocation", "targets", "targetAllocations"]);
    const targetAllocations = parseAllocationMap(targetRaw);
    if (!Object.keys(targetAllocations).length) {
      throw new Error("Target Allocation must include at least one token:value pair.");
    }

    const currentRaw = readFirstField(formData, ["Current Allocation", "currentAllocations"]);
    const currentAllocations = Object.keys(parseAllocationMap(currentRaw)).length
      ? parseAllocationMap(currentRaw)
      : deriveCurrentAllocations(targetAllocations);

    return {
      endpoint: "/api/agents/rebalancing",
      payload: {
        targetAllocations,
        currentAllocations,
        driftTolerance: parseNumberFromAliases(formData, ["Drift Tolerance %", "driftTolerance"], 5)
      }
    };
  }

  if (normalizedType === "BUSINESS") {
    const businessType = readFirstField(formData, ["Business Type", "businessContext"]) || "general";
    return {
      endpoint: "/api/agents/business",
      payload: {
        query: readFirstField(formData, ["Query", "query", "userTextInput"]) ||
          `Give three practical growth actions for a ${businessType} business.`,
        businessContext: readFirstField(formData, ["Industry Context", "businessContext"]) || businessType,
        language: readFirstField(formData, ["Response Language", "language"]) || "English",
        formality: (readFirstField(formData, ["Formality", "formality"]) || "formal").toLowerCase()
      }
    };
  }

  const genericConfig = Object.entries(formData).reduce<Record<string, string>>((acc, [field, value]) => {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      acc[field] = trimmed;
    }
    return acc;
  }, {});

  if (!Object.keys(genericConfig).length) {
    throw new Error("Please provide configuration values before activating this agent.");
  }

  return {
    endpoint: "/api/agents/execute",
    payload: {
      agentId,
      userConfig: genericConfig
    }
  };
}

function buildActivationConfig(agentType: string, payload: Record<string, unknown>): string {
  return JSON.stringify({
    agentType: agentType.trim().toLowerCase(),
    ...payload
  });
}

export default function AgentDetailPage() {
  const params = useParams();
  const agentId = params.id as string;
  const localAgent = AGENTS[agentId];

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isActivating, setIsActivating] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);
  const [activationSuccess, setActivationSuccess] = useState<string | null>(null);
  const [agentFromBackend, setAgentFromBackend] = useState<AgentProfile | null>(null);
  const [isAgentLoading, setIsAgentLoading] = useState(true);
  const [agentLoadError, setAgentLoadError] = useState<string | null>(null);
  const [automationState, setAutomationState] = useState<AutomationAgentState | null>(null);
  const [automationError, setAutomationError] = useState<string | null>(null);
  const [automationStatus, setAutomationStatus] = useState<string | null>(null);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [automationFrequency, setAutomationFrequency] = useState<AutomationFrequency>("daily");
  const [createdJob, setCreatedJob] = useState<CreatedJobResponse | null>(null);
  const [existingJob, setExistingJob] = useState<AutomationJobView | null>(null);
  const [activeJobActionId, setActiveJobActionId] = useState<string | null>(null);
  const [isFundingGas, setIsFundingGas] = useState(false);
  const [isFundingHLUSD, setIsFundingHLUSD] = useState(false);
  const [hlusdFundingAmount, setHlusdFundingAmount] = useState("5");
  const [executionPolicy, setExecutionPolicy] = useState<ExecutionPolicyDraft>(() =>
    buildDefaultExecutionPolicy(localAgent?.type || "")
  );

  useEffect(() => {
    let active = true;

    async function loadAgent() {
      setIsAgentLoading(true);
      setAgentLoadError(null);

      try {
        const [agentResponse, automationResponse] = await Promise.all([
          fetch(`/api/agents/${agentId}`, {
            method: "GET",
            cache: "no-store"
          }),
          fetch(`/api/automation/agent/${agentId}`, {
            method: "GET",
            cache: "no-store"
          }).catch(() => null)
        ]);

        const agentData = (await agentResponse.json()) as AgentRouteResponse;
        if (!agentResponse.ok || !agentData.agent) {
          throw new Error(agentData.error || "Failed to load agent details.");
        }

        let nextAutomationState: AutomationAgentState | null = null;
        if (automationResponse) {
          const automationData = (await automationResponse.json()) as AutomationAgentState;
          if (automationResponse.ok) {
            nextAutomationState = automationData;
          }
        }

        const currentAccount = await getConnectedAccount().catch(() => null);
        let nextExistingJob: AutomationJobView | null = null;
        if (currentAccount) {
          const jobsResponse = await fetch(
            `/api/automation/jobs?ownerAddress=${encodeURIComponent(currentAccount)}`,
            {
              method: "GET",
              cache: "no-store"
            }
          ).catch(() => null);

          if (jobsResponse && jobsResponse.ok) {
            const jobsPayload = (await jobsResponse.json()) as { jobs?: AutomationJobView[] };
            nextExistingJob = selectLatestJobForAgent(jobsPayload.jobs, agentId);
          }
        }

        if (active) {
          setAgentFromBackend(toAgentProfile(agentData.agent));
          setAutomationState(nextAutomationState);
          setExistingJob(nextExistingJob);
          const storedAgent = nextAutomationState?.storedAgent;
          if (storedAgent) {
            setCreatedJob((current) =>
              current || {
                job: {
                  id: nextExistingJob?.id || "",
                  frequency: nextExistingJob?.frequency || "daily",
                  nextRunAt: nextExistingJob?.nextRunAt || "",
                  status: nextExistingJob?.status || storedAgent.status || "active"
                },
                agentWalletAddress: storedAgent.agentWalletAddress,
                balanceHLUSD: nextExistingJob?.balanceHLUSD || null,
                nativeBalanceHELA: nextExistingJob?.nativeBalanceHELA || null,
                recommendedMinimumHLUSD: nextExistingJob?.recommendedMinimumHLUSD || null,
                gasFundingStatus: nextExistingJob?.gasFundingStatus || "unknown",
                gasHint: nextExistingJob?.gasHint || undefined,
                fundingStatus: nextExistingJob?.fundingStatus || "unknown",
                fundingHint: nextExistingJob?.fundingHint || undefined
              }
            );
          }
        }
      } catch (error: unknown) {
        if (active) {
          setAgentFromBackend(null);
          setAgentLoadError(error instanceof Error ? error.message : "Failed to load agent details.");
        }
      } finally {
        if (active) {
          setIsAgentLoading(false);
        }
      }
    }

    void loadAgent();
    return () => {
      active = false;
    };
  }, [agentId]);

  const agent = useMemo(() => agentFromBackend || localAgent || null, [agentFromBackend, localAgent]);
  const automationAgentType = agentFromBackend?.type || localAgent?.type || "";
  const platformFee = useMemo(() => (agent ? calculatePlatformFee(agent.price) : 0), [agent]);
  const developerPayout = useMemo(() => (agent ? calculateDeveloperPayout(agent.price) : 0), [agent]);

  useEffect(() => {
    if (automationAgentType) {
      setExecutionPolicy(buildDefaultExecutionPolicy(automationAgentType));
    }
  }, [automationAgentType]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExecutionPolicyChange = (field: keyof ExecutionPolicyDraft, value: string | boolean) => {
    setExecutionPolicy((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleActivate = async () => {
    if (!agent) {
      return;
    }

    setActivationError(null);
    setActivationSuccess(null);
    setIsActivating(true);

    try {
      const { endpoint, payload } = buildActivationRequest(agent.type, agentId, formData);
      const activationConfig = buildActivationConfig(agent.type, payload);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Activation request failed.");
      }

      await ensureHeLaNetwork();
      const account = (await getConnectedAccount()) || (await connectWallet());

      const alreadyActivated = await isAgentActivatedByUser(account, Number(agentId));
      if (alreadyActivated) {
        throw new Error("This wallet has already activated this agent.");
      }

      const price = Number(agent.price);
      if (!Number.isFinite(price) || price < 0) {
        throw new Error("Agent price is invalid.");
      }

      if (price > 0) {
        const { escrow } = getPublicContractAddresses();
        await approveHLUSD(escrow, parseUnits(String(price), 18));
      }

      const txResult = await activateAgentOnChain(Number(agentId), activationConfig);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(`agent-config-${agentId}`, JSON.stringify(formData));
      }

      setActivationSuccess(`Agent ${agent.name} activated on-chain. Tx: ${txResult.hash}`);
    } catch (error: unknown) {
      setActivationError(error instanceof Error ? error.message : "Activation failed.");
    } finally {
      setIsActivating(false);
    }
  };

  const handleCreateAutomation = async () => {
    try {
      setIsCreatingJob(true);
      setAutomationError(null);
      setAutomationStatus("Preparing automation job...");

      await ensureHeLaNetwork();
      const account = (await getConnectedAccount()) || (await connectWallet());

      const response = await fetch("/api/automation/jobs", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          agentId: String(agentId),
          ownerAddress: account,
          frequency: automationFrequency,
          nextRunAt: new Date().toISOString(),
          userConfig: formData,
          executionPolicy: supportsExecutionPolicy(agent.type)
            ? buildExecutionPolicyPayload(executionPolicy)
            : undefined
        })
      });

      const payload = (await response.json()) as CreatedJobResponse | { error: string };
      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "Failed to create automation job.");
      }

      setCreatedJob(payload);
        setExistingJob({
          ...payload.job,
          agentId: String(agentId),
          ownerAddress: account,
        userConfig: formData,
        agentWalletAddress: payload.agentWalletAddress,
        balanceHLUSD: payload.balanceHLUSD || null,
        nativeBalanceHELA: payload.nativeBalanceHELA || null,
        recommendedMinimumHLUSD: payload.recommendedMinimumHLUSD || null,
        gasFundingStatus: payload.gasFundingStatus || "unknown",
        gasHint: payload.gasHint,
        fundingStatus: payload.fundingStatus || "unknown",
        fundingHint: payload.fundingHint,
        lastResult: undefined,
        lastError: undefined,
        lastExecutionTxHash: undefined
      });
      setAutomationState((current) => ({
        automationReady: true,
        storedAgent: {
          agentId: String(agentId),
          agentWalletAddress: payload.agentWalletAddress,
          status: "active",
          deployedAt: current?.storedAgent?.deployedAt || new Date().toISOString()
        }
      }));
      setAutomationStatus(
        supportsExecutionPolicy(agent.type)
          ? "Automation job created with execution guardrails. Review funding and readiness below."
          : "Automation job created. Review funding and readiness below."
      );
    } catch (error: unknown) {
      setAutomationError(error instanceof Error ? error.message : "Failed to create automation job.");
      setAutomationStatus(null);
    } finally {
      setIsCreatingJob(false);
    }
  };

  const refreshExistingJob = async (jobId: string) => {
    const response = await fetch(`/api/automation/jobs/${jobId}`, {
      method: "GET",
      cache: "no-store"
    });

    const payload = (await response.json()) as {
      job?: AutomationJobView;
      balanceHLUSD?: string | null;
      nativeBalanceHELA?: string | null;
      recommendedMinimumHLUSD?: string | null;
      gasFundingStatus?: "missing" | "low" | "ready" | "unknown";
      gasHint?: string;
      fundingStatus?: "empty" | "low" | "funded" | "unknown";
      fundingHint?: string;
      error?: string;
    };

    if (!response.ok || !payload.job) {
      throw new Error(payload.error || "Failed to refresh automation job.");
    }

    const nextJob: AutomationJobView = {
      ...payload.job,
      agentWalletAddress:
        existingJob?.agentWalletAddress ||
        createdJob?.agentWalletAddress ||
        automationState?.storedAgent?.agentWalletAddress ||
        null,
      balanceHLUSD: payload.balanceHLUSD || null,
      nativeBalanceHELA: payload.nativeBalanceHELA || null,
      recommendedMinimumHLUSD: payload.recommendedMinimumHLUSD || null,
      gasFundingStatus: payload.gasFundingStatus || "unknown",
      gasHint: payload.gasHint,
      fundingStatus: payload.fundingStatus || "unknown",
      fundingHint: payload.fundingHint
    };

    setExistingJob(nextJob);
    setCreatedJob((current) =>
      current
        ? {
            ...current,
            job: {
              id: nextJob.id,
              frequency: nextJob.frequency,
              nextRunAt: nextJob.nextRunAt,
              status: nextJob.status
            },
            balanceHLUSD: nextJob.balanceHLUSD || null,
            nativeBalanceHELA: nextJob.nativeBalanceHELA || null,
            recommendedMinimumHLUSD: nextJob.recommendedMinimumHLUSD || null,
            gasFundingStatus: nextJob.gasFundingStatus || "unknown",
            gasHint: nextJob.gasHint,
            fundingStatus: nextJob.fundingStatus || "unknown",
            fundingHint: nextJob.fundingHint
          }
        : current
    );
  };

  const handleJobAction = async (action: "pause" | "resume" | "run_now") => {
    const jobId = existingJob?.id || createdJob?.job.id;
    if (!jobId) {
      setAutomationError("Create automation first before using job controls.");
      return;
    }

    try {
      setActiveJobActionId(`${jobId}:${action}`);
      setAutomationError(null);
      setAutomationStatus(
        action === "run_now" ? "Running automation job..." : action === "pause" ? "Pausing automation job..." : "Resuming automation job..."
      );

      const response = await fetch(`/api/automation/jobs/${jobId}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ action })
      });

      const payload = (await response.json()) as {
        job?: AutomationJobView;
        balanceHLUSD?: string | null;
        nativeBalanceHELA?: string | null;
        recommendedMinimumHLUSD?: string | null;
        gasFundingStatus?: "missing" | "low" | "ready" | "unknown";
        gasHint?: string;
        fundingStatus?: "empty" | "low" | "funded" | "unknown";
        fundingHint?: string;
        error?: string;
      };

      if (!response.ok || !payload.job) {
        throw new Error(payload.error || "Failed to update automation job.");
      }

      const nextJob: AutomationJobView = {
        ...payload.job,
        agentWalletAddress:
          existingJob?.agentWalletAddress ||
          createdJob?.agentWalletAddress ||
          automationState?.storedAgent?.agentWalletAddress ||
          null,
        balanceHLUSD: payload.balanceHLUSD || null,
        nativeBalanceHELA: payload.nativeBalanceHELA || null,
        recommendedMinimumHLUSD: payload.recommendedMinimumHLUSD || null,
        gasFundingStatus: payload.gasFundingStatus || "unknown",
        gasHint: payload.gasHint,
        fundingStatus: payload.fundingStatus || "unknown",
        fundingHint: payload.fundingHint
      };

      setExistingJob(nextJob);
      setCreatedJob((current) =>
        current
          ? {
              ...current,
              job: {
                id: nextJob.id,
                frequency: nextJob.frequency,
                nextRunAt: nextJob.nextRunAt,
                status: nextJob.status
              },
              balanceHLUSD: nextJob.balanceHLUSD || null,
              nativeBalanceHELA: nextJob.nativeBalanceHELA || null,
              recommendedMinimumHLUSD: nextJob.recommendedMinimumHLUSD || null,
              gasFundingStatus: nextJob.gasFundingStatus || "unknown",
              gasHint: nextJob.gasHint,
              fundingStatus: nextJob.fundingStatus || "unknown",
              fundingHint: nextJob.fundingHint
            }
          : current
      );
      setAutomationStatus(
        action === "run_now"
          ? "Automation job executed. Check the updated status below."
          : action === "pause"
            ? "Automation job paused."
            : "Automation job resumed."
      );
    } catch (error: unknown) {
      setAutomationError(error instanceof Error ? error.message : "Failed to update automation job.");
      setAutomationStatus(null);
    } finally {
      setActiveJobActionId(null);
    }
  };

  const handleCopyWalletAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setAutomationStatus("Agent wallet address copied. Open the faucet and paste it there to fund the agent.");
    } catch {
      setAutomationError("Failed to copy wallet address.");
    }
  };

  const handleFundGas = async () => {
    const jobId = existingJob?.id || createdJob?.job.id;
    if (!jobId) {
      setAutomationError("Create automation first before funding gas.");
      return;
    }

    try {
      setIsFundingGas(true);
      setAutomationError(null);
      setAutomationStatus("Funding agent gas wallet...");

      const response = await fetch(`/api/automation/jobs/${jobId}/fund-gas`, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ amount: "0.02" })
      });

      const payload = (await response.json()) as {
        nativeBalanceHELA?: string | null;
        balanceHLUSD?: string | null;
        recommendedMinimumHLUSD?: string | null;
        gasFundingStatus?: "missing" | "low" | "ready" | "unknown";
        gasHint?: string;
        fundingStatus?: "empty" | "low" | "funded" | "unknown";
        fundingHint?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Failed to fund agent gas wallet.");
      }

      await refreshExistingJob(jobId);
      setAutomationStatus(
        `Agent gas wallet funded${payload.nativeBalanceHELA ? ` (${payload.nativeBalanceHELA} HELA available).` : "."}`
      );
    } catch (error: unknown) {
      setAutomationError(error instanceof Error ? error.message : "Failed to fund agent gas wallet.");
      setAutomationStatus(null);
    } finally {
      setIsFundingGas(false);
    }
  };

  const handleFundHLUSD = async () => {
    if (!displayWalletAddress) {
      setAutomationError("Create automation first before funding HLUSD.");
      return;
    }

    try {
      setIsFundingHLUSD(true);
      setAutomationError(null);
      setAutomationStatus(`Sending ${hlusdFundingAmount} HLUSD to the agent wallet...`);

      await ensureHeLaNetwork();
      await connectWallet();
      await transferHLUSD(displayWalletAddress, hlusdFundingAmount);

      const jobId = existingJob?.id || createdJob?.job.id;
      if (jobId) {
        await refreshExistingJob(jobId);
      }

      setAutomationStatus(`Sent ${hlusdFundingAmount} HLUSD to the agent wallet.`);
    } catch (error: unknown) {
      setAutomationError(error instanceof Error ? error.message : "Failed to fund the agent wallet with HLUSD.");
      setAutomationStatus(null);
    } finally {
      setIsFundingHLUSD(false);
    }
  };

  if (!agent && isAgentLoading) {
    return (
      <main className="min-h-screen bg-black">
        <TopNavBar />
        <div className="flex min-h-screen items-center justify-center pt-24">
          <div className="text-center">
            <h1 className="mb-4 font-headline text-4xl text-white">LOADING AGENT</h1>
            <p className="font-mono text-xs uppercase text-white/60">Fetching live agent details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!agent) {
    return (
      <main className="min-h-screen bg-black">
        <TopNavBar />
        <div className="flex min-h-screen items-center justify-center pt-24">
          <div className="text-center">
            <h1 className="mb-4 font-headline text-4xl text-white">AGENT NOT FOUND</h1>
            {agentLoadError && (
              <p className="mb-4 font-mono text-xs uppercase text-red-300">{agentLoadError}</p>
            )}
            <Link href="/marketplace" className="text-white transition-colors hover:text-white/60">
              Back to Marketplace
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const canCreateAutomation = Boolean(automationState?.automationReady);
  const displayWalletAddress =
    createdJob?.agentWalletAddress || automationState?.storedAgent?.agentWalletAddress || null;
  const activeJob = existingJob || (createdJob
    ? {
        id: createdJob.job.id,
        agentId: String(agentId),
        ownerAddress: "",
        frequency: createdJob.job.frequency,
        nextRunAt: createdJob.job.nextRunAt,
        status: createdJob.job.status as "active" | "paused" | "error",
        createdAt: "",
        updatedAt: "",
        userConfig: formData,
        agentWalletAddress: createdJob.agentWalletAddress,
        balanceHLUSD: createdJob.balanceHLUSD || null,
        nativeBalanceHELA: createdJob.nativeBalanceHELA || null,
        recommendedMinimumHLUSD: createdJob.recommendedMinimumHLUSD || null,
        gasFundingStatus: createdJob.gasFundingStatus || "unknown",
        gasHint: createdJob.gasHint,
        fundingStatus: createdJob.fundingStatus || "unknown",
        fundingHint: createdJob.fundingHint
      }
    : null);

  return (
    <main className="min-h-screen bg-black">
      <TopNavBar />

      <div className="mx-auto mt-24 grid max-w-7xl grid-cols-1 gap-8 p-8 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="relative h-96 w-full overflow-hidden border border-white/12 bg-surface-container-lowest">
            <Image src={agent.image} alt={agent.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 33vw" />
          </div>

          <div className="flex flex-col gap-4 border border-white/12 p-6">
            <div>
              <p className="font-mono text-xs uppercase text-white/60">Active Users</p>
              <p className="font-headline text-4xl text-white">{agent.activeCount}</p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase text-white/60">Activation Price</p>
              <p className="font-headline text-4xl text-white">{agent.price} HLUSD</p>
              <p className="mt-2 font-mono text-[10px] uppercase text-white/40">
                {PLATFORM_FEE_PERCENT}% platform fee included
              </p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase text-white/60">Status</p>
              <div className={`mt-2 flex items-center gap-2 ${agent.isLive ? "text-live-signal" : "text-white/20"}`}>
                <span className={`h-3 w-3 rounded-full ${agent.isLive ? "bg-live-signal" : "bg-white/20"}`}></span>
                <span className="font-mono text-sm uppercase">{agent.isLive ? "LIVE" : "IDLE"}</span>
              </div>
            </div>
            <div>
              <p className="font-mono text-xs uppercase text-white/60">Developer Receives</p>
              <p className="font-headline text-2xl text-white">{developerPayout} HLUSD</p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase text-white/60">Trovia Receives</p>
              <p className="font-headline text-2xl text-white">{platformFee} HLUSD</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <div>
            <h1 className="mb-4 font-headline text-6xl uppercase text-white">{agent.name}</h1>
            <p className="text-sm uppercase leading-relaxed text-white/60">{agent.fullDescription}</p>
            {agentLoadError && (
              <div className="mt-4 border border-yellow-500/60 bg-yellow-500/10 p-3">
                <p className="font-mono text-xs uppercase text-yellow-100">
                  Using fallback details: {agentLoadError}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6 border border-white/12 p-6">
            <h2 className="font-headline text-2xl uppercase text-white">Configuration</h2>

            <div className="border border-white/12 bg-white/[0.03] p-4">
              <p className="font-mono text-xs uppercase text-white/60">Activation Pricing</p>
              <p className="mt-2 font-headline text-3xl text-white">{agent.price} HLUSD total</p>
              <p className="mt-3 font-mono text-[11px] uppercase leading-relaxed text-white/50">
                {PLATFORM_FEE_PERCENT}% platform fee included. Developer receives {developerPayout} HLUSD and
                Trovia receives {platformFee} HLUSD per activation.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {agent.config.map((configItem, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <label className="font-mono text-xs uppercase text-white/60">{configItem.field}</label>
                  {configItem.type === "textarea" ? (
                    <textarea
                      placeholder={configItem.placeholder}
                      value={formData[configItem.field] || ""}
                      onChange={(event) => handleInputChange(configItem.field, event.target.value)}
                      className="border border-white/20 bg-surface-container p-3 font-mono text-sm text-white placeholder-white/30 transition-colors focus:border-white focus:outline-none"
                      rows={3}
                    />
                  ) : configItem.type === "select" ? (
                    <select
                      value={formData[configItem.field] || ""}
                      onChange={(event) => handleInputChange(configItem.field, event.target.value)}
                      className="border border-white/20 bg-surface-container p-3 font-mono text-sm text-white placeholder-white/30 transition-colors focus:border-white focus:outline-none"
                    >
                      <option value="">{configItem.placeholder}</option>
                      {(FIELD_SELECT_OPTIONS[configItem.field] || ["option1", "option2"]).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={configItem.type}
                      placeholder={configItem.placeholder}
                      value={formData[configItem.field] || ""}
                      onChange={(event) => handleInputChange(configItem.field, event.target.value)}
                      className="border border-white/20 bg-surface-container p-3 font-mono text-sm text-white placeholder-white/30 transition-colors focus:border-white focus:outline-none"
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleActivate}
              disabled={isActivating}
              className="w-full border border-white bg-white py-4 font-headline text-xl uppercase text-black transition-colors hover:bg-black hover:text-white disabled:opacity-50"
            >
              {isActivating ? "ACTIVATING..." : "[ ACTIVATE ↗ ]"}
            </button>

            {activationError && (
              <div className="border border-red-500/60 bg-red-500/10 p-3">
                <p className="font-mono text-xs uppercase text-red-200">{activationError}</p>
              </div>
            )}

            {activationSuccess && (
              <div className="border border-green-500/60 bg-green-500/10 p-3">
                <p className="font-mono text-xs uppercase text-green-200">{activationSuccess}</p>
              </div>
            )}

            {["CONTENT", "BUSINESS", "TRADING", "FARMING", "REBALANCING", "SCHEDULING"].includes(agent.type) && (
              <Link
                href={`/agent/${agentId}/run`}
                className="w-full border border-white py-4 text-center font-headline text-xl uppercase text-white transition-colors hover:bg-white hover:text-black"
              >
                [ OPEN INTERACTION ↗ ]
              </Link>
            )}

            <div className="border border-white/12 p-4">
              <h3 className="font-headline text-xl uppercase text-white">Automation</h3>
              <p className="mt-2 font-mono text-xs uppercase text-white/60">
                Create a recurring job for this agent. Scheduling agents need HLUSD funded into the agent wallet. Trading, farming, and rebalancing jobs can also be limited with execution guardrails.
              </p>

              <div className="mt-4 flex flex-col gap-3">
                <label className="font-mono text-xs uppercase text-white/60">Run Frequency</label>
                <select
                  value={automationFrequency}
                  onChange={(event) => setAutomationFrequency(event.target.value as AutomationFrequency)}
                  className="border border-white/20 bg-surface-container p-3 font-mono text-sm text-white focus:border-white focus:outline-none"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {supportsExecutionPolicy(agent.type) && (
                <div className="mt-4 border border-white/12 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-mono text-xs uppercase text-white/60">Execution Guardrails</p>
                      <p className="mt-1 font-mono text-[11px] uppercase text-white/40">
                        Limit auto-actions to approved tokens, protocols, and spend caps.
                      </p>
                    </div>
                    <label className="flex items-center gap-2 font-mono text-xs uppercase text-white/70">
                      <input
                        type="checkbox"
                        checked={executionPolicy.autoExecute}
                        onChange={(event) => handleExecutionPolicyChange("autoExecute", event.target.checked)}
                        className="h-4 w-4 accent-white"
                      />
                      Auto Execute
                    </label>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-xs uppercase text-white/60">Max Spend / Run (HLUSD)</label>
                      <input
                        type="number"
                        value={executionPolicy.maxSpendPerRunHLUSD}
                        onChange={(event) => handleExecutionPolicyChange("maxSpendPerRunHLUSD", event.target.value)}
                        className="border border-white/20 bg-surface-container p-3 font-mono text-sm text-white focus:border-white focus:outline-none"
                        placeholder="e.g. 2"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-xs uppercase text-white/60">Max Daily Spend (HLUSD)</label>
                      <input
                        type="number"
                        value={executionPolicy.maxDailySpendHLUSD}
                        onChange={(event) => handleExecutionPolicyChange("maxDailySpendHLUSD", event.target.value)}
                        className="border border-white/20 bg-surface-container p-3 font-mono text-sm text-white focus:border-white focus:outline-none"
                        placeholder="e.g. 5"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-xs uppercase text-white/60">Allowed Tokens</label>
                      <input
                        type="text"
                        value={executionPolicy.allowedTokens}
                        onChange={(event) => handleExecutionPolicyChange("allowedTokens", event.target.value)}
                        className="border border-white/20 bg-surface-container p-3 font-mono text-sm text-white focus:border-white focus:outline-none"
                        placeholder="BTC,USDC"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-mono text-xs uppercase text-white/60">Allowed Protocols</label>
                      <input
                        type="text"
                        value={executionPolicy.allowedProtocols}
                        onChange={(event) => handleExecutionPolicyChange("allowedProtocols", event.target.value)}
                        className="border border-white/20 bg-surface-container p-3 font-mono text-sm text-white focus:border-white focus:outline-none"
                        placeholder="UNISWAP-V3"
                      />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="font-mono text-xs uppercase text-white/60">Slippage Cap (BPS)</label>
                      <input
                        type="number"
                        value={executionPolicy.slippageBps}
                        onChange={(event) => handleExecutionPolicyChange("slippageBps", event.target.value)}
                        className="border border-white/20 bg-surface-container p-3 font-mono text-sm text-white focus:border-white focus:outline-none"
                        placeholder="e.g. 100"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleCreateAutomation}
                disabled={!canCreateAutomation || isCreatingJob}
                className="mt-4 w-full border border-white bg-white py-4 font-headline text-xl uppercase text-black transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCreatingJob ? "CREATING..." : "[ CREATE AUTOMATION ↗ ]"}
              </button>

              {automationError && (
                <div className="mt-4 border border-red-500/60 bg-red-500/10 p-3">
                  <p className="font-mono text-xs uppercase text-red-200">{automationError}</p>
                </div>
              )}

              {automationStatus && (
                <div className="mt-4 border border-white/12 bg-white/5 p-3">
                  <p className="font-mono text-xs uppercase text-white/80">{automationStatus}</p>
                </div>
              )}

              {displayWalletAddress && (
                <div
                  className={`mt-4 border p-4 ${
                    activeJob ? getAutomationPanelClass(activeJob) : "border-white/12 bg-white/5"
                  }`}
                >
                  <p className="font-mono text-xs uppercase text-white/60">Agent Wallet Address</p>
                  <p className="mt-2 break-all font-mono text-xs text-white">{displayWalletAddress}</p>
                  {activeJob && (
                    <div className="mt-4 border border-white/12 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-mono text-xs uppercase text-white/60">Funding Status</p>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`font-mono text-xs uppercase ${
                              activeJob.fundingStatus === "funded"
                                ? "text-emerald-300"
                                : activeJob.fundingStatus === "low"
                                  ? "text-yellow-300"
                                  : activeJob.fundingStatus === "empty"
                                    ? "text-red-300"
                                    : "text-white/50"
                            }`}
                          >
                            {activeJob.fundingStatus || "unknown"}
                          </span>
                          <span
                            className={`border px-3 py-1 font-mono text-[10px] uppercase ${getAutomationReadiness(activeJob).className}`}
                          >
                            {getAutomationReadiness(activeJob).label}
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 font-mono text-xs text-white/80">
                        {activeJob.fundingHint || "Funding status unavailable."}
                      </p>
                      {displayWalletAddress &&
                        (activeJob.fundingStatus === "empty" || activeJob.fundingStatus === "low") &&
                        activeJob.recommendedMinimumHLUSD &&
                        activeJob.recommendedMinimumHLUSD !== "0" && (
                          <p className="mt-2 break-all font-mono text-xs text-red-200">
                            This job needs HLUSD in agent wallet {displayWalletAddress}. Gas funding alone is not enough.
                          </p>
                        )}
                      {activeJob.recommendedMinimumHLUSD !== null && activeJob.recommendedMinimumHLUSD !== undefined && (
                        <p className="mt-2 font-mono text-xs text-white/50">
                          Recommended minimum: {activeJob.recommendedMinimumHLUSD} HLUSD
                        </p>
                      )}
                      <p className="mt-2 font-mono text-xs text-white/50">
                        Current balance: {formatWalletBalance(activeJob)}
                      </p>
                      {activeJob.nativeBalanceHELA && (
                        <p className="mt-2 font-mono text-xs text-white/50">
                          Native gas balance: {activeJob.nativeBalanceHELA}
                        </p>
                      )}
                      {activeJob.gasFundingStatus && (
                        <p className="mt-2 font-mono text-xs text-white/50">
                          Gas status: {activeJob.gasFundingStatus} {activeJob.gasHint ? `| ${activeJob.gasHint}` : ""}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="mt-4 flex flex-col gap-3">
                    <div className="flex flex-col gap-3 md:flex-row">
                      <button
                        onClick={() => handleCopyWalletAddress(displayWalletAddress)}
                        className="border border-white px-4 py-3 font-headline text-sm uppercase text-white transition-colors hover:bg-white hover:text-black"
                      >
                        [ COPY WALLET ADDRESS ]
                      </button>
                      <a
                        href={FAUCET_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="border border-white bg-white px-4 py-3 text-center font-headline text-sm uppercase text-black transition-colors hover:bg-black hover:text-white"
                      >
                        [ OPEN GAS FAUCET ↗ ]
                      </a>
                      <button
                        onClick={handleFundGas}
                        disabled={isFundingGas}
                        className="border border-white px-4 py-3 font-headline text-sm uppercase text-white transition-colors hover:bg-white hover:text-black disabled:opacity-50"
                      >
                        {isFundingGas ? "[ FUNDING GAS... ]" : "[ FUND GAS 0.02 HELA ↗ ]"}
                      </button>
                    </div>

                    <div className="border border-white/12 p-3">
                      <p className="font-mono text-[11px] uppercase text-white/50">Fund HLUSD From Connected Wallet</p>
                      <div className="mt-3 flex flex-col gap-3 md:flex-row">
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={hlusdFundingAmount}
                          onChange={(event) => setHlusdFundingAmount(event.target.value)}
                          className="border border-white/20 bg-surface-container p-3 font-mono text-sm text-white focus:border-white focus:outline-none md:w-32"
                          placeholder="HLUSD"
                        />
                        <button
                          onClick={handleFundHLUSD}
                          disabled={isFundingHLUSD}
                          className="border border-white bg-white px-4 py-3 font-headline text-sm uppercase text-black transition-colors hover:bg-black hover:text-white disabled:opacity-50"
                        >
                          {isFundingHLUSD ? "[ SENDING HLUSD... ]" : "[ SEND HLUSD ↗ ]"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeJob?.id && (
                <div className="mt-4 flex flex-col gap-3 md:flex-row">
                  <button
                    onClick={() => handleJobAction("run_now")}
                    disabled={activeJobActionId === `${activeJob.id}:run_now`}
                    className="border border-white bg-white px-4 py-3 font-headline text-sm uppercase text-black transition-colors hover:bg-black hover:text-white disabled:opacity-50"
                  >
                    {activeJobActionId === `${activeJob.id}:run_now` ? "[ RUNNING... ]" : "[ RUN NOW ↗ ]"}
                  </button>

                  {activeJob.status === "paused" ? (
                    <button
                      onClick={() => handleJobAction("resume")}
                      disabled={activeJobActionId === `${activeJob.id}:resume`}
                      className="border border-white px-4 py-3 font-headline text-sm uppercase text-white transition-colors hover:bg-white hover:text-black disabled:opacity-50"
                    >
                      {activeJobActionId === `${activeJob.id}:resume` ? "[ RESUMING... ]" : "[ RESUME ↗ ]"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJobAction("pause")}
                      disabled={activeJobActionId === `${activeJob.id}:pause`}
                      className="border border-white px-4 py-3 font-headline text-sm uppercase text-white transition-colors hover:bg-white hover:text-black disabled:opacity-50"
                    >
                      {activeJobActionId === `${activeJob.id}:pause` ? "[ PAUSING... ]" : "[ PAUSE ↗ ]"}
                    </button>
                  )}

                  {activeJob.id && (
                    <button
                      onClick={() => refreshExistingJob(activeJob.id)}
                      className="border border-white px-4 py-3 font-headline text-sm uppercase text-white transition-colors hover:bg-white hover:text-black"
                    >
                      [ REFRESH STATUS ↗ ]
                    </button>
                  )}
                </div>
              )}
            </div>

            <Link
              href="/marketplace"
              className="w-full border border-white py-4 text-center font-headline text-xl uppercase text-white transition-colors hover:bg-white hover:text-black"
            >
              [ BACK ↗ ]
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
