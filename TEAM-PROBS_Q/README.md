# 🌊 PayStream — Salary Streaming Payroll dApp

> Real-time salary streaming on **HeLa Testnet** using **HLUSD** for payments and gas fees.

[![Built on HeLa](https://img.shields.io/badge/Chain-HeLa%20Testnet-6366f1?style=flat-square)](https://helachain.com)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue?style=flat-square)](https://soliditylang.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square)](https://nextjs.org)

---

## ✨ Features

- **Per-Second Salary Streaming** — Deterministic, drift-free accrual with remainder handling
- **Pause / Resume / Cancel** — Full stream lifecycle management with correct accounting
- **Tax Withholding** — Automatic percentage deduction to TaxVault on each withdrawal
- **Batch Operations** — Create streams for 50+ employees in a single transaction
- **Gas Optimized** — Storage-packed structs, minimal writes, HLUSD-native gas model
- **HR Dashboard** — Treasury management, stream creation (single + CSV), stream management, compliance view
- **Employee Portal** — Live streaming earned display, withdraw, history

---

## 🔗 HeLa Testnet Details

| Parameter | Value |
|---|---|
| **RPC URL** | `https://testnet-rpc.helachain.com` |
| **Chain ID** | `666888` |
| **Explorer** | [testnet-blockexplorer.helachain.com](https://testnet-blockexplorer.helachain.com) |
| **HLUSD Token** | `0xBE75FDe9DeDe700635E3dDBe7e29b5db1A76C125` |
| **Faucet** | [testnet-faucet.helachain.com](https://testnet-faucet.helachain.com) |
| **Gas Model** | HLUSD-native (gas fees paid in HLUSD stablecoin) |

> **Source**: [HeLa Official Docs](https://docs.helachain.com), [ChainList](https://chainlist.org/chain/666888)

---

## 📦 Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **MetaMask** or compatible wallet
- **HLUSD** testnet tokens from [faucet](https://testnet-faucet.helachain.com)

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd hackathon

# Install contract deps
cd contracts
npm install

# Install frontend deps
cd ../frontend
npm install
```

### 2. Configure Environment

Create `contracts/.env`:

```env
DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
HLUSD_ADDRESS=0xBE75FDe9DeDe700635E3dDBe7e29b5db1A76C125
```

### 3. Run Tests

```bash
cd contracts
npx hardhat test
```

All 26 tests should pass:
- Accrual accuracy (start, mid, end)
- Remainder handling & final settlement
- Pause/resume (single & multiple cycles)
- Cancel (stops accrual, withdrawal, no over-withdraw)
- Tax split (single & multiple withdrawals)
- Access control (HR-only operations)
- Batch creation
- Treasury operations

### 4. Deploy to HeLa Testnet

```bash
cd contracts
npx hardhat run scripts/deploy_hela_testnet.ts --network hela_testnet
```

This deploys `TaxVault → PayrollTreasury → PayStream`, wires them together, and saves addresses to `deployed-addresses.json`.

### 5. Update Frontend Config

Copy the deployed addresses from `contracts/deployed-addresses.json` into `frontend/src/config/contracts.ts`:

```typescript
export const CONTRACTS = {
  HLUSD: "0xBE75FDe9DeDe700635E3dDBe7e29b5db1A76C125",
  TAX_VAULT: "<deployed TaxVault address>",
  TREASURY: "<deployed PayrollTreasury address>",
  PAY_STREAM: "<deployed PayStream address>",
};
```

### 6. Start Frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🎯 Demo Walkthrough

### As HR / Admin:

1. **Connect wallet** (deployer wallet has HR role by default)
2. **💰 Treasury Tab** → Approve + Deposit HLUSD into treasury
3. **➕ Create Tab** → Enter employee address, amount (e.g., 3000 HLUSD), duration (30 days), tax (1000 = 10%)
4. **Or** upload `sample_employees.csv` for batch creation
5. **📋 Manage Tab** → View all streams, Pause/Resume/Cancel as needed
6. **🏛️ Compliance Tab** → View TaxVault balance and tax configuration

### As Employee:

1. **Connect employee wallet** → Navigate to Employee Portal
2. See **live streaming** earned amount updating every second
3. Click **Withdraw** → Receives 90% net, 10% goes to TaxVault
4. View stream details (rate/sec, start/end, tax %, remainder)

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌───────────┐
│ PayrollTreasury  │────▶│    PayStream      │────▶│ TaxVault  │
│ (HLUSD deposits) │     │ (streaming logic) │     │  (taxes)  │
└─────────────────┘     └──────────────────┘     └───────────┘
       ▲                    ▲         │
       │                    │         │
    HR deposits          HR manages   Employee withdraws
                         streams      (net = amount - tax)
```

### Smart Contracts

| Contract | Purpose |
|---|---|
| **PayStream.sol** | Core streaming: create/pause/resume/cancel streams, withdraw with tax split |
| **PayrollTreasury.sol** | Holds HLUSD deposits, funds stream creation |
| **TaxVault.sol** | Receives and holds withheld taxes |

### Key Design Decisions

1. **Drift-free math**: `ratePerSecond = totalAmount / duration`, `remainder = totalAmount % duration`. Remainder paid only at final settlement.
2. **Storage packing**: `uint64` timestamps + `uint16` taxBps in packed struct slots → reduced gas.
3. **CEI pattern**: Checks-Effects-Interactions on every external call, ReentrancyGuard on withdraw.
4. **Cancel freezes time**: `endTime` set to cancel timestamp so earned is deterministic post-cancel.

---

## ⛽ Gas Report

Measured using Hardhat local network:

| Operation | Gas Used | Per Stream | Savings vs Single |
|---|---|---|---|
| **Single createStream** | 251,262 | 251,262 | — |
| **Batch 10 streams** | 1,756,325 | 175,632 | **-30.1%** |
| **Batch 50 streams** | 8,582,633 | 171,652 | **-31.7%** |

### Run Gas Report

```bash
cd contracts
npx hardhat run scripts/gas-report.ts
```

### HeLa's HLUSD Gas Model

HeLa Chain uses **HLUSD (a USD-pegged stablecoin) as the native gas token**. This provides:

- **Predictable costs**: Gas fees are denominated in USD-equivalent, eliminating volatile gas pricing
- **Simple budgeting**: HR can accurately predict payroll operational costs
- **Formula**: `Total Gas Fee (HLUSD) = Gas Used × Gas Price`
- **Optimization**: Batch operations reduce per-stream gas by 30%+, compounding savings with HLUSD's stable pricing

### Storage Optimization

```solidity
// Packed struct layout:
// Slot 1: employee (20B) + status (1B) + taxBps (2B) = 23B → 1 slot
// Slot 2: startTime (8B) + endTime (8B) + pausedAt (8B) + totalPaused (8B) = 32B → 1 slot
// Remaining: ratePerSecond, deposited, withdrawn, remainder → 4 slots each
```

---

## 🧪 Tests

```bash
cd contracts
npx hardhat test
```

**26 tests** covering:

| Category | Tests |
|---|---|
| Deployment & Admin | 3 |
| Stream Creation | 4 |
| Batch Creation | 2 |
| Accrual Accuracy | 3 |
| Pause / Resume | 4 |
| Cancel | 3 |
| Tax Split | 2 |
| Remainder Handling | 1 |
| Access Control | 2 |
| Treasury | 2 |

---

## 🔐 Security Notes

- **ReentrancyGuard** on `withdraw()` prevents reentrancy attacks
- **SafeERC20** for all token transfers
- **Checks-Effects-Interactions** pattern throughout
- **Access Control**: Owner + HR role system; employees can only withdraw their own funds
- **Input Validation**: Explicit revert reasons, cap on tax (≤50%), zero-address checks
- **Cancel safety**: endTime frozen at cancel, refund sent to treasury, no remainder on early cancel
- **No floating-point math**: All integer arithmetic with explicit remainder tracking

---

## 📁 Project Structure

```
hackathon/
├── contracts/
│   ├── contracts/
│   │   ├── PayStream.sol          # Core streaming contract
│   │   ├── PayrollTreasury.sol    # HLUSD deposit treasury
│   │   ├── TaxVault.sol           # Tax withholding vault
│   │   └── MockHLUSD.sol          # Test token
│   ├── scripts/
│   │   ├── deploy_hela_testnet.ts # Deployment script
│   │   └── gas-report.ts          # Gas measurement
│   ├── test/
│   │   └── PayStream.test.ts      # 26 unit tests
│   └── hardhat.config.ts
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── page.tsx           # Landing page
│       │   ├── hr/page.tsx        # HR Dashboard
│       │   └── employee/page.tsx  # Employee Portal
│       ├── components/
│       │   ├── Providers.tsx      # wagmi + RainbowKit
│       │   └── Navbar.tsx
│       └── config/
│           └── contracts.ts       # ABIs + addresses + chain
├── sample_employees.csv
└── README.md
```

---

## 🚀 Deployment

### Smart Contracts (HeLa Testnet)

1.  **Configure**: Ensure `contracts/.env` has `DEPLOYER_PRIVATE_KEY`.
2.  **Deploy**:
    ```bash
    cd contracts
    npx hardhat run scripts/deploy_prod.ts --network hela_testnet
    ```
3.  **Verify**: scripts will automatically update `frontend/src/config/contracts.ts`.

### Frontend (Vercel)

This project is a monorepo. To deploy the frontend to Vercel:

1.  **Import** the repository in Vercel.
2.  **Configure Project**:
    -   **Framework Preset**: Next.js
    -   **Root Directory**: Click "Edit" and select `frontend`.
        *(This is crucial because the Next.js app lives in a subdirectory)*
3.  **Environment Variables**:
    -   Add `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` (if using WalletConnect).
4.  **Deploy**!

---

## 📄 License

MIT
