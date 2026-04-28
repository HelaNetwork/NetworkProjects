# HelaConnect

LinkedIn, but on-chain. A professional networking platform built on the **Hela blockchain** — where your identity, connections, and activity are secured by Web3.

## What it does

- **Wallet login** — No email or password. Connect MetaMask and you're in.
- **Professional profiles** — Showcase your skills, experience, and live blockchain activity in one place.
- **Networking** — Follow and connect with other Web3 professionals.
- **Jobs & Events** — Discover opportunities and local events (with a focus on the Pune Web3 scene).
- **Live on-chain data** — Token balances, recent transactions, and smart contract activity, all in real time.
- **Admin panel** — A dedicated dashboard to create, update, and delete jobs, events, and airdrops.

## Tech stack

| Frontend | Backend |
|----------|---------|
| React + Vite | Node.js + Express |
| Tailwind CSS | MongoDB |
| Redux | Hela Blockchain |
| Ethers.js | |

## Run it locally

```bash
# Install everything (frontend + backend in one go)
npm run install

# Start the backend
npm run start:backend

# Start the frontend
npm run start:frontend
```

Open `http://localhost:5173`, connect your wallet, and start exploring.

## Admin access

The platform includes an admin panel to manage all content — jobs, events, and airdrops.

| | |
|---|---|
| **URL** | `http://localhost:5173/admin` |
| **Email** | `admin@gmail.com` |
| **Password** | `admin123` |

From the admin dashboard you can create, edit, or remove any job posting, event, or airdrop listing on the platform.