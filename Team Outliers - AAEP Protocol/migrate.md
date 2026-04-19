# GasSafe → HeLa Blockchain Migration Guide

> **Source:** [HeLa Labs Docs – Build on Testnet](https://docs.helalabs.com/build-on-hela/build-on-testnet)  
> **Target Network:** HeLa Testnet (then Mainnet)  
> **Current Network:** Sepolia / Holesky (Ethereum testnets)

---

## Overview

GasSafe is an EVM-compatible dApp built on Ethereum testnets. Since HeLa Chain is **fully EVM-compatible**, migration requires minimal code changes — primarily updating RPC endpoints, Chain ID, and the native token symbol (ETH → HLUSD). The smart contract (`GasSafe.sol`) and backend logic can be reused almost verbatim.

---

## HeLa Network Details

### Testnet

| Property       | Value                                          |
|----------------|------------------------------------------------|
| Network Name   | HeLa Testnet                                   |
| RPC URL        | `https://testnet-rpc.helachain.com`            |
| Chain ID       | `666888`                                       |
| Symbol         | `HLUSD`                                        |
| Block Explorer | `https://testnet-blockexplorer.helachain.com`  |
| Faucet         | `https://testnet-faucet.helachain.com`         |

### Mainnet

| Property       | Value                                      |
|----------------|--------------------------------------------|
| Network Name   | HeLa Mainnet                               |
| RPC URL        | `https://mainnet-rpc.helachain.com`        |
| Chain ID       | `8668`                                     |
| Symbol         | `HLUSD`                                    |
| Block Explorer | `https://helascan.io`                      |

---

## Prerequisites

Before starting the migration:

1. **Node.js** — Check with `node -v` (install from https://nodejs.org if missing)
2. **MetaMask** — Configure with HeLa Testnet RPC (see Network Details above)
3. **HLUSD Test Tokens** — Get 10 HLUSD every 24h from the [Testnet Faucet](https://testnet-faucet.helachain.com)
4. **solc 0.8.9** — HeLa currently **only supports Solidity 0.8.9** (see Step 1 below)
5. **Your deployer wallet private key** (already in `.env` as `PRIVATE_KEY`)

> ⚠️ **WARNING:** HeLa currently only supports **Solidity compiler version `0.8.9`**. The current `GasSafe.sol` uses `^0.8.19` which must be pinned to `0.8.9` before deployment.

---

## Step 1 — Update the Smart Contract (`contracts/GasSafe.sol`)

### 1a. Pin the Solidity Version

Open `contracts/GasSafe.sol` and change line 2:

```diff
- pragma solidity ^0.8.19;
+ pragma solidity 0.8.9;
```

> **Note:** Using the caret `^` would allow newer patch versions. HeLa requires exactly `0.8.9`, so use the exact version without `^`.

### 1b. No Logic Changes Required

All GasSafe contract logic — SBT issuance, escrow locking/releasing, audit anchoring — is standard EVM-compatible Solidity. No contract logic changes are needed.

---

## Step 2 — Recompile the Contract

Delete any existing compiled artifacts first, then recompile targeting `0.8.9`:

```bash
# Remove old compiled files
rm -rf contracts/compiled/

# Recompile with solc 0.8.9
npx solc@0.8.9 --abi --bin contracts/GasSafe.sol -o contracts/compiled/
```

Verify the output files are created:
```
contracts/compiled/contracts_GasSafe_sol_GasSafe.abi
contracts/compiled/contracts_GasSafe_sol_GasSafe.bin
```

---

## Step 3 — Update Environment Variables (`.env`)

Open `.env` and make the following changes:

```diff
  # GasSafe Environment Config
  PRIVATE_KEY=0x<your_private_key>

- SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
+ HELA_RPC_URL=https://testnet-rpc.helachain.com

  PORT=3001

- CONTRACT_ADDRESS=0x20d4F09c0117A282519FaD748162C74D6Ce27FeD
+ CONTRACT_ADDRESS=   # leave blank — will be filled after Step 5 deployment

  HF_TOKEN=<your_hf_token>
```

> ⚠️ **CAUTION:** Your `PRIVATE_KEY` is already in `.env` — make sure it has enough HLUSD testnet tokens for gas. Get them from the [faucet](https://testnet-faucet.helachain.com) before proceeding.

---

## Step 4 — Update the Deploy Script (`contracts/deploy.js`)

Replace the RPC URL resolution and network detection logic:

```diff
  async function deploy() {
-   const RPC_URL =
-     process.env.HOLESKY_RPC_URL ||
-     process.env.SEPOLIA_RPC_URL ||
-     "https://ethereum-holesky-rpc.publicnode.com";
+   const RPC_URL =
+     process.env.HELA_RPC_URL ||
+     "https://testnet-rpc.helachain.com";

    const PRIVATE_KEY = process.env.PRIVATE_KEY;

    if (!PRIVATE_KEY) {
      console.error("No PRIVATE_KEY found in .env");
      console.log("\nSetup instructions:");
-     console.log("1. Get testnet ETH from https://holesky-faucet.pk910.de/");
-     console.log("2. Add to .env:  PRIVATE_KEY=0x...   HOLESKY_RPC_URL=https://...");
+     console.log("1. Get testnet HLUSD from https://testnet-faucet.helachain.com");
+     console.log("2. Add to .env:  PRIVATE_KEY=0x...   HELA_RPC_URL=https://testnet-rpc.helachain.com");
      process.exit(1);
    }

    // ... (balance check — keep as-is, works with HLUSD)

    const config = {
      contractAddress: address,
      ownerAddress:    wallet.address,
-     network: RPC_URL.includes("holesky") ? "holesky" : "sepolia",
+     network: RPC_URL.includes("testnet-rpc.helachain") ? "hela-testnet" : "hela-mainnet",
      deployedAt: new Date().toISOString(),
      abi: ABI,
    };

-   const explorer = RPC_URL.includes("holesky")
-     ? `https://holesky.etherscan.io/address/${address}`
-     : `https://sepolia.etherscan.io/address/${address}`;
+   const explorer = RPC_URL.includes("testnet-rpc.helachain")
+     ? `https://testnet-blockexplorer.helachain.com/address/${address}`
+     : `https://helascan.io/address/${address}`;
  }
```

---

## Step 5 — Deploy `GasSafe.sol` to HeLa Testnet

Run the deployment:

```bash
npm run deploy
```

**Expected output:**
```
Deploying from: 0xYourWalletAddress
Balance: X.XX HLUSD
Deploying GasSafe.sol...
Tx sent: 0x...
   Waiting for confirmation...
GasSafe deployed at: 0xNewHeLaContractAddress
Config saved to backend/data/contract.json
Deployment complete!
View on explorer: https://testnet-blockexplorer.helachain.com/address/0x...
```

After deployment:
- **Copy the new contract address** from the output
- **Update `.env`:** Set `CONTRACT_ADDRESS=0xNewHeLaContractAddress`
- `backend/data/contract.json` will be auto-updated by the deploy script

---

## Step 6 — Update the Backend Chain Service (`backend/agents/chainService.js`)

Update the RPC URL fallback in `chainService.js` (line 24–26):

```diff
  const provider = new ethers.JsonRpcProvider(
-   process.env.SEPOLIA_RPC_URL || "https://ethereum-holesky-rpc.publicnode.com"
+   process.env.HELA_RPC_URL || "https://testnet-rpc.helachain.com"
  );
```

Also update the startup log in `server.js` (line 24):

```diff
- console.log(`Chain: ${process.env.SEPOLIA_RPC_URL ? "Sepolia testnet" : "MOCK mode"}`);
+ console.log(`Chain: ${process.env.HELA_RPC_URL ? "HeLa testnet" : "MOCK mode"}`);
```

---

## Step 7 — Configure MetaMask for HeLa

Add HeLa Testnet to MetaMask manually:

1. Open MetaMask → **Settings** → **Networks** → **Add Network**
2. Fill in the following:
   - **Network Name:** `HeLa Testnet`
   - **RPC URL:** `https://testnet-rpc.helachain.com`
   - **Chain ID:** `666888`
   - **Currency Symbol:** `HLUSD`
   - **Block Explorer URL:** `https://testnet-blockexplorer.helachain.com`
3. Click **Save** and **Switch to HeLa Testnet**
4. Get test tokens: Paste your wallet address at [https://testnet-faucet.helachain.com](https://testnet-faucet.helachain.com)

---

## Step 8 — Update Frontend (if needed)

If the frontend hardcodes any chain/network references, search and replace them:

```bash
# Search for Ethereum-specific references in frontend source
grep -r "sepolia\|holesky\|etherscan\|11155111\|17000" frontend/src/
```

Common replacements:

| Old Value                           | New Value                                          |
|-------------------------------------|----------------------------------------------------|
| `11155111` (Sepolia Chain ID)       | `666888`                                           |
| `17000` (Holesky Chain ID)          | `666888`                                           |
| `https://sepolia.etherscan.io`      | `https://testnet-blockexplorer.helachain.com`      |
| `https://holesky.etherscan.io`      | `https://testnet-blockexplorer.helachain.com`      |
| `ETH` symbol                        | `HLUSD`                                            |

---

## Step 9 — Verify Deployment on HeLa Explorer

1. Go to [https://testnet-blockexplorer.helachain.com](https://testnet-blockexplorer.helachain.com)
2. Paste your new contract address in the search bar
3. Verify:
   - Contract is created and bytecode is visible
   - Owner address matches your deployer wallet
   - Transactions/events are visible (SBT issuance, escrow events, audit anchoring)

---

## Step 10 — Run & Test the Full Stack

```bash
# Start the backend server
npm run dev

# In a separate terminal, start the frontend (development mode)
cd frontend && npm run dev
```

Test the full AAEP protocol flow:

| Step | Endpoint | On-chain Function |
|------|----------|-------------------|
| 1 | `POST /api/register` | `issueSBT()` on HeLa |
| 2 | `POST /api/book` | `lockSubsidy()` on HeLa |
| 3 | `POST /api/deliver` | `releaseSubsidy()` on HeLa |
| 4 | `POST /api/audit/anchor` | `anchorAuditRoot()` on HeLa |

Check all transactions on the [HeLa Testnet Explorer](https://testnet-blockexplorer.helachain.com).

---

## Optional — Hardhat Integration

If you prefer Hardhat for deployment management (instead of the current `solc` + `ethers.js` workflow):

```bash
# Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv

# Initialize project
npx hardhat
# Select "Create a JavaScript project"
```

Create `hardhat.config.js` in the project root:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.9",  // HeLa requires exactly 0.8.9
  networks: {
    hela: {
      url: process.env.HELA_RPC_URL || "https://testnet-rpc.helachain.com",
      chainId: 666888,
      accounts: [process.env.PRIVATE_KEY]
    },
    helaMainnet: {
      url: "https://mainnet-rpc.helachain.com",
      chainId: 8668,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

Deploy via Hardhat:

```bash
# Deploy to HeLa Testnet
npx hardhat run scripts/deploy.js --network hela

# Deploy to HeLa Mainnet
npx hardhat run scripts/deploy.js --network helaMainnet
```

---

## Mainnet Migration Checklist

When ready to move from testnet to HeLa Mainnet:

- [ ] Audit and test all contract functions on testnet first
- [ ] Update `.env`: `HELA_RPC_URL=https://mainnet-rpc.helachain.com`
- [ ] Fund your deployer wallet with real HLUSD for mainnet gas
- [ ] Run `npm run deploy` (or `npx hardhat run scripts/deploy.js --network helaMainnet`)
- [ ] Update `.env`: `CONTRACT_ADDRESS=0xNewMainnetAddress`
- [ ] Update Block Explorer links to `https://helascan.io`
- [ ] Re-verify all API endpoints against the mainnet contract

> **Important:** On mainnet, `SUBSIDY_AMOUNT` in `GasSafe.sol` is `0.001 ether` (= 0.001 HLUSD). Verify this value is correct for your production use case before deploying.

---

## Summary of All Required File Changes

| File | What to Change |
|------|----------------|
| `contracts/GasSafe.sol` | `pragma solidity ^0.8.19` → `pragma solidity 0.8.9` |
| `.env` | Remove `SEPOLIA_RPC_URL`, add `HELA_RPC_URL`, update `CONTRACT_ADDRESS` |
| `contracts/deploy.js` | Replace Holesky/Sepolia RPC URLs + explorer URLs with HeLa equivalents |
| `backend/agents/chainService.js` | `SEPOLIA_RPC_URL` → `HELA_RPC_URL` in provider init (line 25) |
| `server.js` | Update startup log message for HeLa |
| `frontend/src/` | Replace any hardcoded Ethereum chain IDs / explorer URLs |
| `hardhat.config.js` *(new, optional)* | Add `hela` and `helaMainnet` network configs with Chain IDs |

---

## Resources

- 📖 [HeLa Docs — Build on Testnet](https://docs.helalabs.com/build-on-hela/build-on-testnet)
- 📖 [HeLa Docs — Deploy with Hardhat](https://docs.helalabs.com/build-on-hela/build-on-testnet/deploy-smart-contracts-with-hardhat)
- 📖 [HeLa Docs — Deploy with Remix](https://docs.helalabs.com/build-on-hela/build-on-testnet/deploy-smart-contracts-with-remix)
- 📖 [HeLa Docs — Network Endpoints](https://docs.helalabs.com/network-endpoints-and-explorer/network-endpoints-and-explorer)
- 🔍 [HeLa Testnet Explorer](https://testnet-blockexplorer.helachain.com)
- 🔍 [HeLa Mainnet Explorer (HeLaScan)](https://helascan.io)
- 💧 [Testnet Faucet (10 HLUSD / 24h)](https://testnet-faucet.helachain.com)
- 💬 [HeLa Developer Discord](https://discord.gg/NEBtTztJCj)
