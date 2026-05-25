import type { ExecutionRequest } from "../../shared/types.js";
import { getBroker } from "../lib/broker-registry.js";
import { getMarketplaceRepository } from "../repositories/index.js";
import { relayProposalExecution } from "./contracts-service.js";

export async function executeProposal(request: ExecutionRequest) {
  const repository = getMarketplaceRepository();
  const proposal = await repository.getProposal(request.proposalId);
  if (!proposal) {
    throw new Error(`Unknown proposal: ${request.proposalId}`);
  }

  if (proposal.vault !== request.vault) {
    throw new Error("Vault mismatch for execution request.");
  }

  const result = await relayProposalExecution(proposal);
  if (result.execution.status !== "failed") {
    await repository.markExecuted(proposal.id);
  }

  const response = {
    ...result.execution,
    amountDeployed: result.amount.toString(),
    approval: request.approval,

  };

  await repository.saveExecution(request, response);
  getBroker()?.broadcast("proposal.executed", response);
  return response;
}
