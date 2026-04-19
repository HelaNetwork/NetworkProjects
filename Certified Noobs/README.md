# PayStream – Real-Time Payroll Streaming on HeLa

Salary streaming on HeLa Testnet: HR deposits native HEA into the treasury, creates streams from that balance per employee, and employees withdraw accrued pay (with optional tax to a vault). Treasury and tax vault behave as designed: one treasury, streams funded from it, outflows to employees, tax vault, and owner.

## Repository structure

- **paystream-contract/** – Solidity contracts (NativePayStream for HEA, PayStream for HLUSD) and deploy scripts
- **paystream-frontend/** – Next.js app: HR dashboard, employee portal, wallet connect

## How to run

### 1. Deploy the contract (HeLa Testnet)

```bash
cd paystream-contract
cp .env.example .env   # or create .env
# Set HELA_RPC_URL, HELA_CHAIN_ID, PRIVATE_KEY (wallet that will be owner/HR)
# Optional: TAX_VAULT_ADDRESS (receives tax HEA), TAX_BPS (e.g. 1000 = 10%)
npm install
npm run deploy:native
```

Copy the printed **NATIVE_PAYSTREAM_ADDRESS** (or PAYSTREAM_ADDRESS) for the frontend.

### 2. Run the frontend

```bash
cd paystream-frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_SUPABASE_* and NEXT_PUBLIC_PAYSTREAM_ADDRESS=<address from step 1>
npm install
npm run dev
```

Open http://localhost:3000. Connect MetaMask to **HeLa Testnet** (Chain ID 666888).

### 3. Use the app

- **HR:** Connect with the deployer wallet (or one added as HR). Deposit HEA to treasury, create streams from treasury (single or bulk), one-time bonus (add to stream / streaming spike) from treasury, pause/resume/cancel, withdraw treasury (owner only).
- **Owner:** Can also deposit “yield” (mock) to treasury and manage HRs/ownership.
- **Employee:** Connect with the wallet address the HR used when creating your stream. View streams and withdraw accrued HEA. Streams keep accruing at the set rate until paused or cancelled.

## Features (evaluation metrics)

| Metric | Implementation |
|--------|----------------|
| **Streaming efficiency** | Base stream: per-second at fixed rate, runs until paused or cancelled. One-time bonus: finite amount, accrues only until that amount is reached. |
| **Gas / HeLa** | Deployed on HeLa Testnet; native HEA for gas and streaming. |
| **Security** | Only HR can create/pause/cancel streams; only employee can withdraw their stream; only owner can withdraw treasury and deposit yield. |
| **HR dashboard** | Deposit, create stream (single/bulk) from treasury, one-time bonus (streaming spike: add to stream), pause/resume/cancel, treasury balance, withdraw treasury (owner), yield (owner), manage HRs. |
| **Employee portal** | View streams, withdraw accrued HEA to wallet. |
| **Tax** | Configurable % to tax vault on each withdraw (set at deploy). |
| **One-time bonus** | Streaming spike only: add amount from treasury to an existing stream; employee accrues at the same rate. |
| **Yield** | Mock: owner can deposit HEA to treasury as simulated yield. |
| **Blockchain** | HeLa Testnet deployment. |

## Requirements

- Node 18+
- MetaMask (or compatible wallet) on HeLa Testnet
- HEA for gas and deposits (testnet faucet if available)

## Project state and design

See **[PROJECT_STATE.md](./PROJECT_STATE.md)** for:

- Current implementation vs track evaluation metrics
- Token/treasury flow (where HEA goes in and out)
- .env and tax vault configuration
- Email vs wallet (account) and how to connect
- What’s redundant and what’s fixed (e.g. active vs total streams)

## License

MIT
