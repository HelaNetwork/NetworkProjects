# Trovia Final Execution Plan

Owners: Nabil, Bhumi, Aman  
Last updated: 2026-04-19  
Scope: Final hackathon completion plan for frontend/backend wiring, agent reliability, automation, and safe team collaboration

## Objective
Finish Trovia as a judging-ready, fully demoable on-chain AI agent marketplace on HeLa where:
- marketplace, publish, dashboard, agent detail, and run flows all work end-to-end
- smart contracts and wallet activation are stable
- automation works reliably
- the three owners can work in parallel without breaking each other’s changes

This file is the single source of truth for:
- ownership boundaries
- remaining work
- branch strategy
- PR and merge safety rules
- final implementation priorities

---

## Current Project Status

### Working now
- Smart contracts are deployed and tested.
- Wallet connect, HeLa switch, HLUSD activation, and contract integration are working.
- Publish flow supports:
  - guided AI mode
  - technical mode
  - safety review
  - deploy route
- Marketplace, agent detail, dashboard, and run page are wired to real backend flows.
- Automation MVP is in place:
  - create job
  - run now
  - pause
  - resume
  - funding status
  - gas funding
  - readiness badges
- Scheduling agent is the strongest completed path:
  - real agent wallet
  - real HLUSD transfer
  - real gas funding
  - real execution log path
- Content, business, trading, farming, and rebalancing:
  - can be activated
  - can be interacted with from frontend
  - can create automation jobs
  - can run under automation with policy guardrails
- Aman’s animation/frontend refresh has been merged safely into `main`.

### Not finished yet
- Trading does not perform real on-chain swap execution yet.
- Rebalancing does not perform real on-chain rebalance swaps yet.
- Farming does not perform a real protocol action yet.
- Automation worker exists, but always-on deployment/cron still needs to be finalized.
- Agent wallet private keys are still stored in JSON and are not encrypted.
- JSON file persistence still needs to be replaced or treated as demo-only.
- Gemini configuration is not fully unified across all routes.
- Final full-browser regression still needs to be completed after the latest merge.

---

## Team Rules

## Collaboration Rules
- Nobody works directly on `main`.
- Every unit of work must go into a feature branch.
- Every merge into `main` must come through a PR.
- No one force pushes `main`.
- No one rewrites history on shared branches.
- No one replaces large files wholesale unless that file is explicitly theirs.
- If a shared file must be edited, the owner of that surface must review the PR before merge.

## Branch Rules
- Base every branch from latest `main`.
- Branch naming:
  - `nabil/<task-name>`
  - `bhumi/<task-name>`
  - `aman/<task-name>`
- One branch per focused task.
- Keep PRs small and scoped.

## PR Rules
- Every PR must include:
  - summary of what changed
  - files changed
  - what was tested
  - whether any env/setup changes are required
- Every PR must avoid:
  - `.vscode/settings.json`
  - `data/automation-store.json`
  - secrets or `.env`
- Before opening PR:
  - run lint for touched files
  - test affected frontend path
  - test affected backend route if applicable

## Merge Rules
- Merge only after:
  - conflicts are resolved locally
  - no conflict markers remain
  - affected flows are tested
- If a PR touches a shared critical file, do not self-merge without review from the surface owner.

---

## Ownership Map

## Nabil Owns
Primary responsibility:
- smart contracts
- blockchain integration
- automation runtime
- agent wallets
- funding/gas flow
- backend execution policies
- finance-agent real execution path

Owned files and surfaces:
- `contracts/*`
- `deployments/*`
- `scripts/deploy*`
- `scripts/activateDemo.ts`
- `scripts/automationWorker.ts`
- `lib/contracts.ts`
- `lib/wallet.ts`
- `lib/automation.ts`
- `lib/automationBootstrap.ts`
- `lib/automationFunding.ts`
- `lib/automationStore.ts`
- `lib/agentRunner.ts`
- `app/api/automation/*`
- `app/api/agents/deploy/route.ts`
- contract/wallet logic inside:
  - `app/agent/[id]/page.tsx`
  - `app/dashboard/page.tsx`

Nabil must review any PR touching:
- `lib/contracts.ts`
- `lib/wallet.ts`
- `lib/automation*.ts`
- `app/api/automation/*`
- `app/api/agents/deploy/route.ts`
- smart contracts and deployment files

## Bhumi Owns
Primary responsibility:
- AI agent route quality
- Gemini integration
- runtime execution reliability
- agent response consistency
- non-blockchain backend agent intelligence

Owned files and surfaces:
- `app/api/agents/content/route.ts`
- `app/api/agents/business/route.ts`
- `app/api/agents/trading/route.ts`
- `app/api/agents/farming/route.ts`
- `app/api/agents/scheduling/route.ts`
- `app/api/agents/rebalancing/route.ts`
- `app/api/agents/generate/route.ts`
- `app/api/agents/review/route.ts`
- `app/api/gemini/route.ts`
- `lib/gemini.ts`
- AI/runtime logic in:
  - `app/agent/[id]/run/page.tsx`

Bhumi must review any PR touching:
- `app/api/agents/*`
- `lib/gemini.ts`
- `app/api/gemini/route.ts`
- `app/agent/[id]/run/page.tsx`

## Aman Owns
Primary responsibility:
- frontend experience
- animations and presentation
- marketing/support/legal pages
- UI polish for pages that already work
- visual clarity and UX improvements without breaking logic

Owned files and surfaces:
- `app/page.tsx`
- `app/globals.css`
- `app/about/page.tsx`
- `app/blog/page.tsx`
- `app/contact/page.tsx`
- `app/cookies/page.tsx`
- `app/disclaimer/page.tsx`
- `app/faq/page.tsx`
- `app/help/page.tsx`
- `app/layout.tsx`
- `app/pricing/page.tsx`
- `app/privacy/page.tsx`
- `app/roadmap/page.tsx`
- `app/security/page.tsx`
- `app/terms/page.tsx`
- `components/ClientParticles.tsx`
- `components/CursorParticles.tsx`
- `hooks/useScrollAnimation.ts`

Aman can also improve visuals on:
- `app/marketplace/page.tsx`
- `app/dashboard/page.tsx`
- `app/publish/page.tsx`
- `app/agent/[id]/page.tsx`

But for those shared product pages:
- he must not break backend wiring
- he must coordinate with Nabil or Bhumi before changing behavior

---

## Shared Critical Files

These files are shared and high-risk. Nobody should replace them wholesale.

- `app/agent/[id]/page.tsx`
- `app/agent/[id]/run/page.tsx`
- `app/dashboard/page.tsx`
- `app/marketplace/page.tsx`
- `app/publish/page.tsx`
- `app/api/agents/deploy/route.ts`
- `lib/contracts.ts`
- `lib/wallet.ts`
- `lib/automation.ts`
- `lib/agentRunner.ts`

Rule:
- if touching any shared critical file, keep the edit minimal and scoped
- mention it clearly in the PR
- request review from the relevant owner

---

## Final Remaining Work

## Track 1: Real Financial Agent Execution
Status: NOT DONE
Owner: Nabil

Goal:
- move trading, farming, and rebalancing from policy-guarded automated planning into real protocol execution

### 1.1 Trading
- integrate one real whitelisted DEX/router
- support one safe token pair first
- execute real swap from agent wallet
- enforce:
  - token allowlist
  - slippage cap
  - max spend per run
  - max daily spend
  - failure handling

Deliverable:
- one real autonomous swap path from agent wallet

### 1.2 Rebalancing
- reuse trading swap executor
- support 2-token rebalance first
- convert drift plan into one or more safe swaps
- enforce:
  - token allowlist
  - drift threshold
  - max rebalance spend
  - cooldown between rebalances

Deliverable:
- one real portfolio rebalance path from agent wallet

### 1.3 Farming
- support one whitelisted farming protocol only
- pick one supported real action:
  - deposit
  - claim
  - compound
- enforce:
  - protocol allowlist
  - token allowlist
  - amount caps
  - clear result/error reporting

Deliverable:
- one real farming action path from agent wallet

## Track 2: Automation Reliability
Status: PARTIAL
Owner: Nabil

### 2.1 Always-on Worker
- choose production/demo cron runner
- document how automation is kept alive
- test scheduled execution without manual triggering

### 2.2 Job Management
- optionally add:
  - edit execution policy
  - withdraw remaining funds
  - top up from wallet

### 2.3 Persistence
- keep JSON store for demo only if needed
- ideally move to DB
- if DB is not possible before demo, document JSON store as demo-only

## Track 3: Security and Runtime Hardening
Status: PARTIAL
Owners: Nabil + Bhumi

### 3.1 Secret Handling
- unify env handling
- ensure no secrets are committed
- confirm `.env` and local runtime files stay untracked

### 3.2 Agent Wallet Key Safety
- encrypt stored agent wallet private keys if time permits
- otherwise document current behavior as demo-only and keep store local

### 3.3 Generated Runtime Safety
- review `new Function(...)` runtime execution
- improve validation/limits if possible
- ensure bad generated code fails safely

## Track 4: AI and Route Reliability
Status: PARTIAL
Owner: Bhumi

### 4.1 Unify Gemini Path
- standardize on backend Gemini env usage
- reduce duplicate config logic
- ensure all agent routes use the same wrapper consistently

### 4.2 Response Shape Stability
- every AI route must return predictable frontend-friendly shapes
- reduce malformed/empty Gemini responses
- keep deterministic fallback where needed

### 4.3 Run Page Stability
- make sure each agent type renders:
  - clean loading state
  - clean error state
  - clean result formatting

Deliverable:
- all 6 agent types behave predictably in `OPEN INTERACTION`

## Track 5: Frontend UX and Visual Clarity
Status: PARTIAL
Owner: Aman

### 5.1 Product UI Clarity
- make execution modes visually obvious:
  - manual only
  - policy guarded
  - real on-chain execution
- improve messaging around:
  - funding needed
  - gas needed
  - no funding required

### 5.2 Shared Page Polish
- improve readability and spacing on:
  - marketplace
  - dashboard
  - publish
  - agent detail
- do not change working logic

### 5.3 Final Demo Polish
- landing page and support/legal pages remain polished
- ensure no visual regressions from future backend merges

## Track 6: Full Regression and Demo Rehearsal
Status: NOT DONE
Owners: All

### 6.1 Frontend Regression
- landing page
- marketplace
- publish
- dashboard
- agent detail
- run page

### 6.2 Agent Matrix Regression
- Trading:
  - activate
  - interact
  - create automation
  - run now
- Farming:
  - activate
  - interact
  - create automation
  - run now
- Scheduling:
  - activate
  - create automation
  - fund HLUSD
  - fund gas
  - run now
  - verify transfer
- Rebalancing:
  - activate
  - interact
  - create automation
  - run now
- Content:
  - activate
  - interact
  - create automation
  - run now
- Business:
  - activate
  - interact
  - create automation
  - run now

### 6.3 Final Demo Story
- publish new agent
- activate existing agent
- automate one content/business agent
- automate one scheduling payment
- show dashboard
- show on-chain tx / logs

---

## Branch Plan By Person

## Nabil Branches
- `nabil/trading-real-swap-executor`
- `nabil/rebalancing-real-swap-executor`
- `nabil/farming-real-protocol-action`
- `nabil/automation-worker-deployment`
- `nabil/security-persistence-hardening`

## Bhumi Branches
- `bhumi/gemini-config-unification`
- `bhumi/agent-route-response-hardening`
- `bhumi/run-page-stability`
- `bhumi/generated-runtime-safety`

## Aman Branches
- `aman/dashboard-ux-clarity`
- `aman/agent-detail-ui-polish`
- `aman/publish-ui-clarity`
- `aman/demo-visual-polish`

---

## Safe Parallelization Plan

These tasks can run in parallel safely:

### Nabil
- real swap executor backend
- automation worker deployment
- funding/security/persistence work

### Bhumi
- Gemini/path cleanup
- AI route consistency
- run-page output quality

### Aman
- dashboard clarity
- publish/detail visual polish
- non-breaking UX improvements

These tasks should not happen in parallel without coordination:
- major edits to `app/dashboard/page.tsx`
- major edits to `app/publish/page.tsx`
- major edits to `app/agent/[id]/page.tsx`
- changes to request/response contracts used by frontend

Rule:
- if two people need the same shared file, split the work into sequential PRs

---

## PR Review Matrix

| Changed Area | Required Reviewer |
|---|---|
| Contracts / automation / wallet / deploy | Nabil |
| AI routes / Gemini / run page logic | Bhumi |
| Marketing pages / visual system / animation hooks | Aman |
| Shared product pages (`dashboard`, `publish`, `agent detail`, `marketplace`) | At least 2 of the 3 |

---

## Immediate Next Sprint

### Nabil
1. Implement real trading swap executor
2. Expose one safe real execution mode in automation
3. Wire that into rebalancing

### Bhumi
1. Unify Gemini config and route behavior
2. Normalize all AI route outputs
3. Review and harden run-page execution results

### Aman
1. Improve dashboard clarity for execution modes and funding states
2. Polish agent detail and publish UX without touching backend logic
3. Help with final demo clarity and visual confidence

---

## Definition of Done

Trovia is done for the hackathon when:
- all 6 agent types can be activated and interacted with from frontend
- scheduling performs real automated payments from agent wallet
- trading, farming, and rebalancing have at least one real safe execution path each, or are explicitly demo-labeled if not completed
- dashboard and publish flows are stable
- automation runs without manual babysitting
- final demo regression passes
- no team member has overwritten another member’s core logic during merge

---

## Non-Negotiables
- do not commit secrets
- do not commit `data/automation-store.json`
- do not commit `.vscode/settings.json`
- do not push directly to `main`
- do not resolve conflicts by replacing whole files blindly
- do not break working wallet/automation/contract flows for visual changes

---

## Final Note for AI Coding Agents

If you are working from this plan:
- read the ownership section first
- stay inside your assigned files unless necessary
- if you must touch a shared critical file, keep the change minimal and explain it clearly
- prefer additive changes over rewrites
- preserve working backend/frontend wiring
- test the route or page you touched before opening a PR
