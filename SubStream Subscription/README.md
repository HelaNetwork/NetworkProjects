# SubStream (subscription_hela)

> **A next-generation Web3 prototype built natively for the Hela Ecosystem.**

## The Problem
Web3 lacks native recurring payment rails, forcing creators to rely on Web2 platforms like Patreon.

## The Solution
A fully onchain subscription manager issuing Creator Tokens and unlockable Content NFTs.

## Architecture Diagram

```mermaid
graph TD;
    UI[React Frontend] -->|Connects to| W[Web3 Wallet]
    W --> ContentNFT[ContentNFT Smart Contract]
    W --> CreatorToken[CreatorToken Smart Contract]
    W --> SubscriptionManager[SubscriptionManager Smart Contract]
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
