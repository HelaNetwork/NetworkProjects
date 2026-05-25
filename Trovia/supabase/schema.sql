create extension if not exists pgcrypto;

create table if not exists public.stored_agents (
  agent_id text primary key,
  agent jsonb not null,
  execution_code text not null,
  deployed_at timestamptz not null,
  developer_address text not null,
  agent_wallet_address text not null unique,
  agent_wallet_private_key text not null,
  status text not null check (status in ('active', 'paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_jobs (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null references public.stored_agents(agent_id) on delete cascade,
  owner_address text not null,
  frequency text not null check (frequency in ('hourly', 'daily', 'weekly', 'monthly')),
  next_run_at timestamptz not null,
  last_run_at timestamptz,
  status text not null check (status in ('active', 'paused', 'error')),
  user_config jsonb not null default '{}'::jsonb,
  execution_policy jsonb,
  last_result text,
  last_error text,
  last_execution_tx_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_agent_jobs_owner_address on public.agent_jobs(owner_address);
create index if not exists idx_agent_jobs_status_next_run_at on public.agent_jobs(status, next_run_at);
create index if not exists idx_agent_jobs_agent_id on public.agent_jobs(agent_id);

create table if not exists public.execution_logs (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null references public.stored_agents(agent_id) on delete cascade,
  owner_address text not null,
  job_id uuid references public.agent_jobs(id) on delete set null,
  success boolean not null,
  result text not null,
  tx_hash text,
  executed_at timestamptz not null default now()
);

create index if not exists idx_execution_logs_owner_address on public.execution_logs(owner_address);
create index if not exists idx_execution_logs_job_id on public.execution_logs(job_id);
create index if not exists idx_execution_logs_executed_at on public.execution_logs(executed_at desc);

alter table public.stored_agents enable row level security;
alter table public.agent_jobs enable row level security;
alter table public.execution_logs enable row level security;
