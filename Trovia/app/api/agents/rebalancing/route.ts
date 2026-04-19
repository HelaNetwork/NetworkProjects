import { randomUUID } from "node:crypto";
import { isAddress } from "ethers";
import { NextResponse } from "next/server";
import { scheduleAgent } from "@/lib/cronManager";
import { callGemini } from "@/lib/gemini";
import { calculatePortfolioAllocations } from "@/lib/walletMonitor";

type AllocationMap = Record<string, number>;
type MonitorFrequency = "minutely" | "hourly" | "daily" | "weekly" | "monthly";

type TokenConfig = {
  symbol: string;
  address: string;
  coingeckoId?: string;
};

type RebalancingConfig = {
  walletAddress: string;
  targetAllocations: AllocationMap;
  driftThreshold: number;
  tokens: TokenConfig[];
  fallbackCurrentAllocations: AllocationMap;
  enableMonitoring: boolean;
  monitorFrequency: MonitorFrequency;
};

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

type DriftEntry = {
  token: string;
  current: number;
  target: number;
  deviation: number;
  action: "buy" | "sell" | "hold";
  adjustmentPercent: number;
};

type RebalancingResponse = {
  needsRebalance: boolean;
  currentAllocations: AllocationMap;
  targetAllocations: AllocationMap;
  driftReport: DriftEntry[];
  requiredTrades: string[];
  recommendation: string;
  checkedAt: string;
  monitorJobId: string | null;
};

type RebalancingState = {
  checks: number;
  lastNeedsRebalance: boolean;
  lastCheckedAt: string;
};

const rebalancingState = new Map<string, RebalancingState>();

const DEFAULT_TOKEN_METADATA: Record<string, { address: string; coingeckoId: string }> = {
  USDC: {
    address: "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    coingeckoId: "usd-coin"
  },
  USDT: {
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    coingeckoId: "tether"
  },
  DAI: {
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    coingeckoId: "dai"
  },
  WBTC: {
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    coingeckoId: "bitcoin"
  },
  WETH: {
    address: "0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2",
    coingeckoId: "ethereum"
  }
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseMonitorFrequency(raw: unknown): MonitorFrequency {
  const normalized = asString(raw)?.toLowerCase();
  if (
    normalized === "minutely" ||
    normalized === "hourly" ||
    normalized === "daily" ||
    normalized === "weekly" ||
    normalized === "monthly"
  ) {
    return normalized;
  }
  return "hourly";
}

function parseAllocationMap(value: unknown, fieldName: string, allowEmpty = false): AllocationMap {
  if (!isRecord(value)) {
    if (allowEmpty) {
      return {};
    }
    throw { statusCode: 400, message: `${fieldName} must be a non-empty object of numeric values.` };
  }

  const entries = Object.entries(value)
    .map(([symbol, rawWeight]) => {
      const weight = asFiniteNumber(rawWeight);
      if (weight === null || weight < 0) {
        throw { statusCode: 400, message: `${fieldName}.${symbol} must be a non-negative number.` };
      }
      return [symbol.toUpperCase(), weight] as const;
    })
    .filter(([, weight]) => weight >= 0);

  if (!allowEmpty && entries.length === 0) {
    throw { statusCode: 400, message: `${fieldName} must be a non-empty object of numeric values.` };
  }

  return Object.fromEntries(entries);
}

function parseTokenList(value: unknown, target: AllocationMap): TokenConfig[] {
  const fromBody: TokenConfig[] = [];

  if (Array.isArray(value)) {
    for (const entry of value) {
      if (!isRecord(entry)) {
        continue;
      }
      const symbol = asString(entry.symbol)?.toUpperCase();
      const address = asString(entry.address);
      if (!symbol || !address || !isAddress(address)) {
        continue;
      }
      fromBody.push({
        symbol,
        address,
        coingeckoId: asString(entry.coingeckoId)?.toLowerCase() || undefined
      });
    }
  }

  if (fromBody.length > 0) {
    return fromBody;
  }

  return Object.keys(target)
    .map((symbol) => symbol.toUpperCase())
    .map((symbol): TokenConfig => ({
      symbol,
      address: DEFAULT_TOKEN_METADATA[symbol]?.address,
      coingeckoId: DEFAULT_TOKEN_METADATA[symbol]?.coingeckoId
    }))
    .filter((entry) => typeof entry.address === "string");
}

function parseBody(body: unknown): RebalancingConfig {
  if (!isRecord(body)) {
    throw { statusCode: 400, message: "Request body must be a JSON object." };
  }

  const source = isRecord(body.config) ? body.config : body;

  const targetAllocations = parseAllocationMap(source.targetAllocations, "config.targetAllocations");
  const fallbackCurrentAllocations = parseAllocationMap(
    source.currentAllocations,
    "config.currentAllocations",
    true
  );

  const driftThreshold = asFiniteNumber(source.driftThreshold ?? source.driftTolerance);
  if (driftThreshold === null || driftThreshold < 0) {
    throw { statusCode: 400, message: "config.driftThreshold must be a non-negative number." };
  }

  const rawWalletAddress = asString(source.walletAddress ?? source.userAddress ?? source.address);
  if (rawWalletAddress && !isAddress(rawWalletAddress)) {
    throw { statusCode: 400, message: "config.walletAddress must be a valid wallet address." };
  }

  return {
    walletAddress: rawWalletAddress || "",
    targetAllocations,
    driftThreshold,
    tokens: parseTokenList(source.tokens, targetAllocations),
    fallbackCurrentAllocations,
    enableMonitoring: source.enableMonitoring === true,
    monitorFrequency: parseMonitorFrequency(source.monitorFrequency)
  };
}

function hasLiveWalletAddress(walletAddress: string): boolean {
  return isAddress(walletAddress) && walletAddress.toLowerCase() !== ZERO_ADDRESS;
}

async function resolveCurrentAllocations(config: RebalancingConfig): Promise<AllocationMap> {
  if (hasLiveWalletAddress(config.walletAddress) && config.tokens.length > 0) {
    const calculated = await calculatePortfolioAllocations(config.walletAddress, config.tokens);
    const normalized: AllocationMap = {};
    for (const token of config.tokens) {
      normalized[token.symbol.toUpperCase()] = Number((calculated.allocations[token.symbol.toUpperCase()] ?? 0).toFixed(4));
    }
    return normalized;
  }

  if (Object.keys(config.fallbackCurrentAllocations).length > 0) {
    return config.fallbackCurrentAllocations;
  }

  throw {
    statusCode: 400,
    message: "Provide config.currentAllocations, or include a valid walletAddress and token list for live allocation checks."
  };
}

function buildDriftAnalysis(currentAllocations: AllocationMap, targetAllocations: AllocationMap, driftThreshold: number): {
  needsRebalance: boolean;
  driftReport: DriftEntry[];
  requiredTrades: string[];
} {
  const symbols = Array.from(new Set([...Object.keys(currentAllocations), ...Object.keys(targetAllocations)])).sort();

  const driftReport: DriftEntry[] = [];
  const requiredTrades: string[] = [];
  let needsRebalance = false;

  for (const symbol of symbols) {
    const current = Number((currentAllocations[symbol] ?? 0).toFixed(4));
    const target = Number((targetAllocations[symbol] ?? 0).toFixed(4));
    const deviation = Number((current - target).toFixed(4));
    const adjustmentPercent = Number(Math.abs(deviation).toFixed(4));

    let action: DriftEntry["action"] = "hold";
    if (adjustmentPercent > driftThreshold) {
      action = deviation > 0 ? "sell" : "buy";
      needsRebalance = true;
      requiredTrades.push(`${action.toUpperCase()} ${adjustmentPercent}% ${symbol}`);
    }

    driftReport.push({
      token: symbol,
      current,
      target,
      deviation,
      action,
      adjustmentPercent
    });
  }

  return { needsRebalance, driftReport, requiredTrades };
}

async function buildRecommendation(
  currentAllocations: AllocationMap,
  targetAllocations: AllocationMap,
  driftThreshold: number,
  requiredTrades: string[]
): Promise<string> {
  const prompt = [
    "Portfolio rebalancing needed:",
    `Current: ${JSON.stringify(currentAllocations)}`,
    `Target: ${JSON.stringify(targetAllocations)}`,
    `Drift threshold: ${driftThreshold}%`,
    `Required trades: ${requiredTrades.length > 0 ? requiredTrades.join(", ") : "No trades required"}`,
    "",
    "Provide:",
    "1. Why rebalance now",
    "2. Priority order of trades",
    "3. Risk considerations",
    "4. Suggested execution strategy"
  ].join("\n");

  return callGemini(prompt);
}

function stateKey(config: RebalancingConfig): string {
  const walletPart = config.walletAddress ? config.walletAddress.toLowerCase() : "manual";
  return `${walletPart}:${Object.keys(config.targetAllocations).sort().join("-")}`;
}

function updateState(config: RebalancingConfig, needsRebalance: boolean): void {
  const key = stateKey(config);
  const current = rebalancingState.get(key);
  rebalancingState.set(key, {
    checks: current ? current.checks + 1 : 1,
    lastNeedsRebalance: needsRebalance,
    lastCheckedAt: new Date().toISOString()
  });
}

function startMonitor(config: RebalancingConfig): string | null {
  if (!config.enableMonitoring || !hasLiveWalletAddress(config.walletAddress) || config.tokens.length === 0) {
    return null;
  }

  const monitorJobId = `rebalancing-${randomUUID()}`;

  scheduleAgent(
    monitorJobId,
    "rebalancing",
    config.walletAddress,
    {
      targetAllocations: config.targetAllocations,
      driftThreshold: config.driftThreshold,
      tokens: config.tokens
    },
    config.monitorFrequency,
    async (runtimeConfig) => {
      const target = parseAllocationMap(runtimeConfig.targetAllocations, "runtime.targetAllocations");
      const threshold = asFiniteNumber(runtimeConfig.driftThreshold) ?? config.driftThreshold;
      const tokens = parseTokenList(runtimeConfig.tokens, target);
      const live = await calculatePortfolioAllocations(config.walletAddress, tokens);
      const current: AllocationMap = {};
      for (const token of tokens) {
        current[token.symbol.toUpperCase()] = Number((live.allocations[token.symbol.toUpperCase()] ?? 0).toFixed(4));
      }
      const analysis = buildDriftAnalysis(current, target, threshold);
      const result = analysis.needsRebalance
        ? `Rebalance needed: ${analysis.requiredTrades.join(" | ")}`
        : "Portfolio within drift threshold.";
      console.log(`[REBALANCING] [MONITOR] ${result}`);
      return { result };
    }
  );

  return monitorJobId;
}

export async function POST(req: Request) {
  console.log("[REBALANCING] Received request");

  try {
    const body = await req.json();
    const config = parseBody(body);

    console.log("[REBALANCING] Calculating current allocations");
    const currentAllocations = await resolveCurrentAllocations(config);
    const analysis = buildDriftAnalysis(currentAllocations, config.targetAllocations, config.driftThreshold);

    console.log("[REBALANCING] Requesting Gemini execution strategy");
    const recommendation = await buildRecommendation(
      currentAllocations,
      config.targetAllocations,
      config.driftThreshold,
      analysis.requiredTrades
    );

    updateState(config, analysis.needsRebalance);
    const monitorJobId = startMonitor(config);

    const response: RebalancingResponse = {
      needsRebalance: analysis.needsRebalance,
      currentAllocations,
      targetAllocations: config.targetAllocations,
      driftReport: analysis.driftReport,
      requiredTrades: analysis.requiredTrades,
      recommendation,
      checkedAt: new Date().toISOString(),
      monitorJobId
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Malformed JSON body." }, { status: 400 });
    }

    const mapped = error as { statusCode?: number; message?: string };
    const statusCode = mapped.statusCode && mapped.statusCode >= 400 ? mapped.statusCode : 500;
    const message = mapped.message || "Rebalancing agent execution failed.";
    console.error(`[REBALANCING] Error: ${message}`);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
