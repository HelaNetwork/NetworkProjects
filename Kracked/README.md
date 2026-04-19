# PayStream

PayStream is a real-time payroll streaming system built on HeLa Testnet. It allows HR to deposit HLUSD into a treasury and create continuous salary streams for employees. Instead of receiving salary once a month, employees earn HLUSD in real time and can withdraw their earnings at any point.

All payments are handled directly by a smart contract. There are no intermediaries. Tax is automatically deducted during withdrawal and stored in a tax vault which can later be claimed by the HR admin.

This project demonstrates real-time on-chain payroll using native HLUSD on HeLa Testnet.

---

# Tech Stack

Backend
Solidity, Hardhat, HeLa Testnet

Frontend
Next.js, ethers.js, MetaMask

Blockchain
HeLa Testnet, HLUSD native token

---

# Project Structure

backend/contracts
Contains the PayStream smart contract which manages treasury deposits, salary streaming, withdrawals, bonuses, and tax vault logic.

backend/scripts
Contains the deployment script used to deploy the contract to HeLa Testnet.

backend/test
Contains test files verifying core contract functionality including deposits, stream creation, and withdrawals.

frontend/src
Contains the Next.js frontend application.

frontend/src/app
Contains the main pages including role selection, HR dashboard, and employee dashboard.

frontend/src/utils
Contains helper functions for wallet connection, contract interaction, and network handling.

---

# Environment Variables

Create a `.env` file inside the backend folder.

Example:

HELA_PRIVATE_KEY=your_private_key_here
HELA_RPC_URL=https://testnet-rpc.helachain.com

Use the private key of the wallet that will deploy the contract.

Do not commit the `.env` file.

---

# Installation and Setup

Clone the repository:

git clone <repo-url>
cd KRACKHACK

Install backend dependencies:

cd backend
npm install

Compile the contract:

npx hardhat compile

Deploy the contract:

npx hardhat run scripts/deploy.ts --network helaTestnet

After deployment, copy the contract address and paste it into:

frontend/src/config/contract.js

Then start the frontend:

cd ../frontend
npm install
npm run dev

Open in browser:

http://localhost:3000

or

http://localhost:8080

---

# How It Works

HR Flow

• Connect MetaMask using the deployer wallet
• Deposit HLUSD into the treasury
• Create salary streams for employees

Employee Flow

• Connect MetaMask using employee wallet
• View real-time salary accrual
• Withdraw earned HLUSD at any time

Tax is automatically deducted and stored in the tax vault.

---

# Live Deployment

Network
HeLa Testnet

Chain ID
666888

Contract Address
PASTE_DEPLOYED_CONTRACT_ADDRESS_HERE

---

# Example Transactions

Deposit
PASTE_TX_HASH

Create Stream
PASTE_TX_HASH

Withdraw
PASTE_TX_HASH

---

# Running Tests

From backend folder:

cd backend
npx hardhat test

Tests cover:

• Treasury deposit
• Stream creation
• Salary accrual over time
• Withdrawals and tax deduction

---

# Notes

This project uses native HLUSD on HeLa Testnet.

The frontend connects directly to the deployed smart contract using ethers.js.

MetaMask must be connected to HeLa Testnet.
