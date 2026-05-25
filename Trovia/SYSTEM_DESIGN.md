# System Design Diagram

```mermaid
flowchart TB
  U[User / Buyer / Developer]
  MM[MetaMask / Freighter-style Wallet UX]
  FE[Trovia Frontend\nNext.js App Router]
  API[API Layer\nNext.js Route Handlers]
  AI[Gemini AI Services]
  SB[(Supabase\nAutomation Store)]
  HW[Automation Worker\ncron/watch runner]
  RPC[HeLa RPC / Testnet]

  subgraph HeLa Contracts
    REG[AgentRegistry]
    ESC[AgentEscrow]
    EXE[AgentExecutor]
    TR[Demo Trading Router]
    FV[Demo Yield Farm]
    HL[HLUSD Token]
  end

  U --> MM
  U --> FE
  FE --> API
  FE --> MM
  API --> AI
  API --> SB
  HW --> SB
  HW --> RPC
  API --> RPC
  MM --> RPC

  RPC --> REG
  RPC --> ESC
  RPC --> EXE
  RPC --> TR
  RPC --> FV
  RPC --> HL

  REG -->|stores published agents| FE
  ESC -->|activation + 5% fee split| FE
  EXE -->|execution logs| FE

  FE -. publish agent .-> REG
  FE -. approve + activate .-> ESC
  FE -. interact / automate .-> API

  API -. deploy generated runtime metadata .-> SB
  API -. create jobs / logs .-> SB
  HW -. run due jobs .-> SB

  TR -->|real swaps| HL
  FV -->|real farm deposits| HL
```

## Component Summary

- `Frontend`: Trovia marketplace, publish flow, agent detail pages, dashboard, automation controls.
- `API Layer`: agent generation, review, deploy, interaction, automation job management, funding helpers.
- `Gemini`: drafts schemas/workflows for non-technical publishing and powers AI-driven agent behavior.
- `Supabase`: stores deployed agent metadata, automation jobs, and execution logs.
- `Automation Worker`: executes due jobs and updates job/log state.
- `HeLa Contracts`:
  - `AgentRegistry`: publishes and reads marketplace agents
  - `AgentEscrow`: handles activation payments and 5% platform fee split
  - `AgentExecutor`: stores on-chain execution log events
  - `Demo Trading Router`: executes whitelisted demo swaps
  - `Demo Yield Farm`: accepts demo HLUSD farming deposits
  - `HLUSD Token`: activation and execution settlement token

## Core Flows

### 1. Publish Flow

`Developer -> Frontend -> Gemini/API -> AgentRegistry`

- Developer describes or defines an agent.
- Gemini/API prepares schema and runtime metadata.
- Wallet signs and publishes the agent on HeLa.

### 2. Activation Flow

`Buyer -> Frontend -> Wallet -> AgentEscrow`

- Buyer configures an agent.
- Buyer approves HLUSD.
- `AgentEscrow` activates the agent and splits payment:
  - `95%` to developer
  - `5%` to Trovia

### 3. Automation Flow

`Frontend/API -> Supabase -> Worker -> HeLa`

- User creates an automation job.
- Job and wallet metadata are stored in Supabase.
- Worker picks up due jobs and executes:
  - scheduling transfers
  - trading swaps
  - rebalancing swaps
  - farming deposits
  - content/business automation runs

### 4. Dashboard Flow

`Supabase + HeLa events -> API -> Frontend`

- Dashboard shows active agents, published agents, job readiness, funding state, and execution logs.
```
