import cron from "node-cron";
import type { ScheduledTask } from "node-cron";

export interface CronJob {
  jobId: string;
  agentId: string;
  userAddress: string;
  config: Record<string, any>;
  frequency: "minutely" | "hourly" | "daily" | "weekly" | "monthly";
  nextRun: string;
  lastRun: string | null;
  lastResult: string | null;
  isActive: boolean;
  executionCount: number;
}

const jobRegistry = new Map<string, CronJob>();
const activeCrons = new Map<string, ScheduledTask>();

function mapFrequencyToCronExpression(frequency: CronJob["frequency"]): string {
  if (frequency === "minutely") {
    return "* * * * *";
  }
  if (frequency === "hourly") {
    return "0 * * * *";
  }
  if (frequency === "daily") {
    return "0 9 * * *";
  }
  if (frequency === "weekly") {
    return "0 9 * * 1";
  }
  return "0 9 1 * *";
}

function calculateNextRun(frequency: CronJob["frequency"], from: Date = new Date()): string {
  const next = new Date(from);

  if (frequency === "minutely") {
    next.setMinutes(next.getMinutes() + 1, 0, 0);
    return next.toISOString();
  }

  if (frequency === "hourly") {
    next.setHours(next.getHours() + 1, 0, 0, 0);
    return next.toISOString();
  }

  if (frequency === "daily") {
    next.setDate(next.getDate() + 1);
    next.setHours(9, 0, 0, 0);
    return next.toISOString();
  }

  if (frequency === "weekly") {
    const day = next.getDay();
    const offset = day === 1 ? 7 : (8 - day) % 7;
    next.setDate(next.getDate() + offset);
    next.setHours(9, 0, 0, 0);
    return next.toISOString();
  }

  next.setMonth(next.getMonth() + 1, 1);
  next.setHours(9, 0, 0, 0);
  return next.toISOString();
}

function cloneJob(job: CronJob): CronJob {
  return {
    ...job,
    config: { ...job.config }
  };
}

export function scheduleAgent(
  jobId: string,
  agentId: string,
  userAddress: string,
  config: Record<string, any>,
  frequency: CronJob["frequency"],
  onExecute: (config: Record<string, any>) => Promise<{ result: string }>
): CronJob {
  const expression = mapFrequencyToCronExpression(frequency);

  if (activeCrons.has(jobId)) {
    cancelJob(jobId);
  }

  const initialJob: CronJob = {
    jobId,
    agentId,
    userAddress,
    config: { ...config },
    frequency,
    nextRun: calculateNextRun(frequency),
    lastRun: null,
    lastResult: null,
    isActive: true,
    executionCount: 0
  };

  jobRegistry.set(jobId, initialJob);

  const task = cron.schedule(expression, async () => {
    const current = jobRegistry.get(jobId);
    if (!current || !current.isActive) {
      return;
    }

    current.lastRun = new Date().toISOString();

    try {
      console.log(`[CRON] Executing job ${jobId} (${agentId})`);
      const execution = await onExecute({ ...current.config });
      current.lastResult = execution.result;
      current.executionCount += 1;
      current.nextRun = calculateNextRun(current.frequency);
      console.log(`[CRON] Job ${jobId} completed (${current.executionCount} runs)`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown execution error";
      current.lastResult = `ERROR: ${message}`;
      current.executionCount += 1;
      current.nextRun = calculateNextRun(current.frequency);
      console.log(`[CRON] Job ${jobId} failed: ${message}`);
    }

    jobRegistry.set(jobId, current);
  });

  activeCrons.set(jobId, task);
  console.log(`[CRON] Scheduled ${jobId} (${agentId}) with ${frequency} cadence`);
  return cloneJob(initialJob);
}

export function cancelJob(jobId: string): boolean {
  const task = activeCrons.get(jobId);
  if (!task) {
    return false;
  }

  task.stop();
  task.destroy();
  activeCrons.delete(jobId);

  const existing = jobRegistry.get(jobId);
  if (existing) {
    existing.isActive = false;
    existing.nextRun = "";
    jobRegistry.set(jobId, existing);
  }

  console.log(`[CRON] Cancelled job ${jobId}`);
  return true;
}

export function getJob(jobId: string): CronJob | undefined {
  const job = jobRegistry.get(jobId);
  return job ? cloneJob(job) : undefined;
}

export function getUserJobs(userAddress: string): CronJob[] {
  const normalized = userAddress.trim().toLowerCase();
  return Array.from(jobRegistry.values())
    .filter((job) => job.userAddress.trim().toLowerCase() === normalized)
    .map((job) => cloneJob(job));
}

export function getJobStatus(jobId: string): {
  isActive: boolean;
  nextRun: string;
  lastRun: string | null;
  lastResult: string | null;
  executionCount: number;
} {
  const job = jobRegistry.get(jobId);
  if (!job) {
    return {
      isActive: false,
      nextRun: "",
      lastRun: null,
      lastResult: null,
      executionCount: 0
    };
  }

  return {
    isActive: job.isActive,
    nextRun: job.nextRun,
    lastRun: job.lastRun,
    lastResult: job.lastResult,
    executionCount: job.executionCount
  };
}
