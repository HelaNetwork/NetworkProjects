🚀 PayStream – Decentralized Salary Streaming with Tax Automation
📌 Problem Statement

Traditional payroll systems are:

❌ Centralized

❌ Non-transparent

❌ Delayed (monthly payouts)

❌ Complex tax handling

Employees lack real-time access to earned salary, and tax calculations are manual and inefficient.

💡 Solution

PayStream is a blockchain-based salary streaming platform built on HeLa Network that:

✅ Streams salary in real-time

✅ Automatically deducts tax (10%)

✅ Sends tax to a secure vault address

✅ Allows employees to claim earned salary anytime

✅ Provides HR dashboard with analytics

✅ Tracks live contract events using backend observer

🛠 Tech Stack

Blockchain: HeLa Testnet

Smart Contracts: Solidity (OpenZeppelin)

Backend: Node.js + Express + Ethers.js v6

Frontend: React (HR + User dashboards)

Event Listener: Smart contract event monitoring

Environment Config: dotenv

📂 Project Structure
IIT M/
|
├── project/
│      ├── contracts/
│      |   ├── paystream.sol
│      |   └── paystream_flattened.sol
|      ├── backend/
│          ├── server.js
│          ├── blockchain.js
│          ├── analytics.js
│          ├── listeners.js
│          ├── routes.js
│
├── paystream-hr-dashboard/
├── paystream-app/
│
├── shared/
│   └── abi.json
│
├── test/
│
├── README.md
└── .env.example

🔗 Smart Contract Details

Network: HeLa Testnet

Tax Percentage: 10%

Streams stored per employee

Uses SafeERC20 for secure transfers

Owner-controlled employee onboarding

⚙️ How It Works
1️⃣ HR Onboards Employee

Sets yearly salary

Smart contract creates a salary stream

2️⃣ Salary Accrues in Real-Time

Based on block timestamp

Calculated per second

3️⃣ Employee Claims Salary

Receives net amount

10% automatically sent to tax vault

4️⃣ Backend Observer

Listens for:

EmployeeOnboarded

SalaryClaimed

Updates analytics in real-time

🧪 Running the Project Locally
Backend
cd backend
npm install
node server.js


Runs on:

http://localhost:5000

Frontend (HR)
cd frontend_hr
npm install
npm start

Frontend (User)
cd frontend_user
npm install
npm start

🔐 Environment Variables

Create a .env file in backend:

RPC_URL=
PRIVATE_KEY=
CONTRACT_ADDRESS=
PORT=5000


⚠️ Never push .env to GitHub.

👩‍💻 Team Members

Ash – Smart Contract Development

You – Backend + Blockchain Integration

Shreya – HR Frontend

Vedika – User Frontend

🎯 Key Features

Real-time payroll streaming

Automatic tax withholding

Event-driven backend analytics

Dual dashboard system (HR & Employee)

Fully decentralized logic

🚀 Future Improvements

Stablecoin salary payments

Multi-tax bracket system

Treasury dashboard

Production deployment

🏁 Conclusion

PayStream demonstrates how blockchain can modernize payroll systems by making them:

Transparent

Automated

Real-time

Trustless

Built with ❤️ on HeLa Network.