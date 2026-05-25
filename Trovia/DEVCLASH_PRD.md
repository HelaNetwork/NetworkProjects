# 🏪 Trovia — DevClash 2026 PRD
**Team:** Nabil, Bhumi, Aman, Madhura, Saad  
**Problem Statement:** PS 03 — Agent Marketplace  
**Hackathon:** DevClash 2026 | April 18–19 | Dr. D.Y. Patil Institute of Technology, Pimpri  
**Track:** Web3 — HeLa Blockchain  

---

## 1. PRODUCT VISION

> **"An on-chain App Store for AI agents — developers publish them, anyone can activate and use them, all powered by HeLa's AI-native blockchain."**

Trovia is a decentralized marketplace where developers deploy AI agents as smart contracts on HeLa Chain. Non-technical buyers browse, pay in HLUSD, and activate agents with one click — no setup, no code, no friction. Every agent listed in PS 03 is pre-built and live on the marketplace at demo time.

---

## 2. PROBLEM STATEMENT ALIGNMENT

PS 03 requires a functional marketplace with all 6 agent types:

| # | Agent Type | Our Implementation |
|---|---|---|
| 1 | Trading Agent | AI monitors price thresholds, executes/simulates swaps |
| 2 | Farming Agent | Auto-compounds yield, monitors LP positions |
| 3 | Scheduling Agent | Recurring HLUSD payments on time-based triggers |
| 4 | Portfolio Rebalancing Agent | Monitors wallet allocation, triggers rebalance alerts |
| 5 | Content Reply Agent | Gemini-powered social/business content auto-responder |
| 6 | Business Assistant Agent | Gemini AI answers queries, drafts emails, summaries |

---

## 3. CORE ARCHITECTURE

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js)                 │
│  Marketplace Browse → Agent Detail → Activate Flow  │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              API LAYER (Next.js API Routes)          │
│     Agent Execution · Gemini AI · Wallet Monitor    │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│           SMART CONTRACTS (Solidity on HeLa)         │
│    AgentRegistry · AgentEscrow · AgentExecutor      │
└──────────────────────┬──────────────────────────────┘
                       │
              HeLa Blockchain (Chain ID: 666888)
```

---

## 4. TECH STACK

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS — modern clean design system (minimal, professional, responsive) |
| Blockchain SDK | ethers.js v6 |
| Wallet | MetaMask (window.ethereum) |
| Smart Contracts | Solidity ^0.8.20 + Hardhat |
| AI Engine | Google Gemini 2.5 Flash API |
| Chain | HeLa Testnet (Chain ID: 666888) |
| Payment Token | HLUSD (HeLa stablecoin) |
| Deployment | Vercel (frontend) + HeLa Testnet (contracts) |

---

## 5. SMART CONTRACTS

### 5.1 AgentRegistry.sol
```solidity
// Stores all published agents
struct Agent {
    uint256 id;
    string name;
    string description;
    string agentType;      // "trading" | "farming" | "scheduling" | "rebalancing" | "content" | "business"
    uint256 priceHLUSD;    // price in HLUSD (18 decimals)
    address developer;     // dev wallet — receives payment
    bool isActive;
    string configSchema;   // JSON schema for buyer config inputs
}

mapping(uint256 => Agent) public agents;
uint256 public agentCount;

function publishAgent(...) external
function getAgent(uint256 id) external view returns (Agent memory)
function getAllAgents() external view returns (Agent[] memory)
```

### 5.2 AgentEscrow.sol
```solidity
// Handles buyer payment + activation
function activateAgent(
    uint256 agentId,
    string calldata userConfig  // buyer's config as JSON string
) external {
    // 1. Transfer HLUSD from buyer to this contract
    // 2. Immediately release to developer wallet (no hold)
    // 3. Emit AgentActivated event with buyer address + config
    // 4. Store activation record on-chain
}

mapping(address => uint256[]) public userActiveAgents;
event AgentActivated(uint256 agentId, address buyer, string config, uint256 timestamp);
```

### 5.3 AgentExecutor.sol (lightweight)
```solidity
// Logs agent execution results on-chain for auditability
function logExecution(
    uint256 agentId,
    address user,
    string calldata action,
    string calldata result
) external

event ExecutionLogged(uint256 agentId, address user, string action, string result, uint256 timestamp);
```

---

## 6. THE 6 AGENTS — DETAILED SPEC

### Agent 1 — Trading Agent 📈
**What it does:** User sets a price threshold (e.g. "alert me when HLUSD drops below $0.98"). Agent monitors via HeLa RPC, sends Telegram alert, and simulates a swap execution.  
**Config inputs:** Token pair, threshold price, action (alert/simulate-swap), amount  
**AI layer:** Gemini generates a market analysis summary when threshold is hit  
**On-chain:** Activation logged, execution events emitted  

### Agent 2 — Farming Agent 🌾
**What it does:** Monitors a user's LP position on HeLa. When yield crosses a threshold, auto-compounds (simulated on testnet) or sends alert.  
**Config inputs:** LP address, compound threshold, frequency  
**AI layer:** Gemini explains current APY and recommends action  
**On-chain:** Compound actions logged as events  

### Agent 3 — Scheduling Agent 📅
**What it does:** Sends recurring HLUSD payments to a target address on a set schedule (daily/weekly/monthly). Testnet simulation with real tx on HeLa.  
**Config inputs:** Recipient address, amount, frequency, start date  
**AI layer:** None needed — pure smart contract logic  
**On-chain:** Each payment is a real on-chain transaction  

### Agent 4 — Portfolio Rebalancing Agent ⚖️
**What it does:** Monitors wallet token distribution. When allocation drifts beyond target (e.g. HLUSD drops below 60% of portfolio), agent alerts and suggests rebalance trades.  
**Config inputs:** Target allocation percentages, drift tolerance, tokens to watch  
**AI layer:** Gemini generates plain-English rebalance recommendation  
**On-chain:** Rebalance actions logged  

### Agent 5 — Content Reply Agent ✍️
**What it does:** User pastes a received message (tweet, email, DM). Gemini generates 3 reply options in the user's configured tone (professional/casual/aggressive). User picks and copies.  
**Config inputs:** Tone preference, context about user's brand/persona  
**AI layer:** Core of the agent — Gemini generates replies  
**On-chain:** Usage logged per activation  

### Agent 6 — Business Assistant Agent 💼
**What it does:** User types any business question or task (draft proposal, summarize contract, write cold email, answer customer query). Gemini responds with high-quality output.  
**Config inputs:** Business context (what is your business?), response language, formality  
**AI layer:** Core of the agent — Gemini handles everything  
**On-chain:** Sessions logged  

---

## 7. USER FLOWS

### Flow A — Developer Publishes Agent
```
Connect Wallet → Fill Agent Form (name, type, desc, price, config schema) 
→ Submit → AgentRegistry.publishAgent() tx → MetaMask confirm → Agent live on marketplace
```

### Flow B — Buyer Activates Agent
```
Browse Marketplace → Click Agent Card → View Details + Config Form
→ Fill config (e.g. wallet address, threshold) → Click "Activate" 
→ HLUSD approval tx → AgentEscrow.activateAgent() tx → MetaMask confirm
→ Redirected to Dashboard → Agent live and running
```

### Flow C — User Interacts with Active Agent
```
Dashboard → Click active agent → Chat/config interface
→ Type query / set trigger → Gemini API processes → Result shown
→ On-chain execution log emitted
```

---

## 8. PAGES & COMPONENTS

| Page | Route | Description |
|---|---|---|
| Landing | `/` | Hero, product pitch, connect wallet CTA |
| Marketplace | `/marketplace` | Grid of all 6 agent cards with filter by type |
| Agent Detail | `/agent/[id]` | Full description, config form, price, activate button |
| Dashboard | `/dashboard` | User's active agents + activity feed |
| Publish | `/publish` | Developer form to list a new agent |
| Agent Chat | `/agent/[id]/run` | Live interaction interface for active agent |

---

## 9. JUDGING CRITERIA MAPPING

| Criteria | Weight | How we nail it |
|---|---|---|
| Functional Correctness | 80% | All 6 agents work end-to-end. Real txs on HeLa testnet. Wallet connect, payment, activation all functional. No broken flows. |
| Completeness | 20% | All 6 agent types from PS 03 implemented. Marketplace browse + agent detail + activation + dashboard all built. |

**Key rule:** Every feature we show MUST work. No fake demos. No hardcoded outputs passed off as live.

---

## 10. TEAM ROLES & WORK DIVISION

---

### 🔴 NABIL — Smart Contracts + Blockchain Integration (Lead)
**You own the hardest, most critical layer. If contracts break, nothing works.**

**Pre-hackathon (tonight):**
- [ ] Set up Hardhat project with HeLa testnet config
- [ ] Write skeleton `AgentRegistry.sol`
- [ ] Configure MetaMask on HeLa Chain ID 666888
- [ ] Get test HLUSD from faucet

**During hackathon:**
- [ ] Write, test and deploy all 3 smart contracts to HeLa testnet
- [ ] Write Hardhat deploy scripts
- [ ] Build `lib/contracts.ts` — ethers.js wrapper for all contract calls
- [ ] Build `lib/wallet.ts` — MetaMask connect, network switch, HLUSD approval
- [ ] Wire up contract calls to frontend (activateAgent, publishAgent, getUserAgents)
- [ ] Handle all on-chain errors gracefully (rejected tx, wrong network, insufficient balance)
- [ ] Verify contracts on HeLa explorer
- [ ] Write `README.md` + Markdown file (AI tools used + run instructions)
- [ ] Commit discipline — every commit timestamped WITHIN hackathon window

**You do NOT touch:** UI components, styling, slide deck

---

### 🟡 BHUMI — AI Agent Execution Engine
**You own the brain of every agent. Gemini integration + agent logic.**

**Pre-hackathon (tonight):**
- [ ] Get Gemini API key from aistudio.google.com
- [ ] Test basic Gemini 2.5 Flash API call
- [ ] Understand the 6 agent config schemas

**During hackathon:**
- [ ] Build `/api/agents/trading/route.ts` — price monitor logic
- [ ] Build `/api/agents/farming/route.ts` — LP yield monitor
- [ ] Build `/api/agents/scheduling/route.ts` — time-based trigger
- [ ] Build `/api/agents/rebalancing/route.ts` — portfolio drift detection
- [ ] Build `/api/agents/content/route.ts` — Gemini content reply (3 options)
- [ ] Build `/api/agents/business/route.ts` — Gemini business assistant
- [ ] Build `lib/gemini.ts` — single wrapper for all Gemini calls with proper prompting
- [ ] Build `/api/agents/execute/route.ts` — unified execution router
- [ ] Handle Gemini errors, rate limits, empty responses

**You do NOT touch:** Smart contracts, frontend pages, slides

---

### 🟢 AMAN — Frontend Engineering (Coding)
**You own frontend implementation quality. Build fast, stable pages from Madhura's design specs.**

**Pre-hackathon (tonight):**
- [ ] Scaffold Next.js 14 project with Tailwind
- [ ] Set up folder structure: `app/`, `components/`, `lib/`
- [ ] Prepare reusable UI component scaffolding and route skeletons for all required pages

**During hackathon:**
- [ ] Implement Madhura's design system in code (colors, typography, spacing, component variants)
- [ ] Build `components/WalletConnect.tsx` — connect button, address display, network badge
- [ ] Build `components/AgentCard.tsx` — marketplace grid card component
- [ ] Build `app/page.tsx` — landing hero with product pitch
- [ ] Build `app/marketplace/page.tsx` — agent grid with type filter tabs
- [ ] Build `app/agent/[id]/page.tsx` — agent detail + config form + activate button
- [ ] Build `app/dashboard/page.tsx` — user's active agents + activity log
- [ ] Build `app/agent/[id]/run/page.tsx` — chat interface for content + business agents
- [ ] Build `app/publish/page.tsx` — developer publish form
- [ ] Global: modern clean visual style, clear hierarchy, consistent color palette, loading states, error states
- [ ] Mobile responsive (at least functional on phone)
- [ ] Wire all frontend flows to APIs/contracts from Bhumi and Nabil with proper UX feedback

**Rules:** Do NOT modify anything in `lib/contracts.ts` or `lib/wallet.ts`. Only consume the functions Nabil exposes. Do NOT call Gemini API directly — only through Bhumi's API routes.

---

### 🟣 MADHURA — Frontend Design & UX
**You own how the product looks and feels. Define a modern clean design language and interaction quality.**

**During hackathon:**
- [ ] Define visual direction: modern clean UI with light-first palette, strong typography hierarchy, and clear spacing scale
- [ ] Create page-level designs for `/`, `/marketplace`, `/agent/[id]`, `/dashboard`, `/publish`, `/agent/[id]/run`
- [ ] Design component specs for `WalletConnect`, `AgentCard`, forms, tabs, buttons, badges, and activity feed
- [ ] Define responsive behavior for desktop + mobile and ensure touch-friendly layouts
- [ ] Specify loading, empty, success, and error states for every key user flow
- [ ] Provide handoff notes to Aman (tokens, spacing, states, interaction notes) and review implementation continuously
- [ ] Ensure UI copy/microcopy is clear, concise, and consistent with demo narrative

**You do NOT touch:** Smart contracts, backend API logic, or direct implementation in frontend route files.

---

### 🔵 SAAD — Research, Testing & Content
**You are the QA + content layer. You break things before judges do.**

**During hackathon:**
- [ ] **Agent Descriptions** — write compelling, plain-English descriptions for all 6 agents as they'll appear on the marketplace cards. Focus on what the buyer gets, not tech jargon.
- [ ] **Testing** — as each feature is built, you test it. Checklist:
  - [ ] Wallet connects on HeLa testnet
  - [ ] All 6 agent cards appear on marketplace
  - [ ] Agent detail page loads with correct info
  - [ ] HLUSD approval + activation tx completes
  - [ ] Content reply agent returns 3 Gemini replies
  - [ ] Business assistant answers a question
  - [ ] Dashboard shows activated agents
  - [ ] No console errors visible to judges
- [ ] **Prompts research** — research best Gemini prompting strategies for content reply and business assistant agents. Share with Bhumi.
- [ ] **HeLa research** — find HeLa testnet faucet link, explorer URL, official RPC endpoint, HLUSD contract address. Share with Nabil ASAP tonight.
- [ ] **Competitive talking points** — prepare 3 sentences on why our marketplace is different from SingularityNET and Virtuals Protocol for judges' Q&A
- [ ] Help Madhura with UI copy/microcopy and proofreading

---

## 11. TIMELINE

| Time | Milestone | Owner |
|---|---|---|
| **Tonight (now–sleep)** | Hardhat setup, contracts skeleton, Next.js scaffold, HeLa testnet config | Nabil + Aman |
| **10:00 AM** | Hackathon starts. Immediately: deploy contracts to testnet | Nabil |
| **10:00–11:00** | Contracts deployed. Frontend scaffold live. Wallet connect working | Nabil + Aman |
| **11:00–1:00 PM** | Agent API routes built (all 6). Frontend pages built. | Bhumi + Aman |
| **1:00–2:00 PM** | Lunch. Contracts wired to frontend. Basic flow working. | — |
| **2:00–4:30 PM** | Full activate flow working. Dashboard built. System design diagram done. | All |
| **4:30 PM** | 🚨 FREEZE NEW FEATURES. Only bug fixes from here for judging round. | Nabil |
| **5:00–6:00 PM** | 🔴 1st Judging Round — show system design + working wallet connect + 1 agent | Nabil presents |
| **6:00–9:00 PM** | Evening push — all 6 agents working. Chat interface for content + business. | Bhumi + Aman |
| **9:00 PM–12:00 AM** | Polish UI. Fix bugs. Write README. Prep submission. | All |
| **12:00–1:00 AM** | 🔴 2nd Judging Round — show all 6 agents, full marketplace flow | Nabil presents |
| **1:00–7:00 AM** | Final polish. Submission form filled. Demo video recorded. Slides finalized. | All |
| **8:00 AM** | Submissions open. Submit everything. | Saad checks checklist |
| **9:00 AM** | 🔴 3rd Judging Round — full polished demo | Nabil + Madhura |
| **10:00 AM** | Hacking ends ✅ | |

---

## 12. SUBMISSION CHECKLIST

- [ ] GitHub repo — public, all commits within hackathon window
- [ ] Working deployed link (Vercel)
- [ ] Demo video 3–5 minutes (screen record the full flow)
- [ ] Presentation deck 5–10 slides (PDF)
- [ ] Markdown file with tech stack + AI tools + run guide
- [ ] Submission form filled on DevKraft portal

---

## 13. CRITICAL RULES FOR THE CODEBASE

**To prevent merge conflicts and code ruination:**

```
app/
├── page.tsx                    → AMAN only
├── marketplace/page.tsx        → AMAN only  
├── agent/[id]/page.tsx         → AMAN only
├── agent/[id]/run/page.tsx     → AMAN only
├── dashboard/page.tsx          → AMAN only
├── publish/page.tsx            → AMAN only
└── api/
    └── agents/
        ├── trading/route.ts    → BHUMI only
        ├── farming/route.ts    → BHUMI only
        ├── scheduling/route.ts → BHUMI only
        ├── rebalancing/route.ts→ BHUMI only
        ├── content/route.ts    → BHUMI only
        ├── business/route.ts   → BHUMI only
        └── execute/route.ts    → BHUMI only

lib/
├── contracts.ts                → NABIL only
├── wallet.ts                   → NABIL only
└── gemini.ts                   → BHUMI only

contracts/
└── *.sol                       → NABIL only
```

**Git rules:**
- One branch per person: `nabil/contracts`, `bhumi/agents`, `aman/frontend`
- Merge to `main` only when a feature is COMPLETE and TESTED
- Never push broken code to main
- Nabil reviews all PRs before merge

---

## 14. ENV VARIABLES

```bash
# .env.local
GEMINI_API_KEY=your_key_here
NEXT_PUBLIC_HELA_RPC=https://testnet-rpc.helachain.com
NEXT_PUBLIC_CHAIN_ID=666888
NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS=0x...  # after deploy
NEXT_PUBLIC_AGENT_ESCROW_ADDRESS=0x...    # after deploy
NEXT_PUBLIC_AGENT_EXECUTOR_ADDRESS=0x... # after deploy
NEXT_PUBLIC_HLUSD_ADDRESS=0x...          # HeLa HLUSD token
```

---

## 15. DEMO SCRIPT (for judges)

**Duration: ~8 minutes**

1. **(30s)** — Open landing page. "This is Trovia — an on-chain marketplace for AI agents."
2. **(30s)** — Connect MetaMask to HeLa testnet. Show wallet address and HLUSD balance.
3. **(1min)** — Browse marketplace. Show all 6 agent cards. "These are all built on HeLa smart contracts."
4. **(2min)** — Click Scheduling Agent. Fill config (recipient + amount + weekly). Click Activate. MetaMask prompt. Confirm. Show tx hash + HeLa explorer link. "Payment in HLUSD, developer gets paid instantly, no middleman."
5. **(2min)** — Go to Content Reply Agent. Paste a tweet. Agent returns 3 Gemini-powered reply options. "AI runs on Gemini, usage is logged on-chain."
6. **(1min)** — Dashboard. Show both activated agents. Show activity log.
7. **(1min)** — "Why HeLa? Stable gas fees with HLUSD, AI-native chain, aligns with PS 03 exactly. Any questions?"

---

## 16. RISK MITIGATION

| Risk | Mitigation |
|---|---|
| HeLa testnet is down | Pre-fund wallets. Cache contract responses. Have mock data fallback. |
| Gemini API rate limit | Implement response caching. Have pre-generated responses ready. |
| MetaMask tx fails | Clear error messages. Show testnet faucet link in UI. |
| Merge conflict destroys code | Strict file ownership rules above. One person per domain. |
| Someone goes to sleep | Nabil + Bhumi stay awake minimum until 2nd judging round (1 AM). |
| Not enough features by judging | Trading + Content + Scheduling agents are priority 1. Others are priority 2. |

---

*Built for DevClash 2026 by Team Trovia*  
*Nabil · Bhumi · Aman · Madhura · Saad*
