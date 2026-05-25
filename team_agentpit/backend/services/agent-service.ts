import type { Address, AgentRegistration, AgentWalletProof } from "../../shared/types.js";
import { getBroker } from "../lib/broker-registry.js";
import { getMarketplaceRepository } from "../repositories/index.js";
import {
  finalizeAgentRegistrationOnchain,
  registerAgentOnchain,
  transferAgentTokenOnchain,
  writeVerifiedAgentWallet,
} from "./contracts-service.js";
import { buildAgentIdentityDocument, publishIdentityDocument } from "./ipfs-service.js";

export async function registerAgent(input: Omit<AgentRegistration, "registeredAt">) {
  const registeredAt = new Date().toISOString();
  const registrationStart = await registerAgentOnchain(
    input.agentAddress as Address,
    input.agentUri,
    input.metadata,
  );

  // Persist a minimal offchain registration immediately after onchain mint.
  const baseRegistration: AgentRegistration = {
    ...input,
    registeredAt,
    registryAgentId: registrationStart.registryAgentId,
    identityTxHash: registrationStart.txHash,
    agentUri: input.agentUri,
  };

  await getMarketplaceRepository().saveAgent(baseRegistration);

  let registration: AgentRegistration = baseRegistration;
  let registrationFinalize: Record<string, unknown>;

  try {
    const identityDocument = buildAgentIdentityDocument({
      ...input,
      registryAgentId: registrationStart.registryAgentId,
      registeredAt,
    });
    const identityUpload = await publishIdentityDocument(identityDocument);

    registrationFinalize = await finalizeAgentRegistrationOnchain(
      registrationStart.registryAgentId,
      input.agentUri ?? identityUpload.uri,
      input.metadata,
    );

    registration = {
      ...baseRegistration,
      agentUri: input.agentUri ?? identityUpload.uri,
      identityDocument,
      identityUpload,
    };

    await getMarketplaceRepository().saveAgent(registration);
  } catch (error) {
    registrationFinalize = {
      status: "skipped",
      notes: [
        `Registration finalized partially: ${error instanceof Error ? error.message : String(error)}`,
      ],
    };
  }

  const onchain = {
    ...registrationStart,
    ...registrationFinalize,
  };

  getBroker()?.broadcast("agent.registered", { registration, onchain });

  return {
    registration,
    onchain,
  };
}

export async function transferAgentTokenService(input: {
  agentId: string;
  registryAgentId: string;
  agentAddress: Address;
}) {
  const ownershipTransfer = await transferAgentTokenOnchain(input.registryAgentId, input.agentAddress);
  const repository = getMarketplaceRepository();
  const existing = await repository.getAgent(input.agentId);

  if (existing) {
    await repository.saveAgent({
      ...existing,
      agentAddress: input.agentAddress,
      registryAgentId: input.registryAgentId,
    });
  }

  const result = {
    agentId: input.agentId,
    registryAgentId: input.registryAgentId,
    agentAddress: input.agentAddress,
    ownershipTransfer,
  };

  getBroker()?.broadcast("agent.token_transferred", result);

  return result;
}

export async function setAgentWalletService(input: {
  agentId: string;
  registryAgentId: string;
  proof: AgentWalletProof;
}) {
  const walletWrite = await writeVerifiedAgentWallet(input.registryAgentId, input.proof);
  const repository = getMarketplaceRepository();
  const existing = await repository.getAgent(input.agentId);
  if (existing) {
    await repository.saveAgent({
      ...existing,
      verifiedWallet: input.proof.wallet,
    });
  }

  getBroker()?.broadcast("agent.wallet_set", {
    agentId: input.agentId,
    registryAgentId: input.registryAgentId,
    wallet: input.proof.wallet,
    walletWrite,
  });

  return {
    agentId: input.agentId,
    registryAgentId: input.registryAgentId,
    wallet: input.proof.wallet,
    walletWrite,
  };
}
