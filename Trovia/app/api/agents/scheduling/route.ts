import { randomUUID } from "node:crypto";
import { isAddress } from "ethers";
import { NextResponse } from "next/server";
import { cancelJob, getJob, getJobStatus, scheduleAgent } from "@/lib/cronManager";

type ScheduleFrequency = "minutely" | "hourly" | "daily" | "weekly" | "monthly";
type SchedulingAction = "schedule" | "status" | "cancel";

type ScheduleConfig = {
  userAddress: string;
  recipient: string;
  amount: number;
  token: string;
  frequency: ScheduleFrequency;
};

type RequestBody = {
  action?: string;
  jobId?: string;
  config?: Partial<ScheduleConfig>;
} & Partial<ScheduleConfig>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseAction(raw: unknown): SchedulingAction {
  const action = asString(raw)?.toLowerCase();
  if (action === "status" || action === "cancel" || action === "schedule") {
    return action;
  }
  return "schedule";
}

function parseFrequency(raw: unknown): ScheduleFrequency {
  const frequency = asString(raw)?.toLowerCase();
  if (
    frequency === "minutely" ||
    frequency === "hourly" ||
    frequency === "daily" ||
    frequency === "weekly" ||
    frequency === "monthly"
  ) {
    return frequency;
  }
  return "hourly";
}

function parseScheduleConfig(body: RequestBody): ScheduleConfig {
  const source = isRecord(body.config) ? body.config : body;

  const recipient = asString(source.recipient);
  if (!recipient) {
    throw { statusCode: 400, message: "config.recipient is required." };
  }

  const amount = asFiniteNumber(source.amount);
  if (amount === null || amount <= 0) {
    throw { statusCode: 400, message: "config.amount must be a number greater than 0." };
  }

  const token = asString(source.token) || "ETH";
  const frequency = parseFrequency(source.frequency);

  const rawUserAddress = asString(source.userAddress);
  if (rawUserAddress && !isAddress(rawUserAddress)) {
    throw { statusCode: 400, message: "config.userAddress must be a valid wallet address." };
  }

  return {
    userAddress: rawUserAddress || "0x0000000000000000000000000000000000000000",
    recipient,
    amount,
    token,
    frequency
  };
}

async function handleSchedule(body: RequestBody) {
  const config = parseScheduleConfig(body);
  const jobId = `schedule-${randomUUID()}`;

  console.log(`[SCHEDULING] Creating job ${jobId}`);

  scheduleAgent(
    jobId,
    "scheduling",
    config.userAddress,
    {
      recipient: config.recipient,
      amount: config.amount,
      token: config.token
    },
    config.frequency,
    async (runtimeConfig) => {
      const recipient = asString(runtimeConfig.recipient) || config.recipient;
      const token = asString(runtimeConfig.token) || config.token;
      const amount = asFiniteNumber(runtimeConfig.amount) ?? config.amount;
      const result = `Scheduled transfer simulation: ${amount} ${token} to ${recipient}`;
      console.log(`[SCHEDULING] [JOB ${jobId}] ${result}`);
      return { result };
    }
  );

  const status = getJobStatus(jobId);
  return NextResponse.json(
    {
      jobId,
      nextRun: status?.nextRun ?? null,
      status: status?.isActive ? "active" : "inactive",
      message: `Payment schedule created: ${config.amount} ${config.token} to ${config.recipient} (${config.frequency}).`
    },
    { status: 200 }
  );
}

function handleStatus(body: RequestBody) {
  const jobId = asString(body.jobId);
  if (!jobId) {
    throw { statusCode: 400, message: "jobId is required for status action." };
  }

  const job = getJob(jobId);
  if (!job) {
    return NextResponse.json(
      {
        jobId,
        nextRun: null,
        status: "not_found",
        message: "No schedule found for the provided jobId."
      },
      { status: 404 }
    );
  }

  const status = getJobStatus(jobId);

  return NextResponse.json(
    {
      jobId,
      nextRun: status.nextRun,
      status: status.isActive ? "active" : "inactive",
      message: "Schedule status retrieved successfully."
    },
    { status: 200 }
  );
}

function handleCancel(body: RequestBody) {
  const jobId = asString(body.jobId);
  if (!jobId) {
    throw { statusCode: 400, message: "jobId is required for cancel action." };
  }

  const cancelled = cancelJob(jobId);
  return NextResponse.json(
    {
      jobId,
      nextRun: null,
      status: cancelled ? "cancelled" : "not_found",
      message: cancelled ? "Schedule cancelled successfully." : "No schedule found for the provided jobId."
    },
    { status: cancelled ? 200 : 404 }
  );
}

export async function POST(req: Request) {
  console.log("[SCHEDULING] Received request");

  try {
    const body = (await req.json()) as RequestBody;
    if (!isRecord(body)) {
      throw { statusCode: 400, message: "Request body must be a JSON object." };
    }

    const action = parseAction(body.action);
    if (action === "schedule") {
      return handleSchedule(body);
    }
    if (action === "status") {
      return handleStatus(body);
    }
    return handleCancel(body);
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Malformed JSON body." }, { status: 400 });
    }

    const mapped = error as { statusCode?: number; message?: string };
    const statusCode = mapped.statusCode && mapped.statusCode >= 400 ? mapped.statusCode : 500;
    const message = mapped.message || "Scheduling agent execution failed.";
    console.error(`[SCHEDULING] Error: ${message}`);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
