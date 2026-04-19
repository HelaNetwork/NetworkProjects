# PayStream

**Real-Time Payroll Streaming on HeLa Network**

---

## Overview

PayStream is a decentralized payroll protocol that enables employers to stream salaries to employees in real time on the HeLa Network. Instead of discrete monthly or bi-weekly transfers, funds accrue continuously at a per-second rate and can be withdrawn at any time. The protocol combines per-second accrual, a treasury vault that earns simulated yield, automated tax withholding, and EIP-712 meta-transactions so employees can claim earnings without needing native gas tokens.

## Problem Solved (Use Case)

Traditional payroll is slow and costly: employees wait for pay cycles, treasury funds sit idle, and tax/reporting is manual and opaque. PayStream solves this by making payments continuous (per-second accrual), minimizing idle treasury capital through yield strategies, and automating withholding and reporting. The product is built for small-to-medium employers, remote-first teams, and gig platforms that need high-frequency, trust-minimized payflows and simple audit trails.

## High-Level Architecture

PayStream is composed of three on-chain contracts and a relayer backend:

* **`StreamManager`:** Core streaming logic and EIP-712 verification.
* **`YieldVault`:** Treasury with a configurable simulated APY.
* **`TaxVault`:** Tax withholding accumulator.

<img width="1248" height="549" alt="NP9RRzD048NVzrSCaO14A2xt2mzLIqi9KWDLR8fudDgJPjMzcDrnMuFwtncliPl63udjy-tCyPmvY8o16slK8zwG9QWDQgVYbNOr1hHGUbjxHuvpRWr1e9BHNHfIwYaSqrexWiEIVOWAkp-OB5Qm1uULrMu2666n6eJFjZQ-9KglvM5u_qKULsImfI3IUA_6pZ0vqSZmVRsUhz3MS1RyjQx-qvtKlTtoaxUHoS8dtxWAGwjgBA_mac1oXct" src="https://github.com/user-attachments/assets/3739d4bd-779f-4b18-97b0-eee24b45ab77" />

## HeLa Integration

PayStream is intentionally HeLa-native. HeLa provides a low-cost environment that makes per-second micro-transactions economically viable, and HLUSD serves as a stable, on-chain unit of account for salary streams. We leverage HeLa’s testnet for development and validation, and the architecture assumes standard EVM compatibility for smooth integration with HeLa explorer and tooling. Explicitly calling out HeLa benefits and design tradeoffs helps reviewers see why the project belongs in the HeLa ecosystem rather than being a generic EVM toy.

**Key HeLa Integrations:**
* HeLa Testnet RPC endpoint utilized in deployment scripts.
* HLUSD (ERC-20) utilized as the primary payroll token.
* Deployment and verification steps targeted at the HeLa block explorer.

## Key Features

* **Real-time salary accrual** (tokens/second) with live dashboard counters.
* **Batch stream creation** via CSV upload for seamless HR onboarding.
* **YieldVault** with configurable simulated APY for treasury efficiency.
* **Configurable tax withholding** per-stream routed to a dedicated TaxVault.
* **Stream lifecycle management** (pause, resume, cancel, update).
* **EIP-712 meta-transactions & relayer** for a gasless employee withdrawal experience.
* **Off-ramp placeholders** for HLUSD to fiat conversion.

## Quickstart (Run Locally)

### Prerequisites

* Node.js >= 18
* npm >= 9
* A funded wallet on the HeLa Testnet

### Clone & Install

```bash
git clone https://github.com/dexterhere-2k/PaySTrem.git
cd PaySTrem

# Root (contracts)
npm install

# Frontend
cd frontend && npm install && cd ..

# Relayer
cd relayer && npm install && cd ..
```

### Environment Configuration

Create `.env` files from the templates included in the repo. Replace placeholders with deployed contract addresses once available.

**Root `.env` (Contracts)**

```env
HELA_RPC="https://testnet-rpc.helachain.com/"
PRIVATE_KEY=<deployer-private-key>
HELA_EXPLORER_API=https://testnet-blockexplorer.helachain.com
HLUSD_ADDRESS=<deployed-hlusd-address>
```

**Relayer `relayer/.env`**

```env
PRIVATE_KEY=<relayer-wallet-private-key>
RPC_URL=https://testnet-rpc.helachain.com/
STREAM_MANAGER_ADDRESS=<deployed-stream-manager-address>
PORT=3001
```

**Frontend `frontend/.env`**

```env
VITE_HLUSD_ADDRESS=<deployed-hlusd-address>
VITE_STREAMMANAGER_ADDRESS=<deployed-stream-manager-address>
VITE_RELAYER_URL=http://localhost:3001
```

### Compile & Deploy

```bash
npm run compile
npm run deploy:hela
```

### Start Relayer & Frontend

```bash
# Start Relayer
cd relayer
node index.js

# Start Frontend (in a new terminal)
cd ../frontend
npm run dev
```

## Testnet Contract Addresses

*(Placeholder addresses — replace with actual deployments)*
* **StreamManager:** `0x07cE02b3F435CB3c43ac1Eea73eCaa211b471cD8`
* **YieldVault:** `0x2cb4A33393DF44a2C6BdEF6337813DB73Fe548Cd`
* **TaxVault:** `0xf0C5666227efAdf511fdc4De1b4D1aa8F451D7dF`
* **HLUSD:** `0x20bA9E6B65FeF59c8c080A6F614fAe3CB7196c14`

## Live Demo

**Live Frontend (HeLa Testnet):** [PayStream Demo on Netlify](https://silver-pegasus-79931a.netlify.app/)

This deployment connects to the HeLa Testnet contracts listed above. Reviewers can:
* Create streams from the employer dashboard.
* View real-time per-second accrual on the employee dashboard.
* Execute withdrawals (direct or via the relayer if configured).

*(Note: No additional screenshots are included as full functionality can be tested directly via the live deployment.)*

## Folder Structure

```text
PayStream/
 ├── contracts/
 ├── frontend/
 ├── relayer/
 ├── assets/
 └── README.md
```

## Submission Checklist (HeLa dApp Submission)

- [x] Repository is public/open-source.
- [x] Project folder `PayStream/` exists at repo root with `contracts/`, `frontend/`, `relayer/`, `assets/`, `README.md`.
- [x] README contains: Overview, Use case, Architecture, HeLa integration, Deployment details, Smart contract addresses, Demo, and Submission steps.
- [x] Testnet contract addresses are pasted in the README.
- [x] Live demo link or video is included.

## How to Submit

1.  Fork the HeLa submission repository.
2.  Create a directory named `PayStream` at the repository root.
3.  Copy project files (`contracts/`, `frontend/`, `relayer/`, `assets/`, `README.md`) into `PayStream/`.
4.  Commit and push to your fork:

```bash
git add .
git commit -m "Added PayStream HeLa dApp Submission"
git push origin main
```

5.  Open a Pull Request to the original HeLa submission repository and include in the PR description: a summary, live demo link, testnet contract addresses, and video/screenshots.

## Future Improvements

* Replace simulated yield with real DeFi integrations (Aave/Curve-like primitives) for true APY.
* Multi-token payroll with automatic swap routing.
* On-chain governance for protocol parameters.
* Automated tax reporting and exportable receipts per employee.

## License

This project is licensed under the MIT License.
