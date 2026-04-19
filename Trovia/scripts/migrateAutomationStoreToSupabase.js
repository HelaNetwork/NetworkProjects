#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const storePath = path.join(process.cwd(), "data", "automation-store.json");

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

function readStore() {
  if (!fs.existsSync(storePath)) {
    throw new Error(`Automation store not found at ${storePath}`);
  }

  return JSON.parse(fs.readFileSync(storePath, "utf8"));
}

function createSupabase() {
  return createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

async function main() {
  const supabase = createSupabase();
  const store = readStore();

  console.log("Migrating automation store to Supabase...");
  console.log(`Agents: ${store.agents.length}`);
  console.log(`Jobs: ${store.jobs.length}`);
  console.log(`Execution logs: ${store.executionLogs.length}`);

  for (const agent of store.agents) {
    const { error } = await supabase.from("stored_agents").upsert(
      {
        agent_id: agent.agentId,
        agent: agent.agent,
        execution_code: agent.executionCode,
        deployed_at: agent.deployedAt,
        developer_address: agent.developerAddress,
        agent_wallet_address: agent.agentWalletAddress,
        agent_wallet_private_key: agent.agentWalletPrivateKey,
        status: agent.status,
        updated_at: new Date().toISOString()
      },
      { onConflict: "agent_id" }
    );

    if (error) {
      throw new Error(`stored_agents upsert failed for ${agent.agentId}: ${error.message}`);
    }
  }

  for (const job of store.jobs) {
    const { error } = await supabase.from("agent_jobs").upsert(
      {
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
      },
      { onConflict: "id" }
    );

    if (error) {
      throw new Error(`agent_jobs upsert failed for ${job.id}: ${error.message}`);
    }
  }

  for (const log of store.executionLogs) {
    const { error } = await supabase.from("execution_logs").upsert(
      {
        id: log.id,
        agent_id: log.agentId,
        owner_address: log.ownerAddress,
        job_id: log.jobId ?? null,
        success: log.success,
        result: log.result,
        tx_hash: log.txHash ?? null,
        executed_at: log.executedAt
      },
      { onConflict: "id" }
    );

    if (error) {
      throw new Error(`execution_logs upsert failed for ${log.id}: ${error.message}`);
    }
  }

  console.log("Supabase migration complete.");
  console.log("Next step:");
  console.log("  set AUTOMATION_STORE_PROVIDER=supabase");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
