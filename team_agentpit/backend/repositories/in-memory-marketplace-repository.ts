import type {
  AgentRegistration,
  FeedbackRecord,
  FeedbackSummary,
  ExecutionRequest,
  ExecutionResult,
  StrategyProposal,
  VaultFundingSignal,
} from "../../shared/types.js";
import type { MarketplaceRepository } from "./marketplace-repository.js";

export class InMemoryMarketplaceRepository implements MarketplaceRepository {
  private readonly agents = new Map<string, AgentRegistration>();
  private readonly proposals = new Map<string, StrategyProposal>();
  private readonly executions: Array<{ request: ExecutionRequest; result: ExecutionResult & Record<string, unknown> }> =
    [];
  private readonly feedback: FeedbackRecord[] = [];
  private readonly feedbackSummaries = new Map<string, FeedbackSummary>();
  private readonly vaultSignals: VaultFundingSignal[] = [];

  async saveAgent(agent: AgentRegistration) {
    this.agents.set(agent.agentId, agent);
    return agent;
  }

  async getAgent(agentId: string) {
    return this.agents.get(agentId);
  }

  async getAgentByAddress(address: string) {
    return [...this.agents.values()].find((agent) => agent.agentAddress.toLowerCase() === address.toLowerCase());
  }

  async listAgents() {
    return [...this.agents.values()].sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
  }

  async saveProposal(proposal: StrategyProposal) {
    this.proposals.set(proposal.id, proposal);
    return proposal;
  }

  async getProposal(proposalId: string) {
    return this.proposals.get(proposalId);
  }

  async listProposals(vault: string) {
    return [...this.proposals.values()]
      .filter((proposal) => proposal.vault === vault)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async markExecuted(proposalId: string) {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      return undefined;
    }

    const updated = { ...proposal, status: "executed" as const };
    this.proposals.set(proposalId, updated);
    return updated;
  }

  async saveExecution(request: ExecutionRequest, result: ExecutionResult & Record<string, unknown>) {
    this.executions.push({ request, result });
  }

  async saveFeedback(feedback: FeedbackRecord) {
    this.feedback.push(feedback);
  }

  async listFeedback(registryAgentId: string) {
    return this.feedback.filter((entry) => entry.registryAgentId === registryAgentId);
  }

  async saveFeedbackSummary(summary: FeedbackSummary) {
    this.feedbackSummaries.set(summary.registryAgentId, summary);
  }

  async saveVaultSignal(signal: VaultFundingSignal) {
    this.vaultSignals.push(signal);
    return signal;
  }

  async listVaultSignals(filters?: { ownerAddress?: string; vaultAddress?: string }) {
    return this.vaultSignals
      .filter((signal) =>
        (filters?.ownerAddress ? signal.ownerAddress.toLowerCase() === filters.ownerAddress.toLowerCase() : true) &&
        (filters?.vaultAddress ? signal.vaultAddress.toLowerCase() === filters.vaultAddress.toLowerCase() : true),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}
