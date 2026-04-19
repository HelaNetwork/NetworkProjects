# 🛡️ HeLa Stealth: Project Analysis Report

HeLa Stealth is a privacy-preserving stablecoin payment gateway built for the **HeLa Blockchain**. It allows merchants to accept HUSD payments without exposing their main wallet history to public trace-linkability.

## 🏗️ Technical Architecture

The project employs a unique triple-layer privacy architecture to ensure merchant anonymity:

### 1. Stealth Vault Layer (On-Chain Isolation)
Each invoice generates a unique, one-time `StealthVault` contract. This ensures:
-   **No Customer → Merchant Link**: Customers pay into a temporary vault, not the merchant's wallet.
-   **Atomic Forwarding**: The vault automatically forwards funds to a shared `PrivacyPool`.

### 2. Privacy Pool Layer (Shared Liquidity)
A central `PrivacyPool` contract aggregates HUSD from all invoices.
-   **Decoupled Claims**: Merchants withdraw their funds from the pool in a separate transaction, breaking the temporal link between payment and receipt.
-   **Security**: Uses `ReentrancyGuard` and strict access controls via the `PaymentRouter`.

### 3. Obfuscation Layer (Frontend & Backend Noise)
-   **Calldata Padding**: The frontend appends random entropy to withdrawal transactions, making it harder to analyze transaction patterns.
-   **Fog Machine**: A backend service that sends on-chain decoy transactions ("Packet Storms") to create noise and mask actual merchant activity.

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Smart Contracts** | Solidity 0.8.20, OpenZeppelin, Hardhat |
| **Backend** | Node.js, Express, Ethers.js v6 |
| **Frontend** | React 19, Vite, Ethers.js v6, CSS (Custom Glassmorphism) |
| **Blockchain** | HeLa Testnet (Chain ID: 666888) |

## 📦 Key Components

### Smart Contracts (`/contracts`)
-   `HUSD.sol`: The native stablecoin of the protocol.
-   `StealthRegistry.sol`: Stores merchant meta-public-keys for address derivation.
-   `PaymentRouter.sol`: The main entry point for creating and paying invoices.
-   `PrivacyPool.sol`: The shared fund manager for anonymous withdrawals.

### Services (`/backend`)
-   **Event Monitoring**: Real-time sync between blockchain logs and a local persistent store.
-   **Metadata Management**: Securely persists invoice descriptions off-chain.
-   **Fog Machine**: Triggerable noise generation for the blockchain.

### UI (`/frontend`)
-   **Merchant Dashboard**: Streamlined interface for invoice creation and "Advanced Withdrawal" with privacy tiers.
-   **Customer Payment**: Minimalist, mobile-responsive payment page with QR code support.

## 🚀 Unique Features

-   **Privacy Tiers**: Users can choose between "Standard", "Iron Shield", "Gold Ghost", and "Infinite Shadow" modes for varying levels of transaction obfuscation.
-   **Premium Aesthetics**: High-end UI featuring glassmorphism, teal color palettes, and smooth micro-animations.
-   **Self-Healing Sync**: The backend reconciles local state with on-chain data to ensure accurate invoice tracking.

---
**Prepared by Antigravity (Web3 Developer & Blockchain Expert)**
