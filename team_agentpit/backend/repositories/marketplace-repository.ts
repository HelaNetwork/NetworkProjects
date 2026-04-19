import type {
  AgentRegistration,
  FeedbackRecord,
  FeedbackSummary,
  ExecutionRequest,
  ExecutionResult,
  StrategyProposal,
  VaultFundingSignal,
} from "../../shared/types.js";

export interface MarketplaceRepository {
  saveAgent(agent: AgentRegistration): Promise<AgentRegistration>;
  getAgent(agentId: string): Promise<AgentRegistration | undefined>;
  getAgentByAddress(address: string): Promise<AgentRegistration | undefined>;
  listAgents(): Promise<AgentRegistration[]>;
  saveProposal(proposal: StrategyProposal): Promise<StrategyProposal>;
  getProposal(proposalId: string): Promise<StrategyProposal | undefined>;
  listProposals(vault: string): Promise<StrategyProposal[]>;
  markExecuted(proposalId: string): Promise<StrategyProposal | undefined>;
  saveExecution(request: ExecutionRequest, result: ExecutionResult & Record<string, unknown>): Promise<void>;
  saveFeedback(feedback: FeedbackRecord): Promise<void>;
  listFeedback(registryAgentId: string): Promise<FeedbackRecord[]>;
  saveFeedbackSummary(summary: FeedbackSummary): Promise<void>;
  saveVaultSignal(signal: VaultFundingSignal): Promise<VaultFundingSignal>;
  listVaultSignals(filters?: { ownerAddress?: string; vaultAddress?: string }): Promise<VaultFundingSignal[]>;
}
