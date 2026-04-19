# DeckWars — On-Chain Card Battle Game

## Product Overview

DeckWars is a strategic, turn-based card battle game built entirely on the **HeLa Blockchain**. Players own their cards as NFTs (ERC-721), challenge opponents to battles, and wager HLUSD tokens in a fully decentralized arena. All game state is managed on-chain using a commit-reveal scheme to ensure provably fair and tamper-proof gameplay.

**Problem Solved**: Traditional card games rely on centralized servers, meaning players don't truly own their assets and outcomes can be manipulated. DeckWars removes this trust bottleneck by putting everything on-chain.

---

## Use Case

- **Target Users**: Gamers who value asset ownership and blockchain enthusiasts interested in on-chain gaming.
- **Why It Matters**: Players have true ownership of their NFT cards, can wager real assets, and can trust that game outcomes are fair — all without relying on a central authority.

---

## Architecture

| Component | Description |
|---|---|
| **DeckWarsCard (ERC-721)** | NFT cards with unique attributes (HP, ATK, DEF, SPD, Rarity) |
| **DeckWarsGame (Core)** | Manages challenges, game state, turns, and wager resolution |
| **Move Contracts** | Individual smart contracts per move (BasicAttack, HeavyStrike, Shield, Heal) |
| **Commit-Reveal Scheme** | Ensures move results and critical hits are tamper-proof and fair |
| **Frontend** | Vanilla HTML/CSS/JS web interface connected to HeLa Testnet via MetaMask |

**Flow**: Player mints cards → Challenges opponent → Both commit moves → Reveal phase resolves outcomes on-chain → Winner receives wager.

---

## HeLa Integration

DeckWars is deployed on the **HeLa Testnet**, leveraging:
- **Low-cost, fast transactions** for responsive gameplay turn submissions.
- **Native HLUSD** as the wagering token within game matches.
- **HeLa's EVM compatibility** for seamless Solidity smart contract deployment.

> All smart contracts were developed, tested, and deployed exclusively on the HeLa Testnet.

---

## Deployment Details

- **Status**: Testnet Live ✅
- **Network**: HeLa Testnet
- **Chain ID**: `666888`
- **RPC URL**: `https://testnet-rpc.helachain.com`
- **Block Explorer**: `https://testnet-blockexplorer.helachain.com`

### Smart Contract Addresses

| Contract | Address |
|---|---|
| DeckWarsCard (NFT) | `0xA433EB14723f21F4276c4A91ED074E3f8F80f70e` |
| DeckWarsGame (Core) | `0x44CbDf3552626F17d880d127FF71195F632C14e2` |
| BasicAttack Move | `0xc3b2d183F043108454F1e2617a283f18b97F0CD8` |
| HeavyStrike Move | `0x765a38d28Be52A61B4Fc31c09009b5B206D5aEdC` |
| Shield Move | `0x0c78A17c272e2BCC720601c16cFAc5ab50901990` |
| HealMove | `0x9F2365FE2167b37036a07EfCd976233511cca269` |

### Live Demo

🌐 **Live App**: [deckwars-final on Vercel](https://deckwars-final-1f41edpby-keyzorkinza-gmailcoms-projects.vercel.app?_vercel_share=nBCKXkas2Q3yiNw2TvvODFFlQ2oui4DJ)

---

## Demo

📺 **Tutorial Video**: [Watch on YouTube](https://youtu.be/xkAVDhxhVzc)

🔗 **Source Code**: [DeckWars-final on GitHub](https://github.com/DarshilGarg1311/DeckWars-final)

---

## Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/DarshilGarg1311/DeckWars-final.git
cd DeckWars-final

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Add your HeLa private key to .env

# 4. Run frontend locally
cd frontend
npx http-server -p 8080
```

## License
MIT
