import { NextResponse } from "next/server";
import { getStoredAgent } from "@/lib/automationStore";
import { fetchAgentById } from "@/lib/contracts";

type RouteContext = {
  params: {
    agentId: string;
  };
};

export async function GET(_req: Request, context: RouteContext) {
  const agentId = context.params.agentId;
  const storedAgent = await getStoredAgent(agentId);
  let automationReady = Boolean(storedAgent);

  if (!automationReady) {
    try {
      await fetchAgentById(Number(agentId));
      automationReady = true;
    } catch {
      automationReady = false;
    }
  }

  return NextResponse.json(
    {
      automationReady,
      storedAgent: storedAgent
        ? {
            agentId: storedAgent.agentId,
            agentWalletAddress: storedAgent.agentWalletAddress,
            status: storedAgent.status,
            deployedAt: storedAgent.deployedAt
          }
        : null
    },
    { status: 200 }
  );
}
