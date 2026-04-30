import type { Abi } from "viem";
import treasurerVault from "./abis/TreasurerVault.json";
import budgetController from "./abis/BudgetController.json";
import subscriptionManager from "./abis/SubscriptionManager.json";
import strategyExecutor from "./abis/StrategyExecutor.json";
import mockLPPool from "./abis/MockLPPool.json";

export const abis = {
  treasurerVault: treasurerVault as Abi,
  budgetController: budgetController as Abi,
  subscriptionManager: subscriptionManager as Abi,
  strategyExecutor: strategyExecutor as Abi,
  mockLPPool: mockLPPool as Abi,
} as const;

const zero = "0x0000000000000000000000000000000000000000" as const;

function addr(key: string): `0x${string}` | undefined {
  const v = process.env[key];
  if (!v || v === zero) return undefined;
  return v as `0x${string}`;
}

export const addresses = {
  vault: addr("NEXT_PUBLIC_TREASURER_VAULT"),
  budget: addr("NEXT_PUBLIC_BUDGET_CONTROLLER"),
  subscriptions: addr("NEXT_PUBLIC_SUBSCRIPTION_MANAGER"),
  strategy: addr("NEXT_PUBLIC_STRATEGY_EXECUTOR"),
  lpPool: addr("NEXT_PUBLIC_MOCK_LP_POOL"),
};
