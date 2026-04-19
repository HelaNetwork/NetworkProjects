# The Trustworthy Autonomous Agent Protocol (TAAP)

A full-stack web3 application that helps DAOs, organizations, and developers safely run autonomous AI Agents. Administrators can intercept an agent's intended action, run it through a Gemini-powered Explainability Engine for a risk assessment, and securely release the verified transaction to the HeLa blockchain.

---

## Product Overview

### What is your dApp about?
TAAP (Trustworthy Autonomous Agent Protocol) is a comprehensive "Command Center" dashboard that ensures the safe execution of autonomous AI agents by providing an intercept layer and AI-powered governance feedback.

### What problem are you solving?
As AI agents gain the ability to hold funds and execute on-chain transactions autonomously, DAOs and organizations face severe risks of bugs, exploits, or hallucinated decisions draining treasuries. TAAP solves this by enforcing an AI-audited "human-in-the-loop" intercept layer. We prevent rogue scripts from executing blindly.

---

## Use Case

### Who is this product built for?
- **DAO Guardians** looking to protect their treasury from rogue agent activity.
- **DeFi Protocols** running quantitative trading bots requiring human oversight.
- **Web3 Developers** sandbox testing autonomous AI agents.
- **Organizations** that want immutable compliance logs for AI logic.

### Why does this matter for users?
- **Intent Interception**: Stops an AI script from executing blindly by freezing the transaction off-chain.
- **AI-Powered Risk Scoring**: Uses advanced LLM technology (Gemini 2.5) to dynamically catch potential exploits.
- **Immutable Audit Trails**: Every decision is cryptographically locked into the HeLa Testnet for total transparency.
- **Autonomous Dispute Resolution**: Background AI Tribunal automatically reviews challenged decisions and adjusts on-chain agent reputation without requiring manual intervention.

---

## Architecture

### How does your product work?
1. **Intercept**: An Agent attempts an action; our Interceptor API halts it and queues it.
2. **Assess**: The Explainability Engine (Gemini) assesses risk and generates a 0-10 score with human-readable rationale.
3. **Verify**: A human Guardian reviews the intent on the Dashboard and cryptographically signs approval via MetaMask.
4. **Execute**: The verified decision is permanently recorded to the HeLa blockchain.
5. **Dispute**: If challenged within 24 hours, the background Gemini AI Tribunal automatically resolves the dispute on-chain and alters the agent's reputation.

### What components are involved?
- **Frontend**: React, Vite, Vanilla CSS (Glassmorphism), Web3Modal & Ethers.js
- **Backend**: Python 3.12, FastAPI, Web3.py, LangChain + Gemini 2.5 Flash
- **Smart Contract**: `AgentAuditLogger.sol`

---

## HeLa Integration

### How is your dApp leveraging the HeLa Network?
TAAP leverages the HeLa Testnet as the immutable base layer for agent accountability. Every approved decision, challenge, and AI Tribunal verdict is recorded directly on-chain using the `AgentAuditLogger.sol` smart contract. We utilize HeLa's EVM-compatibility and fast finality to seamlessly sign governance transactions via Web3 browser wallets, ensuring transparent and tamper-proof agent histories.

---

## Deployment Details

- **Testnet / Mainnet Status**: Deployed on HeLa Testnet
- **Smart contract addresses**: `0x2AEa811a201CC6E2279D4bD117414007225c0F41` (AgentAuditLogger)
- **Live demo link**: *Add your live Vercel/Netlify link here*

---

## Demo

### Screenshots / Video Walkthrough
(https://drive.google.com/file/d/1QAVI9MtEIbEu21y3pEqHFzT8SDBsgg90/view?usp=sharing)

---

## Features

✅ **Implemented Features:**

- User authentication with Firebase (signup, login).
- Secure Web3 Wallet connections (Mobile Scanner & Browser Extension).
- Dedicated local API endpoint to intercept any agent's workflow.
- Background AI processing to analyze context and calculate Risk Score (1-10).
- Deep-dive dashboard to review pending AI intents.
- Cryptographic execution of verified decisions to the HeLa blockchain.
- Master Audit Log to view historical executed transactions with explorer links.
- Dispute Center UI with live countdowns and automated Gemini AI Tribunal for resolving challenged decisions on-chain.
- Agent Sandbox UI to manually inject decision tests directly from the browser, with real-time reputation tracking.
- Python mock toolkit (`populate_dashboard.py` and `mock_agent.py`) for developers.

---

## Project Structure

```text
5_Pandav/
├── backend/                    # Backend directory (FastAPI)
│   ├── ai_explainer.py         # LangChain & Gemini initialization
│   ├── blockchain.py           # Web3.py HeLa Testnet logic
│   ├── config.py               # Envs and ABI loading
│   ├── main.py                 # App entry point & Routing
│   ├── mock_agent.py           # Direct Smart-Contract executing script
│   ├── populate_dashboard.py   # Developer script to hit Interceptor API
│   ├── abi.json                # Smart Contract ABI mapping
│   ├── requirements.txt        # Python dependencies
│   └── .env                    # Environment variables
│
├── frontend/                   # Frontend directory (React + Vite)
│   ├── src/
│   │   ├── components/          
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/             
│   │   │   └── Web3Modal.js     # Web3Modal Initialization (HeLa Config)
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx
│   │   ├── pages/               
│   │   │   ├── LandingPage/
│   │   │   ├── Auth/
│   │   │   └── Dashboard/       # Dashboard Suite (Sandbox, History, etc.)
│   │   ├── App.jsx              # Main app routing component
│   │   └── main.jsx             # Entry point
│   ├── .env                     # Frontend environment variables
│   ├── package.json             # NPM dependencies
│   └── vite.config.js           # Vite configuration
│
└── README.md
```

---

## API Endpoints

### Interceptor & Audit (`/audit`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/audit/submit-intent` | AI Agent hits this to log a requested payload |
| `GET`  | `/audit/pending` | Dashboard fetches queued intents for Guardian review |
| `POST` | `/audit/verify` | Triggered by Guardian to write decision to the blockchain |

### Blockchain History (`/decisions`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/decisions` | Get all executed decisions loaded from the Smart Contract |
| `GET`  | `/decisions/{id}` | Get specific details for an executed decision |

### Explainability (`/explain`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/explain/all` | Fetches risk scores for all decisions in a single cached call |
| `GET`  | `/explain/{id}` | Analyzes a historical executed decision |
| `POST` | `/explain/batch` | Analyzes multiple historical decisions sequentially |
| `DELETE` | `/explain/cache` | Clears the backend LLM result caches |

### DAO Dispute Logic (`/challenge`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/challenge/{id}/status` | Check if a decision's timelock has expired |
| `POST` | `/challenge/{id}` | Formulate args to freeze a smart-contract payload and kick off AI Tribunal |
| `GET`  | `/review/{id}` | Poll endpoint for the background AI Tribunal verdict |

---

## Frontend Routes

| Route | Component | Protected | Description |
|-------|-----------|-----------|-------------|
| `/` | `LandingPage` | No | Public landing page |
| `/login` | `AuthPage` | No | User login |
| `/signup` | `AuthPage` | No | User registration |
| `/dashboard` | `Dashboard` | Yes | Command Center (Pending Intents) |
| `/dashboard/history` | `AuditHistory` | Yes | Fully executed transaction logs |
| `/dashboard/history/:id`| `DecisionDetails` | Yes | Deep dive into AI execution rationale |
| `/dashboard/disputes` | `DisputeCenter` | Yes | Portal for freezing rogue actions |
| `/dashboard/sandbox` | `AgentSandbox` | Yes | Inject intents manually for API testing |
| `/dashboard/settings` | `Settings` | Yes | Readout of network health and RPC status |

---

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- WalletConnect Cloud account
- Google Cloud / AI Studio account (for Gemini 2.5 API)
- A MetaMask wallet funded with Testnet `HL` tokens

### Backend Setup

1. **Navigate to Backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # Mac/Linux
   pip install -r requirements.txt
   ```

3. **Create `.env` file:**
   ```env
   HELA_RPC=https://testnet-rpc.helachain.com
   CONTRACT_ADDRESS=your_deployed_contract_addr
   PRIVATE_KEY=your_agent_private_key_here
   GOOGLE_API_KEY=your_gemini_api_key
   CHALLENGE_WINDOW_SECONDS=3600
   ```

4. **Run the server:**
   ```bash
   uvicorn main:app --reload
   ```
   Backend will run on `http://localhost:8000`

### Frontend Setup

1. **Navigate to Frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   ```

4. **Install Metamask Wallet in Browser:**
   - Go to https://metamask.io/ 
   - Follow instructions on website to add wallet as extension
   
5. **Run the development server:**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

---

## Usage Guide

### 1. Authentication
- Visit `http://localhost:5173`
- Click "Login" or "Sign Up" securely powered by Firebase.

### 2. Injecting Agent Logic
- To simulate an Agent, run `python populate_dashboard.py` in the backend folder.
- Alternatively, go to the **Agent Sandbox** via the Sidebar and submit an intent manually.

### 3. Guardian Command Center
- Return to your Dashboard.
- Review the fresh pending intents and their Gemini Risk Score (1-10).
- Connect your Web3 Wallet via the top right corner.
- Click **"Verify & Release"** to cryptographically sign the safe decisions directly to the HeLa Testnet!

### 4. Dispute Center (DAO Control)
- Navigate to the **Dispute Center**.
- Any recent action that has been approved shows up here for a 24hr window. DAOs can aggressively challenge these items to revert state if logic was flawed.
- Challenging a decision triggers a backend-signed transaction on the HeLa network, and immediately initiates a background Gemini AI Tribunal.
- The Tribunal will review the challenge, deliver an UPHELD or REJECTED verdict, and automatically adjust the agent's on-chain reputation score.

---

## Testing Checklist

### ✅ Authentication & Routing
- [x] Sign up with Firebase credentials
- [x] Login with existing credentials
- [x] Unauthenticated users redirected accurately
- [x] Top level nested Sidebar routing

### ✅ Explainer Pipeline & Risk Engine
- [x] Interceptor API successfully hooks agent payloads
- [x] Prompt payload properly routed to Gemini 2.5 Flash Lite
- [x] Extract accurate Risk Score (1-10) reliably
- [x] Explainability details render flawlessly on UI

### ✅ Web3 Execution
- [x] Web3 correctly connects via injected browser wallets (MetaMask)
- [x] Backend Formulates Raw Transactions using local Private Keys for Governance functions
- [x] Web3 execution commits properly to HeLa node RPC
- [x] Explorer Links dynamically map to testnet-blockexplorer.helachain.com

### ✅ Dispute Analytics
- [x] Timelocks dynamically recognized by Backend logic
- [x] DAO Dashboard flags transactions nearing deadline with live countdowns
- [x] AI Tribunal correctly parses challenges and evaluates UPHELD/REJECTED verdicts
- [x] Backend automatically executes `resolveDispute` to alter Agent Reputation scores


---

## Future Enhancements

- Real-time WebSockets to update pending dashboard dynamically.
- Integration with Gnosis SAFE for multi-sig agent actions.
- Customizable prompt templates for heavily-niche DeFi trading protocols.
- Dedicated Smart Contract event-listeners to auto-refresh History.
- Advanced Agent Analytics and token burn-rates.

---

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [WalletConnect/Web3Modal Documentation](https://docs.walletconnect.com/)
- [Google Gemini API](https://ai.google.dev/docs)
- [HeLa Testnet Explorer](https://testnet-scan.helachain.com/)

---

## License

This is an educational startup project for learning and protocol distribution.

---

## Contributors

Kartik - Team Leader

Prasad

Darshan

Pranish

Aditya

---

## Support

For issues or questions, please refer to the project documentation or contact the development team.
