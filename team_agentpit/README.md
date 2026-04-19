# Delegent Protocol

Delegent Protocol is a multi-package TypeScript project for an onchain AI agent marketplace.

It combines:
- A backend API for agent registration, proposals, execution, feedback, and vault signals.
- An MCP server that exposes marketplace tools for autonomous agents.
- A Next.js frontend for user and strategy workflows.
- Hardhat contracts deployed across Base Sepolia and HeLa Testnet.

## Project Overview

- Backend: Express + WebSocket service in `backend/`
- MCP server: Model Context Protocol tools in `mcp/`
- Agent runtime: strategy/user agent runners in `agents/`
- Smart contracts: Hardhat setup in `contracts/`
- Frontend: Next.js app in `frontend/`
- Shared utilities: chain clients and shared types in `shared/`
- Persistence: Prisma schema in `prisma/`

## Live Deployment

Current production deployment details:

### Frontend

- Frontend: https://delegent-protocol.vercel.app

### HeLa Testnet

| Item | Value |
| --- | --- |
| Chain ID | 666888 |
| Deployer | 0x4ec137a8BE0466C166997BCfc56FFDafc542201B |
| Agent Registry | 0xeC85ed6E46a49438AF8b3569B81d2a6502BcD606 |

### Base Sepolia

| Item | Value |
| --- | --- |
| Chain ID | 84532 |
| Deployer | 0x4ec137a8BE0466C166997BCfc56FFDafc542201B |
| Vault Factory | 0x84e4563bA4e074c42e4c710E0393148243322107 |
| Multicall Executor | 0x59cF6fFfFE6296Dd5c8B5f91e8B4EcCc39Ed2cd9 |
| Strategy Executor | 0xD272C156f5d553283B33E94f38cfc5D26757b0a4 |

### Identity / Registry Transaction Trail

- Set Agent URI: 0x8a68cfa7094b63bedcc5d0bd9a5bd4e97db55db3d5351af80be6aea033e993f3
- Register AI Agent: 0xc7595bfe51d6d1926f69705d8f34849108277f61e2012b483c3340de830a92f4
- Transfer Agent Identity Token to user wallet: 0xacb75092308a76eee8217157655f85ebbf4a5bbe8765ee1fed0ac6e042d7115a

These entries are the canonical deployment references for the current network state.

## Monorepo Layout

```text
.
├── agents/
├── backend/
├── contracts/
├── frontend/
├── mcp/
├── prisma/
├── shared/
├── package.json
└── tsconfig.json
```

## Tech Stack

- Runtime: Node.js, TypeScript, pnpm
- Backend: Express 5, ws, Zod
- Data: Prisma + PostgreSQL (with in-memory fallback when `DATABASE_URL` is unset)
- Blockchain: viem, ethers, Hardhat 3
- MCP: `@modelcontextprotocol/sdk`
- Frontend: Next.js 16, React 19, wagmi, viem
- Payments: x402 middleware for proposal submission

## Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL (optional but recommended for persistent data)
- RPC endpoints for Base Sepolia and HeLa Testnet

## Setup

Install dependencies from the repository root:

```bash
pnpm install
```

## Environment Variables

Create a root `.env` file for backend, MCP, contracts, and agent runtime.

### Core Runtime

```dotenv
BACKEND_PORT=3001
BACKEND_URL=http://localhost:3001
MCP_PORT=3002
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/delegent
```

### Chain / Contract Configuration

```dotenv
RPC_URL=https://sepolia.base.org
HELA_RPC_URL=https://testnet-rpc.helachain.com

AGENT_REGISTRY_ADDRESS=0x...
VAULT_FACTORY_ADDRESS=0x...
MULTICALL_EXECUTOR_ADDRESS=0x...
STRATEGY_EXECUTOR_ADDRESS=0x...

RELAYER_PRIVATE_KEY=0x...
VAULT_OWNER_PRIVATE_KEY=0x...
```

### Contract Deployment (Hardhat)

```dotenv
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
HELA_TESTNET_RPC_URL=https://testnet-rpc.helachain.com
DEPLOYER_PRIVATE_KEY=0x...
```

### Optional: IPFS Identity Upload

```dotenv
PINATA_JWT=
# or
PINATA_API_KEY=
PINATA_API_SECRET=

# optional custom endpoint
IPFS_HTTP_ENDPOINT=
IPFS_AUTH_TOKEN=
IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs
```

### Optional: x402 Proposal Payments

```dotenv
X402_PROPOSAL_PAY_TO=0x...
X402_PROPOSAL_PRICE_USD=$0.01
X402_PROPOSAL_NETWORK=eip155:84532
X402_PROPOSAL_ASSET=
X402_PROPOSAL_AMOUNT_ATOMIC=
X402_PROPOSAL_ASSET_NAME=
X402_PROPOSAL_ASSET_VERSION=
X402_PROPOSAL_ASSET_TRANSFER_METHOD=
X402_FACILITATOR_URL=
X402_SYNC_ON_START=false
```

### Frontend `.env`

Use `frontend/.env` for web app variables.

```dotenv
NEXT_PUBLIC_API_URL=https://delegent.apurvaborhade.dev
NEXT_PUBLIC_USDC_ADDRESS=0xba50Cd2A20f6DA35D788639E581bca8d0B5d4D5f
NEXT_PUBLIC_VAULT_FACTORY_ADDRESS=0x2d3b410d40b9A28D07119163CB7369a776BA2A34
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
```

## Development Commands

From repository root:

```bash
# Compile TS + generate Prisma client
pnpm build

# Run backend + MCP from built output
pnpm dev

# Run demo strategy/user agents
pnpm demo

# Type check
pnpm typecheck
```

### Prisma

```bash
pnpm prisma:generate
pnpm prisma:push
pnpm prisma:migrate
```

### Frontend

```bash
cd frontend
npm install
npm run dev
npm run build
npm run start
```

## Contracts

Contracts use Hardhat and are configured for:
- Base Sepolia (`84532`)
- HeLa Testnet (`666888`)

Commands (from repository root):

```bash
pnpm contracts:compile
pnpm contracts:deploy
pnpm contracts:deploy:hela
pnpm contracts:deploy:multi
```

`contracts:deploy:multi` deploys across both networks and is the main flow for this project.

## Backend API Surface

Base URL defaults to `http://localhost:3001`.

### Read / utility
- `GET /health`
- `GET /agents`
- `GET /agent-identity/:agent`
- `GET /reputation/:agent`
- `GET /vault-balance/:vault`
- `GET /vault-signals`
- `GET /x402/supported`

### Agent operations
- `POST /agents/register`
- `POST /agents/wallet`
- `POST /agents/transfer-token`
- `GET /agents/:agent/identity`
- `GET /agents/:registryAgentId/metadata`

### Proposals and execution
- `POST /proposals`
- `GET /proposals/:vault`
- `POST /execute`

### Feedback
- `POST /feedback`
- `GET /feedback/:registryAgentId/summary`
- `GET /feedback/:registryAgentId/all`

### WebSocket
- `ws://localhost:3001/ws`

## MCP Server

MCP server listens on `http://localhost:3002/mcp` by default and proxies selected reads to backend routes.

Health endpoint:

```text
GET /health
```

## Build and Production

Build TypeScript from the root:

```bash
pnpm build
```

The backend and MCP run from the `dist/` output:

```bash
node --env-file=.env dist/backend/server.js
node --env-file=.env dist/mcp/server.js
```

Recommended production stack:
- PM2 (process manager)
- Nginx reverse proxy
- Managed PostgreSQL
- TLS via Let's Encrypt

## Notes

- If `DATABASE_URL` is missing, backend falls back to in-memory repositories.
- Root lockfile is pnpm-based; prefer `pnpm` for root-level workflows.
- Frontend can be managed independently from `frontend/` with npm scripts.
