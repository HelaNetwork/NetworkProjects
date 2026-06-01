# Rift Exchange (esports_exchange_hela)

> **A next-generation Web3 prototype built natively for the Hela Ecosystem.**

**Deployed Link:** [https://rift-ivory.vercel.app](https://rift-ivory.vercel.app)

## The Problem
Centralized betting platforms take massive fees and lack transparency in odds and payouts.

## The Solution
A peer-to-peer betting exchange for esports utilizing bonding curves and NFT land plots.

## Architecture Diagram

```mermaid
graph TD;
    UI[React Frontend] -->|Connects to| W[Web3 Wallet]
    W --> EsportsExchange[EsportsExchange Smart Contract]
    W --> LandNFT[LandNFT Smart Contract]
```

## Folder Structure
- `contracts/`: Solidity Smart Contracts
- `frontend/`: React/Vite Frontend interface
- `scripts/`: Hardhat Deployment scripts
- `test/`: Hardhat test suites

## Local Setup & Deployment

Follow these steps to run the project locally or deploy it directly to the **Hela Testnet**.

### 1. Smart Contract Setup
```bash
# Install root dependencies
npm install

# Compile smart contracts
npx hardhat compile

# (Optional) Run local Hardhat node
npx hardhat node

# Deploy to Hela Testnet
# IMPORTANT: Make sure to add your PRIVATE_KEY in the .env file first!
npx hardhat run scripts/deploy.js --network hela
```

### 2. Frontend Setup
```bash
cd frontend

# Install frontend dependencies
npm install

# Start the development server
npm run dev
```

---
*Built for the Hela Ecosystem*
