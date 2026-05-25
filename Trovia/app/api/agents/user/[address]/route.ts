import { formatUnits } from "ethers";
import { NextResponse } from "next/server";
import {
  fetchAgentActivationCount,
  fetchActivationEventsForUser,
  fetchAllAgents,
  fetchExecutionEventsForUser,
  fetchUserActiveAgentIds
} from "@/lib/contracts";
import {
  getAgentImage,
  isHiddenAgentName,
  normalizeAgentDescription,
  toAgentTypeLabel
} from "@/lib/agentUi";

type RouteParams = {
  params: {
    address: string;
  };
};

type ActivityItem = {
  id: string;
  kind: "activation" | "execution";
  agentId: number;
  agentName: string;
  action: string;
  details: string;
  timestamp: number;
  txHash: string;
};

type PublishedAgent = {
  id: number;
  name: string;
  description: string;
  type: string;
  agentType: string;
  isLive: boolean;
  image: string;
  price: number;
  developer: string;
  activeCount: number;
};

function isAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function toPrice(priceWei: bigint): number {
  const parsed = Number(formatUnits(priceWei, 18));
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Number(parsed.toFixed(6));
}

function shortenResult(value: string): string {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= 120) {
    return clean;
  }
  return `${clean.slice(0, 117)}...`;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const address = params.address.trim();
  if (!isAddress(address)) {
    return NextResponse.json({ error: "Invalid wallet address." }, { status: 400 });
  }

  try {
    const [allAgents, activeIdsRaw, activationEvents, executionEvents] = await Promise.all([
      fetchAllAgents(),
      fetchUserActiveAgentIds(address).catch(() => []),
      fetchActivationEventsForUser(address).catch(() => []),
      fetchExecutionEventsForUser(address).catch(() => [])
    ]);

    const activeIds =
      activeIdsRaw.length > 0
        ? activeIdsRaw
        : Array.from(new Set(activationEvents.map((event) => event.agentId)));

    const visibleAgents = allAgents.filter((agent) => !isHiddenAgentName(agent.name));
    const agentMap = new Map(visibleAgents.map((agent) => [Number(agent.id), agent]));

    const executionsByAgent = new Map<number, { total: number; lastTimestamp: number | null }>();
    for (const event of executionEvents) {
      const current = executionsByAgent.get(event.agentId);
      if (!current) {
        executionsByAgent.set(event.agentId, { total: 1, lastTimestamp: event.timestamp });
      } else {
        executionsByAgent.set(event.agentId, {
          total: current.total + 1,
          lastTimestamp:
            current.lastTimestamp === null
              ? event.timestamp
              : Math.max(current.lastTimestamp, event.timestamp)
        });
      }
    }

    const activationByAgent = new Map<number, number>();
    for (const event of activationEvents) {
      const existing = activationByAgent.get(event.agentId);
      activationByAgent.set(event.agentId, existing ? Math.max(existing, event.timestamp) : event.timestamp);
    }

    const uniqueActiveIds = Array.from(new Set(activeIds)).sort((left, right) => left - right);

    const publishedVisibleAgents = visibleAgents.filter(
      (agent) => agent.developer.toLowerCase() === address.toLowerCase()
    );
    const publishedActivationCounts = await Promise.all(
      publishedVisibleAgents.map(async (agent) => {
        try {
          return await fetchAgentActivationCount(Number(agent.id));
        } catch {
          return 0;
        }
      })
    );

    const activeAgents = uniqueActiveIds
      .map((agentId) => {
        const agent = agentMap.get(agentId);
        if (!agent) {
          return null;
        }

        const executionSummary = executionsByAgent.get(agentId);
        const activatedAt = activationByAgent.get(agentId) ?? null;

        return {
          id: agentId,
          name: agent.name,
          description: normalizeAgentDescription(agent.agentType, agent.description),
          type: toAgentTypeLabel(agent.agentType),
          agentType: agent.agentType,
          isLive: agent.isActive,
          image: getAgentImage(agent.agentType),
          price: toPrice(agent.priceHLUSD),
          activatedAt,
          lastExecutionAt: executionSummary?.lastTimestamp ?? null,
          executions: executionSummary?.total ?? 0
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    const publishedAgents: PublishedAgent[] = visibleAgents
      .filter((agent) => agent.developer.toLowerCase() === address.toLowerCase())
      .map((agent, index) => ({
        id: Number(agent.id),
        name: agent.name,
        description: normalizeAgentDescription(agent.agentType, agent.description),
        type: toAgentTypeLabel(agent.agentType),
        agentType: agent.agentType,
        isLive: agent.isActive,
        image: getAgentImage(agent.agentType),
        price: toPrice(agent.priceHLUSD),
        developer: agent.developer,
        activeCount: publishedActivationCounts[index] || 0
      }))
      .sort((left, right) => left.id - right.id);

    const activationActivity: ActivityItem[] = activationEvents
      .map((event) => {
        const agent = agentMap.get(event.agentId);
        if (!agent) {
          return null;
        }

        return {
          id: `activation-${event.txHash}-${event.activationId}`,
          kind: "activation",
          agentId: event.agentId,
          agentName: agent.name,
          action: "Activation completed",
          details: shortenResult(event.config),
          timestamp: event.timestamp,
          txHash: event.txHash
        } as ActivityItem;
      })
      .filter((item): item is ActivityItem => item !== null);

    const executionActivity: ActivityItem[] = executionEvents
      .map((event) => {
        const agent = agentMap.get(event.agentId);
        if (!agent) {
          return null;
        }

        return {
          id: `execution-${event.txHash}-${event.agentId}`,
          kind: "execution",
          agentId: event.agentId,
          agentName: agent.name,
          action: event.action || "Execution logged",
          details: shortenResult(event.result),
          timestamp: event.timestamp,
          txHash: event.txHash
        } as ActivityItem;
      })
      .filter((item): item is ActivityItem => item !== null);

    const activity = [...activationActivity, ...executionActivity]
      .sort((left, right) => right.timestamp - left.timestamp)
      .slice(0, 50);

    return NextResponse.json(
      {
        walletAddress: address,
        activeAgents,
        publishedAgents,
        activity
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Failed to load dashboard data." }, { status: 500 });
  }
}
