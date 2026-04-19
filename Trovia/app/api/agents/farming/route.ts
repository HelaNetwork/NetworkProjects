import { randomUUID } from "node:crypto";
import { isAddress } from "ethers";
import { NextResponse } from "next/server";
import { scheduleAgent } from "@/lib/cronManager";
import { callGemini } from "@/lib/gemini";
import { getWalletNativeBalance, simulateLPPosition } from "@/lib/walletMonitor";

type RiskLevel = "low" | "medium" | "high";
type MonitorFrequency = "minutely" | "hourly" | "daily" | "weekly" | "monthly";

type FarmingConfig = {
  protocol: string;
  poolType: string;
  amount: number;
  durationDays: number;
  userAddress: string;
  riskLevel: RiskLevel;
  enableMonitoring: boolean;
  monitorFrequency: MonitorFrequency;
};

type LpData = {
  totalValueLocked: number;
  apy: number;
  fees24h: number;
  volume24h: number;
};

type FarmingResponse = {
  recommendation: string;
  projectedEarnings: number;
  riskAssessment: string;
  lpData: LpData;
  warning?: string;
  monitorJobId: string | null;
};

type FarmingState = {
  checks: number;
  lastProjectedEarnings: number;
  lastApy: number;
  lastCheckedAt: string;
};

const farmingState = new Map<string, FarmingState>();

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

function parseDurationDays(value: unknown): number {
  const numericValue = asFiniteNumber(value);
  if (numericValue !== null && numericValue > 0) {
    return numericValue;
  }

  if (typeof value === "string") {
    const match = value.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      const parsed = Number(match[1]);
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }
  }

  throw { statusCode: 400, message: "config.duration must be a number greater than 0." };
}

function parseRiskLevel(value: unknown): RiskLevel {
  const normalized = asString(value)?.toLowerCase();
  if (normalized === "low" || normalized === "medium" || normalized === "high") {
    return normalized;
  }
  return "medium";
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

function parseBody(body: unknown): FarmingConfig {
  if (!isRecord(body)) {
    throw { statusCode: 400, message: "Request body must be a JSON object." };
  }

  const source = isRecord(body.config) ? body.config : body;

  const protocol = asString(source.protocol);
  if (!protocol) {
    throw { statusCode: 400, message: "config.protocol is required." };
  }

  const poolType = asString(source.poolType);
  if (!poolType) {
    throw { statusCode: 400, message: "config.poolType is required." };
  }

  const amount = asFiniteNumber(source.amount);
  if (amount === null || amount <= 0) {
    throw { statusCode: 400, message: "config.amount must be a number greater than 0." };
  }

  const durationDays = parseDurationDays(source.durationDays ?? source.duration);
  const riskLevel = parseRiskLevel(source.riskLevel ?? source.risk);

  const rawUserAddress = asString(source.userAddress ?? source.address);
  if (rawUserAddress && !isAddress(rawUserAddress)) {
    throw { statusCode: 400, message: "config.userAddress must be a valid wallet address." };
  }

  return {
    protocol,
    poolType,
    amount,
    durationDays,
    userAddress: rawUserAddress || "0x0000000000000000000000000000000000000000",
    riskLevel,
    enableMonitoring: source.enableMonitoring === true,
    monitorFrequency: parseMonitorFrequency(source.monitorFrequency)
  };
}

function projectEarnings(amount: number, apy: number, durationDays: number): number {
  const projected = amount * (apy / 100) * (durationDays / 365);
  return Number(projected.toFixed(6));
}

function parseGeminiSections(text: string): { recommendation: string; riskAssessment: string; keyWarnings: string } {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced?.[1]?.trim() || trimmed;

  let parsed: unknown = null;

  try {
    parsed = JSON.parse(candidate);
  } catch {
    const objectMatch = candidate.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        parsed = JSON.parse(objectMatch[0]);
      } catch {
        parsed = null;
      }
    }
  }

  if (isRecord(parsed)) {
    const recommendation = asString(parsed.recommendation);
    const riskAssessment = asString(parsed.riskAssessment);
    const keyWarnings = Array.isArray(parsed.keyWarnings)
      ? parsed.keyWarnings
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
          .join(" ")
      : asString(parsed.keyWarnings);

    if (recommendation && riskAssessment) {
  return {
    recommendation,
    riskAssessment,
    keyWarnings: keyWarnings || "No material warnings identified."
  };
    }
  }

  const lines = candidate
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const riskAssessment = lines.slice(0, 2).join(" ") || "Risk appears moderate based on current pool metrics.";
  const recommendation = lines[lines.length - 1] || "Proceed cautiously with size and monitor APY drift.";
  const keyWarnings = lines.slice(2, 4).join(" ") || "APY and fees can change quickly based on liquidity.";

  return {
    recommendation,
    riskAssessment,
    keyWarnings
  };
}

function buildFallbackAnalysis(
  config: FarmingConfig,
  apy: number,
  projectedEarnings: number
): { recommendation: string; riskAssessment: string; keyWarnings: string } {
  const riskAssessment =
    config.riskLevel === "high"
      ? `This opportunity carries elevated risk because ${config.protocol}/${config.poolType} can experience fast APY swings, liquidity changes, and smart-contract risk. Returns may look attractive at ${apy}% APY, but capital protection should be treated as the priority.`
      : config.riskLevel === "low"
        ? `This farming setup appears relatively conservative compared with higher-yield pools, but APY, fees, and liquidity can still move quickly. The current simulated APY is ${apy}%, so expected returns remain sensitive to market conditions and pool depth.`
        : `This opportunity sits in a moderate-risk range: yield is meaningful at ${apy}% APY, but fees, liquidity quality, and protocol trust still matter. A medium-risk position size and regular monitoring would be more appropriate than a set-and-forget approach.`;

  const keyWarnings = [
    "APY can change quickly as liquidity and reward emissions move.",
    "Impermanent loss and protocol risk should be considered before increasing size.",
    `Projected earnings are estimated at ${projectedEarnings.toFixed(6)} units for the selected duration and are not guaranteed.`
  ].join(" ");

  const recommendation =
    projectedEarnings > 0
      ? `Consider a cautious position only if ${config.protocol}/${config.poolType} matches your risk tolerance and you are comfortable monitoring yield drift. Start smaller, verify pool quality, and scale only after validating performance over time.`
      : `Do not proceed yet. Validate the pool inputs and expected returns before allocating capital.`;

  return {
    recommendation,
    riskAssessment,
    keyWarnings
  };
}

function isUsefulAnalysis(value: { recommendation: string; riskAssessment: string; keyWarnings: string }) {
  return (
    value.recommendation.trim().length >= 24 &&
    value.riskAssessment.trim().length >= 24 &&
    value.recommendation.trim() !== "}" &&
    value.riskAssessment.trim() !== "}"
  );
}

async function buildAnalysis(
  config: FarmingConfig,
  apy: number,
  projectedEarnings: number
): Promise<{ recommendation: string; riskAssessment: string; keyWarnings: string }> {
  const prompt = [
    "Analyze this DeFi farming opportunity:",
    `Protocol: ${config.protocol}`,
    `Pool: ${config.poolType}`,
    `Amount: ${config.amount} ETH`,
    `APY: ${apy}%`,
    `Duration: ${config.durationDays} days`,
    `Risk level: ${config.riskLevel}`,
    "",
    "Provide:",
    "1. Risk assessment (2 sentences)",
    "2. Estimated returns",
    "3. Key warning points",
    "4. Recommendation (yes/no with reason)",
    "",
    "Return valid JSON with exactly these keys: riskAssessment, keyWarnings, recommendation."
  ].join("\n");

  try {
    const geminiText = await callGemini(prompt);
    const parsed = parseGeminiSections(geminiText);
    if (isUsefulAnalysis(parsed)) {
      return parsed;
    }
  } catch {
    // Fall back to deterministic analysis below.
  }

  return buildFallbackAnalysis(config, apy, projectedEarnings);
}

function toStateKey(config: FarmingConfig): string {
  return `${config.userAddress.toLowerCase()}:${config.protocol.toLowerCase()}:${config.poolType.toLowerCase()}`;
}

function updateState(config: FarmingConfig, projectedEarnings: number, apy: number): void {
  const key = toStateKey(config);
  const existing = farmingState.get(key);
  farmingState.set(key, {
    checks: existing ? existing.checks + 1 : 1,
    lastProjectedEarnings: projectedEarnings,
    lastApy: apy,
    lastCheckedAt: new Date().toISOString()
  });
}

function startMonitor(config: FarmingConfig): string | null {
  if (!config.enableMonitoring || !isAddress(config.userAddress)) {
    return null;
  }

  const monitorJobId = `farming-${randomUUID()}`;
  scheduleAgent(
    monitorJobId,
    "farming",
    config.userAddress,
    {
      protocol: config.protocol,
      poolType: config.poolType,
      amount: config.amount,
      durationDays: config.durationDays
    },
    config.monitorFrequency,
    async (runtimeConfig) => {
      const protocol = asString(runtimeConfig.protocol) || config.protocol;
      const poolType = asString(runtimeConfig.poolType) || config.poolType;
      const amount = asFiniteNumber(runtimeConfig.amount) ?? config.amount;
      const duration = asFiniteNumber(runtimeConfig.durationDays) ?? config.durationDays;
      const lpData = await simulateLPPosition(`${protocol}:${poolType}`);
      const projected = projectEarnings(amount, lpData.apy, duration);
      const result = `Farming monitor check ${protocol}/${poolType}: APY ${lpData.apy}% projected ${projected} ETH`;
      console.log(`[FARMING] [MONITOR] ${result}`);
      return { result };
    }
  );

  return monitorJobId;
}

export async function POST(req: Request) {
  console.log("[FARMING] Received request");

  try {
    const body = await req.json();
    const config = parseBody(body);

    console.log(`[FARMING] Simulating LP data for ${config.protocol}/${config.poolType}`);
    const lpRaw = await simulateLPPosition(`${config.protocol}:${config.poolType}`);
    const lpData: LpData = {
      totalValueLocked: Number(lpRaw.totalValueLocked.toFixed(2)),
      apy: Number(lpRaw.apy.toFixed(3)),
      fees24h: Number(lpRaw.fees24h.toFixed(2)),
      volume24h: Number(lpRaw.volume24h.toFixed(2))
    };

    const projectedEarnings = projectEarnings(config.amount, lpData.apy, config.durationDays);

    console.log("[FARMING] Requesting Gemini risk assessment");
    const ai = await buildAnalysis(config, lpData.apy, projectedEarnings);

    let warning = ai.keyWarnings;
    if (isAddress(config.userAddress)) {
      const gasBalance = await getWalletNativeBalance(config.userAddress);
      if (gasBalance < 0.01) {
        warning = `${warning} Low native token balance may cause transaction failures.`;
      }
    }

    updateState(config, projectedEarnings, lpData.apy);
    const monitorJobId = startMonitor(config);

    const response: FarmingResponse = {
      recommendation: ai.recommendation,
      projectedEarnings,
      riskAssessment: ai.riskAssessment,
      lpData,
      warning,
      monitorJobId
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Malformed JSON body." }, { status: 400 });
    }

    const mapped = error as { statusCode?: number; message?: string };
    const statusCode = mapped.statusCode && mapped.statusCode >= 400 ? mapped.statusCode : 500;
    const message = mapped.message || "Farming agent execution failed.";
    console.error(`[FARMING] Error: ${message}`);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
