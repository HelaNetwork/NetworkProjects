---
description: How to deploy HeLa Stealth to production
---

# Deployment Guide

Follow these steps to deploy HeLa Stealth (Frontend & Backend).

## 1. Environment Configuration
Ensure your `.env` files are correctly set for production in both directories.

### Backend (`/backend/.env`)
```bash
PORT=4000
# Ensure your production DB or RPC URL is correct
```

### Frontend (`/frontend/.env`)
```bash
VITE_API_URL=https://your-backend-api.com
```

## 2. Frontend Deployment (Vite)

// turbo
1. Build the production bundle:
   ```bash
   cd frontend
   npm run build
   ```
2. Upload the contents of the `frontend/dist` folder to your static hosting provider (Vercel, Netlify, or AWS S3).

## 3. Backend Deployment (Node.js)

1. Install dependencies on your server:
   ```bash
   cd backend
   npm install --production
   ```
2. Start the server using a process manager like PM2:
   ```bash
   pm2 start index.js --name "hela-stealth-api"
   ```

## 4. Contract Deployment (HeLa Testnet)

For the hackathon, you should deploy your own instances of the contracts to show full ownership.

### Steps:
1.  **Fund your Deployer**: Ensure your address (matching the `PRIVATE_KEY` in `backend/.env`) has test HLUSD from the [HeLa Faucet](https://testnet-faucet.helachain.com/).
2.  **Run Deploy Script**:
    ```bash
    # From the root directory
    npx hardhat run scripts/deploy.js --network hela_testnet
    ```
3.  **Automatic Sync**: The script will automatically:
    *   Deploy `HUSD`, `StealthRegistry`, `FeeManager`, `PrivacyPool`, and `PaymentRouter`.
    *   Update `frontend/.env` with the new addresses.
    *   Update `backend/.env` with the new addresses.
4.  **Verify on Explorer**: Check your contract addresses on the [HeLa Testnet Explorer](https://testnet-blockexplorer.helachain.com/).

> [!IMPORTANT]
> After deploying new contracts, you **MUST** rebuild your frontend (`npm run build`) and restart your backend to use the new addresses.
