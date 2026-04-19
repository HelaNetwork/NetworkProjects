export type Address = `0x${string}`;

export type ReputationTier = "rookie" | "trusted" | "elite";
export type StrategyProtocol = "aave-v3-supply" | "aave-v3-withdraw";
export type FeedbackCategory = "strategy" | "execution" | "trust" | "general";

export interface AgentIdentityProfile {
  name?: string;
  image?: string;
  website?: string;
  contact?: string;
  tags?: string[];
  links?: Record<string, string>;
}

export interface AgentIdentityDocument {
  schema: "delegent-agent-identity/v1";
  registryAgentId: string;
  agentId: string;
  agentType: "strategy" | "user";
  agentAddress: Address;
  verifiedWallet?: Address;
  name: string;
  description: string;
  skills: string[];
  metadata?: Record<string, unknown>;
  profile?: AgentIdentityProfile;
  capabilities: {
    mcpTools: string[];
    executionStyle: "propose" | "evaluate-execute";
    supportedProtocols: string[];
    preferredAssets: string[];
  };
  chainContext: {
    chain: "base-sepolia";
    identityRegistry?: Address;
    reputationRegistry?: Address;
  };
  createdAt: string;
}

export interface IdentityUploadRecord {
  uri: string;
  gatewayUrl?: string;
  cid: string;
  source: "pinata" | "generic-ipfs" | "mock";
}

export interface AgentWalletProof {
  wallet: Address;
  deadline: bigint;
  signature: `0x${string}`;
}

export interface ProtocolPlan {
  protocol: StrategyProtocol;
  chain: "base-sepolia";
  poolAddress: Address;
  assetAddress: Address;
  assetSymbol: string;
  amountMode: "all";
  referralCode: number;
}

export interface AgentRegistration {
  agentId: string;
  agentType: "strategy" | "user";
  agentAddress: Address;
  skills: string[];
  description: string;
  registeredAt: string;
  registryAgentId?: string;
  agentUri?: string;
  verifiedWallet?: Address;
  identityTxHash?: `0x${string}`;
  identityProfile?: AgentIdentityProfile;
  identityDocument?: AgentIdentityDocument;
  identityUpload?: IdentityUploadRecord;
  metadata?: Record<string, unknown>;
}

export interface AgentIdentityRecord {
  agentAddress: Address;
  registryAgentId: string;
  agentUri?: string;
  verifiedWallet?: Address;
  metadata?: Record<string, unknown>;
  identityDocument?: AgentIdentityDocument;
  identityUpload?: IdentityUploadRecord;
  registrationTxHash?: `0x${string}`;
  uriTxHash?: `0x${string}`;
  walletTxHash?: `0x${string}`;
  source: "onchain" | "mock";
}

export interface StrategyCall {
  target: Address;
  data: `0x${string}`;
  value: string;
  note?: string;
}

export interface StrategyProposal {
  id: string;
  vault: string;
  proposerAgentId: string;
  proposerAddress: Address;
  title: string;
  summary: string;
  rationale: string;
  expectedApyBps: number;
  riskLevel: "low" | "medium" | "high";
  marketSnapshot: MarketSnapshot;
  protocolPlan: ProtocolPlan;
  calls: StrategyCall[];
  createdAt: string;
  status: "pending" | "executed" | "rejected";
  score?: number;
}

export interface MarketSnapshot {
  protocol: string;
  pair: string;
  supplyAprBps: number;
  borrowAprBps: number;
  utilizationBps: number;
  confidence: number;
  source: "mock-feed";
  timestamp: string;
}

export interface ExecutionApproval {
  vault: string;
  proposalId: string;
  signer: Address;
  nonce: bigint;
  deadline: bigint;
  signature: `0x${string}`;
}

export interface ExecutionRequest {
  vault: string;
  proposalId: string;
  userAgentId: string;
  approval: ExecutionApproval;
}

export interface ExecutionResult {
  proposalId: string;
  vault: string;
  status: "relayed" | "simulated" | "failed";
  txHash: `0x${string}`;
  executionMode: "strategy-executor" | "vault-delegateexecute-fallback" | "mock";
  amountDeployed?: string;
  reputationAfter?: bigint;
  notes: string[];
}

export interface ReputationRecord {
  agentAddress: Address;
  registryAgentId?: string;
  score: bigint;
  tier: ReputationTier;
  source: "onchain" | "mock";
}

export interface FeedbackRecord {
  registryAgentId: string;
  reviewer?: Address;
  score: number;
  category: FeedbackCategory;
  comment?: string;
  txHash?: `0x${string}`;
  createdAt: string;
  source: "onchain" | "mock";
}

export interface FeedbackSummary {
  registryAgentId: string;
  averageScore: number;
  totalFeedback: number;
  positiveFeedback: number;
  negativeFeedback: number;
  source: "onchain" | "mock";
}

export interface VaultFundingSignal {
  id: string;
  ownerAddress: Address;
  vaultAddress: Address;
  assetAddress: Address;
  assetSymbol: string;
  fundedAmount: string;
  status: "vault-created" | "vault-funded" | "ready-for-strategy";
  userAgentId: string;
  chain: "base-sepolia";
  notes?: string;
  createdAt: string;
}

export interface BackendConfig {
  port: number;
  backendUrl: string;
  mcpPort: number;
  chainId: number;
}

export interface ToolRequest<TArgs = unknown> {
  agentId?: string;
  args: TArgs;
}

export interface ToolResponse<TResult = unknown> {
  ok: boolean;
  tool: string;
  result?: TResult;
  error?: string;
}

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface SkillDefinition {
  name: string;
  description: string;
  tools: string[];
  goals: string[];
  style?: string;
  x402?: {
    network?: `${string}:${string}`;
    signer?: {
      address: `0x${string}`;
      endpoint: string;
      authToken?: string;
    };
  };
}

export interface AgentContextState {
  registered?: boolean;
  identity?: AgentIdentityRecord;
  reputation?: ReputationRecord;
  marketSnapshot?: MarketSnapshot;
  proposal?: StrategyProposal;
  proposals?: StrategyProposal[];
  selectedProposal?: StrategyProposal;
  approval?: ExecutionApproval;
  execution?: ExecutionResult;
  vaultBalance?: bigint;
}
