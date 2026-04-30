# HelaMatch: Privacy-First Onchain Dating

**Team Name**: cocomelon  
**Hackathon**: Offgrid Hackathon

HelaMatch is a futuristic, decentralized dating dApp built on the **Hela Chain**. It leverages zero-knowledge principles and the stable secondary-gas economics of Hela to provide a private, transparent, and fairly monetized social experience.

---

## Project Summary (PS)

**Entire Onchain Dating App (Consumer Dapps)**

*   **Matches & Privacy**: Likes, matches, and chat proofs are recorded on-chain using privacy-preserving mechanisms to ensure your data belongs only to you.
*   **Stable Economics**: Because Hela utilizes **HLUSD** for gas, we can enable sustainable micropayments that are not subject to the volatility of traditional crypto assets.
*   **Monetization Models**: 
    *   **Pay-per-swipe**: Small, stable fees for discovery.
    *   **Pay-per-message**: A direct value exchange for high-intent communication.
    *   **Content Unlocks**: Premium features and exclusive content tiers controlled via smart contracts.

---

## Technical Architecture

HelaMatch utilizes a tri-contract system on the **Hela Testnet**:

- **LikeRegistry**: Manages user interest and triggers match creation when interest is bidirectional.
- **MatchRegistry**: The immutable record of successful connections.
- **PaymentManager**: Handles the stablecoin-based micro-transactions for swipes, messages, and premium unlocks.

---

## Key Features

### 1. Zero-Knowledge Proofs
User interactions are hashed and recorded. Matches are validated without exposing PII (Personally Identifiable Information) publicly on the ledger.

### 2. Pay-per-Message & Swipe
We disrupt the subscription-heavy dating model by allowing users to pay only for the value they consume, facilitated by Hela's low-fee environment.

### 3. Premium Content
Unlock exclusive profile visibility and advanced filters through a one-time premium unlock.

---

## Getting Started

Follow these steps to clone the repository and run HelaMatch locally.

### 1. Clone the Repository
```bash
git clone https://github.com/your-repo/hela-match.git
cd hela-match
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install contract dependencies
cd contracts
npm install
cd ..
```

### 3. Environment Configuration
Create a `.env.local` in the project root:
```env
# Blockchain
DEPLOYER_PRIVATE_KEY=0xYourPrivateKey
NEXT_PUBLIC_WALLETCONNECT_ID=YourProjectID

# Contracts (Update after deployment)
NEXT_PUBLIC_LIKE_REGISTRY=0x...
NEXT_PUBLIC_MATCH_REGISTRY=0x...
NEXT_PUBLIC_PAYMENT_MANAGER=0x...

# IPFS (Pinata)
NEXT_PUBLIC_PINATA_JWT=...
NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud
```

### 4. Running the App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to start swiping.

---

## Smart Contract Deployment

Find the source files in `/contracts`.

1. **Compile**: `npm run contracts:compile`
2. **Deploy**: `npm run deploy:hela`

The deployment script will automatically generate a `hela-contracts.env` file in the root with your new contract addresses.

---

## Network Reference: Hela Testnet
- **RPC**: `https://testnet-rpc.helachain.com`
- **Chain ID**: `666888`
- **Native Currency**: `HLUSD` (Gas)
- **Explorer**: [testnet-blockexplorer.helachain.com](https://testnet-blockexplorer.helachain.com)
- **Faucet**: [testnet-faucet.helachain.com](https://testnet-faucet.helachain.com/)
