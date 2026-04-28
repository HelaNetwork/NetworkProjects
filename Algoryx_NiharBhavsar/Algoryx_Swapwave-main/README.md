# SwapWave — Intent-Based DEX Aggregator

A web app where users describe token swaps in plain English and get the best rate across multiple DEX aggregators in real time.

## What It Does

- Parse natural language swap intent (powered by Groq AI + fallback regex)
- Fetch live quotes from 4 DEX aggregators in parallel: Paraswap, 0x, KyberSwap, OpenOcean
- Display best route with explanation and full comparison table
- Simulate or execute swaps via MetaMask
- Records swap intent on-chain via HeLa Testnet smart contract

## Tech Stack

- React + Vite (frontend)
- ethers.js v6 (wallet + transaction)
- wagmi (wallet connection)
- Groq LLaMA3 (intent parsing)
- Paraswap, 0x, KyberSwap, OpenOcean (DEX quotes)
- Solidity (HeLa Testnet smart contract)

## Smart Contract

Deployed on HeLa Testnet:
`0x28DaED322680592883F685716975D75DB1037724`

## Setup

```bash
npm install
cp .env.example .env   # fill in your keys
npm run dev
```

## Environment Variables

Create a `.env` file in the project root and fill in the following:

```env
VITE_ZEROX_KEY=        # Get free at https://0x.org/docs/api → Sign up
VITE_ALCHEMY_RPC=      # Get free at https://alchemy.com → Create App → Copy HTTP URL
VITE_WALLETCONNECT_ID= # Get free at https://cloud.walletconnect.com → Create Project
VITE_GROQ_KEY=         # Get free at https://console.groq.com → API Keys → Create Key
```

## Demo

Type something like:
- `Convert 1 ETH to USDC`
- `Swap half my eth to bitcoin`
- `Get DAI with 0.5 ETH`

## Live Demo
https://swapwave.vercel.app

## Demo Video
https://youtu.be/_K3xeWToP2M

## Smart Contract
Network: HeLa Testnet
Address: 0x28DaED322680592883F685716975D75DB1037724

## Example Transactions
1.0x12bf77af259787d61e9b996365c6e9030742706bb8e8f1b865e01f7f978d2da2 (simulate swap USDC -> ETH)
2.0x6f38bfa979d85558392855508e5c9b4b29460bb0fac89edfb42a1ac9c0b9f72b (simulate swap ETH -> DAI)
3.0x4556807c27eec3fe503cf7c9525cdcf589f5914cd08c8328d04af7bbe95ab8a8 (simulate swap ETH -> USDC)

The app parses your intent, fetches all quotes, and shows you the best rate with full route explanation.