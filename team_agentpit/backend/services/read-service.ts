import type { Address } from "../../shared/types.js";
import { getMarketplaceRepository } from "../repositories/index.js";
import {
  fetchAgentIdentity,
  fetchAgentMetadata,
  fetchAllFeedback,
  fetchErc20Decimals,
  fetchFeedbackSummary,
  fetchReputation,
  fetchVaultAssetBalance,
  fetchVaultBalance,
  getChainContext,
} from "./contracts-service.js";
import { fetchIdentityDocumentFromUri } from "./ipfs-service.js";

export async function getReputation(agentAddress: Address) {
  const stored = await getMarketplaceRepository().getAgentByAddress(agentAddress);
  return fetchReputation(agentAddress, stored?.registryAgentId);
}

export async function getAgentMetadataByKey(registryAgentId: string, key?: string) {
  if (!key) {
    throw new Error("Metadata query requires ?key=...");
  }

  return fetchAgentMetadata(registryAgentId, key);
}

export async function getAgentIdentity(agent: string) {
  const repository = getMarketplaceRepository();
  const isAddress = /^0x[a-fA-F0-9]{40}$/.test(agent);

  let stored = isAddress
    ? await repository.getAgentByAddress(agent)
    : await repository.getAgent(agent);

  const resolvedAddress = isAddress ? agent : stored?.agentAddress;

  if (!resolvedAddress || !/^0x[a-fA-F0-9]{40}$/.test(resolvedAddress)) {
    throw new Error("Agent must resolve to a valid EVM address via agentId or agentAddress.");
  }

  if (!stored) {
    stored = await repository.getAgentByAddress(resolvedAddress);
  }

  const onchain = await fetchAgentIdentity(resolvedAddress as Address, stored?.registryAgentId);
  const resolvedAgentUri = stored?.agentUri ?? onchain.agentUri;
  const resolvedIdentityDocument =
    stored?.identityDocument ??
    onchain.identityDocument ??
    (await fetchIdentityDocumentFromUri(resolvedAgentUri));
  const normalizedName =
    (resolvedIdentityDocument as { name?: string } | undefined)?.name ??
    stored?.identityProfile?.name ??
    stored?.agentId;
  const normalizedDescription =
    (resolvedIdentityDocument as { description?: string } | undefined)?.description ??
    stored?.description;
  const normalizedSkills =
    (resolvedIdentityDocument as { skills?: string[] } | undefined)?.skills ?? stored?.skills;

  return {
    ...onchain,
    agentUri: resolvedAgentUri,
    verifiedWallet: stored?.verifiedWallet ?? onchain.verifiedWallet,
    metadata: stored?.metadata ?? onchain.metadata,
    identityDocument: resolvedIdentityDocument,
    identityUpload: stored?.identityUpload,
    name: normalizedName,
    description: normalizedDescription,
    skills: normalizedSkills,
  };
}

export async function listAgentsDirectory() {
  const repository = getMarketplaceRepository();
  const agents = await repository.listAgents();

  const enriched = await Promise.all(
    agents.map(async (agent) => {
      const onchainIdentity = await fetchAgentIdentity(agent.agentAddress as Address, agent.registryAgentId);
      const resolvedAgentUri = agent.agentUri ?? onchainIdentity.agentUri;
      const resolvedIdentityDocument =
        agent.identityDocument ??
        onchainIdentity.identityDocument ??
        (await fetchIdentityDocumentFromUri(resolvedAgentUri));
      const reputation = await fetchReputation(agent.agentAddress as Address, agent.registryAgentId);

      return {
        agentId: agent.agentId,
        agentType: agent.agentType,
        agentAddress: agent.agentAddress,
        registryAgentId: agent.registryAgentId,
        agentUri: resolvedAgentUri,
        verifiedWallet: agent.verifiedWallet ?? onchainIdentity.verifiedWallet,
        skills:
          (resolvedIdentityDocument as { skills?: string[] } | undefined)?.skills ??
          agent.skills ??
          [],
        description:
          (resolvedIdentityDocument as { description?: string } | undefined)?.description ??
          agent.description,
        name:
          (resolvedIdentityDocument as { name?: string } | undefined)?.name ??
          agent.identityProfile?.name ??
          agent.agentId,
        metadata: agent.metadata ?? onchainIdentity.metadata,
        identityDocument: resolvedIdentityDocument,
        identityUpload: agent.identityUpload,
        registeredAt: agent.registeredAt,
        reputation,
      };
    }),
  );

  return {
    agents: enriched,
  };
}

export async function getFeedbackSummaryForAgent(registryAgentId: string) {
  const onchain = await fetchFeedbackSummary(registryAgentId);
  if (onchain.source === "onchain" && onchain.totalFeedback > 0) {
    return onchain;
  }

  const feedback = await getMarketplaceRepository().listFeedback(registryAgentId);
  const totalFeedback = feedback.length;
  const positiveFeedback = feedback.filter((entry) => entry.score >= 7).length;
  const negativeFeedback = feedback.filter((entry) => entry.score <= 4).length;
  const averageScore =
    totalFeedback > 0
      ? feedback.reduce((sum, entry) => sum + entry.score, 0) / totalFeedback
      : 0;

  return {
    registryAgentId,
    averageScore,
    totalFeedback,
    positiveFeedback,
    negativeFeedback,
    source: totalFeedback > 0 ? ("mock" as const) : onchain.source,
  };
}

export async function getAllFeedbackForAgent(registryAgentId: string) {
  return fetchAllFeedback(registryAgentId);
}

export async function getVaultBalanceForRequest(vault: string, assetAddress?: string) {
  if (
    assetAddress &&
    /^0x[a-fA-F0-9]{40}$/.test(vault) &&
    /^0x[a-fA-F0-9]{40}$/.test(assetAddress)
  ) {
    const [rawBalance, decimals] = await Promise.all([
      fetchVaultAssetBalance(vault as Address, assetAddress as Address),
      fetchErc20Decimals(assetAddress as Address),
    ]);
    const divisor = 10n ** BigInt(decimals);
    const whole = rawBalance / divisor;
    const fraction = rawBalance % divisor;
    const fractionStr = fraction.toString().padStart(decimals, "0").replace(/0+$/, "");
    const humanBalance = fractionStr ? `${whole}.${fractionStr}` : whole.toString();
    return {
      vault,
      assetAddress,
      decimals,
      balance: humanBalance,
    };
  }

  // VaultFactory.getVaultBalance returns native token balance in wei (18 decimals)
  const rawBalance = await fetchVaultBalance(vault);
  const divisor = 10n ** 18n;
  const whole = rawBalance / divisor;
  const fraction = rawBalance % divisor;
  const fractionStr = fraction.toString().padStart(18, "0").replace(/0+$/, "");
  const humanBalance = fractionStr ? `${whole}.${fractionStr}` : whole.toString();
  return {
    vault,
    balance: humanBalance,
  };
}

export function getHealth() {
  return {
    ok: true,
    service: "delegent-backend",
    chain: getChainContext(),
  };
}
