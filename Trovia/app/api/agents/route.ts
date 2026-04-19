import { formatUnits } from "ethers";
import { NextResponse } from "next/server";
import { fetchAgentActivationCount, fetchAllAgents } from "@/lib/contracts";
import {
  getAgentImage,
  isHiddenAgentName,
  normalizeAgentDescription,
  toAgentTypeLabel
} from "@/lib/agentUi";

type AgentListItem = {
  id: number;
  name: string;
  description: string;
  agentType: string;
  type: string;
  price: number;
  activeCount: number;
  isLive: boolean;
  image: string;
  configSchema: string;
  developer: string;
};

const CANONICAL_AGENT_NAMES: Record<string, string> = {
  trading: "Trading Agent",
  farming: "Farming Agent",
  scheduling: "Scheduling Agent",
  rebalancing: "Portfolio Rebalancing Agent",
  content: "Content Reply Agent",
  business: "Business Assistant Agent"
};

const MARKETPLACE_EXCLUDED_NAME_PATTERNS: RegExp[] = [
  /\bdemo\b/i,
  /\bguided\b/i,
  /\btechnical\b/i,
  /\bbackend\b/i,
  /\bname\s+suggest(?:or|er)?\b/i,
  /\bname\s+creator\b/i,
  /\bbaby\b/i,
  /\bpet\b/i
];

function toPrice(priceWei: bigint): number {
  const parsed = Number(formatUnits(priceWei, 18));
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Number(parsed.toFixed(6));
}

function isMarketplaceExcluded(agent: AgentListItem) {
  return MARKETPLACE_EXCLUDED_NAME_PATTERNS.some((pattern) => pattern.test(agent.name));
}

function getMarketplacePriority(agent: AgentListItem): number {
  const normalizedType = agent.agentType.trim().toLowerCase();
  const canonicalName = CANONICAL_AGENT_NAMES[normalizedType];

  if (canonicalName && agent.name.trim().toLowerCase() === canonicalName.toLowerCase()) {
    return 100;
  }

  return 10;
}

export async function GET() {
  try {
    const agents = await fetchAllAgents();

    const activeCounts = await Promise.all(
      agents.map(async (agent) => {
        try {
          return await fetchAgentActivationCount(Number(agent.id));
        } catch {
          return 0;
        }
      })
    );

    const mappedAgents: AgentListItem[] = agents
      .map((agent, index) => ({
        id: Number(agent.id),
        name: agent.name,
        description: normalizeAgentDescription(agent.agentType, agent.description),
        agentType: agent.agentType,
        type: toAgentTypeLabel(agent.agentType),
        price: toPrice(agent.priceHLUSD),
        activeCount: activeCounts[index] ?? 0,
        isLive: agent.isActive,
        image: getAgentImage(agent.agentType),
        configSchema: agent.configSchema,
        developer: agent.developer
      }))
      .filter((agent) => !isHiddenAgentName(agent.name))
      .filter((agent) => !isMarketplaceExcluded(agent));
    const sortedAgents = [...mappedAgents].sort((left, right) => {
      const priorityDiff = getMarketplacePriority(right) - getMarketplacePriority(left);
      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      if (right.activeCount !== left.activeCount) {
        return right.activeCount - left.activeCount;
      }

      return left.id - right.id;
    });

    return NextResponse.json({ agents: sortedAgents }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch agents." }, { status: 500 });
  }
}
