# ⚡ ZapPay — WhatsApp Crypto Transfers

> Send and receive HELA tokens using simple WhatsApp messages. No crypto wallet needed. No app required. Just chat.

Built for **HackJKLU v5.0** · Blockchain Track powered by HeLa Labs · Team BLOCKCHAIN-XIII

---

## 🎯 Problem Statement

Crypto transfers today require users to install wallets, remember seed phrases, copy-paste long addresses, and navigate complex interfaces. This creates a massive barrier for everyday users who want to participate in Web3.

**ZapPay bridges WhatsApp and Web3** — making crypto as simple as sending a text message.

---

## 🚀 Live Demo

- **WhatsApp Bot**: Message `+1 415 523 8886` (Twilio Sandbox)
- **Dashboard**: [https://zappay.vercel.app](https://zappay.vercel.app)
- **Contract**: [`0x9EF05bB79358e602b21575204F2EF6dC310E1b1D`](https://testnet-scanner.helachain.com/address/0x9EF05bB79358e602b21575204F2EF6dC310E1b1D)

---

## 📦 Project Structure

```
zappay/
├── backend/          # Node.js Express server
│   ├── index.js      # Main server + WhatsApp webhook
│   ├── package.json
│   └── .env.example
├── frontend/         # React + Vite dashboard
│   ├── src/
│   │   ├── App.jsx   # Main dashboard component
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
└── contract/         # Solidity smart contract
    ├── contracts/
    │   └── HelaTransfer.sol
    ├── scripts/
    │   └── deploy.js
    └── hardhat.config.js
```

---

## 🏗️ Architecture

```
WhatsApp User
      ↓  (message)
   Twilio
      ↓  (webhook POST)
Node.js Backend  ←→  data.json (storage)
      ↓  (ethers.js)
HelaTransfer Smart Contract (Hela Testnet)
      ↑
React Dashboard  ←  polls /api every 5s
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 PIN Security | 4-digit PIN with 10-minute session expiry |
| 👛 Auto Wallet | Ethereum wallet created on first message |
| 💸 Send HELA | Transfer tokens to any registered user |
| 📥 Deposit | Fund your contract balance |
| 📤 Withdraw | Pull funds back to your wallet |
| 📊 Balance Check | Real-time balance from smart contract |
| 📋 History | Last 5 transactions in chat |
| 🔔 Notifications | Instant WhatsApp alert when you receive HELA |
| 👥 Contacts | Save people by name, send by name |
| 📈 Dashboard | Live admin panel with analytics |
| 🌐 REST API | Full cURL API for programmatic access |
| 🔒 Encryption | AES-256-GCM encrypted private keys |

---

## 💬 Bot Commands

```
Hi                              → Register / show commands
1234                            → Enter PIN (required every 10 mins)
Deposit 10 HELA                 → Fund your account
Send 5 HELA to +91XXXXXXXXXX    → Transfer to another user
Send 5 HELA to Rahul            → Transfer using saved contact
Check balance                   → View your HELA balance
Withdraw 10 HELA                → Pull funds to your wallet
Transaction history             → Last 5 transactions
Daily limit                     → Remaining daily transfer limit
My wallet                       → Show your wallet address
Add contact Rahul +91XXXXXXXX   → Save a contact
My contacts                     → List saved contacts
Remove contact Rahul            → Delete a contact
Open dashboard                  → Get dashboard link
```

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| Smart Contract | Solidity 0.8.20, Hardhat |
| Blockchain | Hela Testnet (Chain ID: 666888) |
| Backend | Node.js, Express.js |
| Blockchain SDK | Ethers.js v6 |
| WhatsApp | Twilio WhatsApp API |
| Frontend | React 18, Vite |
| Storage | Local JSON (data.json) |
| Encryption | AES-256-GCM |
| Tunneling | Cloudflare Tunnel |

---

## 📡 Smart Contract

**Contract Address (Hela Testnet)**: `0x9EF05bB79358e602b21575204F2EF6dC310E1b1D`

### Functions

| Function | Description |
|----------|-------------|
| `deposit()` | Deposit native HELA into contract |
| `transfer(to, amount)` | Transfer HELA to another address |
| `withdraw(amount)` | Withdraw HELA back to wallet |
| `getBalance(address)` | Get user's contract balance |
| `getRemainingDailyLimit(address)` | Get remaining daily transfer limit |
| `setDailyLimit(newLimit)` | Owner only: set daily limit |

### Security Features
- Daily transfer limit: 1000 HELA per user
- Balance checks before every transaction
- Zero-address protection
- Self-send protection

---

## 🔌 REST API

```bash
# Check balance
curl "http://localhost:3001/api/balance?phone=+91XXXXXXXXXX"

# Deposit
curl -X POST http://localhost:3001/api/deposit \
  -H "Content-Type: application/json" \
  -d '{"phone":"+91XXXXXXXXXX","amount":5}'

# Send
curl -X POST http://localhost:3001/api/send \
  -H "Content-Type: application/json" \
  -d '{"from":"+91XXXXXXXXXX","to":"+91YYYYYYYYYY","amount":2}'

# Withdraw
curl -X POST http://localhost:3001/api/withdraw \
  -H "Content-Type: application/json" \
  -d '{"phone":"+91XXXXXXXXXX","amount":3}'
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- Git

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/zappay.git
cd zappay
```

### 2. Deploy Contract (one time)
```bash
cd contract
npm install
# Create .env with HELA_RPC and DEPLOYER_PRIVATE_KEY
npm run compile
npm run deploy
# Copy CONTRACT_ADDRESS from output
```

### 3. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in .env values
npm run dev
```

### 4. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:3001/api
npm run dev
```

### 5. Expose Backend (for Twilio)
```bash
cloudflared tunnel --url http://localhost:3001
# Copy URL → paste in Twilio Webhook settings
```

---

## 🌍 Deployment

### Backend → Railway
1. Push to GitHub
2. New project on [railway.app](https://railway.app) → Deploy from GitHub
3. Point to `backend/` folder
4. Set all environment variables
5. Copy Railway URL → update Twilio webhook

### Frontend → Vercel
```bash
cd frontend
npx vercel
# Set VITE_API_URL to your Railway backend URL
```

---

## 🔐 Environment Variables

### Backend `.env`
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
CONTRACT_ADDRESS=0x9EF05bB79358e602b21575204F2EF6dC310E1b1D
HELA_RPC=https://testnet-rpc.helachain.com
ENCRYPTION_KEY=your_64_char_hex_key
NODE_ENV=development
PORT=3001
DASHBOARD_URL=https://your-frontend-url.com
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:3001/api
```

---

## 📊 Example Transactions (Hela Testnet)

| # | TX Hash | Description |
|---|---------|-------------|
| 1 | `0xcdad4a2ee714557fa2d7a9000475fc515d06355d382a5f04aceb3235b003a384` | Deposit HELA |
| 2 | `0xc245a1021f8122249ae90590770a6992c5712a3c128a60538f9237e70430e3a0` | Send HELA |
| 3 | `0x528696de9d5ed06d932873d481956249d89877efb7d6c20d99160f19e4f8d405` | Withdraw HELA |

---

## 🛣️ Roadmap

- [ ] Mainnet deployment
- [ ] Multi-token support (USDT, USDC)
- [ ] DEX integration for token swaps
- [ ] MongoDB for production storage
- [ ] Telegram bot support
- [ ] QR code payments
- [ ] Non-custodial option via WalletConnect

---

## 👥 Team

**BLOCKCHAIN-XIII** · HackJKLU v5.0

---

## 📄 License

MIT License
