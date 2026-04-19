# Trovia QA Checklist

Mark each item `PASS` / `FAIL` during final verification.

## Core Setup
- `git pull origin main`
- `npm install`
- `nvm use 22`
- `npm run dev`
- `npm run automation:watch` in a second terminal
- MetaMask is on HeLa testnet `666888`
- Connected wallet has native gas
- Connected wallet has HLUSD

## Marketplace
- Open `/marketplace`
- Confirm only the 6 live agents are shown:
  - Trading
  - Farming
  - Scheduling
  - Rebalancing
  - Content
  - Business
- Confirm weak/demo/name-generator agents are hidden
- Confirm the `Coming Soon` section shows 6 upcoming agents
- Confirm upcoming agents are clearly marked as not live
- Confirm live agent cards open the correct detail pages

## Publish
- Open `/publish`
- Test `Describe with AI` mode
- Generate a safe agent draft
- Run safety review
- Confirm approved safe draft can publish
- Test `Technical JSON` mode
- Fill runtime code manually
- Run safety review
- Confirm technical agent can publish
- Confirm malicious prompt/sample gets blocked or flagged correctly

## Wallet
- Connect wallet from navbar
- Disconnect wallet
- Confirm disconnect prompt appears
- Confirm clicking yes disconnects app state
- Reconnect wallet
- Confirm dashboard and pages recognize wallet again

## Agent Detail Pages
- `/agent/1` trading
- `/agent/2` farming
- `/agent/3` scheduling
- `/agent/4` rebalancing
- `/agent/5` content
- `/agent/6` business
- Confirm config fields render correctly
- Confirm activate works
- Confirm `OPEN INTERACTION` works
- Confirm automation creation works
- Confirm status card updates correctly
- Confirm latest job state is shown, not a stale one
- Confirm funded jobs render green instead of red

## Run Pages
- Trading run page returns trading analysis/result
- Farming run page returns farming recommendation/result
- Scheduling run page returns schedule response
- Rebalancing run page returns rebalance result
- Content run page returns generated content/reply
- Business run page returns business answer
- Confirm no payload mismatch or broken rendering
- Confirm no 500 errors in browser network panel

## Dashboard
- Open `/dashboard`
- Confirm active agents load
- Confirm automation jobs load
- Confirm readiness badges are correct:
  - `READY TO RUN`
  - `NEEDS GAS`
  - `NEEDS HLUSD`
- Confirm logs stay inside their boxes
- Confirm successful jobs show green styling
- Confirm long errors wrap and scroll correctly
- Confirm copy wallet button works
- Confirm `SEND HLUSD` exists on dashboard jobs
- Confirm `OPEN GAS FAUCET` exists
- Confirm `FUND GAS` works
- Confirm `RUN NOW`, `PAUSE`, and `RESUME` work

## Scheduling Agent Real Flow
- Activate scheduling agent
- Create automation
- Fund HLUSD
- Fund gas
- Run now
- Confirm real transfer succeeds
- Confirm tx hash appears
- Confirm dashboard/logs update
- Confirm wallet balance decreases appropriately

## Trading Agent Real Flow
- Activate trading agent with `hlusd/dusdc`
- Set threshold to trigger immediately
- Create automation with guardrails
- Fund HLUSD from wallet
- Fund gas if needed
- Run now
- Confirm real swap succeeds
- Confirm tx hash appears
- Confirm dashboard/logs update
- Confirm wallet balance changes appropriately

## Rebalancing Agent Real Flow
- Activate rebalancing agent with HLUSD/DUSDC allocations
- Create automation
- Fund HLUSD
- Fund gas
- Run now
- Confirm real rebalance swap succeeds
- Confirm tx hash appears
- Confirm post-run funding state updates correctly

## Farming Agent Real Flow
- Activate farming agent with:
  - protocol `demo-farm`
  - pool `hlusd-usdc`
  - amount `2`
- Create automation
- Fund HLUSD
- Fund gas
- Run now
- Confirm real deposit succeeds
- Confirm tx hash appears
- Confirm post-run balance decreases and farming result appears

## Content Agent Automation
- Create content automation
- Confirm no HLUSD requirement appears
- Run now
- Confirm result lands in dashboard logs

## Business Agent Automation
- Create business automation
- Run now
- Confirm result lands in dashboard logs
- Confirm no fake funding requirement appears

## Automation Worker
- Keep `npm run automation:watch` running
- Create or resume at least one due job
- Wait for scheduled interval
- Confirm worker picks it up without manual `RUN NOW`
- Confirm logs update automatically

## Funding UX
- Confirm gas faucet is labeled as gas, not HLUSD
- Confirm direct HLUSD funding from wallet works on:
  - agent page
  - dashboard
- Confirm status refresh updates after funding
- Confirm stale funding-status bug is gone

## API / Backend Smoke
- `GET /api/agents`
- `GET /api/agents/:id`
- `GET /api/agents/user/:address`
- `GET /api/automation/overview?ownerAddress=...`
- `GET /api/automation/jobs?ownerAddress=...`
- `PATCH /api/automation/jobs/:jobId` with `run_now`
- Confirm all return expected data on the live app

## Final Demo Readiness
- One clean example prepared for each of the 6 agents
- One clean publish flow prepared
- One clean automation flow prepared
- One clean dashboard/log proof prepared
- No overflow or misleading red success states left
- No dead/basic agents in the live marketplace

## Failure Capture
- Page URL
- Agent id
- Button clicked
- Visible error text
- Browser console error
- Network response body
