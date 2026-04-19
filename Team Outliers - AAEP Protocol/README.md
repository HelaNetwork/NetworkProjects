# GasSafe — AAEP Protocol v1.0

> **Autonomous Agent Execution Protocol** for subsidized LPG gas delivery on the HeLa blockchain.

### 🚨 Note: This is a POC *Proof of Concept*  for AAEP Protocol.
For More Details Visit [AAEP Protocol](./protocol/AAEP_PROTOCOL.md)

GasSafe is a full-stack blockchain dApp that uses autonomous AI agents to manage subsidized LPG (cooking gas) distribution in India. Every booking decision — registration, fraud scoring, delivery verification — is made autonomously by LLM-powered agents, cryptographically logged as Decision Log Entries (DLEs), and anchored on-chain via a Merkle tree.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Core Concepts](#core-concepts)
  - [AAEP Protocol](#aaep-protocol)
  - [Decision Log Entries (DLEs)](#decision-log-entries-dles)
  - [Risk Tiers](#risk-tiers)
  - [Smart Contract](#smart-contract)
- [AI Agents](#ai-agents)
  - [Booking Agent](#booking-agent)
  - [Scoring Agent](#scoring-agent)
  - [Chat Agent (Admin AI)](#chat-agent-admin-ai)
- [API Reference](#api-reference)
- [Frontend](#frontend)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Running the Project](#running-the-project)
  - [Windows](#windows)
  - [macOS / Linux](#macos--linux)
- [Smart Contract Deployment](#smart-contract-deployment)
- [Seeding Demo Data](#seeding-demo-data)
- [Useful Scripts](#useful-scripts)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      React Frontend (Vite)                  │
│   CustomerUI  │  DeliveryUI  │  AdminUI + AI Chatbot        │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP REST (axios)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Express Backend  (server.js :3001)             │
│                   backend/routes/api.js                     │
└──────┬─────────────────┬──────────────────┬────────────────┘
       │                 │                  │
       ▼                 ▼                  ▼
 bookingAgent      scoringAgent         chatAgent
 (LLaMA 3.1 8B)   (LLaMA 3.1 8B)     (Qwen2.5 72B)
       │                 │                  │
       ▼                 │                  ▼
 chainService ◄──────────┘          auditLogger (DLEs)
       │                                    │
       ▼                                    ▼
 HeLa Testnet                    backend/data/audit_log.json
 (GasSafe.sol)                   backend/data/db.json
```

The backend is a single Express process that serves both the REST API and the pre-built React frontend (production). In development the frontend runs separately on Vite's dev server.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Solidity 0.8.9, deployed on HeLa testnet |
| Blockchain SDK | ethers.js v6 |
| Backend Runtime | Node.js (CommonJS) |
| Backend Framework | Express v5 |
| AI / LLM | HuggingFace Inference API (via OpenAI-compatible SDK) |
| LLM — Booking/Scoring | `meta-llama/Llama-3.1-8B-Instruct` (Novita router) |
| LLM — Admin Chat | `Qwen/Qwen2.5-72B-Instruct` (Novita router) |
| Frontend Framework | React 19 + Vite 8 |
| Routing | react-router-dom v7 |
| Charts | Recharts |
| Icons | Lucide React |
| Markdown rendering | react-markdown |
| HTTP client | axios |
| UUID generation | uuid |
| Data store | JSON flat-files (`db.json`, `audit_log.json`) |

---

## Project Structure

```
gassafe/
├── server.js                  # Express entry point (PORT 3001)
├── package.json               # Root dependencies & npm scripts
├── .env                       # Environment variables (never commit!)
│
├── backend/
│   ├── agents/
│   │   ├── bookingAgent.js    # Agent 1 — Registration, booking, delivery
│   │   ├── scoringAgent.js    # Agent 2 — Fraud scoring (Sybil/Hoarder/GPS)
│   │   ├── chatAgent.js       # Agent 3 — Admin compliance AI chatbot
│   │   ├── chainService.js    # Ethers.js wrapper (MOCK-safe)
│   │   └── auditLogger.js     # DLE store + Merkle root computation
│   ├── routes/
│   │   └── api.js             # All REST endpoints
│   └── data/
│       ├── db.json            # User & booking state (auto-created)
│       ├── audit_log.json     # Immutable DLE audit trail (auto-created)
│       ├── contract.json      # Deployed contract address + ABI
│       └── wallet_info.json   # Deployer wallet public info
│
├── contracts/
│   ├── GasSafe.sol            # Solidity contract (SBT + Escrow + Audit)
│   ├── deploy.js              # Deployment script → HeLa testnet
│   ├── generateWallet.js      # Wallet keygen utility
│   └── compiled/              # solc ABI + bytecode output
│
├── scripts/
│   └── seed.js                # Populate demo users/bookings/deliveries
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx            # Sidebar + router
        ├── main.css           # Design system (green/white theme)
        ├── pages/
        │   ├── CustomerUI.jsx # Register + Book gas
        │   ├── DeliveryUI.jsx # Confirm deliveries
        │   └── AdminUI.jsx    # Audit dashboard + stats
        └── components/
            └── AdminChatbot.jsx  # Floating AI compliance chatbot
```

---

## Core Concepts

### AAEP Protocol

The **Autonomous Agent Execution Protocol** (AAEP v1.0) defines how agents communicate, make decisions, and log them. Each inter-agent message has a standard envelope:

```json
{
  "aaep_version": "1.0",
  "message_id": "<uuid>",
  "trace_id": "<session-uuid>",
  "timestamp": "ISO-8601",
  "from": "booking-agent",
  "to": "scoring-agent",
  "intent": "SCORE_REQUEST",
  "payload": { ... },
  "requires_response": true,
  "timeout_ms": 5000
}
```

Every booking creates a `trace_id` that links all DLEs across agents for that session, enabling end-to-end forensic tracing.

### Decision Log Entries (DLEs)

Every autonomous decision is recorded as a **DLE**:

| Field | Description |
|---|---|
| `dle_id` | Unique UUID |
| `trace_id` | Links all decisions in a session |
| `agent_id` | Which agent made the decision |
| `decision_type` | `USER_REGISTERED`, `FRAUD_SCORE`, `BOOKING_CREATED`, `DELIVERY_CONFIRMED`, etc. |
| `inputs` | Raw inputs to the decision |
| `reasoning` | LLM reasoning + factor breakdown |
| `output` | Decision outputs (fraud score, risk tier, tx hash, etc.) |
| `confidence` | LLM confidence score (0.0–1.0) |
| `onchain_tx` | Associated blockchain transaction hash |
| `overrideable` | Whether an admin can override this DLE |
| `override_history` | Array of admin overrides with before/after snapshots |
| `hash` | SHA-256 self-hash for tamper detection |

All DLE hashes are assembled into a **Merkle tree**; the root can be anchored on-chain via `POST /api/audit/anchor`.

### Risk Tiers

The scoring agent classifies every booking into one of three tiers:

| Tier | Label | Fraud Score | Verification Required |
|---|---|---|---|
| 0 | 🟢 GREEN | 0–30 | SMS OTP |
| 1 | 🟡 YELLOW | 31–75 | Photo of cylinder |
| 2 | 🔴 RED | 76–100 | Live Face Authentication |

### Smart Contract

`GasSafe.sol` (Solidity 0.8.9) combines three primitives:

| Component | Description |
|---|---|
| **SBT** (Soulbound Token) | Non-transferable token issued on registration. Stores `vouchersRemaining` (starts at 12/year) and `riskTier`. |
| **Escrow** | Each booking locks 0.001 HLUSD on-chain. Released to the delivery agent on confirmed delivery. |
| **Audit Anchor** | Stores a chain of Merkle roots of DLE hashes on-chain for tamper-proof audit. |

Key contract events: `SBTIssued`, `SubsidyLocked`, `SubsidyReleased`, `BookingOverridden`, `AuditRootAnchored`.

---

## AI Agents

### Booking Agent

**File:** `backend/agents/bookingAgent.js`  
**LLM:** `meta-llama/Llama-3.1-8B-Instruct` via HuggingFace/Novita

Responsible for the full booking lifecycle. Makes three types of autonomous LLM decisions:

1. **Registration Decision** — Evaluates duplicate wallet/address detection and decides APPROVE or REJECT.
2. **Booking Decision** — Receives the Scoring Agent's result and makes the final decision: `PROCEED`, `HOLD`, or `REJECT`.
3. **Delivery Decision** — Validates delivery proof (OTP/Photo/FaceAuth), checks for delivery diversion (>8 deliveries from same GPS in 1 hour), and decides `RELEASE`, `REJECT`, or `ESCALATE`.

All LLM calls have deterministic fallback logic so the system continues functioning when the LLM is unavailable.

### Scoring Agent

**File:** `backend/agents/scoringAgent.js`  
**LLM:** `meta-llama/Llama-3.1-8B-Instruct` via HuggingFace/Novita

Computes a **composite fraud score (0–100)** using three weighted models:

| Model | Weight | Detects |
|---|---|---|
| Sybil Ring Detector | 55% | Multiple wallets on the same device/IP subnet |
| Hoarder Pattern Detector | 30% | Statistically abnormal booking frequency (std dev analysis) |
| GPS Mismatch Detector | 15% | Delivery location far from registered address |

A **rural discount** is applied (40% score reduction) when the booking originates from a rural area or known shared device to reduce false positives.

The LLM then provides contextual reasoning, classifies the primary fraud signal (`SYBIL`, `HOARDER`, `GPS`, or `CLEAN`), and recommends an action (`APPROVE`, `ESCALATE`, `FLAG_FOR_REVIEW`).

### Chat Agent (Admin AI)

**File:** `backend/agents/chatAgent.js`  
**LLM:** `Qwen/Qwen2.5-72B-Instruct` via HuggingFace/Novita

An agentic compliance assistant embedded in the Admin dashboard. It uses **OpenAI function-calling** to query live platform data before answering questions.

Available tools:

| Tool | Description |
|---|---|
| `get_platform_stats` | Live user counts, booking totals, risk tier breakdown, Merkle root |
| `get_audit_log` | Recent DLEs, filterable by agent |
| `get_overridden_decisions` | Admin overrides with before/after diffs |
| `search_by_trace_id` | Full session trace forensics |
| `get_high_risk_bookings` | All RED-tier bookings |

The agent runs an autonomous loop — calling tools until it has all data needed — then returns a markdown-formatted response to the frontend.

---

## API Reference

Base URL: `http://localhost:3001/api`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Register a new user (issues SBT on-chain) |
| `POST` | `/book` | Book a gas cylinder (fraud scoring + escrow lock) |
| `POST` | `/deliver` | Confirm a delivery (proof validation + escrow release) |
| `GET` | `/deliveries/pending` | List all PENDING deliveries |
| `GET` | `/deliveries/completed` | List all DELIVERED bookings |
| `GET` | `/bookings/:wallet` | All bookings for a wallet address |
| `GET` | `/user/:wallet` | User profile (excludes ZKP commitment) |
| `GET` | `/audit` | All DLEs + total count + current Merkle root |
| `GET` | `/audit/:traceId` | DLEs for a specific trace session |
| `POST` | `/override/:dleId` | Admin override a DLE decision |
| `POST` | `/audit/anchor` | Anchor current Merkle root to blockchain |
| `GET` | `/stats` | Admin dashboard stats (bookings, tiers, DLEs) |
| `POST` | `/chat` | Admin AI chat (body: `{ history, message }`) |

---

## Frontend

Three role-specific interfaces, all served from a single-page React app:

| Route | Page | Role |
|---|---|---|
| `/` | **CustomerUI** | Register, view SBT status, book gas, view booking history |
| `/delivery` | **DeliveryUI** | View pending bookings, submit delivery proof (OTP/Photo/FaceAuth) |
| `/admin` | **AdminUI** | Live stats, full DLE audit log, Merkle root anchoring, override decisions, AI chatbot |

The **AdminChatbot** is a floating chat widget (bottom-right) that uses the Chat Agent API and renders responses as Markdown. It displays tool call activity for transparency.

---

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| **Node.js** | ≥ 18.x | LTS recommended |
| **npm** | ≥ 9.x | Ships with Node.js |
| **solc** (optional) | 0.8.9 | Only needed to recompile the contract |
| **HuggingFace account** | — | For `HF_TOKEN` (free tier works) |
| **HeLa testnet wallet** | — | For on-chain features; not required for MOCK mode |

---

## Environment Setup

Create a `.env` file in the project root (`gassafe/`):

```env
# ── Required ───────────────────────────────────────────────────
HF_TOKEN=hf_your_huggingface_token_here

# ── Optional: On-Chain Mode ─────────────────────────────────────
# Leave blank to run in MOCK mode (no real blockchain calls)
PRIVATE_KEY=0x_your_deployer_wallet_private_key
HELA_RPC_URL=https://testnet-rpc.helachain.com
CONTRACT_ADDRESS=0x_deployed_contract_address

# ── Server ─────────────────────────────────────────────────────
PORT=3001
```

> **MOCK Mode:** If `PRIVATE_KEY` or `contract.json` is missing, `chainService.js` automatically falls back to mock transactions (randomly generated hashes). All agent logic and audit logging still work normally. This is the recommended mode for development.

**Getting a HuggingFace token:**
1. Sign up at [huggingface.co](https://huggingface.co)
2. Go to **Settings → Access Tokens → New Token** (read access is sufficient)

---

## Running the Project

### Windows

Open **PowerShell** or **Command Prompt**.

#### Mode 1 — Production (single server, recommended)

```powershell
# 1. Navigate to the project root
cd C:\path\to\gassafe

# 2. Install backend dependencies
npm install

# 3. Install frontend dependencies and build the React app
cd frontend
npm install
npm run build
cd ..

# 4. Copy your .env file (or edit the existing one)
#    Make sure HF_TOKEN is set

# 5. Start the server
npm start
# → Server running on http://localhost:3001
```

Open `http://localhost:3001` in your browser.

#### Mode 2 — Development (hot-reload frontend)

Run **two terminals** simultaneously:

**Terminal 1 — Backend:**
```powershell
cd C:\path\to\gassafe
npm install
npm run dev
# → API server running on http://localhost:3001
```

**Terminal 2 — Frontend (Vite dev server):**
```powershell
cd C:\path\to\gassafe\frontend
npm install
npm run dev
# → Frontend running on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

> **Note for Windows users:** If you encounter execution policy errors running npm scripts in PowerShell, run:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

---

### macOS / Linux

#### Mode 1 — Production (single server, recommended)

```bash
# 1. Navigate to the project root
cd /path/to/gassafe

# 2. Install backend dependencies
npm install

# 3. Install frontend dependencies and build the React app
cd frontend && npm install && npm run build && cd ..

# 4. Ensure .env is configured with your HF_TOKEN

# 5. Start the server
npm start
# → Server running on http://localhost:3001
```

Open `http://localhost:3001` in your browser.

#### Mode 2 — Development (hot-reload frontend)

Run in **two terminal tabs**:

**Terminal 1 — Backend:**
```bash
cd /path/to/gassafe
npm install
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd /path/to/gassafe/frontend
npm install
npm run dev
# → Frontend at http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## Smart Contract Deployment

> Skip this section if you want to use **MOCK mode** (no blockchain required).

### Step 1 — Generate a Wallet

```bash
npm run wallet
# Prints address, private key, and mnemonic
# Saves wallet_info.json (public address only)
```

Copy the private key into your `.env` as `PRIVATE_KEY`.

### Step 2 — Fund the Wallet

Get testnet HLUSD from the HeLa faucet:
- [https://testnet-faucet.helachain.com](https://testnet-faucet.helachain.com)

You need at least **0.01 HLUSD** for deployment.

### Step 3 — Compile the Contract

HeLa requires Solidity **0.8.9** exactly. Install and compile:

**Windows (PowerShell):**
```powershell
npm install -g solc@0.8.9
# Or use npx:
npx solc@0.8.9 --abi --bin contracts/GasSafe.sol -o contracts/compiled/
```

**macOS/Linux:**
```bash
npx solc@0.8.9 --abi --bin contracts/GasSafe.sol -o contracts/compiled/
```

### Step 4 — Deploy

```bash
npm run deploy
# Deploys to HeLa testnet
# Saves contract address + ABI to backend/data/contract.json
# Prints the block explorer link
```

The backend picks up `contract.json` automatically on next start — no further config needed.

### Step 5 — Verify Deployment

Check your contract on the HeLa testnet block explorer:
```
https://testnet-blockexplorer.helachain.com/address/<CONTRACT_ADDRESS>
```

---

## Seeding Demo Data

Populate the database with sample users, bookings, and a completed delivery for a demo or presentation:

```bash
# From the project root (server does NOT need to be running)
node scripts/seed.js
```

This creates:
- 3 demo users (Ramesh Kumar, Priya Sharma, Mohammed Khan) across different Pune locations
- 3 bookings with varying fraud risk profiles (GREEN, YELLOW, RED)
- 1 confirmed delivery for the GREEN booking
- A full set of DLEs in `audit_log.json`

---

## Useful Scripts

All scripts are run from the **project root** (`gassafe/`):

| Command | Description |
|---|---|
| `npm start` | Start production server (serves built frontend + API) |
| `npm run dev` | Start backend in development mode |
| `npm run build` | Build the React frontend to `frontend/dist/` |
| `npm run wallet` | Generate a new Ethereum wallet |
| `npm run deploy` | Deploy `GasSafe.sol` to HeLa testnet |
| `node scripts/seed.js` | Seed demo data |

**Frontend-only scripts** (run from `gassafe/frontend/`):

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

