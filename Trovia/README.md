<h1 align="center">Trovia</h1>

<p align="center">
  <a href="https://youtu.be/4uzBng_q0rs?si=1A37Qr3d-ZDj7O4D" target="_blank" rel="noreferrer">
    <img alt="Trovia Demo Video Preview" src="https://img.youtube.com/vi/4uzBng_q0rs/maxresdefault.jpg" width="720" />
  </a>
</p>

<p align="center">
  <a href="https://youtu.be/4uzBng_q0rs?si=1A37Qr3d-ZDj7O4D">Watch Demo Video</a>
</p>

<p align="center">
  <img width="865" height="473" alt="logotrovia" src="https://github.com/user-attachments/assets/93374861-4c3e-4c1b-83dd-360c4f367806" />
</p>


Trovia is an on-chain AI agent marketplace built on HeLa testnet where developers publish agents, users activate them with HLUSD, and agent usage plus automation can be tracked on-chain.

The platform is designed around a freelancer-friendly flow:
- developers can publish and sell AI agents
- buyers can activate agents with one wallet flow
- agents can run manually or through scheduled automation
- revenue is split between the creator and the platform

## DevClash Submission

- `Track`: Web3
- `Problem Statement`: PS 03 — Agent Marketplace
- `One-line Description`: A freelancer-focused on-chain AI agent marketplace on HeLa where developers publish agents, buyers activate them with HLUSD, and autonomous agent actions are funded, tracked, and executed on-chain.

## Why This Fits PS 03

Trovia directly implements the required Web3 track marketplace brief:

- `Trading Agent`
- `Farming Agent`
- `Scheduling Agent`
- `Portfolio Rebalancing Agent`
- `Content Reply Agent`
- `Business Assistant Agent`

All six required marketplace agents are live in the project, deployed on HeLa, purchasable through the on-chain activation flow, and usable through manual or automated execution paths.

## What Is Live

Trovia currently supports 6 live agent categories:

1. `Trading Agent`
2. `Farming Agent`
3. `Scheduling Agent`
4. `Portfolio Rebalancing Agent`
5. `Content Reply Agent`
6. `Business Assistant Agent`

All 6 have:
- marketplace listing
- detail page
- activation flow
- run/interaction flow
- dashboard visibility

The finance-oriented agents also support real demo execution paths:
- `Scheduling`: real HLUSD transfer
- `Trading`: real swap through demo router
- `Rebalancing`: real rebalance swap
- `Farming`: real deposit into demo farm

## Core Features

- Wallet connection and HeLa network switching
- Marketplace of curated live agents
- Guided and technical publish flows
- AI safety review before publishing
- On-chain activation with HLUSD payment
- 5% platform fee on paid activations
- Agent dashboard with activity and automation jobs
- Funding agent wallets with HLUSD and gas
- Recurring automation worker
- Demo trading router and demo farming vault
- Supabase-backed automation persistence scaffold
- Google Cloud Run deployment scaffold

## AI Tools Used

AI tools were used with review, adaptation, and full understanding by the team.

- `Antigravity` — used for UI ideation and interface direction
- `Stitch` — used to help shape and refine the UI design
- `Claude` — used during backend development and implementation support
- `Codex` — used for backend development, frontend integration, debugging, and deployment setup
- `Google Gemini` — used inside the product for agent generation, business/content flows, and safety review

The team reviewed and adapted AI-assisted outputs rather than treating them as blind copy-paste code.

## Platform Fee

Paid activations now include a platform fee split:

- User pays the full listed activation price
- `95%` goes to the agent developer
- `5%` goes to the Trovia platform treasury

Example:
- `3 HLUSD` activation
- developer receives `2.85 HLUSD`
- Trovia receives `0.15 HLUSD`

This split is enforced in [contracts/AgentEscrow.sol](contracts/AgentEscrow.sol).

## Architecture

```text
Next.js App Router frontend
  -> API routes for agent logic, Gemini, automation, deployment helpers
  -> ethers.js contract integration layer
  -> Solidity contracts on HeLa testnet

Contracts:
  AgentRegistry  -> publishes and reads agents
  AgentEscrow    -> handles activation payments and fee split
  AgentExecutor  -> logs execution activity

Automation:
  agent wallets
  recurring jobs
  funding checks
  worker loop
```

## System Design Summary

Trovia is built as a layered Web3 application:

1. `Frontend`
- Next.js App Router UI for marketplace, agent detail, run pages, publish flow, pricing, and dashboard

2. `Backend/API`
- Next.js API routes for:
  - agent logic
  - generation
  - safety review
  - deployment helpers
  - automation jobs
  - funding and execution control

3. `On-chain Contracts`
- `AgentRegistry` for marketplace listings
- `AgentEscrow` for HLUSD activation payment and 5% platform fee split
- `AgentExecutor` for on-chain execution logging

4. `Automation Layer`
- isolated agent wallets
- recurring job scheduling
- funding readiness checks
- `run now`, `pause`, `resume`
- always-on worker mode

5. `Persistence`
- local JSON store for demo fallback
- Supabase/Postgres migration path for real deployment

## Repo Structure

```text
app/                 Next.js pages and API routes
components/          UI components
contracts/           Solidity contracts
lib/                 Wallet, contract, automation, executor helpers
scripts/             Deploy, seed, verify, worker scripts
test/                Hardhat contract tests
deployments/         Deployment artifacts
data/                Local automation store for demo/runtime state
supabase/            Supabase SQL schema for production persistence
```

## Smart Contracts

### AgentRegistry
Stores published agents:
- name
- description
- agent type
- price in HLUSD
- developer address
- active status
- config schema

### AgentEscrow
Handles activation:
- buyer approves HLUSD
- buyer activates agent
- escrow receives full amount
- 5% platform fee sent to treasury
- 95% sent to developer
- activation is recorded on-chain

### AgentExecutor
Stores execution logs for auditability.

## Agent Types

### Trading Agent
Monitors thresholds and can execute a real demo swap through the demo router.

Typical config:
- token pair
- threshold price
- direction
- amount

### Farming Agent
Monitors a farming opportunity and can deposit HLUSD into the demo farm.

Typical config:
- protocol
- pool
- amount
- duration

### Scheduling Agent
Creates recurring HLUSD payment behavior and can execute a real on-chain transfer.

Typical config:
- recipient
- amount
- frequency
- start date

### Portfolio Rebalancing Agent
Evaluates allocation drift and can perform a real capped rebalance swap.

Typical config:
- target allocations
- current allocations
- drift tolerance

### Content Reply Agent
Generates content/reply suggestions using Gemini and template automation flows.

Typical config:
- message
- tone
- brand context

### Business Assistant Agent
Handles business drafting, summaries, and structured answers.

Typical config:
- query
- business context
- language
- formality

## Tech Stack

- `Next.js 14`
- `React 18`
- `TypeScript`
- `Tailwind CSS`
- `Hardhat`
- `Solidity`
- `ethers.js v6`
- `Google Gemini`
- `HeLa testnet`

## Network

- Chain: `HeLa Testnet`
- Chain ID: `666888`
- HLUSD token is used for activations and demo execution funding

## Local Setup

### 1. Install

```bash
npm install
```

### 2. Use Node 22

Hardhat behaves best here with Node 22.

```bash
nvm use 22
```

### 3. Configure `.env`

Copy the values from `.env.example` and fill the required keys.

Important envs:

```env
HELA_RPC_URL=
HELA_CHAIN_ID=666888
HLUSD_ADDRESS=
PRIVATE_KEY=

NEXT_PUBLIC_HELA_RPC=
NEXT_PUBLIC_CHAIN_ID=666888
NEXT_PUBLIC_HLUSD_ADDRESS=
NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS=
NEXT_PUBLIC_AGENT_ESCROW_ADDRESS=
NEXT_PUBLIC_AGENT_EXECUTOR_ADDRESS=
NEXT_PUBLIC_PLATFORM_FEE_BPS=500

PLATFORM_FEE_BPS=500
PLATFORM_FEE_RECIPIENT=
GEMINI_API_KEY=
```

Do not commit `.env`.

### 4. Start the app

```bash
npm run dev
```

### 5. Start the automation worker

In a second terminal:

```bash
npm run automation:watch
```

This keeps due automation jobs running continuously during a live demo.

## Production Recommendation

### Database

For deployment beyond a local demo, Supabase is the right next step.

Why:
- the current automation state is still stored in `data/automation-store.json`
- that is fine for local demos, but not for Cloud Run or multi-instance deployment
- Supabase gives you:
  - managed Postgres
  - auth if you want it later
  - a clean SQL backend for jobs, logs, agent wallets, and execution history

Recommended migration target:
- `stored_agents`
- `agent_jobs`
- `execution_logs`

This repo now includes the first migration scaffold:
- [supabase/schema.sql](supabase/schema.sql)
- [lib/supabaseAdmin.ts](lib/supabaseAdmin.ts)
- [lib/automationStore.ts](lib/automationStore.ts) with:
  - `AUTOMATION_STORE_PROVIDER=json` fallback
  - `AUTOMATION_STORE_PROVIDER=supabase` for database-backed persistence
- [scripts/migrateAutomationStoreToSupabase.js](scripts/migrateAutomationStoreToSupabase.js) to import local demo data

Short version:
- `local demo` -> JSON store is okay
- `real deployment` -> move persistence to Supabase

### App Hosting

Recommended production hosting:
- frontend + API routes: `Google Cloud Run`
- database: `Supabase Postgres`

This repo now includes:
- [Dockerfile](Dockerfile)
- [cloudbuild.yaml](cloudbuild.yaml)
- [scripts/deploy-gcp.sh](scripts/deploy-gcp.sh)

## Deploying To Google Cloud Run

### 1. Prepare Artifact Registry

Create a Docker repository, for example:
- repository name: `trovia`
- region: `asia-south1`

### 2. Set deploy env vars locally

```bash
export GCP_PROJECT_ID=your-gcp-project-id
export GCP_REGION=asia-south1
export GCP_CLOUD_RUN_SERVICE=trovia-app
export GCP_ARTIFACT_REPOSITORY=trovia
export GCP_IMAGE_NAME=trovia-app
export GCP_IMAGE_TAG=latest
```

### 3. Deploy

```bash
npm run deploy:gcp
```

That command:
- builds the app container
- pushes it to Artifact Registry
- deploys it to Cloud Run

### 4. Important runtime note

If you deploy to Cloud Run without migrating persistence away from the JSON file store, automation state will not be reliable across instances or restarts.

So the safe production order is:
1. move automation storage to Supabase
2. then deploy the app to Cloud Run

### Applying the Supabase schema

Apply [supabase/schema.sql](supabase/schema.sql) in your Supabase SQL editor, then migrate local data if needed:

```bash
npm run automation:migrate:supabase
```

After that, switch the app to the database-backed store:

```env
AUTOMATION_STORE_PROVIDER=supabase
```

## Judge Run Guide

This is the shortest reliable path for judges to run the project locally.

### 1. Prerequisites

- Node `22`
- npm
- MetaMask or any injected EVM wallet
- HeLa testnet network added to the wallet

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Fill `.env` using `.env.example`.

Minimum keys needed:

```env
HELA_RPC_URL=
HELA_CHAIN_ID=666888
HLUSD_ADDRESS=
PRIVATE_KEY=
HELA_PRIVATE_KEY=
GEMINI_API_KEY=
NEXT_PUBLIC_HELA_RPC=
NEXT_PUBLIC_HLUSD_ADDRESS=
NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS=
NEXT_PUBLIC_AGENT_ESCROW_ADDRESS=
NEXT_PUBLIC_AGENT_EXECUTOR_ADDRESS=
NEXT_PUBLIC_PLATFORM_FEE_BPS=500
```

If running with Supabase persistence:

```env
AUTOMATION_STORE_PROVIDER=supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### 4. Start app and worker

```bash
npm run dev
npm run automation:watch
```

### 5. Manual demo flow

1. Open `/marketplace`
2. Open any agent detail page
3. Activate the agent with HLUSD
4. Open interaction or create automation
5. Fund the agent wallet if required
6. Run the job and verify the result in `/dashboard`

### 6. Live agent expectations

- `Trading` -> threshold analysis and demo swap execution
- `Farming` -> farming review and demo farm deposit
- `Scheduling` -> recurring HLUSD payment automation
- `Rebalancing` -> drift analysis and rebalance swap
- `Content` -> content generation and automation
- `Business` -> business drafting and automation

## Demo Deliverables

This repository is our DevClash submission for the Web3 track. The key submission links are below:

- `Demo URL`: https://trovia-app-586045943972.asia-south1.run.app
- `Demo Video`: https://youtu.be/4uzBng_q0rs?si=1A37Qr3d-ZDj7O4D
- `Presentation Deck`: https://docs.google.com/presentation/d/1pjsbKBlZ8PhfKQc-EhE5uLwmwsiudSTedIe1JOMuw60/edit?usp=sharing
- `System Design Diagram`: [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md)

## Deployment Addresses

Current HeLa testnet deployment addresses:

- `HLUSD`: `0x6fEF5d9fe6051dED5cC838feD792c36252DF12bf`
- `AgentRegistry`: `0xE6E5DE5752f223FacBc28b492f78eF689C937a47`
- `AgentEscrow`: `0xe8263ffF468136843Df504326FC958563Ce968be`
- `AgentExecutor`: `0x65088ea52246f09ca0Be6aB5286Bb29095E38a75`
- `Trading Demo Router`: `0x16eADe32E1eCefc7029F463e3589d710deF9DD5f`
- `Trading Demo Quote Token (DUSDC)`: `0x1e7b8F4FAb0129E4A92dF791C73C2258aBFF1151`
- `Farming Demo Vault`: `0x0b9E69d9146A74E4AB78eCCC29098d9e4b211189`

## Example Transactions

Three real example HeLa testnet transactions from Trovia flows:

- `Agent Activation (15 HLUSD with 5% fee split)`: `0x80b57926f2263d355b2f39e9551a849c85df54eca17ac382de280b4105a9454e`
- `Scheduling Transfer Execution`: `0x503d095a1c324e1371cc1467b55b50cb1d53ab1aa78f7bc4dedde1dacf0e1e2f`
- `Farming Deposit Execution`: `0xad7c80b58882ecab6c691128bd1889e2b09aa38acfa4acae13c44aef8640aece`

### 5. Start the automation worker

Run this in a second terminal:

```bash
npm run automation:watch
```

## Deployment and Seeding

### Deploy core contracts

```bash
npm run deploy:hela
```

This writes:
- `deployments/helaTestnet.json`

Then update your local env with the printed values:
- `NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS`
- `NEXT_PUBLIC_AGENT_ESCROW_ADDRESS`
- `NEXT_PUBLIC_AGENT_EXECUTOR_ADDRESS`

### Seed the 6 live marketplace agents

```bash
npm run seed:hela
```

This republishes the canonical live set into the current registry.

### Verify contracts

```bash
npm run verify:hela
```

## Demo Infrastructure

### Demo trading infrastructure

Deploys:
- demo quote token
- demo swap router

```bash
npm run deploy:trading-demo
```

Useful envs:

```env
TRADING_REAL_EXECUTION_ENABLED=true
TRADING_ROUTER_KIND=uniswap-v2
TRADING_ROUTER_ADDRESS=
TRADING_TOKEN_ADDRESS_MAP_JSON=
TRADING_SWAP_DEADLINE_SECONDS=600
```

### Demo farming infrastructure

Deploys:
- demo yield farm

```bash
npm run deploy:farming-demo
```

Useful envs:

```env
FARMING_REAL_EXECUTION_ENABLED=true
FARMING_VAULT_ADDRESS=
FARMING_DEFAULT_POOL_KEY=hlusd-usdc
```

## Buyer Flow

### Activate an agent

1. Connect wallet
2. Open marketplace
3. Choose an agent
4. Fill config
5. Click `ACTIVATE`
6. Approve HLUSD
7. Confirm on-chain activation

The activation flow:
- validates config against the agent API
- ensures correct network
- approves HLUSD to escrow
- activates agent on-chain

### Use the agent

After activation, users can:
- open interaction page
- run the agent
- create automation jobs
- fund the agent wallet
- run scheduled automation

## Automation

Automation supports:
- recurring jobs
- run now
- pause
- resume
- funding status
- gas funding
- HLUSD funding from connected wallet

Finance automation uses isolated agent wallets instead of the user's main wallet.

Readiness states include:
- `READY TO RUN`
- `NEEDS GAS`
- `NEEDS HLUSD`
- `CHECK FUNDING`

## Publishing Agents

Trovia supports two publish modes:

### Describe with AI
For non-technical users:
- describe the agent in plain English
- Gemini generates the draft and runtime
- safety review runs
- deploy pipeline publishes it

### Technical JSON
For technical users:
- manually define config schema and runtime code
- run safety review
- publish through the same deploy pipeline

## Safety Review

The publish flow includes AI-assisted safety review to catch:
- wallet draining intent
- seed phrase/private key collection
- silent signing behavior
- illegal or unethical workflows

The review returns:
- `approve`
- `review`
- `block`

## Marketplace Curation

The marketplace only shows the canonical live 6 agents.

Weak/demo/noisy historical agents are filtered out from the public list.

There is also a separate `Coming Soon` section for upcoming agent concepts.

## Testing

### Contract tests

```bash
npx hardhat test test/agent-bazaar.test.ts
```

### QA checklist

Use:

- [QA_CHECKLIST.md](QA_CHECKLIST.md)

It covers:
- marketplace
- publish
- wallet
- each agent page
- all 6 activation flows
- automation
- dashboard
- worker behavior

## Important Notes

- `.env` is local-only
- `data/automation-store.json` is local runtime/demo state
- deployment artifacts may differ by machine/network run
- old purchases do not carry over after redeploying new contracts
- if you redeploy the registry, you must seed agents again

## Current Status

Working now:
- 6 live agent categories
- real on-chain activation
- 5% fee split
- scheduling real transfer
- trading real demo swap
- rebalancing real demo swap
- farming real demo deposit
- automation worker
- publish flow and safety review

## Team

- Nabil
- Bhumi
- Aman
- Madhura
- Saad

## License

Hackathon project for DevClash / HeLa ecosystem demo use.
