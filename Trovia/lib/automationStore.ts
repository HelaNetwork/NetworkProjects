import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getSupabaseAdminClient, isSupabaseAutomationStoreEnabled } from "./supabaseAdmin";
import type { AgentJob, ExecutionLogRecord, StoredAgent } from "../types/agent";

type StoreShape = {
  agents: StoredAgent[];
  jobs: AgentJob[];
  executionLogs: ExecutionLogRecord[];
};

type StoredAgentRow = {
  agent_id: string;
  agent: StoredAgent["agent"];
  execution_code: string;
  deployed_at: string;
  developer_address: string;
  agent_wallet_address: string;
  agent_wallet_private_key: string;
  status: StoredAgent["status"];
  created_at?: string;
  updated_at?: string;
};

type AgentJobRow = {
  id: string;
  agent_id: string;
  owner_address: string;
  frequency: AgentJob["frequency"];
  next_run_at: string;
  last_run_at?: string | null;
  status: AgentJob["status"];
  user_config: AgentJob["userConfig"];
  execution_policy?: AgentJob["executionPolicy"] | null;
  last_result?: string | null;
  last_error?: string | null;
  last_execution_tx_hash?: string | null;
  created_at: string;
  updated_at: string;
};

type ExecutionLogRow = {
  id: string;
  agent_id: string;
  owner_address: string;
  job_id?: string | null;
  success: boolean;
  result: string;
  tx_hash?: string | null;
  executed_at: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "automation-store.json");

function ensureStoreExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(STORE_PATH)) {
    const initial: StoreShape = {
      agents: [],
      jobs: [],
      executionLogs: []
    };
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), "utf8");
  }
}

function readStore(): StoreShape {
  ensureStoreExists();
  const raw = fs.readFileSync(STORE_PATH, "utf8");
  return JSON.parse(raw) as StoreShape;
}

function writeStore(store: StoreShape) {
  ensureStoreExists();
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

function toStoredAgentRow(agentRecord: StoredAgent): StoredAgentRow {
  return {
    agent_id: agentRecord.agentId,
    agent: agentRecord.agent,
    execution_code: agentRecord.executionCode,
    deployed_at: agentRecord.deployedAt,
    developer_address: agentRecord.developerAddress,
    agent_wallet_address: agentRecord.agentWalletAddress,
    agent_wallet_private_key: agentRecord.agentWalletPrivateKey,
    status: agentRecord.status
  };
}

function fromStoredAgentRow(row: StoredAgentRow): StoredAgent {
  return {
    agent: row.agent,
    executionCode: row.execution_code,
    deployedAt: row.deployed_at,
    developerAddress: row.developer_address,
    agentId: row.agent_id,
    agentWalletAddress: row.agent_wallet_address,
    agentWalletPrivateKey: row.agent_wallet_private_key,
    status: row.status
  };
}

function toAgentJobRow(job: AgentJob): AgentJobRow {
  return {
    id: job.id,
    agent_id: job.agentId,
    owner_address: job.ownerAddress,
    frequency: job.frequency,
    next_run_at: job.nextRunAt,
    last_run_at: job.lastRunAt ?? null,
    status: job.status,
    user_config: job.userConfig,
    execution_policy: job.executionPolicy ?? null,
    last_result: job.lastResult ?? null,
    last_error: job.lastError ?? null,
    last_execution_tx_hash: job.lastExecutionTxHash ?? null,
    created_at: job.createdAt,
    updated_at: job.updatedAt
  };
}

function fromAgentJobRow(row: AgentJobRow): AgentJob {
  return {
    id: row.id,
    agentId: row.agent_id,
    ownerAddress: row.owner_address,
    frequency: row.frequency,
    nextRunAt: row.next_run_at,
    lastRunAt: row.last_run_at ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    userConfig: row.user_config || {},
    executionPolicy: row.execution_policy ?? undefined,
    lastResult: row.last_result ?? undefined,
    lastError: row.last_error ?? undefined,
    lastExecutionTxHash: row.last_execution_tx_hash ?? undefined
  };
}

function toExecutionLogRow(record: ExecutionLogRecord): ExecutionLogRow {
  return {
    id: record.id,
    agent_id: record.agentId,
    owner_address: record.ownerAddress,
    job_id: record.jobId ?? null,
    success: record.success,
    result: record.result,
    tx_hash: record.txHash ?? null,
    executed_at: record.executedAt
  };
}

function fromExecutionLogRow(row: ExecutionLogRow): ExecutionLogRecord {
  return {
    id: row.id,
    agentId: row.agent_id,
    ownerAddress: row.owner_address,
    jobId: row.job_id ?? undefined,
    success: row.success,
    result: row.result,
    txHash: row.tx_hash ?? undefined,
    executedAt: row.executed_at
  };
}

async function upsertStoredAgentFile(agentRecord: StoredAgent) {
  const store = readStore();
  const existingIndex = store.agents.findIndex((entry) => entry.agentId === agentRecord.agentId);

  if (existingIndex >= 0) {
    store.agents[existingIndex] = agentRecord;
  } else {
    store.agents.push(agentRecord);
  }

  writeStore(store);
  return agentRecord;
}

async function listStoredAgentsFile() {
  return readStore().agents;
}

async function getStoredAgentFile(agentId: string) {
  return readStore().agents.find((entry) => entry.agentId === agentId) ?? null;
}

async function createAgentJobFile(input: Omit<AgentJob, "id" | "createdAt" | "updatedAt">) {
  const now = new Date().toISOString();
  const job: AgentJob = {
    ...input,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now
  };

  const store = readStore();
  store.jobs.push(job);
  writeStore(store);
  return job;
}

async function listAgentJobsFile() {
  return readStore().jobs;
}

async function listJobsForOwnerFile(ownerAddress: string) {
  return readStore().jobs.filter((job) => job.ownerAddress.toLowerCase() === ownerAddress.toLowerCase());
}

async function getAgentJobFile(jobId: string) {
  return readStore().jobs.find((job) => job.id === jobId) ?? null;
}

async function updateAgentJobFile(jobId: string, updater: (job: AgentJob) => AgentJob) {
  const store = readStore();
  const index = store.jobs.findIndex((job) => job.id === jobId);

  if (index < 0) {
    return null;
  }

  const updated = updater(store.jobs[index]);
  updated.updatedAt = new Date().toISOString();
  store.jobs[index] = updated;
  writeStore(store);
  return updated;
}

async function listDueJobsFile(referenceTime = new Date().toISOString()) {
  const cutoff = new Date(referenceTime).getTime();
  return readStore().jobs.filter((job) => job.status === "active" && new Date(job.nextRunAt).getTime() <= cutoff);
}

async function appendExecutionLogFile(record: Omit<ExecutionLogRecord, "id">) {
  const store = readStore();
  const logRecord: ExecutionLogRecord = {
    ...record,
    id: randomUUID()
  };
  store.executionLogs.push(logRecord);
  writeStore(store);
  return logRecord;
}

async function listExecutionLogsForOwnerFile(ownerAddress: string) {
  return readStore().executionLogs.filter(
    (log) => log.ownerAddress.toLowerCase() === ownerAddress.toLowerCase()
  );
}

async function listExecutionLogsFile() {
  return readStore().executionLogs;
}

async function upsertStoredAgentSupabase(agentRecord: StoredAgent) {
  const supabase = getSupabaseAdminClient();
  const payload = {
    ...toStoredAgentRow(agentRecord),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("stored_agents")
    .upsert(payload, { onConflict: "agent_id" })
    .select()
    .single();

  if (error) {
    throw new Error(`Supabase stored_agents upsert failed: ${error.message}`);
  }

  return fromStoredAgentRow(data as StoredAgentRow);
}

async function listStoredAgentsSupabase() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("stored_agents").select("*").order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Supabase stored_agents list failed: ${error.message}`);
  }

  return (data as StoredAgentRow[]).map(fromStoredAgentRow);
}

async function getStoredAgentSupabase(agentId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("stored_agents")
    .select("*")
    .eq("agent_id", agentId)
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase stored_agents fetch failed: ${error.message}`);
  }

  return data ? fromStoredAgentRow(data as StoredAgentRow) : null;
}

async function createAgentJobSupabase(input: Omit<AgentJob, "id" | "createdAt" | "updatedAt">) {
  const supabase = getSupabaseAdminClient();
  const now = new Date().toISOString();

  const payload = {
    agent_id: input.agentId,
    owner_address: input.ownerAddress,
    frequency: input.frequency,
    next_run_at: input.nextRunAt,
    last_run_at: input.lastRunAt ?? null,
    status: input.status,
    user_config: input.userConfig,
    execution_policy: input.executionPolicy ?? null,
    last_result: input.lastResult ?? null,
    last_error: input.lastError ?? null,
    last_execution_tx_hash: input.lastExecutionTxHash ?? null,
    created_at: now,
    updated_at: now
  };

  const { data, error } = await supabase
    .from("agent_jobs")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(`Supabase agent_jobs create failed: ${error.message}`);
  }

  return fromAgentJobRow(data as AgentJobRow);
}

async function listAgentJobsSupabase() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("agent_jobs").select("*").order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Supabase agent_jobs list failed: ${error.message}`);
  }

  return (data as AgentJobRow[]).map(fromAgentJobRow);
}

async function listJobsForOwnerSupabase(ownerAddress: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("agent_jobs")
    .select("*")
    .eq("owner_address", ownerAddress)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Supabase agent_jobs owner list failed: ${error.message}`);
  }

  return (data as AgentJobRow[]).map(fromAgentJobRow);
}

async function getAgentJobSupabase(jobId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("agent_jobs")
    .select("*")
    .eq("id", jobId)
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase agent_jobs fetch failed: ${error.message}`);
  }

  return data ? fromAgentJobRow(data as AgentJobRow) : null;
}

async function updateAgentJobSupabase(jobId: string, updater: (job: AgentJob) => AgentJob) {
  const current = await getAgentJobSupabase(jobId);
  if (!current) {
    return null;
  }

  const updated = updater(current);
  updated.updatedAt = new Date().toISOString();

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("agent_jobs")
    .update(toAgentJobRow(updated))
    .eq("id", jobId)
    .select()
    .single();

  if (error) {
    throw new Error(`Supabase agent_jobs update failed: ${error.message}`);
  }

  return fromAgentJobRow(data as AgentJobRow);
}

async function listDueJobsSupabase(referenceTime = new Date().toISOString()) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("agent_jobs")
    .select("*")
    .eq("status", "active")
    .lte("next_run_at", referenceTime)
    .order("next_run_at", { ascending: true });

  if (error) {
    throw new Error(`Supabase due jobs query failed: ${error.message}`);
  }

  return (data as AgentJobRow[]).map(fromAgentJobRow);
}

async function appendExecutionLogSupabase(record: Omit<ExecutionLogRecord, "id">) {
  const supabase = getSupabaseAdminClient();
  const payload = {
    agent_id: record.agentId,
    owner_address: record.ownerAddress,
    job_id: record.jobId ?? null,
    success: record.success,
    result: record.result,
    tx_hash: record.txHash ?? null,
    executed_at: record.executedAt
  };

  const { data, error } = await supabase
    .from("execution_logs")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(`Supabase execution_logs insert failed: ${error.message}`);
  }

  return fromExecutionLogRow(data as ExecutionLogRow);
}

async function listExecutionLogsForOwnerSupabase(ownerAddress: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("execution_logs")
    .select("*")
    .eq("owner_address", ownerAddress)
    .order("executed_at", { ascending: false });

  if (error) {
    throw new Error(`Supabase execution_logs owner list failed: ${error.message}`);
  }

  return (data as ExecutionLogRow[]).map(fromExecutionLogRow);
}

async function listExecutionLogsSupabase() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("execution_logs").select("*").order("executed_at", { ascending: false });

  if (error) {
    throw new Error(`Supabase execution_logs list failed: ${error.message}`);
  }

  return (data as ExecutionLogRow[]).map(fromExecutionLogRow);
}

export async function upsertStoredAgent(agentRecord: StoredAgent) {
  return isSupabaseAutomationStoreEnabled()
    ? upsertStoredAgentSupabase(agentRecord)
    : upsertStoredAgentFile(agentRecord);
}

export async function listStoredAgents() {
  return isSupabaseAutomationStoreEnabled() ? listStoredAgentsSupabase() : listStoredAgentsFile();
}

export async function getStoredAgent(agentId: string) {
  return isSupabaseAutomationStoreEnabled() ? getStoredAgentSupabase(agentId) : getStoredAgentFile(agentId);
}

export async function createAgentJob(input: Omit<AgentJob, "id" | "createdAt" | "updatedAt">) {
  return isSupabaseAutomationStoreEnabled() ? createAgentJobSupabase(input) : createAgentJobFile(input);
}

export async function listAgentJobs() {
  return isSupabaseAutomationStoreEnabled() ? listAgentJobsSupabase() : listAgentJobsFile();
}

export async function listJobsForOwner(ownerAddress: string) {
  return isSupabaseAutomationStoreEnabled() ? listJobsForOwnerSupabase(ownerAddress) : listJobsForOwnerFile(ownerAddress);
}

export async function getAgentJob(jobId: string) {
  return isSupabaseAutomationStoreEnabled() ? getAgentJobSupabase(jobId) : getAgentJobFile(jobId);
}

export async function updateAgentJob(jobId: string, updater: (job: AgentJob) => AgentJob) {
  return isSupabaseAutomationStoreEnabled() ? updateAgentJobSupabase(jobId, updater) : updateAgentJobFile(jobId, updater);
}

export async function listDueJobs(referenceTime = new Date().toISOString()) {
  return isSupabaseAutomationStoreEnabled() ? listDueJobsSupabase(referenceTime) : listDueJobsFile(referenceTime);
}

export async function appendExecutionLog(record: Omit<ExecutionLogRecord, "id">) {
  return isSupabaseAutomationStoreEnabled() ? appendExecutionLogSupabase(record) : appendExecutionLogFile(record);
}

export async function listExecutionLogsForOwner(ownerAddress: string) {
  return isSupabaseAutomationStoreEnabled()
    ? listExecutionLogsForOwnerSupabase(ownerAddress)
    : listExecutionLogsForOwnerFile(ownerAddress);
}

export async function listExecutionLogs() {
  return isSupabaseAutomationStoreEnabled() ? listExecutionLogsSupabase() : listExecutionLogsFile();
}
