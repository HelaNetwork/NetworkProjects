import { NextResponse } from "next/server";
import { getAgentJob, updateAgentJob } from "@/lib/automationStore";
import { processJobById } from "@/lib/automation";
import { getStoredAgent } from "@/lib/automationStore";
import { getFundingSnapshot } from "@/lib/automationFunding";

type RouteContext = {
  params: {
    jobId: string;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function GET(_req: Request, context: RouteContext) {
  const job = await getAgentJob(context.params.jobId);

  if (!job) {
    return NextResponse.json({ error: "Automation job not found" }, { status: 404 });
  }

  const storedAgent = await getStoredAgent(job.agentId);
  const funding = await getFundingSnapshot(
    storedAgent?.agentWalletAddress || null,
    job,
    storedAgent?.agent.agentType || null
  );

  return NextResponse.json({ job, ...funding }, { status: 200 });
}

export async function PATCH(req: Request, context: RouteContext) {
  const jobId = context.params.jobId;
  const job = await getAgentJob(jobId);

  if (!job) {
    return NextResponse.json({ error: "Automation job not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    if (!isRecord(body) || typeof body.action !== "string") {
      return NextResponse.json({ error: "action is required" }, { status: 400 });
    }

    const action = body.action.trim().toLowerCase();

    if (action === "pause") {
      const updated = await updateAgentJob(jobId, (current) => ({
        ...current,
        status: "paused",
        lastError: undefined
      }));
      const storedAgent = updated ? await getStoredAgent(updated.agentId) : null;
      const funding = updated
        ? await getFundingSnapshot(storedAgent?.agentWalletAddress || null, updated, storedAgent?.agent.agentType || null)
        : null;
      return NextResponse.json({ job: updated, ...funding }, { status: 200 });
    }

    if (action === "resume") {
      const updated = await updateAgentJob(jobId, (current) => ({
        ...current,
        status: "active",
        nextRunAt: new Date().toISOString(),
        lastError: undefined
      }));
      const storedAgent = updated ? await getStoredAgent(updated.agentId) : null;
      const funding = updated
        ? await getFundingSnapshot(storedAgent?.agentWalletAddress || null, updated, storedAgent?.agent.agentType || null)
        : null;
      return NextResponse.json({ job: updated, ...funding }, { status: 200 });
    }

    if (action === "run_now") {
      const result = await processJobById(jobId);
      const updated = await getAgentJob(jobId);
      const storedAgent = updated ? await getStoredAgent(updated.agentId) : null;
      const funding = updated
        ? await getFundingSnapshot(storedAgent?.agentWalletAddress || null, updated, storedAgent?.agent.agentType || null)
        : null;
      return NextResponse.json(
        {
          job: updated,
          result,
          ...funding
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update automation job"
      },
      { status: 500 }
    );
  }
}
