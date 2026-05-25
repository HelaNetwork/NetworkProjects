const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const DEFAULT_API_BASE_URL = "http://localhost:3001";
let warnedMissingApiUrl = false;

export type RiskLevel = "low" | "medium" | "high";

export interface AgentIdentityResponse {
  agentAddress: string;
  registryAgentId?: string;
  agentUri?: string;
  name?: string;
  description?: string;
  skills?: string[];
  verifiedWallet?: string;
  metadata?: Record<string, unknown>;
  identityDocument?: {
    name?: string;
    description?: string;
    skills?: string[];
  };
}

export interface VaultBalanceResponse {
  vault: string;
  balance: string;
  assetAddress?: string;
  decimals?: number;
}

export interface VaultSignalResponse {
  id: string;
  ownerAddress: string;
  vaultAddress: string;
  assetAddress: string;
  assetSymbol: string;
  fundedAmount: string;
  status: "vault-created" | "vault-funded" | "ready-for-strategy";
  userAgentId: string;
  chain: string;
  notes?: string;
  createdAt: string;
}

export interface ProposalResponse {
  id: string;
  vault: string;
  proposerAgentId: string;
  proposerAddress: string;
  title: string;
  summary: string;
  rationale: string;
  expectedApyBps: number;
  riskLevel: RiskLevel;
  marketSnapshot: {
    protocol: string;
    pair: string;
    supplyAprBps: number;
    borrowAprBps: number;
    utilizationBps: number;
    confidence: number;
    source: string;
    timestamp: string;
  };
  protocolPlan: {
    protocol: string;
    chain: string;
    poolAddress: string;
    assetAddress: string;
    assetSymbol: string;
    amountMode: string;
    referralCode: number;
  };
  calls: Array<{
    target: string;
    data: string;
    value: string;
    note?: string;
  }>;
  createdAt: string;
  status: "pending" | "executed" | "rejected";
  score?: number;
}

export interface ProposalsListResponse {
  proposals: ProposalResponse[];
}

export interface ReputationResponse {
  agentAddress: string;
  registryAgentId?: string;
  score: string;
  tier: "rookie" | "trusted" | "elite";
  source: "onchain" | "mock";
}

export interface FeedbackSummaryResponse {
  registryAgentId: string;
  averageScore: number;
  totalFeedback: number;
  positiveFeedback: number;
  negativeFeedback: number;
  source: "onchain" | "mock";
}

export interface AgentDirectoryEntry {
  agentId: string;
  agentType: "strategy" | "user";
  agentAddress: string;
  registryAgentId?: string;
  agentUri?: string;
  verifiedWallet?: string;
  skills: string[];
  description?: string;
  name?: string;
  metadata?: Record<string, unknown>;
  identityDocument?: Record<string, unknown>;
  identityUpload?: {
    uri: string;
    gatewayUrl?: string;
    cid: string;
    source: "pinata" | "generic-ipfs" | "mock";
  };
  registeredAt: string;
  reputation: ReputationResponse;
}

export interface AgentDirectoryResponse {
  agents: AgentDirectoryEntry[];
}

function getApiBaseUrl() {
  if (API_BASE_URL) {
    return API_BASE_URL;
  }

  if (typeof window !== "undefined" && !warnedMissingApiUrl) {
    console.warn(
      `NEXT_PUBLIC_API_URL is not configured. Falling back to ${DEFAULT_API_BASE_URL}.`,
    );
    warnedMissingApiUrl = true;
  }

  return DEFAULT_API_BASE_URL;
}

function buildUrl(path: string, query?: Record<string, string | undefined>) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(normalizedPath, getApiBaseUrl());

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, value);
      }
    });
  }

  return url.toString();
}

async function parseJsonSafe(response: Response) {
  const text = await response.text();
  return text ? (JSON.parse(text) as unknown) : {};
}

async function requestJson<T>(
  path: string,
  options?: RequestInit,
  query?: Record<string, string | undefined>,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
      },
    });
  } catch (error) {
    throw new Error(
      `Unable to reach backend at ${getApiBaseUrl()}. Ensure backend is running and API URL is correct.`,
    );
  }
  const data = await parseJsonSafe(response);

  if (!response.ok) {
    const errorMessage =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as { error?: unknown }).error === "string"
        ? (data as { error: string }).error
        : `Request failed with status ${response.status}`;

    throw new Error(errorMessage);
  }

  return data as T;
}

async function requestWithFallback<T>(
  paths: string[],
  options?: RequestInit,
  query?: Record<string, string | undefined>,
): Promise<T> {
  let lastError: unknown;

  for (const path of paths) {
    try {
      return await requestJson<T>(path, options, query);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("All endpoint attempts failed.");
}

export const api = {
  async getAgentIdentity(agent: string) {
    try {
      return await requestWithFallback<AgentIdentityResponse>([
        `/agents/${agent}/identity`,
        `/agent-identity/${agent}`,
      ]);
    } catch (error) {
      return {
        agentAddress: agent,
      };
    }
  },

  async getAgentMetadata(registryAgentId: string, key: string) {
    try {
      return await requestJson<unknown>(`/agents/${registryAgentId}/metadata`, undefined, { key });
    } catch (error) {
      return {};
    }
  },

  async getVaultBalance(vault: string, asset?: string) {
    try {
      return await requestWithFallback<VaultBalanceResponse>(
        [`/vault-balance/${vault}`],
        undefined,
        { asset },
      );
    } catch (error) {
      return {
        vault,
        balance: "0",
        assetAddress: asset,
      };
    }
  },

  async getVaultSignals(filters?: { ownerAddress?: string; vaultAddress?: string }) {
    try {
      return await requestWithFallback<VaultSignalResponse[]>(
        ["/vault-signals"],
        undefined,
        {
          ownerAddress: filters?.ownerAddress,
          vaultAddress: filters?.vaultAddress,
        },
      );
    } catch (error) {
      return [];
    }
  },

  async getProposals(vault: string) {
    try {
      return await requestWithFallback<ProposalsListResponse>([`/proposals/${vault}`]);
    } catch (error) {
      return { proposals: [] };
    }
  },

  async getReputation(agent: string) {
    try {
      return await requestWithFallback<ReputationResponse>([`/reputation/${agent}`]);
    } catch (error) {
      return {
        agentAddress: agent,
        score: "0",
        tier: "rookie",
        source: "mock",
      };
    }
  },

  async getAgentsDirectory() {
    try {
      return await requestWithFallback<AgentDirectoryResponse>(["/agents"]);
    } catch (error) {
      return { agents: [] };
    }
  },

  async getFeedbackSummary(registryAgentId: string) {
    try {
      return await requestWithFallback<FeedbackSummaryResponse>(
        [`/feedback/${registryAgentId}/summary`],
      );
    } catch (error) {
      return {
        registryAgentId,
        averageScore: 0,
        totalFeedback: 0,
        positiveFeedback: 0,
        negativeFeedback: 0,
        source: "mock",
      };
    }
  },
};
