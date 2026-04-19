import { randomUUID } from "node:crypto";
import { isAddress } from "ethers";
import { NextResponse } from "next/server";
import { scheduleAgent } from "@/lib/cronManager";
import { callGemini } from "@/lib/gemini";
import { getTokenPrice } from "@/lib/priceService";

type Direction = "above" | "below";
type ExecutionAction = "alert" | "simulate-swap";
type MonitorFrequency = "minutely" | "hourly" | "daily" | "weekly" | "monthly";

type TradingConfig = {
  tokenPair: string;
  thresholdPrice: number;
  direction: Direction;
  action: ExecutionAction;
  amount: number;
  userAddress: string;
  enableMonitoring: boolean;
  monitorFrequency: MonitorFrequency;
  currentPriceFallback: number | null;
};

type RequestBody = {
  config?: Partial<TradingConfig> & { action?: string; direction?: string };
} & Partial<TradingConfig> & { action?: string; direction?: string };

type SimulatedSwap = {
  inputAmount: number;
  outputAmount: number;
  rate: number;  
  priceImpact: number;
};

type TradingResponse = {
  triggered: boolean;
  currentPrice: number;
  thresholdPrice: number;
  direction: Direction;
  priceDiff: number;
  analysis: string;
  simulatedSwap: SimulatedSwap | null;
  checkedAt: string;
  monitorJobId: string | null;
};

type TradingState = {
  checks: number;
  lastPrice: number;
  lastTriggered: boolean;
  lastCheckedAt: string;
};

const tradingState = new Map<string, TradingState>();

const TOKEN_TO_COINGECKO: Record<string, string> = {
  bitcoin: "bitcoin",
  btc: "bitcoin",
  ethereum: "ethereum",
  eth: "ethereum",
  hela: "bitcoin",
  hla: "bitcoin",
  hlusd: "hlusd",
  usdcoin: "usd-coin",
  usdc: "usd-coin",
  tether: "tether",
  usdt: "tether",
  chainlink: "chainlink",
  link: "chainlink",
  solana: "solana",
  sol: "solana"
};

const STABLE_USD_SYMBOLS = new Set(["hlusd", "usdc", "usdcoin", "usdt", "tether", "dai", "usd"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
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

function asString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseDirection(rawDirection: string | null, legacyAction: string | null): Direction {
  if (rawDirection === "above" || rawDirection === "below") {
    return rawDirection;
  }

  if (legacyAction === "buy") {
    return "below";
  }

  return "above";
}

function parseExecutionAction(rawAction: string | null): ExecutionAction {
  if (rawAction === "hold") {
    return "alert";
  }

  if (rawAction === "alert" || rawAction === "simulate-swap") {
    return rawAction;
  }

  return "simulate-swap";
}

function parseMonitorFrequency(raw: unknown): MonitorFrequency {
  if (typeof raw !== "string") {
    return "minutely";
  }

  const normalized = raw.trim().toLowerCase();
  if (
    normalized === "minutely" ||
    normalized === "hourly" ||
    normalized === "daily" ||
    normalized === "weekly" ||
    normalized === "monthly"
  ) {
    return normalized;
  }

  return "minutely";
}

function normalizeSymbol(rawToken: string): string {
  return rawToken.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function resolvePriceToken(tokenPair: string): string {
  const firstToken = tokenPair.split(/[\/:\-_\s]/)[0]?.trim() || tokenPair;
  const normalized = normalizeSymbol(firstToken);
  return TOKEN_TO_COINGECKO[normalized] || normalized;
}

function splitTokenPair(tokenPair: string): string[] {
  return tokenPair
    .split(/[\/:\-_\s]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

async function resolveUsdPrice(symbolOrId: string): Promise<number | null> {
  const normalized = normalizeSymbol(symbolOrId);
  if (!normalized) {
    return null;
  }

  if (STABLE_USD_SYMBOLS.has(normalized)) {
    return 1;
  }

  const resolvedId = TOKEN_TO_COINGECKO[normalized] || normalized;

  try {
    return await getTokenPrice(resolvedId);
  } catch {
    return null;
  }
}

async function resolveCurrentPrice(tokenPair: string, currentPriceFallback: number | null): Promise<number> {
  const tokens = splitTokenPair(tokenPair);
  const baseToken = tokens[0] || tokenPair;
  const quoteToken = tokens.length > 1 ? tokens[1] : null;

  const baseUsd = await resolveUsdPrice(baseToken);
  let resolved: number | null = null;

  if (baseUsd !== null) {
    if (quoteToken) {
      const quoteUsd = await resolveUsdPrice(quoteToken);
      if (quoteUsd !== null && quoteUsd > 0) {
        resolved = baseUsd / quoteUsd;
      } else {
        resolved = baseUsd;
      }
    } else {
      resolved = baseUsd;
    }
  }

  if (resolved !== null && Number.isFinite(resolved) && resolved > 0) {
    return resolved;
  }

  if (currentPriceFallback !== null && currentPriceFallback > 0) {
    console.log(`[TRADING] Falling back to provided currentPrice for ${tokenPair}`);
    return currentPriceFallback;
  }

  throw {
    statusCode: 400,
    message: `Unable to resolve live price for ${tokenPair}. Use a supported token pair or provide currentPrice.`
  };
}

function parseBody(body: unknown): TradingConfig {
  if (!isRecord(body)) {
    throw { statusCode: 400, message: "Request body must be a JSON object." };
  }

  const source = isRecord(body.config) ? body.config : body;

  const tokenPair = asString(source.tokenPair);
  if (!tokenPair) {
    throw { statusCode: 400, message: "config.tokenPair is required." };
  }

  const thresholdPrice = asFiniteNumber(source.thresholdPrice);
  if (thresholdPrice === null || thresholdPrice <= 0) {
    throw { statusCode: 400, message: "config.thresholdPrice must be a number greater than 0." };
  }

  const amount = asFiniteNumber(source.amount);
  if (amount === null || amount <= 0) {
    throw { statusCode: 400, message: "config.amount must be a number greater than 0." };
  }

  const currentPriceFallback = asFiniteNumber(source.currentPrice);
  if (currentPriceFallback !== null && currentPriceFallback <= 0) {
    throw { statusCode: 400, message: "config.currentPrice must be a number greater than 0." };
  }

  const legacyAction = asString(source.action)?.toLowerCase() || null;
  const direction = parseDirection(asString(source.direction)?.toLowerCase() || null, legacyAction);
  const action = parseExecutionAction(legacyAction);

  const rawUserAddress = asString(source.userAddress);
  const userAddress = rawUserAddress || "0x0000000000000000000000000000000000000000";
  if (rawUserAddress && !isAddress(rawUserAddress)) {
    throw { statusCode: 400, message: "config.userAddress must be a valid wallet address." };
  }

  const enableMonitoring = source.enableMonitoring === true;
  const monitorFrequency = parseMonitorFrequency(source.monitorFrequency);

  return {
    tokenPair: tokenPair.toLowerCase(),
    thresholdPrice,
    direction,
    action,
    amount,
    userAddress,
    enableMonitoring,
    monitorFrequency,
    currentPriceFallback
  };
}

function toStateKey(config: TradingConfig): string {
  return `${config.userAddress.toLowerCase()}:${config.tokenPair}`;
}

function computeTriggered(currentPrice: number, thresholdPrice: number, direction: Direction): boolean {
  return direction === "above" ? currentPrice >= thresholdPrice : currentPrice <= thresholdPrice;
}

function computePriceDiff(currentPrice: number, thresholdPrice: number): number {
  return Number((((currentPrice - thresholdPrice) / thresholdPrice) * 100).toFixed(4));
}

function computePriceImpact(config: TradingConfig): number {
  const seed = `${config.tokenPair}:${config.userAddress}:${config.thresholdPrice}`;
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash + seed.charCodeAt(index) * (index + 11)) % 10_000;
  }

  const bounded = 0.1 + (hash % 201) / 1000;
  return Number(bounded.toFixed(3));
}

async function buildAnalysis(config: TradingConfig, currentPrice: number, triggered: boolean, priceDiff: number): Promise<string> {
  const prompt = [
    `You are a crypto trading analyst. Current ${config.tokenPair} price: $${currentPrice}.`,
    `User threshold: $${config.thresholdPrice} (${config.direction}).`,
    `Threshold ${triggered ? "HAS BEEN" : "has NOT been"} triggered.`,
    `Price difference: ${priceDiff}%.`,
    "Provide a 3-sentence market analysis: current trend, what this means for the user, recommended action.",
    "Be specific with numbers. No generic advice."
  ].join("\n");

  return callGemini(prompt);
}

function simulateSwap(config: TradingConfig, currentPrice: number, triggered: boolean): SimulatedSwap | null {
  if (config.action !== "simulate-swap" || !triggered) {
    return null;
  }

  const priceImpact = computePriceImpact(config);
  const grossOutput = config.amount / currentPrice;
  const outputAmount = grossOutput * (1 - priceImpact / 100);

  return {
    inputAmount: Number(config.amount.toFixed(6)),
    outputAmount: Number(outputAmount.toFixed(8)),
    rate: Number(currentPrice.toFixed(8)),
    priceImpact
  };
}

function updateState(config: TradingConfig, currentPrice: number, triggered: boolean, checkedAt: string): void {
  const key = toStateKey(config);
  const existing = tradingState.get(key);
  const nextChecks = existing ? existing.checks + 1 : 1;

  tradingState.set(key, {
    checks: nextChecks,
    lastPrice: currentPrice,
    lastTriggered: triggered,
    lastCheckedAt: checkedAt
  });
}

function startMonitorIfRequested(config: TradingConfig): string | null {
  if (!config.enableMonitoring) {
    return null;
  }

  if (!isAddress(config.userAddress)) {
    return null;
  }

  const monitorJobId = `trading-${randomUUID()}`;

  scheduleAgent(
    monitorJobId,
    "trading",
    config.userAddress,
    {
      tokenPair: config.tokenPair,
      thresholdPrice: config.thresholdPrice,
      direction: config.direction
    },
    config.monitorFrequency,
    async (runtimeConfig) => {
      const token = asString(runtimeConfig.tokenPair) || config.tokenPair;
      const threshold = asFiniteNumber(runtimeConfig.thresholdPrice) ?? config.thresholdPrice;
      const direction = parseDirection(asString(runtimeConfig.direction), null);
      const fallbackPrice = asFiniteNumber(runtimeConfig.currentPrice);
      const current = await resolveCurrentPrice(token, fallbackPrice);
      const triggered = computeTriggered(current, threshold, direction);
      const result = `${token} monitor check: ${current} vs ${threshold} (${direction}) => ${triggered}`;
      console.log(`[TRADING] [MONITOR] ${result}`);
      return { result };
    }
  );

  return monitorJobId;
}

export async function POST(req: Request) {
  console.log("[TRADING] Received request");

  try {
    const body = (await req.json()) as RequestBody;
    const config = parseBody(body);

    const priceToken = resolvePriceToken(config.tokenPair);
    console.log(`[TRADING] Fetching real price for ${config.tokenPair} (${priceToken})`);
    const currentPrice = await resolveCurrentPrice(config.tokenPair, config.currentPriceFallback);
    const triggered = computeTriggered(currentPrice, config.thresholdPrice, config.direction);
    const priceDiff = computePriceDiff(currentPrice, config.thresholdPrice);

    console.log("[TRADING] Generating Gemini analysis");
    const analysis = await buildAnalysis(config, currentPrice, triggered, priceDiff);

    const simulatedSwap = simulateSwap(config, currentPrice, triggered);
    const checkedAt = new Date().toISOString();
    updateState(config, currentPrice, triggered, checkedAt);

    const monitorJobId = startMonitorIfRequested(config);

    const response: TradingResponse = {
      triggered,
      currentPrice: Number(currentPrice.toFixed(8)),
      thresholdPrice: Number(config.thresholdPrice.toFixed(8)),
      direction: config.direction,
      priceDiff,
      analysis,
      simulatedSwap,
      checkedAt,
      monitorJobId
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Malformed JSON body." }, { status: 400 });
    }

    const mapped = error as { statusCode?: number; message?: string };
    const statusCode = mapped.statusCode && mapped.statusCode >= 400 ? mapped.statusCode : 500;
    const message = mapped.message || "Trading agent execution failed.";
    console.error(`[TRADING] Error: ${message}`);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
