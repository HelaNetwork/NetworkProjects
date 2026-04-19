# HelaPe - Real-Time Payroll Streaming on HeLa Chain

> Revolutionizing payroll with blockchain technology - Earn every second, withdraw anytime.

[![HeLa Network](https://img.shields.io/badge/Network-HeLa%20Testnet-blue)](https://testnet-rpc.helachain.com)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-orange)](https://soliditylang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Product Overview

### What is HelaPe?

**HelaPe** is a decentralized payroll streaming application that enables **continuous, real-time salary payments** on the blockchain. Instead of traditional monthly or bi-weekly payroll cycles, employees earn their salary every single second and can withdraw their earned amount at any time.

### Problem Statement

Traditional payroll systems have several critical issues:

-  **Cash Flow Problems**: Employees wait weeks or months to receive their earned salary, causing financial stress
-  **Delayed Access**: Workers can't access money they've already earned until payday
-  **Cross-Border Friction**: International payments are slow, expensive, and riddled with intermediaries
-  **Inflexibility**: Fixed payment schedules don't adapt to individual needs or emergencies
-  **Opportunity Cost**: Earned but locked funds can't be used or invested

**HelaPe solves these problems** by creating a trustless, transparent, and continuous payment stream where employees:
- Earn salary every second in real-time
- Withdraw any amount, anytime, instantly
- Receive payments on-chain with full transparency
- Benefit from yield generation on unwithdawn balances
- Experience zero payment delays or processing times

---

## Use Case

### Who is This Built For?

#### **Employees / Workers**
- **Freelancers & Gig Workers**: Get paid in real-time for ongoing projects instead of waiting for project completion
- **Remote Workers**: Access earned wages immediately without cross-border delays
- **Full-Time Employees**: Eliminate financial stress by accessing earned salary before traditional payday
- **International Workers**: Receive payments instantly across borders without hefty fees

#### **Employers / HR Departments**
- **Web3 Companies**: Pay distributed teams globally with cryptocurrency efficiency
- **DAOs & Decentralized Organizations**: Implement transparent, automated payroll systems
- **Startups**: Offer innovative compensation structures to attract talent
- **Traditional Companies**: Modernize payroll infrastructure with blockchain technology

### Why Does This Matter?

1. **Financial Freedom**: Workers gain immediate access to their earned wages, improving cash flow and reducing reliance on payday loans or credit
2. **Transparency**: All payment streams are visible on-chain, ensuring trust between employers and employees
3. **Flexibility**: Employers can pause/resume streams, add bonuses, and manage payroll dynamically
4. **Cost Efficiency**: Eliminates intermediaries, payment processors, and international transfer fees
5. **Yield Generation**: Unwithdawn balances earn 5% APY, providing passive income for patient employees

---

## Architecture



### How It Works

#### **1. Stream Creation (Employer)**
```solidity
createStream(streamId, recipientAddress, ratePerSecond, deposit, startTime)
```
- Employer deposits tokens into the PayStream contract
- Defines payment rate per second (e.g., $10/hour = ~0.0028 tokens/second)
- Sets recipient (employee) address and start time
- Contract calculates stop time based on deposit÷rate

#### **2. Real-Time Earning (Employee)**
- Every second, the vested amount increases automatically
- Formula: `vestedAmount = (currentTime - startTime - pausedDuration) × ratePerSecond`
- No transaction needed - math happens on-chain during queries

#### **3. Flexible Withdrawals (Employee)**
```solidity
withdraw(streamId, amount)
```
- Employee can withdraw any amount up to their vested balance
- 10% tax is automatically deducted and sent to TaxVault
- Remaining amount is transferred to employee's wallet
- Transaction completes instantly on HeLa Network

#### **4. Advanced Features**

**Bonus Spikes**
```solidity
addBonusSpike(streamId, amount, reason)
```
- Employers can add instant bonuses (e.g., performance awards, tips)
- Bonuses are immediately available for withdrawal

**Pause/Resume Streams**
```solidity
pauseStream(streamId)
resumeStream(streamId)
```
- Employers can pause streams (e.g., during leave, layoffs)
- Paused duration doesn't count toward vested amount
- Stop time extends automatically when resumed

**Yield Generation**
- Unwithdawn balances earn **5% APY** (Annual Percentage Yield)
- Calculated as simple interest on remaining deposit
- Formula: `yield = (balance × 0.05 × timeElapsed) / secondsPerYear`

**Stream Cancellation**
```solidity
cancelStream(streamId)
```
- Sender or recipient can cancel stream
- Unvested funds are refunded to employer
- Vested funds remain available for employee withdrawal

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Blockchain** | HeLa Network | Layer-1 blockchain for smart contract execution |
| **Smart Contract** | Solidity 0.8.24 | PayStream contract with streaming logic |
| **Token Standard** | ERC-20 | Payment token (MockHLUSD for testing) |
| **Security** | OpenZeppelin | Access control, reentrancy guards |
| **Frontend** | Next.js 14 + TypeScript | Modern React framework for UI |
| **Web3 Integration** | Ethers.js / Wagmi | Blockchain interaction library |
| **Wallet Connection** | RainbowKit | Multi-wallet connection support |
| **Styling** | Tailwind CSS | Responsive UI design |
| **Development** | Hardhat | Smart contract compilation, testing, deployment |

---

## HeLa Integration

### Why HeLa Network?

HelaPe leverages the **HeLa Network** to provide:

1. **High Performance**
   - Fast block times for near-instant transactions
   - Low latency for real-time payment streaming
   - Efficient gas costs for frequent withdrawals

2. **EVM Compatibility**
   - Full Ethereum Virtual Machine support
   - Seamless integration with existing Web3 tools (Hardhat, Ethers.js)
   - Easy migration and deployment of Solidity contracts

3. **Scalability**
   - Can handle thousands of concurrent payment streams
   - Suitable for enterprise-level payroll systems
   - Cost-effective for micro-transactions (per-second payments)

### HeLa-Specific Implementation

- **Network Configuration**: Connected to HeLa Testnet (Chain ID: 666888)
- **RPC Endpoint**: Uses official HeLa RPC at `https://testnet-rpc.helachain.com`
- **Smart Contracts**: Deployed and verified on HeLa blockchain
- **Gas Optimization**: Smart contract designed for minimal gas usage on HeLa
- **Token Standard**: Uses ERC-20 compatible tokens (MockHLUSD) on HeLa

---

## Deployment Details

### Network Information
- **Network**: HeLa Testnet
- **Chain ID**: `666888`
- **RPC URL**: `https://testnet-rpc.helachain.com`
- **Status**: **Live on Testnet**

### Deployed Smart Contracts

| Contract | Address | Description |
|----------|---------|-------------|
| **PayStream** | [`0x08f770Cf65BA21BeC00859F83fc0036184E02997`](https://testnet-explorer.helachain.com/address/0x08f770Cf65BA21BeC00859F83fc0036184E02997) | Main payment streaming contract |
| **MockHLUSD** | [`0xD0d869eB35b2Bf5abE5683c17753de0505D929a8`](https://testnet-explorer.helachain.com/address/0xD0d869eB35b2Bf5abE5683c17753de0505D929a8) | Test ERC-20 token for payments |

### Contract Features
- Stream Creation & Management
- Real-Time Vesting Calculation
- Flexible Withdrawals with Tax Deduction
- Pause/Resume Functionality
- Bonus Spike Integration
- Yield Generation (5% APY)
- Stream Cancellation & Refunds
- Multi-Stream Support per User
- Reentrancy Protection
- Access Control (Owner-based)

### Live Demo
 **Frontend Application**: [[Link](https://hela-pe.vercel.app/)]

---

## Demo


### Video Walkthrough
**Demo Video**: [[Link](https://youtu.be/odotMF9-RgA?si=FB9WG8Hqiy8aD86t)]:
1. Connecting wallet to HeLa Testnet
2. Creating a payment stream as employer
3. Switching to employee view
4. Watching balance increase in real-time
5. Withdrawing earned salary
6. Adding a bonus spike
7. Pausing and resuming a stream

### Key Demo Features

| Feature | Demonstration |
|---------|---------------|
| **Real-Time Earning** | Watch balance increment every second |
| **Instant Withdrawal** | Withdraw any amount and receive funds immediately |
| **Bonus System** | Add performance bonuses that appear instantly |
| **Pause/Resume** | Demonstrate stream pausing during leave |
| **Yield Generation** | Show APY earnings on unwithdawn balance |
| **Multi-Stream** | Create and manage multiple employee streams |

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/KDS-7Git/HelaPe-Krackhack26.git
cd HelaPe-Krackhack26/PayStream
```

### 2. Setup Blockchain Environment

Navigate to the blockchain directory and install dependencies:

```bash
cd blockchain
npm install
```

Create a `.env` file in the blockchain directory:

```env
PRIVATE_KEY=0x<your_private_key>
HELA_RPC_URL=https://testnet-rpc.helachain.com
```

**Get Your Private Key:**
1. Install MetaMask extension
2. Create/login to your MetaMask account
3. Click account icon → Three dots menu → Account Details
4. Click "Export Private Key" and enter password
5. Copy your private key (with `0x` prefix)

### 3. Deploy Smart Contracts

```bash
cd blockchain
npx hardhat run scripts/deploy.ts --network hela
PayStream deployed to: 0x...
```

Save these contract addresses for the next step.

### 4. Configure Frontend Environment

In the `frontend` directory, create a `.env.local` file with the deployed contract addresses:

```env
NEXT_PUBLIC_PAYSTREAM_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_MOCK_TOKEN_ADDRESS=0x...
```

### 5. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 6. Configure Frontend Environment

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_HELA_RPC_URL="https://testnet-rpc.helachain.com"
NEXT_PUBLIC_HELA_CHAIN_ID="666888"
NEXT_PUBLIC_PAYSTREAM_CONTRACT_ADDRESS=0x08f770Cf65BA21BeC00859F83fc0036184E02997
NEXT_PUBLIC_MOCK_TOKEN_ADDRESS=0xD0d869eB35b2Bf5abE5683c17753de0505D929a8
```

### 7. Start the Development Server

```bash
npm run dev
```

The web application will be available at **http://localhost:3000**

---

## User Guide

### For Employers (HR Dashboard)

1. **Connect Wallet**
   - Click "Employer Dashboard" on landing page
   - Connect your wallet (MetaMask recommended)
   - Ensure you're on HeLa Testnet (Chain ID: 666888)

2. **Get Test Tokens**
   - Click "Mint HLUSD" if your balance is zero
   - Request test tokens for development/demo purposes

3. **Create Payment Stream**
   - Fill in employee details:
     - Stream ID (unique identifier)
     - Employee wallet address
     - Monthly salary amount
     - Hourly/monthly rate toggle
     - Start date (leave blank for 60 seconds from now)
   - Approve token spending
   - Confirm stream creation transaction

4. **Manage Active Streams**
   - View all active streams in dashboard
   - Pause/Resume streams as needed
   - Add bonus spikes for performance rewards
   - Cancel streams to refund unvested amounts

### For Employees

1. **Access Dashboard**
   - Click "Employee Dashboard" on landing page
   - Connect your wallet
   - Enter your Stream ID (provided by employer)

2. **View Real-Time Earnings**
   - Watch your earned balance increase every second
   - See total vested amount minus withdrawals
   - Track yield earnings on unwithdawn funds

3. **Withdraw Salary**
   - Enter withdrawal amount (up to available balance)
   - Confirm transaction
   - Receive tokens instantly (minus 10% tax)

4. **Track Benefits**
   - View bonus spikes from employer
   - Monitor yield accrual (5% APY)
   - Check payment history and stream status

---

## Project Structure

```
HelaPe/
├── blockchain/                 # Smart contract infrastructure
│   ├── contracts/
│   │   ├── PayStream.sol      # Main streaming contract
│   │   ├── MockHLUSD.sol      # Test ERC-20 token
│   ├── scripts/
│   │   ├── deploy.ts          # Deployment script
│   │   ├── checkStream.js     # Stream status checker
│   │   └── debugTransaction.js
│   ├── test/
│   │   └── PayStream.test.ts  # Comprehensive test suite
│   ├── hardhat.config.ts      # Hardhat configuration
│   └── package.json
│
├── frontend/                   # Next.js web application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx       # Landing page
│   │   │   ├── employee/      # Employee dashboard
│   │   │   └── hr/            # Employer dashboard
│   │   ├── components/
│   │   │   ├── Header.tsx     # Navigation header
│   │   │   └── MockRampService.tsx  # Fiat conversion demo
│   │   ├── config/
│   │   │   └── wagmi.ts       # Web3 configuration
│   │   ├── hooks/             # Custom React hooks
│   │   ├── abis/              # Contract ABIs
│   │   └── contexts/          # React contexts
│   ├── public/                # Static assets
│   ├── .env.local            # Environment variables
│   └── package.json
│
└── README.md                  # This file
```

---

## Testing

### Run Smart Contract Tests

```bash
cd blockchain
npx hardhat test
```

### Test Coverage

Our comprehensive test suite covers:
- Stream creation and validation
- Vesting calculations
- Withdrawal functionality with tax deduction
- Pause/resume mechanics
- Bonus spike integration
- Yield generation calculations
- Stream cancellation and refunds
- Edge cases and error handling
---
## Contact & Support

- **GitHub**: [KDS-7Git/HelaPe-Krackhack26](https://github.com/KDS-7Git/HelaPe-Krackhack26)
- **Issues**: [Report a Bug](https://github.com/KDS-7Git/HelaPe-Krackhack26/issues)
- **Email**: [gmail](mailto:kdshacker359@gmail.com)

---