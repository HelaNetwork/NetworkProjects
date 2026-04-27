# SmartMP — Decentralized UI & Agents on Hela Network

> **HeLa Labs Blockchain Project**  
> A fully on-chain marketplace for trading, farming, scheduling, portfolio rebalancing, content reply, and business assistant agents. 

---

## 🚀 Concept

The **SmartMP** provides a premium, on-chain hub for discovering and hiring specialized AI agents on the Hela Network. 

### Featured Agents:
1. **Alpha TradeBot (Trading Agent):** High-frequency ML models for market prediction.
2. **Yield Harvester (Farming Agent):** Automates staking/yield farming for best APYs.
3. **Chrono Sync (Scheduling Agent):** ZK-private meeting organizer and calendar master.
4. **Equilibrium (Portfolio Rebalancing Agent):** Dynamic asset allocation tool.
5. **Social Echo (Content Reply Agent):** Automated context-aware messaging and engagement.
6. **BizConnect (Business Assistant Agent):** On-chain business logic for document summarization and communications.

---

## Architecture

```
SmartMP/
├── blockchain/          # Hardhat + Solidity smart contracts
│   ├── contracts/
│   │   └── SmartMP.sol   ← Agent registration, hiring, and marketplace fees
│   ├── hardhat.config.ts          ← Hela Testnet configured
│   └── package.json
└── frontend/            # Next.js 14 + Tailwind CSS (v4)
    ├── app/             
    │   ├── page.tsx               ← Main UI showcasing all 6 agents
    │   └── globals.css            ← Premium Dark Cyberpunk Mode
    └── package.json
```

## Tech Stack

| Layer | Tech |
|---|---|
| Smart Contracts | Solidity 0.8.20, Hardhat |
| Frontend | Next.js 14, React, Tailwind CSS |
| Network | **Hela Network** (EVM-compatible, testnet) |

---

## Quick Start

### 1. Smart Contracts

```bash
cd blockchain
npm install
npx hardhat compile
```

### 2. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to see the dark-themed SmartMP UI.
