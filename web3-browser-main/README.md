# W3B — Web3 Browser

A sleek, production-ready Web3 browser built with React + Vite + ethers.js.

## Features

- 🔐 **MetaMask Wallet Integration** — Connect, view balance, switch networks
- 🌐 **Multi-Tab Browser** — Tabbed browsing with iframe-based dApp rendering
- 🏪 **dApp Store** — Quick access to 16+ popular dApps (DeFi, NFT, Social, Tools)
- 📊 **Transaction Panel** — View recent transaction history with filter
- 🛡️ **Ad Blocker** — Built-in tracker blocking (toggleable)
- 🔀 **Network Switcher** — Switch between Mainnet, Sepolia, Polygon, BNB, etc.
- 📑 **Multi-Tab Support** — Open multiple sites simultaneously
- 🌙 **Dark Cyberpunk UI** — Full dark mode with teal neon accents

## Prerequisites

- Node.js 18+
- MetaMask browser extension (for wallet features)

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

| Layer      | Technology                  |
|------------|-----------------------------|
| Frontend   | React 18 + Vite             |
| Styling    | Tailwind CSS + Custom CSS   |
| Web3       | ethers.js v6                |
| Wallet     | MetaMask (window.ethereum)  |
| Icons      | Lucide React                |
| Fonts      | Space Mono + DM Sans        |

## Project Structure

```
web3-browser/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Top bar with wallet info & network
│   │   ├── WalletConnect.jsx   # Wallet connect sidebar panel
│   │   ├── BrowserView.jsx     # Multi-tab iframe browser
│   │   ├── DappStore.jsx       # dApp directory & quick launch
│   │   └── TransactionPanel.jsx # Transaction history
│   ├── hooks/
│   │   ├── useWallet.js        # Wallet state & MetaMask integration
│   │   └── useTabs.js          # Browser tab management
│   ├── pages/
│   │   └── Home.jsx            # Main layout
│   ├── utils/
│   │   └── wallet.js           # ethers.js helpers & constants
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css               # Global styles + design tokens
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy the `dist/` folder to Vercel
```

### Netlify
```bash
npm run build
# Upload `dist/` folder or connect GitHub repo
```

### GitHub Pages
```bash
npm run build
# Push `dist/` to gh-pages branch
```

## Interview Talking Points

> "I built a lightweight Web3 browser that integrates wallet-based authentication directly into the browsing experience. Instead of relying on browser extensions for navigation, I embedded wallet connectivity using ethers.js and enabled users to interact with dApps through an iframe-based rendering system, complete with multi-tab support, a curated dApp store, and real-time transaction tracking."

## Optional Enhancements

- [ ] Etherscan API for real transaction history
- [ ] ENS name resolution
- [ ] Bookmark system with localStorage
- [ ] WalletConnect v2 support (for non-MetaMask wallets)
- [ ] Token price feeds via CoinGecko API
- [ ] Custom RPC endpoint support
