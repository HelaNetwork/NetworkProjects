PayStream: Real-Time Payroll Streaming on HeLa Network
Overview
PayStream is a decentralized payroll management system that transitions traditional bi-weekly or monthly salary cycles into a continuous, second-by-second financial flow. Built on the HeLa Network, the platform addresses the critical barriers of high gas fees and price volatility that have previously made real-time "Money Streaming" impractical for large-scale enterprise use.

By leveraging HeLa’s stablecoin-native gas architecture (HLUSD), PayStream provides businesses with a predictable, low-cost solution to compensate the modern workforce in real-time.

Problem Statement
Traditional payroll is rigid and fails to align with the immediate liquidity needs of employees. While blockchain-based streaming protocols exist, high transaction costs on legacy networks like Ethereum prevent businesses from scaling these solutions to hundreds of employees. PayStream solves this by utilizing HeLa’s high-throughput, low-latency infrastructure to ensure that gas costs remain negligible and stable.

Key Features
1. Smart Contract Engine
The core logic is written in Solidity and deployed on the HeLa Testnet. It utilizes a flow-rate calculation to determine real-time balances:

Precision Math: Implements 18-decimal fixed-point arithmetic to prevent rounding errors during per-second value transfers.

HLUSD Integration: Uses HLUSD as the primary asset for both salary payments and gas fees, ensuring architectural consistency.

2. HR Administration Dashboard
A comprehensive management portal for payroll administrators to:

Stream Management: Start, Pause, and Cancel salary streams for individual employees or departments.

Treasury Oversight: Monitor total locked value (TVL) and manage corporate HLUSD balances.

Access Control: Robust administrative permissions utilizing OpenZeppelin standards to ensure only authorized HR personnel can initiate streams.

3. Employee Self-Service Portal
A user-centric interface for workers to track their earnings in real-time:

Real-time Counter: A live dashboard showing accumulated earnings since the last withdrawal.

On-Demand Withdrawal: Allows employees to "Claim" accrued funds directly to their HeLa-compatible wallet at any time.

4. Automated Compliance (Tax Module)
A built-in logic gate that automatically redirects a configurable percentage (default 10%) of every stream to a designated "Tax Vault," simplifying corporate tax withholding and reporting.

Technical Stack
Blockchain: HeLa Network (Testnet)

Smart Contracts: Solidity, OpenZeppelin

Frontend: React.js / Next.js

Web3 Integration: Ethers.js / Viem

Gas Token: HLUSD

Evaluation Metrics Compliance
Streaming Efficiency: Accurate per-second calculations without cumulative loss.

Gas Optimization: Minimized state updates to leverage HeLa's cost-efficiency.

Security: Implemented ReentrancyGuard and strict AccessControl.

Compliance: Automated 10% tax redirection logic.

Getting Started
Prerequisites
Node.js (v16.x or higher)

MetaMask or a HeLa-compatible wallet

HeLa Testnet HLUSD for gas and testing

Installation
Clone the repository:

Bash
git clone https://github.com/wrathrager/krackhack26.git
cd krackhack26
Install dependencies:

Bash
npm install
Configure Environment Variables:
Create a .env file in the root directory and add your HeLa Testnet credentials:

Code snippet
PRIVATE_KEY=your_private_key
HELA_RPC_URL=https://testnet-rpc.helachain.com
Deploy Smart Contracts:

Bash
npx hardhat run scripts/deploy.js --network hela
Run the Frontend:

Bash
npm run dev
Future Roadmap
Yield Integration: Implementing logic to deposit idle treasury funds into HeLa-native DeFi protocols to earn interest for the employer.

Scheduled Bonuses: Adding "Streaming Spikes" for performance-based rewards.

Fiat On/Off Ramps: Integration with local payment gateways to convert HLUSD to local currency seamlessly.

License
Distributed under the MIT License. See LICENSE for more information.
