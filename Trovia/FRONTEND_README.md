# Trovia - Decentralized AI Agent Marketplace

> An on-chain App Store for AI agents powered by HeLa Blockchain

## Overview

Trovia is a decentralized marketplace where developers deploy AI agents as smart contracts on HeLa Chain. Non-technical buyers browse, pay in HLUSD, and activate agents with one click — no setup, no code, no friction.

## Features

### 6 Agent Types

1. **Trading Agent** - Monitors price thresholds and executes swaps
2. **Farming Agent** - Auto-compounds yield, monitors LP positions
3. **Scheduling Agent** - Recurring HLUSD payments on time-based triggers
4. **Portfolio Rebalancing Agent** - Monitors wallet allocation, triggers rebalance alerts
5. **Content Reply Agent** - Gemini-powered social/business content auto-responder
6. **Business Assistant Agent** - Gemini AI answers queries, drafts emails, summaries

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Blockchain**: HeLa Chain (Chain ID: 8668)
- **Smart Contracts**: Solidity (AgentRegistry, AgentEscrow, AgentExecutor)
- **Wallet**: MetaMask
- **AI Engine**: Google Gemini 2.5 Flash API
- **Styling**: Tailwind CSS with custom design system

## Project Structure

```
trovia/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Global styles
│   ├── marketplace/
│   │   └── page.tsx            # Agent marketplace
│   ├── agent/
│   │   └── [id]/
│   │       ├── page.tsx        # Agent detail & activation
│   │       └── run/
│   │           └── page.tsx    # Agent chat interface
│   ├── dashboard/
│   │   └── page.tsx            # User dashboard
│   └── publish/
│       └── page.tsx            # Developer publish form
├── components/
│   ├── TopNavBar.tsx           # Navigation bar
│   ├── WalletConnect.tsx       # Wallet connection button
│   └── AgentCard.tsx           # Agent card component
├── lib/
│   ├── contracts.ts            # Contract interactions
│   └── types.ts                # TypeScript interfaces
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript config
├── next.config.mjs             # Next.js config
└── postcss.config.mjs          # PostCSS config
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MetaMask browser extension

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_HELA_RPC_URL=https://testnet-rpc.helachain.com
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Build

```bash
# Create production build
npm run build

# Start production server
npm start
```

## Pages & Routes

| Page | Route | Description |
|---|---|---|
| Landing | `/` | Hero, product pitch, connect wallet CTA |
| Marketplace | `/marketplace` | Grid of all 6 agent cards with filter by type |
| Agent Detail | `/agent/[id]` | Full description, config form, price, activate button |
| Dashboard | `/dashboard` | User's active agents + activity feed |
| Publish | `/publish` | Developer form to list a new agent |
| Agent Chat | `/agent/[id]/run` | Live interaction interface for active agent |

## Design System

### Color Palette

- **Primary**: `#ffffff` (White)
- **Background**: `#000000` (Black)
- **Surface**: `#131313` (Dark Gray)
- **Live Signal**: `#FF3B3B` (Red)
- **Accent**: `#c6c6c7` (Light Gray)

### Typography

- **Headline**: Bebas Neue
- **Body**: Space Grotesk
- **Mono**: JetBrains Mono

### Spacing Scale

Based on Tailwind's default spacing with custom border radius (0px corners by default, 9999px for full round).

## Key Components

### WalletConnect
Handles MetaMask connection, address display, and network switching to HeLa Chain.

### AgentCard
Reusable card component displaying agent information, status, price, and activate button.

### TopNavBar
Navigation bar with links to marketplace, dashboard, publish, and wallet connection.

## Smart Contract Integration

The frontend interacts with three main smart contracts:

1. **AgentRegistry** - Stores published agents and retrieval functions
2. **AgentEscrow** - Handles buyer payment and activation
3. **AgentExecutor** - Logs execution results on-chain for auditability

See `lib/contracts.ts` for integration utilities.

## Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow React best practices with hooks
- Use Next.js App Router exclusively
- Keep components small and reusable
- Use Tailwind CSS for styling (no CSS files except globals.css)

### Creating New Pages

1. Create new directory in `app/`
2. Add `page.tsx` file
3. Import `TopNavBar` component
4. Follow existing page structure

### Creating New Components

1. Create `.tsx` file in `components/`
2. Use `"use client"` directive for client components
3. Export as named export
4. Add TypeScript interfaces for props

## Deployment

### Vercel

The easiest way to deploy Trovia:

```bash
# Connect your repository to Vercel
# Environment variables are set in Vercel dashboard
```

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy the .next folder to your hosting service
```

## Testing

Currently using manual testing. Integration tests and unit tests to be added.

## Contributing

This is a hackathon project. For modifications:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit for review

## License

Private - DevClash 2026

## Support

For issues and questions:
- Check GitHub issues
- Contact the team

---

**Built with ❤️ for DevClash 2026**  
Team: Nabil, Bhumi, Aman, Madhura, Saad
