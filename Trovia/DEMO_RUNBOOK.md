# Demo Runbook (Nabil)

## Objective
Run a reliable, repeatable blockchain demo sequence before judges with fallback options.

## Preflight (must pass)

1. Compile and test:
```bash
npm run compile
npm run test
```

2. Deployment/demo readiness checks:
```bash
npm run demo:check
```

Expected outcome:
- Deployed contracts have code
- HLUSD address points to a token contract
- All 6 seeded agents are present

## Deploy / Seed Sequence

1. Deploy contracts:
```bash
npm run deploy:hela
```

2. Seed all six agents:
```bash
npm run seed:hela
```

3. Run preflight again:
```bash
npm run demo:check
```

## Live Judge Flow (Blockchain checkpoints)

1. Connect wallet on HeLa testnet (Chain ID 666888).
2. Open marketplace and show all 6 agents listed.
3. Activate Scheduling Agent (HLUSD approval + activation tx).
4. Show tx hash on explorer.
5. Show dashboard activity/activation evidence.

CLI fallback for step 3 (no frontend required):
```bash
npm run activate:hela
```

## Recorded Live Proof (2026-04-18)

Activation script execution (agent id 3 - Scheduling Agent):
- Signer: `0x4E81d5892034B31f9d36F903605940f697446B6b`
- Approval tx: `0x26bca1367a1f7f04add1d8c3436e994638d6a97108378d989e8acb1fa72ab089`
- Activation tx: `0x348a88e5730cbf6596c63b17ca97ebb5beba35eb8241625b15a0dc0626e7c054`
- Activation count change: `0 -> 1`

Explorer links:
- Approval: https://testnet.helascan.io/tx/0x26bca1367a1f7f04add1d8c3436e994638d6a97108378d989e8acb1fa72ab089
- Activation: https://testnet.helascan.io/tx/0x348a88e5730cbf6596c63b17ca97ebb5beba35eb8241625b15a0dc0626e7c054

Manual source publish (explorer API v2) completed:
- AgentRegistry: `0x539834B08c1654b598a9D0a28C883253b3C0460b` (`is_verified=true`)
- AgentEscrow: `0xcD15d4C76F855D367a6f3b6b3781484dE1383af8` (`is_verified=true`)
- AgentExecutor: `0x24072496189171977c4C6198ab0493D4D1Bf2b56` (`is_verified=true`)
- DemoHLUSD: `0x6fEF5d9fe6051dED5cC838feD792c36252DF12bf` (`is_verified=true`)

## Fallback Procedure (if tx/RPC issues occur)

1. If HLUSD approval/activation fails:
- Run `npm run demo:check` and inspect blockers.
- Verify HLUSD token address is a real contract in `.env`.
- If wrong, fix `HLUSD_ADDRESS`, redeploy, reseed, rerun preflight.

2. If explorer verification automation fails:
- Use explorer API v2 manual publish flow (`/api/v2/smart-contracts/.../verification/via/standard-input`).
- Continue with live tx proof and logs.

3. If network is unstable:
- Refresh RPC provider and retry once.
- Use previously successful tx hashes and deployment artifacts from `deployments/`.

## Team Sync Reminder

After each successful push to `main`, broadcast:
- "Pull main now before next commit"
- Require branch rebase/merge with latest main before PR.
