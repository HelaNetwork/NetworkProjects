import { Contract, JsonRpcProvider, Wallet, parseUnits } from "ethers";
import { getExecutorContract } from "./contracts";
import { appendExecutionLog, getAgentJob, getStoredAgent, listDueJobs, listExecutionLogsForOwner, updateAgentJob } from "./automationStore";
import { runAgent } from "./agentRunner";
import { callGemini } from "./gemini";
import { getTokenPrice } from "./priceService";
import { simulateLPPosition } from "./walletMonitor";
import { isTemplateAutomationPlaceholder } from "./automationBootstrap";
import { executeFarmingDeposit, isRealFarmingExecutionEnabled } from "./farmingExecutor";
import { executeTokenSwap, executeTradingSwap, isRealTradingExecutionEnabled } from "./tradingExecutor";
import type { AgentJob, AutomationFrequency, ExecutionPolicy, ExecutionResult } from "../types/agent";

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)"
];

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

function addFrequency(from: Date, frequency: AutomationFrequency) {
  const next = new Date(from);

  if (frequency === "hourly") {
    next.setHours(next.getHours() + 1);
  } else if (frequency === "daily") {
    next.setDate(next.getDate() + 1);
  } else if (frequency === "weekly") {
    next.setDate(next.getDate() + 7);
  } else {
    next.setMonth(next.getMonth() + 1);
  }

  return next;
}

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown automation error";
}

function normalizeUppercaseList(values: string[] | undefined) {
  return values?.map((value) => value.trim().toUpperCase()).filter(Boolean) ?? [];
}

function getExecutionPolicy(job: AgentJob): ExecutionPolicy {
  return {
    autoExecute: job.executionPolicy?.autoExecute !== false,
    maxSpendPerRunHLUSD: job.executionPolicy?.maxSpendPerRunHLUSD,
    maxDailySpendHLUSD: job.executionPolicy?.maxDailySpendHLUSD,
    slippageBps: job.executionPolicy?.slippageBps,
    allowedTokens: normalizeUppercaseList(job.executionPolicy?.allowedTokens),
    allowedProtocols: normalizeUppercaseList(job.executionPolicy?.allowedProtocols)
  };
}

function enforceAllowedTokens(job: AgentJob, tokens: string[]) {
  const policy = getExecutionPolicy(job);
  if (!policy.allowedTokens?.length) {
    return;
  }

  const requested = Array.from(new Set(tokens.map((token) => token.trim().toUpperCase()).filter(Boolean)));
  const rejected = requested.filter((token) => !policy.allowedTokens?.includes(token));
  if (rejected.length) {
    throw new Error(`Execution policy rejected unsupported tokens: ${rejected.join(", ")}`);
  }
}

function enforceAllowedProtocols(job: AgentJob, protocols: string[]) {
  const policy = getExecutionPolicy(job);
  if (!policy.allowedProtocols?.length) {
    return;
  }

  const requested = Array.from(new Set(protocols.map((protocol) => protocol.trim().toUpperCase()).filter(Boolean)));
  const rejected = requested.filter((protocol) => !policy.allowedProtocols?.includes(protocol));
  if (rejected.length) {
    throw new Error(`Execution policy rejected unsupported protocols: ${rejected.join(", ")}`);
  }
}

async function enforceSpendLimits(job: AgentJob, estimatedSpendHLUSD: number) {
  const policy = getExecutionPolicy(job);

  if (policy.autoExecute === false) {
    throw new Error("Execution policy requires manual approval before auto-execution.");
  }

  if (
    typeof policy.maxSpendPerRunHLUSD === "number" &&
    estimatedSpendHLUSD > policy.maxSpendPerRunHLUSD
  ) {
    throw new Error(
      `Execution policy maxSpendPerRunHLUSD exceeded (${estimatedSpendHLUSD} > ${policy.maxSpendPerRunHLUSD}).`
    );
  }

  if (typeof policy.maxDailySpendHLUSD === "number") {
    const today = new Date().toISOString().slice(0, 10);
    const spentToday = (await listExecutionLogsForOwner(job.ownerAddress))
      .filter((log) => log.jobId === job.id && log.success && log.executedAt.startsWith(today))
      .reduce((total, log) => {
        const match = log.result.match(/Estimated spend: ([0-9]+(?:\.[0-9]+)?)/i);
        const amount = match ? Number(match[1]) : 0;
        return total + (Number.isFinite(amount) ? amount : 0);
      }, 0);

    if (spentToday + estimatedSpendHLUSD > policy.maxDailySpendHLUSD) {
      throw new Error(
        `Execution policy maxDailySpendHLUSD exceeded (${(spentToday + estimatedSpendHLUSD).toFixed(4)} > ${policy.maxDailySpendHLUSD}).`
      );
    }
  }
}

async function logExecutionOnChain(job: AgentJob, result: ExecutionResult) {
  const rpcUrl = requireEnv("NEXT_PUBLIC_HELA_RPC");
  const privateKey = requireEnv("HELA_PRIVATE_KEY");

  const provider = new JsonRpcProvider(rpcUrl);
  const signer = new Wallet(privateKey, provider);

  const executorReadContract = await getExecutorContract(false);
  const executorContract = executorReadContract.connect(signer);
  const logExecution = executorContract.getFunction("logExecution");
  const tx = await logExecution(job.agentId, job.ownerAddress, "automation_run", result.result);
  const receipt = await tx.wait();
  return receipt?.hash || tx.hash;
}

async function executeSchedulingTransfer(job: AgentJob) {
  const storedAgent = await getStoredAgent(job.agentId);
  if (!storedAgent) {
    throw new Error("Stored agent not found");
  }

  const recipient = String(job.userConfig.recipient || job.userConfig.recipientAddress || "");
  const amountValue = job.userConfig.amount || job.userConfig.stipendAmountHLUSD;
  const amount = typeof amountValue === "number" ? String(amountValue) : String(amountValue || "");

  if (!recipient) {
    throw new Error("Scheduling job missing recipient");
  }
  if (!amount || Number(amount) <= 0) {
    throw new Error("Scheduling job missing amount");
  }

  const rpcUrl = requireEnv("NEXT_PUBLIC_HELA_RPC");
  const hlusdAddress = requireEnv("NEXT_PUBLIC_HLUSD_ADDRESS");

  const provider = new JsonRpcProvider(rpcUrl);
  const signer = new Wallet(storedAgent.agentWalletPrivateKey, provider);
  const token = new Contract(hlusdAddress, ERC20_ABI, signer);

  const tx = await token.transfer(recipient, parseUnits(amount, 18));
  const receipt = await tx.wait();

  return {
    success: true,
    result: `Transferred ${amount} HLUSD to ${recipient}`,
    data: {
      recipient,
      amount
    },
    txHash: receipt?.hash || tx.hash,
    executedAt: new Date().toISOString()
  } satisfies ExecutionResult;
}

function readText(config: AgentJob["userConfig"], keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = config[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return fallback;
}

function readNumber(config: AgentJob["userConfig"], keys: string[], fallback: number): number {
  for (const key of keys) {
    const value = config[key];
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

function parseMap(value: unknown, fallback: Record<string, number>): Record<string, number> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([key, raw]) => {
        const parsed = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw.replace("%", "")) : NaN;
        return Number.isFinite(parsed) ? [key.toUpperCase(), parsed] : null;
      })
      .filter((entry): entry is [string, number] => entry !== null);

    if (entries.length) {
      return Object.fromEntries(entries);
    }
  }

  if (typeof value === "string" && value.includes(":")) {
    const entries = value
      .split(",")
      .map((segment) => segment.trim())
      .filter(Boolean)
      .map((segment) => {
        const [key, raw] = segment.split(":").map((part) => part.trim());
        const parsed = Number((raw || "").replace("%", ""));
        return key && Number.isFinite(parsed) ? [key.toUpperCase(), parsed] as [string, number] : null;
      })
      .filter((entry): entry is [string, number] => entry !== null);

    if (entries.length) {
      return Object.fromEntries(entries);
    }
  }

  return fallback;
}

function getRebalancingExecutionBudget(job: AgentJob, mostOverweightDeviation: number, mostUnderweightDeviation: number): number {
  const configuredCap = getExecutionPolicy(job).maxSpendPerRunHLUSD ?? 1;

  return Number(
    Math.max(0.1, Math.min(configuredCap, Math.abs(mostOverweightDeviation), Math.abs(mostUnderweightDeviation))).toFixed(4)
  );
}

async function executeContentAutomation(job: AgentJob): Promise<ExecutionResult> {
  const topic = readText(job.userConfig, ["topic", "prompt", "message", "Sample Message"], "integration update");
  const tone = readText(job.userConfig, ["tone", "Tone"], "professional");
  const brandContext = readText(job.userConfig, ["brandContext", "Brand Context"], "general brand context");

  const result = await callGemini(
    `Write one concise social response idea about "${topic}" in a ${tone} tone. Brand context: ${brandContext}.`,
    "Return one short practical reply with no markdown."
  ).catch(() => `Prepared a ${tone} content response for: ${topic}`);

  return {
    success: true,
    result,
    executedAt: new Date().toISOString()
  };
}

async function executeBusinessAutomation(job: AgentJob): Promise<ExecutionResult> {
  const query = readText(job.userConfig, ["query", "prompt", "Query"], "Summarize business priorities for this week.");
  const context = readText(job.userConfig, ["businessContext", "context", "Industry Context"], "general business context");

  const result = await callGemini(
    `Business context: ${context}\nRequest: ${query}\nReturn a concise practical answer with 3 action steps.`,
    "You are a concise business advisor. No markdown tables."
  ).catch(() => `Business guidance prepared for: ${query}`);

  return {
    success: true,
    result,
    executedAt: new Date().toISOString()
  };
}

const TOKEN_TO_COINGECKO: Record<string, string> = {
  btc: "bitcoin",
  bitcoin: "bitcoin",
  eth: "ethereum",
  ethereum: "ethereum",
  usdc: "usd-coin",
  usdt: "tether",
  dai: "dai",
  link: "chainlink",
  hlusd: "usd-coin"
};

async function executeTradingAutomation(job: AgentJob): Promise<ExecutionResult> {
  const policy = getExecutionPolicy(job);
  const tokenPair = readText(job.userConfig, ["tokenPair", "Token Pair"], "btc/usdc").toLowerCase();
  const thresholdPrice = readNumber(job.userConfig, ["thresholdPrice", "Price Threshold"], 60000);
  const currentPriceInput = readNumber(job.userConfig, ["currentPrice", "Current Price"], NaN);
  const direction = readText(job.userConfig, ["direction", "Action Type"], "above").toLowerCase() === "below" ? "below" : "above";
  const explicitAction = readText(job.userConfig, ["action", "Action", "Execution Action"], "").toLowerCase();
  const action =
    explicitAction === "alert"
      ? "alert"
      : explicitAction === "simulate-swap"
        ? "simulate-swap"
        : policy.autoExecute === false
          ? "alert"
          : "simulate-swap";
  const amount = readNumber(job.userConfig, ["amount", "Amount"], 1);
  const tokens = tokenPair.split(/[/:_\-\s]+/).filter(Boolean);
  const baseToken = tokenPair.split(/[/:_\-\s]+/)[0];
  const resolved = TOKEN_TO_COINGECKO[baseToken] || "bitcoin";
  const currentPrice = Number.isFinite(currentPriceInput) ? currentPriceInput : await getTokenPrice(resolved).catch(() => thresholdPrice);
  const triggered = direction === "above" ? currentPrice >= thresholdPrice : currentPrice <= thresholdPrice;
  const analysis = triggered
    ? `${tokenPair.toUpperCase()} crossed the ${direction} threshold at ${currentPrice}. Estimated spend: ${amount}.`
    : `${tokenPair.toUpperCase()} has not crossed the ${direction} threshold yet. Current price is ${currentPrice}.`;

  if (!triggered || action === "alert") {
    return {
      success: true,
      result: analysis,
      data: {
        tokenPair,
        currentPrice,
        thresholdPrice,
        direction,
        triggered,
        action: "alert",
        amount,
        executionMode: "alert-only"
      },
      executedAt: new Date().toISOString()
    };
  }

  enforceAllowedTokens(job, tokens);
  await enforceSpendLimits(job, amount);

  const slippageBps =
    typeof policy.slippageBps === "number" && Number.isFinite(policy.slippageBps) ? policy.slippageBps : 100;

  if (isRealTradingExecutionEnabled()) {
    const storedAgent = await getStoredAgent(job.agentId);
    if (!storedAgent) {
      throw new Error("Stored agent not found");
    }

    const swap = await executeTradingSwap({
      agentWalletPrivateKey: storedAgent.agentWalletPrivateKey,
      tokenPair,
      direction,
      amount,
      slippageBps
    });

    return {
      success: true,
      result: `Executed ${swap.strategy} swap for ${swap.inputAmount} ${swap.inputTokenSymbol} into ${swap.outputTokenSymbol}. Estimated spend: ${amount}.`,
      data: {
        tokenPair,
        currentPrice,
        thresholdPrice,
        direction,
        triggered,
        action,
        amount,
        slippageBps,
        executionMode: "real-swap",
        swap
      },
      txHash: swap.txHash,
      executedAt: new Date().toISOString()
    };
  }

  return {
    success: true,
    result: analysis,
    data: {
      tokenPair,
      currentPrice,
      thresholdPrice,
      direction,
      triggered,
      action,
      amount,
      slippageBps,
      executionMode: action === "simulate-swap" ? "policy-guarded-simulation" : "alert-only"
    },
    executedAt: new Date().toISOString()
  };
}

async function executeFarmingAutomation(job: AgentJob): Promise<ExecutionResult> {
  const protocol = readText(job.userConfig, ["protocol", "LP Token Address"], "demo-farm");
  const poolType = readText(job.userConfig, ["poolType"], "hlusd-usdc");
  const amount = readNumber(job.userConfig, ["amount", "Threshold"], 100);
  const durationDays = readNumber(job.userConfig, ["durationDays"], 30);
  enforceAllowedProtocols(job, [protocol]);
  const requiredInputTokens =
    protocol.trim().toLowerCase() === "demo-farm" ? ["HLUSD"] : poolType.split(/[/:_\-\s]+/).filter(Boolean);
  enforceAllowedTokens(job, requiredInputTokens);
  await enforceSpendLimits(job, amount);
  const lpData = await simulateLPPosition(`${protocol}:${poolType}`);
  const projectedEarnings = Number((amount * (lpData.apy / 100) * (durationDays / 365)).toFixed(6));

  if (
    isRealFarmingExecutionEnabled() &&
    protocol.trim().toLowerCase() === "demo-farm" &&
    !isTemplateAutomationPlaceholder(job.agentId)
  ) {
    const storedAgent = await getStoredAgent(job.agentId);
    if (storedAgent) {
      const deposit = await executeFarmingDeposit({
        agentWalletPrivateKey: storedAgent.agentWalletPrivateKey,
        poolKey: poolType,
        amount
      });

      return {
        success: true,
        result: `Deposited ${deposit.depositAmount} HLUSD into ${deposit.poolKey}. Projected earnings: ${projectedEarnings}. Estimated spend: ${amount}.`,
        data: {
          protocol,
          poolType,
          projectedEarnings,
          apy: lpData.apy,
          amount,
          stakedBalance: deposit.stakedBalance,
          executionMode: "real-farm-deposit"
        },
        txHash: deposit.txHash,
        executedAt: new Date().toISOString()
      };
    }
  }

  return {
    success: true,
    result: `Farming review for ${protocol}/${poolType}: APY ${lpData.apy}% with projected earnings ${projectedEarnings}. Estimated spend: ${amount}.`,
    data: {
      protocol,
      poolType,
      projectedEarnings,
      apy: lpData.apy,
      amount,
      executionMode: "policy-guarded-monitoring"
    },
    executedAt: new Date().toISOString()
  };
}

async function executeRebalancingAutomation(job: AgentJob): Promise<ExecutionResult> {
  const target = parseMap(job.userConfig.targetAllocations ?? job.userConfig["Target Allocation"], { USDC: 60, WETH: 40 });
  const current = parseMap(job.userConfig.currentAllocations ?? job.userConfig["Current Allocation"], { USDC: 55, WETH: 45 });
  const driftTolerance = readNumber(job.userConfig, ["driftTolerance", "Drift Tolerance %"], 5);
  const symbols = Array.from(new Set([...Object.keys(target), ...Object.keys(current)])).sort();
  enforceAllowedTokens(job, symbols);

  const requiredTrades = symbols
    .map((symbol) => {
      const deviation = Number(((current[symbol] ?? 0) - (target[symbol] ?? 0)).toFixed(4));
      if (Math.abs(deviation) <= driftTolerance) {
        return null;
      }
      return deviation > 0 ? `SELL ${Math.abs(deviation)}% ${symbol}` : `BUY ${Math.abs(deviation)}% ${symbol}`;
    })
    .filter((item): item is string => Boolean(item));
  const estimatedSpend = Number(
    requiredTrades.reduce((total, trade) => {
      const match = trade.match(/([0-9]+(?:\.[0-9]+)?)%/i);
      const amount = match ? Number(match[1]) : 0;
      return total + (Number.isFinite(amount) ? amount : 0);
    }, 0).toFixed(4)
  );

  if (!requiredTrades.length) {
    return {
      success: true,
      result: "Portfolio is within the configured drift tolerance.",
      data: {
        target,
        current,
        driftTolerance,
        requiredTrades,
        estimatedSpend,
        executionMode: "policy-guarded-rebalance-plan"
      },
      executedAt: new Date().toISOString()
    };
  }

  const deviations = symbols
    .map((symbol) => ({
      symbol,
      deviation: Number(((current[symbol] ?? 0) - (target[symbol] ?? 0)).toFixed(4))
    }))
    .filter((entry) => Math.abs(entry.deviation) > driftTolerance);

  const mostOverweight = deviations
    .filter((entry) => entry.deviation > 0)
    .sort((left, right) => right.deviation - left.deviation)[0];
  const mostUnderweight = deviations
    .filter((entry) => entry.deviation < 0)
    .sort((left, right) => left.deviation - right.deviation)[0];

  const slippageBps = getExecutionPolicy(job).slippageBps ?? 100;
  const realSwapCandidateAmount =
    mostOverweight && mostUnderweight
      ? getRebalancingExecutionBudget(job, mostOverweight.deviation, mostUnderweight.deviation)
      : null;

  if (
    isRealTradingExecutionEnabled() &&
    mostOverweight &&
    mostUnderweight &&
    !isTemplateAutomationPlaceholder(job.agentId)
  ) {
    const storedAgent = await getStoredAgent(job.agentId);
    if (storedAgent) {
      const realSwapAmount = realSwapCandidateAmount ?? 1;
      await enforceSpendLimits(job, realSwapAmount);

      const swap = await executeTokenSwap({
        agentWalletPrivateKey: storedAgent.agentWalletPrivateKey,
        inputTokenSymbol: mostOverweight.symbol,
        outputTokenSymbol: mostUnderweight.symbol,
        amount: realSwapAmount,
        slippageBps
      });

      return {
        success: true,
        result: `Rebalanced portfolio by swapping ${swap.inputAmount} ${swap.inputTokenSymbol} into ${swap.outputTokenSymbol}. Estimated spend: ${realSwapAmount}.`,
        data: {
          target,
          current,
          driftTolerance,
          requiredTrades,
          estimatedSpend,
          inputTokenSymbol: swap.inputTokenSymbol,
          outputTokenSymbol: swap.outputTokenSymbol,
          realSwapAmount,
          quotedOutputAmount: swap.quotedOutputAmount,
          minimumOutputAmount: swap.minimumOutputAmount,
          executionMode: "real-rebalance-swap"
        },
        txHash: swap.txHash,
        executedAt: new Date().toISOString()
      };
    }
  }

  await enforceSpendLimits(job, estimatedSpend);

  return {
    success: true,
    result: `Rebalance needed: ${requiredTrades.join(" | ")}. Estimated spend: ${estimatedSpend}.`,
    data: {
      target,
      current,
      driftTolerance,
      requiredTrades,
      estimatedSpend,
      executionMode: "policy-guarded-rebalance-plan"
    },
    executedAt: new Date().toISOString()
  };
}

async function executeTemplateAutomation(job: AgentJob, agentType: string): Promise<ExecutionResult> {
  if (agentType === "content") {
    return executeContentAutomation(job);
  }
  if (agentType === "business") {
    return executeBusinessAutomation(job);
  }
  if (agentType === "trading") {
    return executeTradingAutomation(job);
  }
  if (agentType === "farming") {
    return executeFarmingAutomation(job);
  }
  if (agentType === "rebalancing") {
    return executeRebalancingAutomation(job);
  }

  return {
    success: false,
    result: `No automation handler found for agent type: ${agentType}`,
    executedAt: new Date().toISOString()
  };
}

async function executeJob(job: AgentJob) {
  const storedAgent = await getStoredAgent(job.agentId);
  if (!storedAgent) {
    throw new Error("Stored agent not found");
  }

  if (storedAgent.agent.agentType === "scheduling") {
    return executeSchedulingTransfer(job);
  }

  if (isTemplateAutomationPlaceholder(storedAgent.executionCode)) {
    return executeTemplateAutomation(job, storedAgent.agent.agentType);
  }

  return runAgent(job.agentId, job.userConfig);
}

export async function processJob(job: AgentJob) {
  return processJobWithOptions(job);
}

type ProcessJobOptions = {
  preserveStatus?: boolean;
  preserveNextRunAt?: boolean;
};

async function processJobWithOptions(job: AgentJob, options: ProcessJobOptions = {}) {
  const startedAt = new Date();

  try {
    const result = await executeJob(job);
    const executionLogTxHash = await logExecutionOnChain(job, result).catch(() => result.txHash);
    const nextRunAt = addFrequency(startedAt, job.frequency).toISOString();

    await updateAgentJob(job.id, (current) => ({
      ...current,
      status: options.preserveStatus ? current.status : "active",
      nextRunAt: options.preserveNextRunAt ? current.nextRunAt : nextRunAt,
      lastRunAt: startedAt.toISOString(),
      lastResult: result.result,
      lastError: undefined,
      lastExecutionTxHash: executionLogTxHash || result.txHash
    }));

    await appendExecutionLog({
      agentId: job.agentId,
      ownerAddress: job.ownerAddress,
      jobId: job.id,
      success: result.success,
      result: result.result,
      txHash: executionLogTxHash || result.txHash,
      executedAt: result.executedAt
    });

    return {
      jobId: job.id,
      success: true,
      result
    };
  } catch (error) {
    const message = toErrorMessage(error);

    await updateAgentJob(job.id, (current) => ({
      ...current,
      status: "error",
      lastRunAt: startedAt.toISOString(),
      lastError: message
    }));

    await appendExecutionLog({
      agentId: job.agentId,
      ownerAddress: job.ownerAddress,
      jobId: job.id,
      success: false,
      result: message,
      executedAt: startedAt.toISOString()
    });

    return {
      jobId: job.id,
      success: false,
      error: message
    };
  }
}

export async function processJobById(jobId: string) {
  const job = await getAgentJob(jobId);
  if (!job) {
    throw new Error("Automation job not found");
  }

  const preserveStatus = job.status === "paused";
  return processJobWithOptions(job, {
    preserveStatus,
    preserveNextRunAt: preserveStatus
  });
}

export async function processDueJobs(referenceTime = new Date().toISOString()) {
  const dueJobs = await listDueJobs(referenceTime);
  const results = [];

  for (const job of dueJobs) {
    results.push(await processJob(job));
  }

  return results;
}
