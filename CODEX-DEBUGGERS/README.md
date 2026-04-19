# 🛡️ ShieldAI — Wallet Guardian

> AI-powered assistant that integrates with crypto wallets (EVM-compatible) to help users understand transactions, assess risks, and make safe decisions before signing.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/Node.js-18+-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)

---

## ✨ Features

### 🔍 Transaction Explainer
Decode any raw transaction into a human-readable explanation. Understands ERC-20/721/1155 transfers, token approvals, DEX swaps, staking, and more.

### ⚡ "What If I Sign This?" Simulator
Preview the effects of a transaction before you sign it: balance changes, token approvals, NFT transfers, gas costs, and hidden interactions.

### 🛡️ Risk Detection Engine
Automated threat detection for:
- Unlimited token approvals
- NFT `setApprovalForAll` permissions
- Unknown/unverified contracts
- Flagged/scam addresses
- High-value transfers
- Suspicious gas usage

Risk scoring: **Low (0-33) / Medium (34-66) / High (67-100)**

### 💬 AI Chat Assistant (ShieldAI)
Conversational AI assistant that answers blockchain security questions in plain, beginner-friendly language. Context-aware when a transaction is loaded.

### 🔐 Safety Recommendations
Actionable advice: reject dangerous transactions, reduce approval limits, use burner wallets, and verify contracts.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), Tailwind CSS, wagmi v2, viem |
| **Backend** | Node.js, Express.js, ethers.js v6 |
| **AI** | OpenAI GPT-4o-mini (with intelligent fallbacks) |
| **Blockchain** | EVM chains — Ethereum, Polygon, Arbitrum, Sepolia |

---

## 📂 Project Structure

```
web3_AI_wallet/
├── frontend/                    # Next.js App
│   ├── src/
│   │   ├── app/                 # Pages & layout
│   │   ├── components/          # UI components
│   │   │   ├── Navbar.tsx
│   │   │   ├── WalletConnect.tsx
│   │   │   ├── TransactionPreview.tsx
│   │   │   ├── RiskMeter.tsx
│   │   │   ├── ChatAssistant.tsx
│   │   │   ├── SimulatorPanel.tsx
│   │   │   └── SafetyRecommendations.tsx
│   │   ├── lib/                 # Config & API client
│   │   └── providers/           # Web3 provider
│   └── package.json
│
├── backend/                     # Express API
│   ├── src/
│   │   ├── routes/              # API endpoints
│   │   ├── services/            # Business logic
│   │   │   ├── decoder.js       # ABI + tx decoder
│   │   │   ├── riskEngine.js    # Risk scoring
│   │   │   ├── aiService.js     # OpenAI integration
│   │   │   └── simulator.js     # Tx simulator
│   │   ├── prompts/             # AI prompt templates
│   │   └── utils/               # ABI registry, known contracts
│   ├── server.js
│   └── package.json
│
├── .env.example
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **MetaMask** browser extension (for wallet connection)
- **OpenAI API Key** (optional — app works with smart fallbacks)

### 1. Clone & Install

```bash
git clone https://github.com/your-repo/web3_AI_wallet.git
cd web3_AI_wallet

# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# Backend config
cd backend
cp .env.example .env   # Edit .env with your API keys
```

Key environment variables:
| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Optional | OpenAI key for AI features (fallback mode available) |
| `PORT` | No | Backend port (default: 3001) |
| `FRONTEND_URL` | No | Frontend URL for CORS (default: http://localhost:3000) |

### 3. Run Development Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# API runs on http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App opens at http://localhost:3000
```

### 4. Use the App
1. Open **http://localhost:3000**
2. Connect your MetaMask wallet (optional)
3. Go to **Analyze** tab → click a **sample transaction** or paste your own
4. View decoded info, risk assessment, simulation results, and AI analysis
5. Use the **AI Chat** tab to ask security questions

---

## 🧪 Sample Test Transactions

The app includes 5 built-in sample transactions:

| Sample | Risk Level | What It Tests |
|--------|-----------|---------------|
| Simple ETH Transfer | 🟢 Low | Basic value transfer |
| Unlimited USDT Approval | 🔴 High | MAX_UINT256 approval detection |
| Uniswap V2 Swap | 🟢 Low | DEX swap decoding |
| NFT SetApprovalForAll | 🔴 High | Full NFT collection access |
| Staking Deposit | 🟡 Medium | Staking contract interaction |

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze` | Full analysis (decode + risk + AI) |
| `POST` | `/api/analyze/decode` | Quick decode (no AI, faster) |
| `POST` | `/api/simulate` | Transaction simulation |
| `POST` | `/api/chat` | AI chat assistant |
| `GET` | `/api/health` | Health check |

### Example Request
```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0xdac17f958d2ee523a2206206994597c13d831ec7",
    "data": "0x095ea7b30000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488dffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
    "value": "0x0"
  }'
```

---

## 🔒 Security & Privacy

- ❌ **No private keys** are ever stored or transmitted
- ✅ All processing is **read-only** — no on-chain transactions are made
- 🔐 Transaction data is processed **server-side** and not stored
- 🛡️ AI interactions use **no user-identifiable information**

---

## 🚢 Deployment

### Frontend (Vercel)
```bash
cd frontend
npx vercel --prod
```
Set `NEXT_PUBLIC_API_URL` environment variable to your backend URL.

### Backend (Railway / Render / Fly.io)
```bash
cd backend
# Deploy following your platform's docs
# Set OPENAI_API_KEY and FRONTEND_URL in env
```

---

## 📜 License

MIT License — use freely for learning and building.

---

Built with ❤️ for Web3 safety.
