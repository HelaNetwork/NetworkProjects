import { formatUnits } from "ethers";
import { NextResponse } from "next/server";
import { fetchAgentActivationCount, fetchAgentById } from "@/lib/contracts";
import {
  getAgentImage,
  isHiddenAgentName,
  normalizeAgentDescription,
  toAgentTypeLabel
} from "@/lib/agentUi";

type RouteParams = {
  params: {
    id: string;
  };
};

function parseAgentId(raw: string): number | null {
  const normalized = raw.trim();
  if (!/^\d+$/.test(normalized)) {
    return null;
  }

  const parsed = Number(normalized);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

function toPrice(priceWei: bigint): number {
  const parsed = Number(formatUnits(priceWei, 18));
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Number(parsed.toFixed(6));
}

export async function GET(_request: Request, { params }: RouteParams) {
  const parsedId = parseAgentId(params.id);
  if (parsedId === null) {
    return NextResponse.json({ error: "Invalid agent id." }, { status: 400 });
  }

  try {
    const [agent, activeCount] = await Promise.all([
      fetchAgentById(parsedId),
      fetchAgentActivationCount(parsedId).catch(() => 0)
    ]);

    if (isHiddenAgentName(agent.name)) {
      return NextResponse.json({ error: "Agent not found." }, { status: 404 });
    }

    return NextResponse.json(
      {
        agent: {
          id: Number(agent.id),
          name: agent.name,
          description: normalizeAgentDescription(agent.agentType, agent.description),
          agentType: agent.agentType,
          type: toAgentTypeLabel(agent.agentType),
          price: toPrice(agent.priceHLUSD),
          activeCount,
          isLive: agent.isActive,
          image: getAgentImage(agent.agentType),
          configSchema: agent.configSchema,
          developer: agent.developer
        }
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Agent not found." }, { status: 404 });
  }
}
