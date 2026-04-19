⚡ HeLa PayStream: Gasless Real-Time Payroll
HeLa PayStream is a revolutionary payroll protocol built on the HeLa Official Runtime Testnet. It transforms stagnant monthly salaries into dynamic, per-second revenue streams. By utilizing a unique Gas Sponsorship mechanism, we've removed the friction of Web3, allowing employees to claim their earnings with zero gas fees.

🌍 Connecting to HeLa Network
To interact with this dApp, configure your MetaMask wallet to the HeLa Official Runtime Testnet:

Network Name: HeLa Official Runtime Testnet

New RPC URL: https://testnet-rpc.helachain.com

Chain ID: 666888

Currency Symbol: HLUSD

Block Explorer URL: https://testnet-blockexplorer.helachain.com

🚀 Hero Features
Real-Time Wealth Tracker: Salaries are calculated on-chain every block via our earnedBalance logic. Watch your earnings grow in real-time.

Gasless Claiming: Our Gas Sponsorship Tank allows employers to prepay transaction fees. Employees withdraw their salary with zero gas fees.

Autonomous Compliance: An integrated Tax Vault automatically reserves a customizable percentage (e.g., 10%) of every claim for seamless reporting.

HR Batch Onboarding: Initialize multiple employee streams in a single, gas-efficient transaction.

🍒 The "Cherry on Top" Features
🤖 HeLa Flow AI (AditiAI): An autonomous auditor that monitors the blockchain to detect anomalies and provide predictive financial runway analysis.

📄 Verified Pay-Stub Generator: One-click PDF export using jsPDF. Generates a cryptographically verified proof of income including wallet addresses, cumulative earnings, and tax deductions.

📖 How to Use (Demo Guide)
To experience the full protocol, use two separate MetaMask accounts.

1. The Employer (Account 1)
Connect Wallet: Select the Employer role.

Fund Gas Tank: Deposit HLUSD into the Gas Sponsorship Tank to enable gasless withdrawals for your team.

Initialize Stream: Enter the Employee's wallet address (Account 2), set the rate, and click Initialize Stream.

2. The Employee (Account 2)
Switch Account: Open the dApp in a separate browser window and connect with Account 2.

Wealth Tracker: Watch your active stream ticking up in real-time.

Gasless Withdrawal: Click "Withdraw Now". The transaction cost is covered by the Employer, requiring 0 HLUSD from the employee.

🏗️ Technical Architecture
Smart Contract: HeLaPayStreamMaster.sol – Manages the real-time math engine and gas sponsorship logic.

Frontend: Next.js 14, Tailwind CSS, Ethers.js.

Backend: Supabase for real-time transaction ledgering.

🏁 Installation
Clone the Repo: git clone <repo-url>

Install Dependencies: npm install

Run Locally: npm run dev
