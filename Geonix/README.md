# PayStream - Continuous Salary Streaming with Smart Contracts

PayStream is a decentralized platform enabling continuous, on-demand salary streaming between employers and employees. Built with Solidity smart contracts on the **HeLa Blockchain (Testnet)**, an Express.js backend, and a React frontend — employees earn their salary every second, in real time.

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/shivanshbadoni007/krackhack-geonix.git
cd krackhack-geonix
```
Before running anything do one thing update the wallet address of john doe to yours:-
in update-john-wallet.js add your wallet address in line 12 
and then run the file
```bash
node update-john-wallet.js
```
---

### 2. Setup & Run Backend

```bash
cd backend
npm install
```

Start the backend server:

```bash
npm start
```

Backend runs on: `http://localhost:4000`

---

### 3. Setup & Run Frontend
Do this in another terminal
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:3000`

---

## 📌 About the Project

### Problem
Traditional payroll systems make employees wait 30 days to access money they've already earned. This causes financial stress, especially for gig workers and contractors.

### Solution
PayStream streams salary **continuously and in real time** using smart contracts on the HeLa Testnet. Employees can claim their earned salary at any moment — no more waiting for payday.

---

## ⚙️ How It Works

1. **HR creates a salary stream** — sets total amount and duration for an employee
2. **Smart contract activates** — salary starts streaming per second immediately
3. **Employee claims anytime** — earned balance is transferred to their wallet instantly
4. **1% tax** is automatically deducted to the tax vault on every withdrawal
5. **HR can pause/resume streams** — total paused duration is tracked accurately on-chain

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Solidity 0.8.20, OpenZeppelin |
| Blockchain | HeLa Testnet (chainId: 666888) |
| Backend | Node.js, Express.js, SQLite (better-sqlite3) |
| Frontend | React, Vite, TailwindCSS |
| Web3 | Ethers.js v6 |
| Auth | JWT |

---

## 📄 Smart Contracts

| Contract | Address |
|---|---|
| PayStream | `0x99c1df5bda4242eB003Ba13b8E1394e2A22b26A7` |
| HLUSD Token | `0x5cB0277f586b3b7651a843B2AB75b4F2A7D944c0` |

**Network:** HeLa Testnet
**Chain ID:** `666888`
**RPC URL:** `https://testnet-rpc.helachain.com`
**Block Explorer:** `https://testnet-blockscout.helachain.com`

---

## 🔑 Key Features

- **Real-time salary streaming** — balance updates every second
- **Instant withdrawals** — employees claim earned salary anytime
- **Pause & Resume** — HR can pause streams (e.g., during leave)
- **Automatic tax deduction** — 1% deducted on every withdrawal
- **Role-based access** — HR and Employee roles with JWT authentication
- **No monthly payroll** — fully automated via smart contracts

---

## 📁 Project Structure

```
my/
├── backend/               # Express.js API server
│   ├── contracts/         # Solidity smart contracts
│   │   ├── PayStream.sol
│   │   └── MockHLUSD.sol
│   ├── src/
│   │   ├── routes/        # API routes (auth, streams)
│   │   ├── services/      # Blockchain service (hela.js)
│   │   ├── middleware/    # JWT auth middleware
│   │   ├── db/            # SQLite database
│   │   └── server.js      # Entry point
│   ├── scripts/           # Deployment scripts
│   └── deployed-addresses.json
├── frontend/              # React + Vite app
│   ├── src/
│   └── public/
└── README.md
```

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register HR or Employee |
| POST | `/api/auth/login` | Login |
| PUT | `/api/auth/wallet` | Update wallet address |
| GET | `/api/streams/my-streams` | Employee's streams |
| GET | `/api/streams/all` | All streams (HR only) |
| POST | `/api/streams/create` | Create stream (HR only) |
| POST | `/api/streams/:id/withdraw` | Claim salary |
| POST | `/api/streams/:id/pause` | Pause stream (HR only) |
| POST | `/api/streams/:id/resume` | Resume stream (HR only) |
| POST | `/api/streams/:id/cancel` | Cancel stream (HR only) |

---

## 🧑‍💻 Team

Built with ❤️ at **KrackHack 2026** on the HeLa Blockchain.
