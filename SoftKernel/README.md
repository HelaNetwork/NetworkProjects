# PayStream — Programmable Payroll Infrastructure on HeLa

> Real-time salary streaming, treasury yield, scheduled bonuses, and OffRamp — 100% on-chain.

## Overview

PayStream is a fully on-chain dApp payroll system built specifically on the HeLa blockchain using the HLUSD native Stable Coin. Essentially, it allows CEOs/founders to create a company and subsequently allow the HRs to add employees and allow them to stream salaries per-second to employees using the stable coin.


## Product Overview

### What is your dApp about?

PayStream is a programmable payroll infrastructure built on the HeLa blockchain that enables real-time salary streaming using HLUSD stablecoin. It transforms traditional monthly salary payments into per-second streaming, allowing employees to access their earned wages instantly at any time. The platform includes treasury management, automated yield generation on reserved funds, scheduled bonuses, tax automation, and a secure OffRamp facility for converting HLUSD to fiat currency (INR).

### What problem are you solving?

Traditional payroll systems create cash flow problems for employees who wait weeks or months to access earned wages, while employers struggle with inefficient treasury management and lack of yield on capital. PayStream solves these problems by:

- **Eliminating payment delays**: Employees earn and can withdraw salary every second instead of waiting for monthly paydays
- **Improving cash flow**: Workers access earned wages instantly, reducing reliance on payday loans or credit
- **Optimizing capital efficiency**: Employers earn 5% APY on reserved payroll funds
- **Automating compliance**: Built-in tax deductions and transparent on-chain records
- **Reducing friction**: Direct crypto-to-fiat conversion via secure OffRamp
- **Enhancing transparency**: All transactions and yields are verifiable on-chain


## Use Case

### Who is this product built for?

- **Remote-first companies**: Businesses with distributed teams across borders who want to streamline international payroll
- **Crypto-native organizations**: DAOs and Web3 companies paying employees in cryptocurrency
- **Progressive employers**: Companies looking to offer innovative benefits and improve employee financial wellness
- **Employees in emerging markets**: Workers who benefit from instant access to earnings and stable currency
- **HR departments**: Teams wanting to automate payroll, bonuses, and compliance

### Why does this matter for users?

**For Employees:**
- Instant access to earned wages without waiting for payday
- Financial flexibility to handle unexpected expenses
- Transparent view of real-time earnings
- Reduced dependency on high-interest payday loans
- Scheduled bonuses with time-locked guarantees
- Easy conversion to local currency via OffRamp

**For Employers:**
- Earn yield on payroll reserves (5% APY)
- Reduce administrative overhead with automated streaming
- Attract talent with innovative payment solutions
- Transparent treasury management with on-chain analytics
- Automated tax handling and compliance
- Flexible bonus scheduling for performance incentives


## Architecture

### How does your product work?

PayStream operates through a multi-contract architecture on HeLa blockchain:

1. **Treasury Contract**: Holds employer funds with separation of available and reserved capital
2. **SalaryStream Contract**: Manages per-second salary accrual, withdrawal logic, and stream lifecycle
3. **OffRamp Contract**: Handles HLUSD → INR conversions with oracle-verified exchange rates
4. **Custom Oracle**: Fetches real-time exchange rates from CoinGecko and signs them cryptographically

**Yield Mechanism:**
- Reserved funds (committed to active streams) generate 5% APY
- Yield accumulates continuously and is claimable by employer
- Available funds remain liquid for new streams or withdrawals

**Bonus System:**
- HR schedules bonuses with time locks
- Bonuses auto-include in employee withdrawals after unlock time
- Fully on-chain with transparent unlock schedules

### What components are involved?

**Smart Contracts (Solidity):**
- `Treasury.sol`: Fund custody, deposit/withdrawal, yield calculation
- `SalaryStream.sol`: Stream creation, per-second accrual, employee withdrawals
- `OffRamp.sol`: Exchange rate verification, HLUSD→INR conversion

**Frontend (React + Vite):**
- CEO/Founder dashboard for company setup and treasury management
- HR dashboard for employee management and stream creation
- Employee portal for real-time earnings, withdrawals, and OffRamp
- Admin panel for system logs and role management

**Backend (Express.js):**
- MongoDB integration for activity logging
- Oracle rate signing service
- API endpoints for logs, analytics, and system monitoring

**Oracle Service:**
- CoinGecko API integration for live exchange rates
- ECDSA signature generation for rate verification
- On-chain signature verification in OffRamp contract

**Infrastructure:**
- Docker containerization for easy deployment
- Nginx for frontend serving
- MongoDB Atlas for persistent logging

---

## HeLa Integration

### How is your dApp leveraging the HeLa Network?

PayStream is built exclusively on the HeLa blockchain and leverages its unique features:

**HLUSD Stablecoin:**
- All salary streams use HLUSD, HeLa's native stablecoin
- Provides price stability for predictable payroll
- Enables reliable fiat conversion via OffRamp

**HeLa Testnet Deployment:**
- Chain ID: 666888
- Fast transaction finality for instant withdrawals
- Low gas fees make per-second streaming economically viable

**Network Benefits:**
- High throughput supports multiple concurrent streams
- EVM compatibility enables Solidity smart contracts
- Low and deterministic gas fee allows the founders and CEOs to make the entire process of PayRoll in a systematic manner.

**On-chain First Approach:**
- All critical logic (streaming, yield, bonuses) runs on HeLa
- No off-chain dependencies for core payroll operations
- Complete auditability via HeLa block explorer

---

## Deployment Details

### Testnet / Mainnet Status

**Current Status**: Deployed on **HeLa Testnet** (Chain ID: 666888)

### Smart Contract Addresses

| Contract | Address |
|----------|---------|
| **Treasury** | `0xC6B9dB5a99F21926501A3a52b992692488fB28d7` |
| **SalaryStream** | `0x18453dC8F01fD9f662b98573f0DE1a270817f5bB` |
| **OffRamp** | `0x561C4f1D1E7472D4C58cb379F8cFA25E064f15Cf` |


Deployment addresses are also saved [here](contracts/deployments/paystream-hela.json) after deployment.

### Live Demo Link

**Frontend**: [https://paystream.softkernel.tech](https://paystream.softkernel.tech)
**Demo Video**: [https://youtu.be/zt3LLNC0XWI](https://youtu.be/zt3LLNC0XWI)


## Key Features

| Feature | Description |
|---------|-------------|
| **Company Setup** | The founder/CEO can setup a company, assign HRs, deposit funds |
| **Per-second salary streaming** | Employees earn HLUSD every second, withdraw any time |
| **Treasury custody** | Employer funds held securely in Treasury contract |
| **Tax redirection** | Automatic percentage-based tax deduction at withdrawal to the tax vault|
| **Yield generation** | 5% APY on reserved payroll capital, claimable by employer |
| **Scheduled bonuses** | Time-locked performance bonuses, auto-included in withdrawals |
| **OffRamp (HLUSD → INR)** | Cryptographically signed exchange rates via CoinGecko |
| **Custom Oracle Setup** | An in-house oracle for the offramp to convert the rates safely and 100% security |
| **On-chain analytics** | Complete stats (streams, yield, bonuses) queryable without backend |

---

## How everything works


## Quick Start

A detailed setup is available [here](SETUP.md)
### Docker Deployment (if contracts already deployed)

```bash
Step 0: Fork the Repository

Step 1: Clone repository
git clone FORK_URL
cd Krackhack3

Step 2: Configure environment
cp .env.example .env
nano .env  # Add MongoDB URI, Oracle key, contract addresses

Step 3: Deploy
docker compose up -d --build

Access
- Frontend: http://localhost:8351
- Backend: http://localhost:8352
```

### Local Development

```bash
Step 1: Deploy contracts
cd contracts
npm install
cp .env.example .env
nano .env  # Add private key and RPC URL
npx hardhat run scripts/deploy.js --network hela

Step 2: Start backend
cd ../backend
npm install
cp .env.example .env
nano .env
npm start

Step 3: Start frontend
cd ../frontend
npm install
cp .env.example .env
nano .env
npm run dev
```

---

## Tech Stack

- **Smart Contracts**: Solidity ^0.8.9, Hardhat
- **Frontend**: React 19, Vite, ethers.js v6
- **Backend**: Express.js, MongoDB (Atlas) (For logs)
- **Blockchain**: HeLa Testnet (Chain ID: 666888)
- **Deployment**: Docker, Docker Compose
- **APIs**: CoinGecko (exchange rates)

---

## Oracle Setup

PayStream uses a custom oracle for secure OffRamp (HLUSD → INR) conversions.

### Generate Oracle Wallet

```bash
cd contracts
node generate-oracle.js
```

This generates:
- **Oracle Address** (public): Used in contract deployment
- **Oracle Private Key** (secret): Used in backend/frontend for rate signing

### Oracle Configuration

1. **During Contract Deployment**: Set `ORACLE_SIGNER` in `contracts/.env`
2. **For Backend/Frontend**: Set `ORACLE_PRIVATE_KEY` in root `.env`

The oracle:
- Fetches live exchange rates from CoinGecko
- Signs rates cryptographically with ECDSA
- Verifies signatures on-chain in OffRamp contract
- Prevents rate manipulation attacks

**Security**: The oracle private key should be kept secret and only used server-side.


## Features
- **Treasury Management**: Deposit HLUSD, track available and reserved funds
- **Yield Generation**: Earn 5% APY on reserved payroll capital
- **Stream Creation**: Set up per-second salary streams for employees
- **Bonus Scheduling**: Schedule performance bonuses with time locks
- **Analytics Dashboard**: View total streams, yield earned, bonuses paid

---
- **Real-time Earnings**: Watch salary accumulate every second
- **Instant Withdrawals**: Withdraw earned salary anytime
- **Bonus Vault**: Track scheduled bonuses with countdown timers
- **Custom Oracle**: To convert the pricing, we have our custom secure oracle to convert HLUSD to INR.
- **OffRamp**: Convert HLUSD to INR via cryptographically verified rates

---
- **Employee Management**: Add/edit employee records
- **Role Assignment**: Set CEO/HR roles
- **System Logs**: Monitor all platform activity
- **Company Updates**: Modify company details

---
