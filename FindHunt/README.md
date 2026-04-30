# FindHunt: Personal Onchain AI Treasurer

FindHunt is an intelligent onchain financial management platform designed to automate and optimize your crypto life. Built on the **Hela Chain**, it combines advanced trading visualizations, systematic investment plans, and recurring payment automation into a single, cohesive AI-driven workspace.

"Find clarity, hunt better outcomes."

---

## Project Summary (PS)

### **Personal Onchain AI Treasurer**

**Agent manages:**
- savings
- yield
- subscriptions
- LP positions
- bill payments
- daily budget

---

## Agent-Managed Treasury

FindHunt acts as your personal treasurer, managing the complexities of decentralized finance through an intuitive AI layer.

### Savings & Yield Optimization
Automated vault management with the **TreasurerVault**. It monitors your balances and suggests or executes yield-generating strategies to ensure your capital is never sitting idle.

### Crypto SIP (Systematic Investment Plan)
Modernize your wealth building with onchain SIPs. Set your interval and horizon, and let the agent manage the systematic purchase of assets while providing projected growth visualizations.

### Subscription Manager
Automate your recurring digital life. Support for streaming services (Netflix, Spotify), SaaS tools (ChatGPT, Midjourney), and essential commitments (rent, tuition).
- Templates for common services
- Auto-bill reminders and onchain execution
- Support for streaming and GPT-class tools

### LP & Liquidity Positions
Manage and track your Liquidity Provider positions directly from the dashboard. Monitor pool performance, rewards, and health ratios without jumping between multiple protocols.

### Daily Budget & Bill Payments
Maintain a strict daily budget enforced by the **BudgetController**.
- Daily spend limits
- Rent and school fee automation
- Categorized expense tracking

### Trading Desk
High-fidelity trading interface with:
- OHLC candles and volume bars
- Cumulative P&L curves
- Real-time trading agent suggestions

---

## Technical Architecture

FindHunt leverages a modular smart contract architecture on the **Hela Testnet**:

- **TreasurerVault**: The core asset holder and yield aggregator.
- **SubscriptionManager**: Logic for handling recurring ERC-20 approvals and transfers.
- **BudgetController**: Guardrails for daily spending and bill prioritization.
- **StrategyExecutor**: The execution layer for AI-driven portfolio rebalancing.

---

## Getting Started

Follow these steps to clone the repository and get the FindHunt dashboard running locally.

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/findhunt.git
cd findhunt
```

### 2. Install Dependencies
Install the root dependencies for the Next.js application and the smart contract environment.
```bash
# Install frontend dependencies
npm install

# Install contract dependencies
cd contracts
npm install
cd ..
```

### 3. Environment Configuration
FindHunt requires configuration for both the AI agent and blockchain interactions. Create a `.env.local` file in the project root:

```env
# AI Agent (Required for intelligent suggestions)
OPENAI_API_KEY=sk-your-openai-key

# Blockchain (Required for deployment)
DEPLOYER_PRIVATE_KEY=0xYourPrivateKey

# WalletConnect (Required for RainbowKit)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YourProjectID
```

*Note: You can get a WalletConnect Project ID at [cloud.reown.com](https://cloud.reown.com).*

### 4. Database Setup (Optional)
If you wish to use the historical tracking features, initialize the Prisma client:
```bash
npx prisma generate
```

### 5. Running the Application
Start the development server:
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

---

## Smart Contract Interactivity

FindHunt is designed to work with the **Hela Testnet**. To enable full onchain functionality:

FindHunt contracts are located in the `/contracts` directory.

1. **Compile**: `npm run contracts:compile`
2. **Deploy**: `npm run deploy:hela`

Deployment will generate `deployed-addresses.json` and `hela-contracts.env`. Add the contents of `hela-contracts.env` to your `.env.local` to connect the frontend to your new contracts.

---

## Tech Stack
- **Blockchain**: Hela Network (Testnet ID: 666888)
- **Frontend**: Next.js, Framer Motion, Tailwind CSS
- **Wallet**: RainbowKit, Wagmi, Viem
- **Database**: Prisma, PostgreSQL
- **AI**: OpenAI SDK
- **Charts**: Recharts

---

## Network Reference: Hela Testnet
- **RPC**: `https://testnet-rpc.helachain.com`
- **Chain ID**: `666888`
- **Explorer**: [https://testnet-blockexplorer.helachain.com](https://testnet-blockexplorer.helachain.com)
- **Faucet**: [https://testnet-faucet.helachain.com/](https://testnet-faucet.helachain.com/)
