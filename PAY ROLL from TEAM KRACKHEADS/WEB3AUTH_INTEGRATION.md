# Web3Auth + HeLa Testnet Integration

This document describes the Web3Auth integration added to connect your CorePayroll smart contract with the web app (frontend + backend).

## Steps Completed (from your screenshots)

1. **Step 1: API Keys** – Configure `VITE_WEB3AUTH_CLIENT_ID` (see below)
2. **Step 2: SDK** – Installed `@web3auth/modal`, `@web3auth/base`, and `ethers`
3. **Step 3: Initialize Web3Auth** – HeLa Testnet config in `frontpage/src/blockchain/config.ts` and `Frontendemployee/src/blockchain/config.ts`
4. **Step 4: Bridge to Ethers.js** – `loginAndConnectContract()` in both frontends uses Web3Auth provider with ethers

## Setup

### 1. Web3Auth Client ID

1. Go to [Web3Auth Dashboard](https://dashboard.web3auth.io) and sign up
2. Create a "Plug and Play" project
3. Copy your Client ID
4. In `frontpage/` and `Frontendemployee/`:
   - Copy `.env.example` to `.env`
   - Set `VITE_WEB3AUTH_CLIENT_ID=your_client_id`

### 2. Backend

Add to `Backend/.env`:

```
CONTRACT_ADDRESS=0x...   # Deployed CorePayroll address on HeLa Testnet
TAX_VAULT_ADDRESS=0x...  # Tax vault address (used at deploy)
```

### 3. Deploy CorePayroll

Deploy `blockchain.sol` to HeLa Testnet with your tax vault address. Update `CONTRACT_ADDRESS` with the deployed address.

## What’s Integrated

| Component | Feature |
|-----------|---------|
| **Treasury (Employer)** | Connect Wallet (Web3Auth) → Deposit HLUSD to CorePayroll |
| **Employee Details (Employer)** | Link employee wallet → Start/Stop on-chain stream |
| **Employee Dashboard** | Connect Wallet → View claimable amount → Withdraw |

## Preserved

- Email/password login (JWT)
- Web2 treasury (deposit/withdraw)
- Web2 stream start/pause
- All existing API routes and UI flows

## Flow

1. **Employer**: Login → Treasury → Connect Wallet → Deposit to Contract  
2. **Employer**: Employees → [Employee] → Link Wallet (employee) → Start On-Chain Stream  
3. **Employee**: Login → Overview → Connect Wallet → Withdraw (claim on-chain earnings)
