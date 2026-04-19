import type {
  Address,
  AgentWalletProof,
  FeedbackRecord,
  FeedbackSummary,
  ReputationRecord,
  StrategyProposal,
} from "../../shared/types.js";
import {
  buildAaveSupplyCalls,
  buildAaveWithdrawCalls,
  executeStrategy,
  getFeedbackSummary,
  getIdentityRecord,
  giveFeedback,
  getContractAddresses,
  getAgentMetadata,
  getErc20Balance,
  getErc20Decimals,
  getRelayerAddress,
  readAllFeedback,
  registerIdentity,
  getScore,
  resolveAgentId,
  setAgentURI,
  getVaultBalance,
  getVaultExecuter,
  hasRelayerSigner,
  isAddress,
  recordSuccess,
  setAgentMetadata,
  setAgentWallet,
  transferAgentTokenOwnership,
  setVaultExecuter,
} from "../../shared/viem-client.js";

export async function registerAgentOnchain(
  agentAddress: Address,
  agentUri?: string,
  metadata?: Record<string, unknown>,
) {
  return registerIdentity(agentAddress, agentUri, metadata);
}

export async function finalizeAgentRegistrationOnchain(
  registryAgentId: string,
  agentUri?: string,
  metadata?: Record<string, unknown>,
) {
  let uriWrite;
  try {
    uriWrite = agentUri ? await setAgentURI(registryAgentId, agentUri) : undefined;
  } catch (error) {
    uriWrite = { status: "skipped" as const, notes: [`setAgentURI not supported: ${error instanceof Error ? error.message : String(error)}`] };
  }
  
  const metadataWrites = metadata
    ? await Promise.all(
        Object.entries(metadata)
          .filter(([, value]) => value !== undefined && value !== null)
          .map(async ([key, value]) => {
            try {
              return await setAgentMetadata(registryAgentId, key, String(value));
            } catch (error) {
              return {
                status: "skipped" as const,
                notes: [
                  `setAgentMetadata failed for '${key}': ${
                    error instanceof Error ? error.message : String(error)
                  }`,
                ],
              };
            }
          }),
      )
    : [];

  return {
    uriWrite,
    metadataWrites,
  };
}

export async function transferAgentTokenOnchain(registryAgentId: string, agentAddress: Address) {
  return transferAgentTokenOwnership(registryAgentId, agentAddress);
}

export async function fetchReputation(agentAddress: Address, registryAgentId?: string): Promise<ReputationRecord> {
  const resolvedRegistryAgentId = await resolveAgentId(agentAddress, registryAgentId);
  return getScore(agentAddress, resolvedRegistryAgentId);
}

export async function fetchAgentMetadata(registryAgentId: string, key: string) {
  return getAgentMetadata(registryAgentId, key);
}

export async function fetchAgentIdentity(agentAddress: Address, registryAgentId?: string) {
  return getIdentityRecord(agentAddress, registryAgentId);
}

export async function writeVerifiedAgentWallet(registryAgentId: string, proof: AgentWalletProof) {
  return setAgentWallet(registryAgentId, proof);
}

export async function submitFeedback(input: {
  registryAgentId: string;
  score: number;
  category: FeedbackRecord["category"];
  comment?: string;
}) {
  return giveFeedback(input);
}

export async function fetchFeedbackSummary(registryAgentId: string): Promise<FeedbackSummary> {
  return getFeedbackSummary(registryAgentId);
}

export async function fetchAllFeedback(registryAgentId: string): Promise<FeedbackRecord[]> {
  return readAllFeedback(registryAgentId);
}

export async function fetchVaultBalance(userAddress: string) {
  if (!isAddress(userAddress)) {
    return 0n;
  }

  return getVaultBalance(userAddress);
}

export async function fetchVaultAssetBalance(vaultAddress: Address, assetAddress: Address) {
  return getErc20Balance(assetAddress, vaultAddress);
}

export async function fetchErc20Decimals(tokenAddress: Address) {
  return getErc20Decimals(tokenAddress);
}

export async function ensureVaultExecuter(vaultAddress: Address) {
  const strategyExecutorAddress = getContractAddresses().strategyExecutor;
  const relayerAddress = getRelayerAddress();
  if (!relayerAddress) {
    return {
      status: "simulated" as const,
      notes: ["RELAYER_PRIVATE_KEY missing, vault executer setup simulated locally."],
    };
  }

  const currentExecuter = await getVaultExecuter(vaultAddress);
  if (currentExecuter.toLowerCase() === strategyExecutorAddress.toLowerCase()) {
    return {
      status: "already-set" as const,
      notes: ["Vault already authorizes the StrategyExecutor contract as executer."],
    };
  }

  return setVaultExecuter(vaultAddress, strategyExecutorAddress);
}

export async function materializeProposalCalls(proposal: StrategyProposal) {
  if (proposal.protocolPlan.protocol !== "aave-v3-supply" && proposal.protocolPlan.protocol !== "aave-v3-withdraw") {
    return {
      amount: 0n,
      calls: proposal.calls,
    };
  }

  if (!isAddress(proposal.vault)) {
    return {
      amount: 0n,
      calls: proposal.calls,
    };
  }

  if (proposal.protocolPlan.protocol === "aave-v3-withdraw") {
    return {
      amount: 0n,
      calls: buildAaveWithdrawCalls({
        vault: proposal.vault,
        poolAddress: proposal.protocolPlan.poolAddress,
        assetAddress: proposal.protocolPlan.assetAddress,
      }),
    };
  }

  const amount = await fetchVaultAssetBalance(proposal.vault, proposal.protocolPlan.assetAddress);
  if (amount <= 0n) {
    throw new Error(
      `Vault ${proposal.vault} has no ${proposal.protocolPlan.assetSymbol} balance available for Aave supply.`,
    );
  }

  return {
    amount,
    calls: buildAaveSupplyCalls({
      vault: proposal.vault,
      poolAddress: proposal.protocolPlan.poolAddress,
      assetAddress: proposal.protocolPlan.assetAddress,
      amount,
      referralCode: proposal.protocolPlan.referralCode,
    }),
  };
}

export async function relayProposalExecution(proposal: StrategyProposal) {
  if (isAddress(proposal.vault)) {
    const expectedExecuter = getContractAddresses().strategyExecutor;
    const currentExecuter = await getVaultExecuter(proposal.vault);

    if (currentExecuter.toLowerCase() !== expectedExecuter.toLowerCase()) {
      throw new Error(
        `Vault executer mismatch for ${proposal.vault}: current ${currentExecuter}, expected ${expectedExecuter}.`,
      );
    }
  }

  const materialized = await materializeProposalCalls(proposal);
  const execution = await executeStrategy({
    ...proposal,
    calls: materialized.calls,
  });
  

  return {
    execution,

    amount: materialized.amount,
  };
}

export function getChainContext() {
  return {
    hasRelayerSigner: hasRelayerSigner(),
    relayerAddress: getRelayerAddress(),
    contracts: getContractAddresses(),
  };
}
