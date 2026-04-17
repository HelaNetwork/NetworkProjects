# CryptoDuo - Learn Crypto on Hela Chain

CryptoDuo is a gamified crypto-learning platform inspired by Duolingo, built on the **Hela Chain**. 

## Features

- **Gamified Learning**: Interactive lessons with progress bars and 3D UI elements.
- **Hela Chain Integration**: Connect your wallet and verify lesson completion on-chain.
- **Responsive Design**: Works on mobile and desktop.
- **Modern Tech Stack**: Built with React, Tailwind CSS, Framer Motion, and Ethers.js.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the App
```bash
npm run dev
```

### 3. Deploy Smart Contract (Optional)
Navigate to the `contract` folder:
```bash
cd contract
npm install
# Update .env with your private key
npm run deploy --network hela
```

## Folder Structure

- `src/components`: UI components (Button, ProgressBar, etc.)
- `src/pages`: Home, Dashboard, and Lesson flow.
- `src/hooks`: Hela chain connection logic.
- `src/data`: Mock lesson content.
- `contract`: Solidity source code and Hardhat configuration.

## Netowrk Config (Hela Testnet)
- **RPC**: https://testnet-rpc.helachain.com
- **Chain ID**: 666888
- **Symbol**: HLSC
