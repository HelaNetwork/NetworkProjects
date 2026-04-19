import type { AgentJob } from "../types/agent";
import { fetchHLUSDBalanceForAddress, fetchNativeBalanceForAddress } from "./contracts";
import { isRealFarmingExecutionEnabled } from "./farmingExecutor";
import { isRealTradingExecutionEnabled } from "./tradingExecutor";

export type FundingStatus = "empty" | "low" | "funded" | "unknown";
export type GasFundingStatus = "missing" | "low" | "ready" | "unknown";

export type FundingSnapshot = {
  balanceHLUSD: string | null;
  balanceValue: number | null;
  nativeBalanceHELA: string | null;
  nativeBalanceValue: number | null;
  recommendedMinimumHLUSD: string | null;
  gasFundingStatus: GasFundingStatus;
  gasHint: string;
  fundingStatus: FundingStatus;
  fundingHint: string;
};

function toNumber(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function readText(job: AgentJob, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = job.userConfig[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return fallback;
}

function readNumber(job: AgentJob, keys: string[], fallback: number): number {
  for (const key of keys) {
    const value = job.userConfig[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string") {
      const parsed = Number(value.trim().replace("%", ""));
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return fallback;
}

function getTradingInputToken(job: AgentJob): string | null {
  const tokenPair = readText(job, ["tokenPair", "Token Pair"], "").toUpperCase();
  if (!tokenPair) {
    return null;
  }

  const symbols = tokenPair
    .split(/[/:_\-\s]+/)
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean);

  if (symbols.length !== 2) {
    return null;
  }

  const direction = readText(job, ["direction", "Action Type"], "above").toLowerCase() === "below" ? "below" : "above";
  return direction === "above" ? symbols[0] : symbols[1];
}

function getRebalancingExecutionBudget(job: AgentJob): number | null {
  if (!isRealTradingExecutionEnabled()) {
    return null;
  }

  const targetAllocations = job.userConfig.targetAllocations ?? job.userConfig["Target Allocation"];
  const currentAllocations = job.userConfig.currentAllocations ?? job.userConfig["Current Allocation"];

  if (
    !targetAllocations ||
    typeof targetAllocations !== "object" ||
    Array.isArray(targetAllocations) ||
    !currentAllocations ||
    typeof currentAllocations !== "object" ||
    Array.isArray(currentAllocations)
  ) {
    return null;
  }

  const targetSymbols = Object.keys(targetAllocations as Record<string, unknown>).map((symbol) => symbol.toUpperCase());
  const currentSymbols = Object.keys(currentAllocations as Record<string, unknown>).map((symbol) => symbol.toUpperCase());
  const symbols = Array.from(new Set([...targetSymbols, ...currentSymbols]));

  if (!symbols.includes("HLUSD") || !symbols.includes("DUSDC")) {
    return null;
  }

  const budget = typeof job.executionPolicy?.maxSpendPerRunHLUSD === "number" ? job.executionPolicy.maxSpendPerRunHLUSD : 1;
  return Number.isFinite(budget) && budget > 0 ? budget : 1;
}

function getFarmingExecutionBudget(job: AgentJob): number | null {
  if (!isRealFarmingExecutionEnabled()) {
    return null;
  }

  const protocol = readText(job, ["protocol", "LP Token Address"], "").toLowerCase();
  if (protocol !== "demo-farm") {
    return null;
  }

  return readNumber(job, ["amount", "Threshold"], 1);
}

function requiresNativeGas(job: AgentJob, agentType: string | null): boolean {
  if (agentType === "scheduling") {
    return true;
  }

  if (agentType === "trading" && isRealTradingExecutionEnabled()) {
    const autoExecute = job.executionPolicy?.autoExecute !== false;
    const explicitAction = readText(job, ["action", "Action", "Execution Action"], "").toLowerCase();
    const action =
      explicitAction === "alert"
        ? "alert"
        : explicitAction === "simulate-swap"
          ? "simulate-swap"
          : autoExecute
            ? "simulate-swap"
            : "alert";

    return action === "simulate-swap";
  }

  if (agentType === "rebalancing" && getRebalancingExecutionBudget(job) !== null) {
    return true;
  }

  if (agentType === "farming" && getFarmingExecutionBudget(job) !== null) {
    return true;
  }

  return false;
}

function getRecommendedMinimum(job: AgentJob, agentType: string | null): number | null {
  if (agentType === "content" || agentType === "business") {
    return 0;
  }

  if (agentType === "trading") {
    if (isRealTradingExecutionEnabled() && getTradingInputToken(job) === "HLUSD") {
      return readNumber(job, ["amount", "Amount"], 1);
    }
    return 0;
  }

  if (agentType === "rebalancing") {
    return getRebalancingExecutionBudget(job) ?? 0;
  }

  if (agentType === "farming") {
    return getFarmingExecutionBudget(job) ?? 0;
  }

  if (agentType === "scheduling") {
    const rawAmount = job.userConfig.amount ?? job.userConfig.stipendAmountHLUSD;
    const parsed = Number(rawAmount);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }

  return 0;
}

function toDisplayAmount(value: number | null) {
  if (value === null) {
    return null;
  }
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

const MIN_NATIVE_GAS_BALANCE = 0.01;

export async function getFundingSnapshot(
  agentWalletAddress: string | null,
  job: AgentJob,
  agentType: string | null = null
): Promise<FundingSnapshot> {
  if (!agentWalletAddress) {
    return {
      balanceHLUSD: null,
      balanceValue: null,
      nativeBalanceHELA: null,
      nativeBalanceValue: null,
      recommendedMinimumHLUSD: toDisplayAmount(getRecommendedMinimum(job, agentType)),
      gasFundingStatus: "unknown",
      gasHint: "Agent wallet address is unavailable.",
      fundingStatus: "unknown",
      fundingHint: "Agent wallet address is unavailable."
    };
  }

  try {
    const [balanceHLUSD, nativeBalanceHELA] = await Promise.all([
      fetchHLUSDBalanceForAddress(agentWalletAddress),
      fetchNativeBalanceForAddress(agentWalletAddress)
    ]);
    const balanceValue = toNumber(balanceHLUSD);
    const nativeBalanceValue = toNumber(nativeBalanceHELA);
    const recommendedMinimum = getRecommendedMinimum(job, agentType);

    if (balanceValue === null || nativeBalanceValue === null) {
      return {
        balanceHLUSD,
        balanceValue,
        nativeBalanceHELA,
        nativeBalanceValue,
        recommendedMinimumHLUSD: toDisplayAmount(recommendedMinimum),
        gasFundingStatus: "unknown",
        gasHint: "Wallet gas balance could not be parsed.",
        fundingStatus: "unknown",
        fundingHint: "Wallet balances could not be parsed."
      };
    }

    if ((recommendedMinimum ?? 0) <= 0) {
      const needsGas = requiresNativeGas(job, agentType);
      if (needsGas && nativeBalanceValue <= 0) {
        return {
          balanceHLUSD,
          balanceValue,
          nativeBalanceHELA,
          nativeBalanceValue,
          recommendedMinimumHLUSD: toDisplayAmount(recommendedMinimum),
          gasFundingStatus: "missing",
          gasHint: "Add native gas to the agent wallet so it can pay transaction fees.",
          fundingStatus: "low",
          fundingHint: "This automation path does not require HLUSD, but the agent wallet needs native gas to execute."
        };
      }

      if (needsGas && nativeBalanceValue < MIN_NATIVE_GAS_BALANCE) {
        return {
          balanceHLUSD,
          balanceValue,
          nativeBalanceHELA,
          nativeBalanceValue,
          recommendedMinimumHLUSD: toDisplayAmount(recommendedMinimum),
          gasFundingStatus: "low",
          gasHint: "Top up a small amount of native gas so the wallet can pay transaction fees.",
          fundingStatus: "low",
          fundingHint: "This automation path does not require HLUSD, but native gas is low for reliable execution."
        };
      }

      return {
        balanceHLUSD,
        balanceValue,
        nativeBalanceHELA,
        nativeBalanceValue,
        recommendedMinimumHLUSD: toDisplayAmount(recommendedMinimum),
        gasFundingStatus: needsGas ? "ready" : "ready",
        gasHint: needsGas ? "Agent wallet has enough native gas for execution." : "This agent does not require wallet funding for automation runs.",
        fundingStatus: "funded",
        fundingHint: needsGas
          ? "This agent does not require HLUSD for the configured path and has enough native gas to run."
          : "This agent can run without HLUSD or agent-wallet gas funding."
      };
    }

    if (balanceValue <= 0) {
      return {
        balanceHLUSD,
        balanceValue,
        nativeBalanceHELA,
        nativeBalanceValue,
        recommendedMinimumHLUSD: toDisplayAmount(recommendedMinimum),
        gasFundingStatus:
          nativeBalanceValue <= 0 ? "missing" : nativeBalanceValue < MIN_NATIVE_GAS_BALANCE ? "low" : "ready",
        gasHint:
          nativeBalanceValue <= 0
            ? "Add native gas to the agent wallet so it can pay transaction fees."
            : nativeBalanceValue < MIN_NATIVE_GAS_BALANCE
              ? "Top up a small amount of native gas so the wallet can pay transaction fees."
              : "Agent wallet has enough native gas for execution.",
        fundingStatus: "empty",
        fundingHint: "Fund this agent wallet with HLUSD before automation can run."
      };
    }

    if (recommendedMinimum !== null && balanceValue < recommendedMinimum) {
      return {
        balanceHLUSD,
        balanceValue,
        nativeBalanceHELA,
        nativeBalanceValue,
        recommendedMinimumHLUSD: toDisplayAmount(recommendedMinimum),
        gasFundingStatus:
          nativeBalanceValue <= 0 ? "missing" : nativeBalanceValue < MIN_NATIVE_GAS_BALANCE ? "low" : "ready",
        gasHint:
          nativeBalanceValue <= 0
            ? "Add native gas to the agent wallet so it can pay transaction fees."
            : nativeBalanceValue < MIN_NATIVE_GAS_BALANCE
              ? "Top up a small amount of native gas so the wallet can pay transaction fees."
              : "Agent wallet has enough native gas for execution.",
        fundingStatus: "low",
        fundingHint: `Current balance is below the recommended ${toDisplayAmount(recommendedMinimum)} HLUSD minimum for reliable runs.`
      };
    }

    if (nativeBalanceValue <= 0) {
      return {
        balanceHLUSD,
        balanceValue,
        nativeBalanceHELA,
        nativeBalanceValue,
        recommendedMinimumHLUSD: toDisplayAmount(recommendedMinimum),
        gasFundingStatus: "missing",
        gasHint: "Add native gas to the agent wallet so it can pay transaction fees.",
        fundingStatus: "low",
        fundingHint: "Agent wallet has enough HLUSD, but no native gas for transaction fees."
      };
    }

    if (nativeBalanceValue < MIN_NATIVE_GAS_BALANCE) {
      return {
        balanceHLUSD,
        balanceValue,
        nativeBalanceHELA,
        nativeBalanceValue,
        recommendedMinimumHLUSD: toDisplayAmount(recommendedMinimum),
        gasFundingStatus: "low",
        gasHint: "Top up a small amount of native gas so the wallet can pay transaction fees.",
        fundingStatus: "low",
        fundingHint: "Agent wallet has enough HLUSD, but native gas is low for reliable execution."
      };
    }

    return {
      balanceHLUSD,
      balanceValue,
      nativeBalanceHELA,
      nativeBalanceValue,
      recommendedMinimumHLUSD: toDisplayAmount(recommendedMinimum),
      gasFundingStatus: "ready",
      gasHint: "Agent wallet has enough native gas for execution.",
      fundingStatus: "funded",
      fundingHint: "Agent wallet has enough HLUSD and native gas for the next automation run."
    };
  } catch {
    return {
      balanceHLUSD: null,
      balanceValue: null,
      nativeBalanceHELA: null,
      nativeBalanceValue: null,
      recommendedMinimumHLUSD: toDisplayAmount(getRecommendedMinimum(job, agentType)),
      gasFundingStatus: "unknown",
      gasHint: "Could not fetch the native gas balance for this agent wallet.",
      fundingStatus: "unknown",
      fundingHint: "Could not fetch the HLUSD balance for this agent wallet."
    };
  }
}
