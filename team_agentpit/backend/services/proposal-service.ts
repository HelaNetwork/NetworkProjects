import { randomUUID } from "node:crypto";
import type { Address, StrategyProposal } from "../../shared/types.js";
import { getBroker } from "../lib/broker-registry.js";
import { getMarketplaceRepository } from "../repositories/index.js";
import { fetchReputation } from "./contracts-service.js";

export async function createProposal(
  proposalData: Omit<StrategyProposal, "id" | "createdAt" | "status" | "score">,
) {
  const reputation = await fetchReputation(proposalData.proposerAddress as Address);


  const proposal: StrategyProposal = {
    ...proposalData,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    status: "pending",
    score:
      proposalData.expectedApyBps -
      (proposalData.riskLevel === "high" ? 250 : proposalData.riskLevel === "medium" ? 125 : 50),
  };

  await getMarketplaceRepository().saveProposal(proposal);
  getBroker()?.broadcast("proposal.created", proposal);
  return { proposal, reputation };
}

export async function listProposals(vault: string) {
  return getMarketplaceRepository().listProposals(vault);
}

export async function getProposal(proposalId: string) {
  return getMarketplaceRepository().getProposal(proposalId);
}
