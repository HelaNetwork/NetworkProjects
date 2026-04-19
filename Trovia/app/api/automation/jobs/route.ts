import { NextResponse } from "next/server";
import { createAgentJob, getStoredAgent, listAgentJobs, listJobsForOwner } from "@/lib/automationStore";
import { getFundingSnapshot } from "@/lib/automationFunding";
import { ensureStoredAgentForAutomation } from "@/lib/automationBootstrap";
import type { AgentJobConfig, AutomationFrequency, ExecutionPolicy } from "@/types/agent";

type CreateJobBody = {
  agentId?: string;
  ownerAddress?: string;
  frequency?: AutomationFrequency;
  nextRunAt?: string;
  userConfig?: AgentJobConfig;
  executionPolicy?: ExecutionPolicy;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidFrequency(value: unknown): value is AutomationFrequency {
  return value === "hourly" || value === "daily" || value === "weekly" || value === "monthly";
}

function normalizeStringList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const normalized = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);

  return normalized.length ? Array.from(new Set(normalized)) : undefined;
}

function normalizeNonNegativeNumber(value: unknown, fieldName: string): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value.trim())
        : Number.NaN;

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${fieldName} must be a non-negative number`);
  }

  return parsed;
}

function validateExecutionPolicy(value: unknown): ExecutionPolicy | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!isRecord(value)) {
    throw new Error("executionPolicy must be an object");
  }

  const autoExecute = value.autoExecute !== false;
  const maxSpendPerRunHLUSD = normalizeNonNegativeNumber(value.maxSpendPerRunHLUSD, "executionPolicy.maxSpendPerRunHLUSD");
  const maxDailySpendHLUSD = normalizeNonNegativeNumber(value.maxDailySpendHLUSD, "executionPolicy.maxDailySpendHLUSD");
  const slippageBps = normalizeNonNegativeNumber(value.slippageBps, "executionPolicy.slippageBps");

  return {
    autoExecute,
    maxSpendPerRunHLUSD,
    maxDailySpendHLUSD,
    slippageBps,
    allowedTokens: normalizeStringList(value.allowedTokens),
    allowedProtocols: normalizeStringList(value.allowedProtocols)
  };
}

function validateCreateBody(body: unknown): CreateJobBody {
  if (!isRecord(body)) {
    throw new Error("Request body must be an object");
  }

  const nextRunAt = typeof body.nextRunAt === "string" && body.nextRunAt.trim()
    ? body.nextRunAt.trim()
    : new Date().toISOString();

  if (typeof body.agentId !== "string" || !body.agentId.trim()) {
    throw new Error("agentId is required");
  }
  if (typeof body.ownerAddress !== "string" || !body.ownerAddress.trim()) {
    throw new Error("ownerAddress is required");
  }
  if (!isValidFrequency(body.frequency)) {
    throw new Error("frequency must be hourly, daily, weekly, or monthly");
  }
  if (!isRecord(body.userConfig)) {
    throw new Error("userConfig must be an object");
  }
  if (Number.isNaN(new Date(nextRunAt).getTime())) {
    throw new Error("nextRunAt must be a valid ISO date");
  }

  return {
    agentId: body.agentId.trim(),
    ownerAddress: body.ownerAddress.trim(),
    frequency: body.frequency,
    nextRunAt,
    userConfig: body.userConfig,
    executionPolicy: validateExecutionPolicy(body.executionPolicy)
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ownerAddress = searchParams.get("ownerAddress");

  const jobs = await Promise.all(
    (await (ownerAddress ? listJobsForOwner(ownerAddress) : listAgentJobs())).map(async (job) => {
      const storedAgent = await getStoredAgent(job.agentId);
      const agentWalletAddress = storedAgent?.agentWalletAddress || null;
      const funding = await getFundingSnapshot(agentWalletAddress, job, storedAgent?.agent.agentType || null);

      return {
        ...job,
        agentWalletAddress,
        ...funding
      };
    })
  );
  return NextResponse.json({ jobs }, { status: 200 });
}

export async function POST(req: Request) {
  try {
    const body = validateCreateBody(await req.json());
    const storedAgent = (await ensureStoredAgentForAutomation(body.agentId!)) || (await getStoredAgent(body.agentId!));

    if (!storedAgent) {
      return NextResponse.json({ error: "Stored agent not found for agentId" }, { status: 404 });
    }

    const job = await createAgentJob({
      agentId: body.agentId!,
      ownerAddress: body.ownerAddress!,
      frequency: body.frequency!,
      nextRunAt: body.nextRunAt!,
      status: "active",
      userConfig: body.userConfig!,
      executionPolicy: body.executionPolicy,
      lastResult: undefined,
      lastError: undefined,
      lastExecutionTxHash: undefined
    });

    const funding = await getFundingSnapshot(storedAgent.agentWalletAddress, job, storedAgent.agent.agentType);

    return NextResponse.json(
      {
        job,
        agentWalletAddress: storedAgent.agentWalletAddress,
        ...funding
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create automation job"
      },
      { status: 400 }
    );
  }
}
