# Onchain Scheduler: Decentralized Cron on Hela

**Team Name**: SmashCoders  
**Hackathon**: Offgrid Hackathon

Onchain Scheduler is an autonomous, decentralized cron execution engine built on the **Hela Chain**. It enables users, protocols, and developers to schedule delayed transactions, recurring subscriptions, and onchain reminders natively without relying on centralized web2 backend servers.

---

## Project Summary (PS)

**Web3 Infrastructure & Tooling (Smart Contract Automation)**

*   **Scheduled Transactions**: Trustlessly queue transactions that can only be executed at or after an exact timestamp.
*   **Recurring Subscriptions**: Set up recurring payments loops for DAOs, SaaS platforms, and recurring services where payments execute intervally.
*   **Reminders & Automation**: Easily script complex automated tasks directly from our beautifully designed "Paper-Theme" dashboard. Use Hela's fast finality to ensure tasks execute precisely when they are meant to.
*   **Cost Efficiency**: Because the Hela network utilizes **HLUSD** for stable gas fees, recurring operations operate at completely predictable costs.

---

## Technical Architecture

The architecture interacts directly with the **Hela Testnet**:

- **CronScheduler Contract**: An immutable ledger of scheduled jobs. It tracks user-submitted function `calldata`, target addresses, and handles validation of timeouts and repeat intervals before permitting execution.
- **Off-chain Keepers (Relayers)**: A network mechanism that periodically pings the `executeTask()` function. Anyone can run a keeper.
- **Vite/React Frontend**: A highly-optimized, typography-first dashboard using Ethers.js to easily abstract cron scheduling into a few simple clicks.

---

## Key Features

### 1. Fully Trustless Execution
Tasks are locked to specific temporal thresholds verifiable by block timestamps. No one can execute your tasks early.

### 2. Predictable Interval Execution
Perfect for subscription payments or automated reward distributions, natively supported via `.interval`.

### 3. Clean Paper UI
A radical departure from cluttered web3 dashboards. We utilize an aesthetic, minimalist "Paper Theme" offering a warm, ink-on-paper feel for maximal readability.

---

## Getting Started

Follow these steps to clone the repository and run the frontend/backend locally.

### 1. Clone the Repository
```bash
git clone https://github.com/SmashCoders/onchain-scheduler.git
cd onchain-scheduler
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
cd frontend
npm install
cd ..

# Install contract dependencies
cd blockchain
npm install
cd ..
```

### 3. Environment Configuration
Create a `.env` file in the `blockchain` directory:
```env
# Blockchain
PRIVATE_KEY=0xYourPrivateKey

# RPC
HELA_RPC_URL=https://testnet-rpc.helachain.com
```

### 4. Running the Frontend
```bash
cd frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to start scheduling.

---

## Smart Contract Deployment

Find the corresponding source files in `/blockchain`.

1. **Compile**: `npx hardhat compile`
2. **Deploy**: `npx hardhat run scripts/deploy.ts --network helaTestnet`

The blockchain framework is fully integrated with `@nomicfoundation/hardhat-toolbox`.

---

## Network Reference: Hela Testnet
- **RPC**: `https://testnet-rpc.helachain.com`
- **Chain ID**: `666888`
- **Native Currency**: `HLUSD` (Gas)
- **Explorer**: [testnet-blockscout.helachain.com](https://testnet-blockscout.helachain.com)
- **Faucet**: [testnet-faucet.helachain.com](https://testnet-faucet.helachain.com/)
