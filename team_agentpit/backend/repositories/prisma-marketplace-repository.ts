import { Prisma } from "@prisma/client";
import type {
  AgentRegistration,
  FeedbackRecord,
  FeedbackSummary,
  ExecutionRequest,
  ExecutionResult,
  StrategyProposal,
  VaultFundingSignal,
} from "../../shared/types.js";
import { getPrismaClient } from "../db/prisma.js";
import type { MarketplaceRepository } from "./marketplace-repository.js";

function asJson(value: unknown) {
  return value as Prisma.InputJsonValue;
}

function toExecutionStatus(status: ExecutionResult["status"]): "relayed" | "simulated" {
  // Prisma enum currently supports only relayed|simulated.
  return status === "failed" ? "simulated" : status;
}

export class PrismaMarketplaceRepository implements MarketplaceRepository {
  private readonly prisma = getPrismaClient();

  private get client() {
    if (!this.prisma) {
      throw new Error("Prisma repository requires DATABASE_URL.");
    }

    return this.prisma;
  }

  async saveAgent(agent: AgentRegistration) {
    await this.client.agent.upsert({
      where: { id: agent.agentId },
      update: {
        type: agent.agentType,
        address: agent.agentAddress,
        registryAgentId: agent.registryAgentId ?? null,
        agentUri: agent.agentUri ?? null,
        identityCid: agent.identityUpload?.cid ?? null,
        identityGatewayUrl: agent.identityUpload?.gatewayUrl ?? null,
        identityUploadSource: agent.identityUpload?.source ?? null,
        identityDocument: asJson(agent.identityDocument ?? null),
        verifiedWallet: agent.verifiedWallet ?? null,
        identityTxHash: agent.identityTxHash ?? null,
        skills: asJson(agent.skills),
        description: agent.description,
        metadata: asJson(agent.metadata ?? null),
        registeredAt: new Date(agent.registeredAt),
      },
      create: {
        id: agent.agentId,
        type: agent.agentType,
        address: agent.agentAddress,
        registryAgentId: agent.registryAgentId ?? null,
        agentUri: agent.agentUri ?? null,
        identityCid: agent.identityUpload?.cid ?? null,
        identityGatewayUrl: agent.identityUpload?.gatewayUrl ?? null,
        identityUploadSource: agent.identityUpload?.source ?? null,
        identityDocument: asJson(agent.identityDocument ?? null),
        verifiedWallet: agent.verifiedWallet ?? null,
        identityTxHash: agent.identityTxHash ?? null,
        skills: asJson(agent.skills),
        description: agent.description,
        metadata: asJson(agent.metadata ?? null),
        registeredAt: new Date(agent.registeredAt),
      },
    });

    return agent;
  }

  async getAgent(agentId: string) {
    const row = await this.client.agent.findUnique({ where: { id: agentId } });
    if (!row) {
      return undefined;
    }

    return mapAgent(row);
  }

  async getAgentByAddress(address: string) {
    const row = await this.client.agent.findFirst({
      where: { address: { equals: address, mode: "insensitive" } },
    });

    return row ? mapAgent(row) : undefined;
  }

  async listAgents() {
    const rows = await this.client.agent.findMany({
      orderBy: { registeredAt: "desc" },
    });

    return rows.map(mapAgent);
  }

  async saveProposal(proposal: StrategyProposal) {
    const inferredAgentType = proposal.proposerAgentId.toLowerCase().includes("user")
      ? "user"
      : "strategy";

    await this.client.agent.upsert({
      where: { id: proposal.proposerAgentId },
      update: {
        address: proposal.proposerAddress,
      },
      create: {
        id: proposal.proposerAgentId,
        type: inferredAgentType,
        address: proposal.proposerAddress,
        skills: asJson([]),
        description: "Auto-created proposer agent record from proposal submission.",
        metadata: asJson({ autoCreated: true, source: "proposal-save" }),
        registeredAt: new Date(proposal.createdAt),
      },
    });

    await this.client.proposal.upsert({
      where: { id: proposal.id },
      update: {
        vault: proposal.vault,
        proposerAgentId: proposal.proposerAgentId,
        proposerAddress: proposal.proposerAddress,
        title: proposal.title,
        summary: proposal.summary,
        rationale: proposal.rationale,
        expectedApyBps: proposal.expectedApyBps,
        riskLevel: proposal.riskLevel,
        marketSnapshot: asJson(proposal.marketSnapshot),
        protocolPlan: asJson(proposal.protocolPlan),
        calls: asJson(proposal.calls),
        status: proposal.status,
        score: proposal.score ?? null,
        createdAt: new Date(proposal.createdAt),
      },
      create: {
        id: proposal.id,
        vault: proposal.vault,
        proposerAgentId: proposal.proposerAgentId,
        proposerAddress: proposal.proposerAddress,
        title: proposal.title,
        summary: proposal.summary,
        rationale: proposal.rationale,
        expectedApyBps: proposal.expectedApyBps,
        riskLevel: proposal.riskLevel,
        marketSnapshot: asJson(proposal.marketSnapshot),
        protocolPlan: asJson(proposal.protocolPlan),
        calls: asJson(proposal.calls),
        status: proposal.status,
        score: proposal.score ?? null,
        createdAt: new Date(proposal.createdAt),
      },
    });

    return proposal;
  }

  async getProposal(proposalId: string) {
    const row = await this.client.proposal.findUnique({ where: { id: proposalId } });
    return row ? mapProposal(row) : undefined;
  }

  async listProposals(vault: string) {
    const rows = await this.client.proposal.findMany({
      where: { vault },
      orderBy: { createdAt: "desc" },
    });

    return rows.map(mapProposal);
  }

  async markExecuted(proposalId: string) {
    const row = await this.client.proposal.update({
      where: { id: proposalId },
      data: { status: "executed" },
    });

    return mapProposal(row);
  }

  async saveExecution(request: ExecutionRequest, result: ExecutionResult & Record<string, unknown>) {
    await this.client.execution.create({
      data: {
        proposalId: request.proposalId,
        vault: request.vault,
        userAgentId: request.userAgentId,
        approval: asJson(request.approval),
        status: toExecutionStatus(result.status),
        txHash: result.txHash,
        executionMode: result.executionMode,
        amountDeployed: typeof result.amountDeployed === "string" ? result.amountDeployed : null,
        notes: asJson(result.notes ?? []),
        relayNotes: asJson((result.relayNotes as unknown[] | undefined) ?? null),
      },
    });
  }

  async saveFeedback(feedback: FeedbackRecord) {
    await this.client.feedback.create({
      data: {
        registryAgentId: feedback.registryAgentId,
        reviewerAddress: feedback.reviewer ?? null,
        score: feedback.score,
        category: feedback.category,
        comment: feedback.comment ?? null,
        txHash: feedback.txHash ?? null,
        source: feedback.source,
        createdAt: new Date(feedback.createdAt),
      },
    });
  }

  async listFeedback(registryAgentId: string) {
    const rows = await this.client.feedback.findMany({
      where: { registryAgentId },
      orderBy: { createdAt: "desc" },
    });

    return rows.map((row) => ({
      registryAgentId: row.registryAgentId,
      reviewer: (row.reviewerAddress as `0x${string}` | null) ?? undefined,
      score: row.score,
      category: row.category as FeedbackRecord["category"],
      comment: row.comment ?? undefined,
      txHash: (row.txHash as `0x${string}` | null) ?? undefined,
      createdAt: row.createdAt.toISOString(),
      source: row.source as FeedbackRecord["source"],
    }));
  }

  async saveFeedbackSummary(_summary: FeedbackSummary) {
    return;
  }

  async saveVaultSignal(signal: VaultFundingSignal) {
    await this.client.vaultSignal.create({
      data: {
        id: signal.id,
        ownerAddress: signal.ownerAddress,
        vaultAddress: signal.vaultAddress,
        assetAddress: signal.assetAddress,
        assetSymbol: signal.assetSymbol,
        fundedAmount: signal.fundedAmount,
        status: signal.status,
        userAgentId: signal.userAgentId,
        chain: signal.chain,
        notes: signal.notes ?? null,
        createdAt: new Date(signal.createdAt),
      },
    });

    return signal;
  }

  async listVaultSignals(filters?: { ownerAddress?: string; vaultAddress?: string }) {
    const rows = await this.client.vaultSignal.findMany({
      where: {
        ...(filters?.ownerAddress
          ? { ownerAddress: { equals: filters.ownerAddress, mode: "insensitive" } }
          : {}),
        ...(filters?.vaultAddress
          ? { vaultAddress: { equals: filters.vaultAddress, mode: "insensitive" } }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return rows.map((row) => ({
      id: row.id,
      ownerAddress: row.ownerAddress as `0x${string}`,
      vaultAddress: row.vaultAddress as `0x${string}`,
      assetAddress: row.assetAddress as `0x${string}`,
      assetSymbol: row.assetSymbol,
      fundedAmount: row.fundedAmount,
      status: row.status as VaultFundingSignal["status"],
      userAgentId: row.userAgentId,
      chain: row.chain as VaultFundingSignal["chain"],
      notes: row.notes ?? undefined,
      createdAt: row.createdAt.toISOString(),
    }));
  }
}

function mapAgent(row: {
  id: string;
  type: "strategy" | "user";
  address: string;
  registryAgentId: string | null;
  agentUri: string | null;
  identityCid: string | null;
  identityGatewayUrl: string | null;
  identityUploadSource: string | null;
  identityDocument: Prisma.JsonValue;
  verifiedWallet: string | null;
  identityTxHash: string | null;
  skills: Prisma.JsonValue;
  description: string;
  metadata: Prisma.JsonValue;
  registeredAt: Date;
}): AgentRegistration {
  return {
    agentId: row.id,
    agentType: row.type,
    agentAddress: row.address as `0x${string}`,
    registryAgentId: row.registryAgentId ?? undefined,
    agentUri: row.agentUri ?? undefined,
    identityUpload:
      row.identityCid || row.identityGatewayUrl
        ? {
            cid: row.identityCid ?? "",
            gatewayUrl: row.identityGatewayUrl ?? undefined,
            uri: row.agentUri ?? "",
            source:
              row.identityUploadSource === "generic-ipfs"
                ? "generic-ipfs"
                : row.identityUploadSource === "mock"
                  ? "mock"
                  : "pinata",
          }
        : undefined,
    identityDocument:
      (row.identityDocument as AgentRegistration["identityDocument"] | null) ?? undefined,
    verifiedWallet: (row.verifiedWallet as `0x${string}` | null) ?? undefined,
    identityTxHash: (row.identityTxHash as `0x${string}` | null) ?? undefined,
    skills: row.skills as string[],
    description: row.description,
    registeredAt: row.registeredAt.toISOString(),
    metadata: (row.metadata as Record<string, unknown> | null) ?? undefined,
  };
}

function mapProposal(row: {
  id: string;
  vault: string;
  proposerAgentId: string;
  proposerAddress: string;
  title: string;
  summary: string;
  rationale: string;
  expectedApyBps: number;
  riskLevel: string;
  marketSnapshot: Prisma.JsonValue;
  protocolPlan: Prisma.JsonValue;
  calls: Prisma.JsonValue;
  status: string;
  score: number | null;
  createdAt: Date;
}): StrategyProposal {
  return {
    id: row.id,
    vault: row.vault,
    proposerAgentId: row.proposerAgentId,
    proposerAddress: row.proposerAddress as `0x${string}`,
    title: row.title,
    summary: row.summary,
    rationale: row.rationale,
    expectedApyBps: row.expectedApyBps,
    riskLevel: row.riskLevel as StrategyProposal["riskLevel"],
    marketSnapshot: row.marketSnapshot as unknown as StrategyProposal["marketSnapshot"],
    protocolPlan: row.protocolPlan as unknown as StrategyProposal["protocolPlan"],
    calls: row.calls as unknown as StrategyProposal["calls"],
    createdAt: row.createdAt.toISOString(),
    status: row.status as StrategyProposal["status"],
    score: row.score ?? undefined,
  };
}
