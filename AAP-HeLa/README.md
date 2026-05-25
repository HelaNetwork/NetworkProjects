# 🔐 AAP — Agent Audit Protocol
**The Trust Layer for Autonomous AI Agents on HeLa L1**

---

## 📌 Product Overview

**What is your dApp about?**

AAP (Agent Audit Protocol) is a blockchain-anchored, DAO-governed transparency and accountability framework for autonomous AI trading agents. It solves the "black box AI" problem by ensuring every decision made by an AI agent is logged, verifiable, and challengeable on the HeLa blockchain.

**What problem are you solving?**

Autonomous AI agents make high-stakes financial decisions with no transparency, no audit trail, and no mechanism for humans or DAOs to verify or challenge them. AAP introduces a standardized protocol that makes AI agent decisions fully transparent, cryptographically verifiable, and community-governable.

---

## 🎯 Use Case

**Who is this product built for?**

- Retail investors who use AI trading bots and want to verify the agent's reasoning
- DAOs and institutions that need auditable AI decision trails for compliance
- HeLa ecosystem builders who want a trust layer for AI-powered dApps

**Why does this matter for users?**

Every trade an AI agent makes is now backed by an immutable, on-chain record. Users can challenge any suspicious decision within 24 hours via DAO voting, ensuring AI agents are accountable — not just automated.

---

## 🏗️ Architecture

**How does your product work?**

```
User → AI Chatbot (Gemini / GPT-4o / Claude / Llama3)
         ↓
    Analyze Market (NSE / Crypto / MF)
         ↓
    Build PDR (Protocol Decision Record)
         ↓
    Upload to IPFS (Pinata)
         ↓
    Batch 10 PDRs → Merkle Tree
         ↓
    Anchor Merkle Root → HeLa Chain (AuditAnchor.sol)
         ↓
    24h DAO Challenge Window (ChallengeRegistry.sol)
         ↓
    Community Votes → Uphold or Override
```

**What components are involved?**

| Component | Technology |
|---|---|
| AI Agent | LangGraph + Google Gemini 1.5 Pro |
| Multi-Agent Router | Llama3, GPT-4o, Claude 3.5 (rep-gated) |
| Backend API | FastAPI + WebSocket |
| Decentralized Storage | IPFS via Pinata |
| Smart Contracts | Solidity on HeLa L1 |
| Verification | SHA-256 Hash + ZK-SNARK (Groth16) |
| Observability | ELK Stack (Elasticsearch, Logstash, Kibana) |
| Frontend | Vanilla HTML/CSS/JS — Premium Dark Dashboard |
| Data Sources | yfinance (NSE), ccxt (Crypto), MFAPI (Mutual Funds) |

---

## ⬡ HeLa Integration

**How is your dApp leveraging the HeLa Network?**

1. **AuditAnchor.sol** — Deployed on HeLa Chain. Stores Merkle roots of batched PDR hashes, providing tamper-proof, permanent proof of every AI decision.

2. **ChallengeRegistry.sol** — Deployed on HeLa Chain. Handles 24-hour DAO challenge windows with HELA token-weighted voting to dispute or uphold AI decisions.

3. **AgentRegistry.sol** — Registers and tracks all approved AI agents on-chain, creating a reputation ledger for agent accountability.

4. **PolicyRegistry.sol** — On-chain governance rules: minimum stake, challenge window duration, auto-approval thresholds — all managed by the community.

5. **HELA Token Stake** — Users must stake HELA tokens to raise a challenge, preventing spam and aligning incentives.

---

## 🚀 Deployment Details

| Field | Details |
|---|---|
| **Network** | HeLa Testnet (Chain ID: 666) |
| **Status** | ✅ Testnet Deployed |
| **AuditAnchor.sol** | Deployed (simulation mode with real contract ABI) |
| **ChallengeRegistry.sol** | Deployed (simulation mode) |
| **Live Demo** | Dashboard running locally on `http://localhost:7890` |
| **GitHub Repo** | https://github.com/Ratneshp1122/aap-hela |

**HeLa Network Config:**
```
Network Name: HeLa Testnet
RPC URL: https://testnet-rpc.helachain.com
Chain ID: 666
Currency: HELA
```

---

## 🎥 Demo

**Video Walkthrough:** https://drive.google.com/file/d/1tLrDHOFqXaLJ2g7AIY9-Q2G71uyk0enq/view?usp=sharing

**GitHub Repository:** https://github.com/Ratneshp1122/aap-hela

### Key Features Demonstrated:
- 💬 AI Chatbot — Ask about NSE stocks, crypto, portfolio
- 📊 Live Market Ticker — 11 NSE stocks + ETH/BTC updating every 8s
- 🤖 Multi-Agent Selector — Llama3 → Gemini → GPT-4o → Claude (rep-gated)
- 🔐 PDR Audit Trail — Every decision logged and verifiable
- ⬡ HeLa Anchoring — Merkle root stored on HeLa L1
- 🗳️ DAO Challenge — 24h window to dispute any AI decision
- 📈 Portfolio Overview — Holdings, P&L, agent decision timeline
- 🔭 ELK Observability — Real-time analytics and agent monitoring

---

## 🛠️ How to Run Locally

```bash
# Clone
git clone https://github.com/Ratneshp1122/aap-hela.git
cd aap-hela

# Install dependencies
pip install langgraph langchain langchain-google-genai google-generativeai fastapi "uvicorn[standard]" python-dotenv pydantic httpx websockets requests pandas numpy yfinance pandas-ta web3 ccxt

# Setup env
cp .env.example .env
# Add GOOGLE_API_KEY for live AI (optional — works without it)

# Terminal 1: Dashboard
python -m http.server 7890 --directory dashboard

# Terminal 2: Backend
uvicorn backend.main:app --port 8000 --reload

# Open
# Dashboard: http://localhost:7890
# API Docs:  http://localhost:8000/api/docs
```

---

## 👥 Team

**Team Name:** !ESC  
**Project Name:** AAP HeLa dApp  
**Track:** Consumer dApp / AI + Blockchain / DeFi Infrastructure
