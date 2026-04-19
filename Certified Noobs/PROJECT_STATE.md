# PayStream – Project State vs Track Requirements

## Current vs Track Requirements

| Requirement | Status | Notes |
|-------------|--------|--------|
| **Asset** | Partial | Track asks for **HLUSD** (stablecoin). This repo has two paths: **(1) NativePayStream** uses **native HEA** (used by frontend today). **(2) PayStream** uses **HLUSD** (ERC20) but frontend is wired to NativePayStream. To align with “HLUSD as primary asset”, you’d wire the app to PayStream + HLUSD and deploy with `deploy.js`. |
| **Streaming efficiency** | Met | Per-second accrual at fixed rate; streams run until paused or cancelled (no automatic end). |
| **Gas / HeLa** | Met | Deployed on HeLa Testnet; native HEA used for gas and streaming in current flow. |
| **Security** | Met | Only HR/owner can create/pause/cancel; only employee can withdraw their stream; only owner can withdraw treasury. |
| **HR Dashboard** | Met | Start/Pause/Cancel streams, treasury balance, deposit, bulk create, one-time bonus, withdraw treasury, manage HRs. |
| **Employee portal** | Met | Employee view lists streams and “Withdraw” for accrued HEA. |
| **Tax module** | Met | NativePayStream: configurable `taxBps` (e.g. 1000 = 10%) to a `taxVault` address on each employee withdraw. PayStream (HLUSD): 10% to TaxVault. |
| **Active vs total streams** | Fixed | “Active Streams” now counts only streams with `active === true`. “Total Streams” = all time created (`nextStreamId`). |

---

## Token / Treasury Flow (NativePayStream – Intended Design)

The **treasury** is the contract’s native HEA balance. One source of funds; all outflows come from it.

- **In:** HR deposits **native HEA** via `deposit()` (msg.value) or `receive()`. Funds sit in the contract (treasury).
- **Stream creation:** HR calls `createStream(employee, duration, totalDeposit)` or `createStreamBatch(...)` **with no msg.value**. The contract allocates from treasury and sets rate = totalDeposit / durationSeconds. The stream does not end when that amount is paid out; it keeps accruing at that rate until paused or cancelled. So streams are funded from treasury, not from the HR’s wallet at creation time.
- **Out – employee:** Employee calls `withdraw(streamId)`. Contract sends **net** HEA to employee and **tax** HEA to `taxVault` (if configured). **Treasury → employee (net) + tax vault (tax).** Employee’s wallet balance increases.
- **Out – cancel:** HR cancels a stream; employee gets accrued (minus tax) from treasury. No refund to owner (stream runs at rate until cancelled).
- **Out – owner:** Owner calls `withdrawTreasury(amount)`. Contract sends HEA to owner. **Treasury → owner.** Use for unallocated or leftover balance once streams are done.
- **One-time bonus (streaming spike):** HR calls `addStreamBonus(streamId, amount)`. A finite amount from treasury is added; the employee can accrue that bonus only until the amount is reached. The base stream continues unbounded until paused or cancelled.
- **Yield (mock):** Owner calls `depositYield()` with msg.value. **Wallet → treasury.** Simulates yield; production could integrate with a lending protocol so funds in the vault earn yield.

**Tax vault:** Set at deploy (`TAX_VAULT_ADDRESS`, `TAX_BPS` in paystream-contract `.env`). Receives that percentage of each employee withdraw (and of accrued amount on cancel). Any address that accepts HEA (EOA or `receive() payable` contract). If not set, tax is 0.

---

## .env and Tax Vault

- **Frontend `.env.local`:** Set `NEXT_PUBLIC_PAYSTREAM_ADDRESS` to your **NativePayStream** address (from `npm run deploy:native` in paystream-contract).
- **Tax vault “which to choose”:**
  - **NativePayStream:** Tax is sent in **native HEA** to `taxVault` set at deploy time (in **paystream-contract** `.env`: `TAX_VAULT_ADDRESS`, `TAX_BPS`). That address can be any EOA or contract that accepts HEA (e.g. `receive() external payable {}`). It does **not** have to be the ERC20 `TaxVault.sol` (that one is for HLUSD).
  - **PayStream (HLUSD):** Tax is sent in **HLUSD** to the ERC20 **TaxVault** contract (deployed with `deploy.js`). So for HLUSD flow you’d use that TaxVault address.

So: for the **current** app (NativePayStream + HEA), choose **one** tax destination address (EOA or simple payable contract) and set it in **paystream-contract** `.env` as `TAX_VAULT_ADDRESS` before `deploy:native`. The frontend does not need a tax vault env var for NativePayStream.

---

## Email vs Wallet (Account)

- **Email:** Used for **app login** (Supabase). Identifies “user” in your DB / auth.
- **Wallet (account):** Used for **on-chain** identity: who is HR, who is employee, who receives HEA.

Having email and wallet differ is **normal**: e.g. log in with email, then “Connect wallet” (MetaMask). The important part is: **streams and withdrawals are keyed by wallet address**. So the employee must connect the same wallet that was used when the HR created the stream for them. Process: HR adds stream with employee’s **wallet address** → employee connects that wallet in the app → they see their streams and can withdraw. No need for email and wallet to be the same; just ensure the connected wallet matches the stream’s `employee` address.

---

## What’s Redundant or Unused

- **PayStream.sol + deploy.js:** HLUSD path; not used by the current frontend. Either remove or keep for a future “HLUSD mode” and document.
- **MockHLUSD:** Only needed if you deploy PayStream (HLUSD) and don’t have real HLUSD.
- **AnalyticsSection:** Component exists but is not rendered in the HR dashboard. Either wire it (e.g. pass treasury, tax vault balance, active count) or remove.
- **NotificationDropdown:** Uses mock data (“Employee withdrew 12.50 HLUSD” etc.). Consider wiring to real events or marking as demo-only.

---

## How to Run (Summary)

1. **Contract (NativePayStream):**  
   In `paystream-contract`: copy `.env.example` → `.env`, set `PRIVATE_KEY`, optionally `TAX_VAULT_ADDRESS` and `TAX_BPS`. Run `npm run deploy:native`. Set the printed address in the frontend.
2. **Frontend:**  
   In `paystream-frontend`: copy `.env.example` → `.env.local`, set `NEXT_PUBLIC_PAYSTREAM_ADDRESS` to that address. `npm run dev`.
3. **Connect account:**  
   Use “Connect wallet” (MetaMask). Switch to HeLa Testnet (666888). HR uses the deployer wallet (or one added as HR); employees use the wallet address the HR used when creating the stream.

---

## Employee Withdraw – Does It Increase Their Balance?

Yes. For **NativePayStream**, `withdraw(id)` does:

- `payable(msg.sender).call{value: netAmount}("")`  

So the employee’s **wallet** receives **native HEA**; their HEA balance goes up. The UI shows “Withdraw HEA” and the net amount (after tax). So the transfer from “vault” (contract treasury) to employee is working; the employee’s tokens (HEA) increase in their account.
