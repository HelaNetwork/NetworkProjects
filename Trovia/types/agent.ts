/**
 * Shared type contracts for generated agents, deployment snapshots, and execution results.
 * All backend routes and runners should import from this file to keep payload shapes consistent.
 */

export interface AgentField {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "address";
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface AgentObject {
  name: string;
  description: string;
  agentType: "trading" | "farming" | "scheduling" | "rebalancing" | "content" | "business";
  priceHLUSD: number;
  configSchema: { fields: AgentField[] };
  executionLogic: string;
  geminiPrompt: string;
  tags: string[];
  estimatedRuntime: string;
}

export interface StoredAgent {
  agent: AgentObject;
  executionCode: string;
  deployedAt: string;
  developerAddress: string;
  agentId: string;
  agentWalletAddress: string;
  agentWalletPrivateKey: string;
  status: "active" | "paused";
}

export interface ExecutionResult {
  success: boolean;
  result: string;
  data?: Record<string, any>;
  txHash?: string;
  executedAt: string;
}

export type AutomationFrequency = "hourly" | "daily" | "weekly" | "monthly";

export interface AgentJobConfig {
  [key: string]: unknown;
}

export interface ExecutionPolicy {
  autoExecute: boolean;
  maxSpendPerRunHLUSD?: number;
  maxDailySpendHLUSD?: number;
  allowedTokens?: string[];
  allowedProtocols?: string[];
  slippageBps?: number;
}

export interface AgentJob {
  id: string;
  agentId: string;
  ownerAddress: string;
  frequency: AutomationFrequency;
  nextRunAt: string;
  lastRunAt?: string;
  status: "active" | "paused" | "error";
  createdAt: string;
  updatedAt: string;
  userConfig: AgentJobConfig;
  executionPolicy?: ExecutionPolicy;
  lastResult?: string;
  lastError?: string;
  lastExecutionTxHash?: string;
}

export interface ExecutionLogRecord {
  id: string;
  agentId: string;
  ownerAddress: string;
  jobId?: string;
  success: boolean;
  result: string;
  txHash?: string;
  executedAt: string;
}
