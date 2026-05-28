# Rentible (nftr_hela)

> **A next-generation Web3 prototype built natively for the Hela Ecosystem.**

## The Problem
DeFi lacks standardized primitives for time-locked value such as vesting schedules and recurring leases.

## The Solution
A platform minting time-locked financial contracts natively as ERC721 tokens (NFTRs).

## Architecture Diagram

```mermaid
graph TD;
    UI[React Frontend] -->|Connects to| W[Web3 Wallet]
    W --> NFTRReceipt[NFTRReceipt Smart Contract]
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
