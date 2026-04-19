# DihChain - PayStream Vault
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/AryaMundra/DihChain)

DihChain is a decentralized payroll management system designed to run on the HeLa blockchain. It enables organizations to stream salaries to employees in real-time using the native HLUSD currency. The project consists of a `PayStreamVault` smart contract for the core logic and a feature-rich React dashboard for seamless interaction.

The system provides dedicated interfaces for both administrators (HR) and employees, simplifying on-chain payroll management, treasury funding, and salary withdrawals.

## Working Link

[Paystream dApp](https://dih-chain-hzm1.vercel.app/)

## Demo Video

[Youtube](https://youtu.be/5exDFRqaMek?si=1pq2Er0Ke_vfvoBs)

## Key Features

*   **Real-time Salary Streaming:** Salaries accrue per second and can be withdrawn by employees at any time.
*   **Automated Tax Handling:** A configurable percentage of each withdrawal is automatically sent to a designated tax vault.
*   **Vesting & Cliff Periods:** Set contract durations and initial cliff periods for new employee streams.
*   **Dual-Role Dashboard:** A single application with distinct views and functionalities for HR administrators and employees.
*   **Comprehensive Admin Controls:**
    *   Fund the main treasury.
    *   Create, pause, and cancel salary streams.
    *   Pay instant, one-time bonuses.
    *   Perform emergency withdrawals to the owner's wallet.
    *   Update the designated tax vault address.
*   **Secure & On-Demand Withdrawals:** Employees can view their accrued salary and withdraw available funds with a single transaction.

## Components

The repository is organized into two main components:

### 1. Smart Contract (`smart_contract/`)

The core of the system is the `PayStreamVault.sol` contract, built with Solidity and OpenZeppelin libraries.

*   **`Ownable` & `ReentrancyGuard`:** Ensures secure, single-owner administration and protects against re-entrancy attacks.
*   **Stream Management:** Provides functions for administrators to `startStream`, `pauseStream`, and `cancelStream` for any employee address.
*   **Salary & Tax Logic:** Calculates salary per second based on a monthly figure and automatically deducts a specified `taxPercent` during withdrawals.
*   **Treasury Functions:** Includes mechanisms for the owner to `depositTreasury`, view the `treasuryBalance`, and perform an `emergencyWithdraw`.

### 2. PayStream Dashboard (`paystream-dashboard/`)

A modern, responsive frontend built with React, Vite, and Material-UI to interact with the smart contract. It provides a user-friendly interface for all parties.

*   **Admin View:**
    *   **Dashboard:** Displays high-level statistics like total active streams, current treasury balance, and total accrued liability.
    *   **Stream Management:** A dedicated page to create new salary streams with parameters for monthly salary, tax percentage, duration, and cliff period. Also allows for pausing and canceling existing streams.
    *   **Admin Panel:** Provides tools for treasury management (deposits), bonus payments, and critical configuration changes like updating the tax vault.

*   **Employee View:**
    *   A personalized portal where employees can connect their wallet to view their active stream details, including monthly salary, tax rate, and contract timings.
    *   Displays the real-time accrued salary available for withdrawal.
    *   Allows employees to execute a withdrawal transaction directly from the interface.

## HeLa Integration

DihChain is designed specifically for the HeLa Network and leverages:

    Native HLUSD currency for payroll streaming

    Low transaction costs for frequent withdrawals

    High throughput for scalable payroll operations

    Secure smart contract execution

    HeLa Testnet infrastructure for deployment

The system demonstrates how HeLa can support real-world financial applications such as enterprise payroll, government disbursements, and Web3 compensation models.

## Getting Started

To run the PayStream Dashboard locally, follow these steps.

### Prerequisites

*   Node.js (v18 or later)
*   A package manager like `npm` or `yarn`
*   A Web3 wallet extension like MetaMask

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/AryaMundra/DihChain.git
    cd DihChain
    ```

2.  **Navigate to the dashboard directory:**
    ```bash
    cd paystream-dashboard
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

5.  **Configure MetaMask:**
    *   To interact with the application, you must connect to the HeLa Chain. Add a new network with the following details:
        *   **Network Name:** HeLa Testnet
        *   **RPC URL:** `https://testnet-rpc.helachain.com`
        *   **Chain ID:** `666888`
        *   **Currency Symbol:** `HLUSD`
    *   Switch to the HeLa Testnet network in MetaMask.

## Technology Stack

*   **Frontend:**
    *   React
    *   Vite
    *   Ethers.js
    *   Material-UI
    *   React Router

*   **Smart Contract:**
    *   Solidity
    *   OpenZeppelin Contracts

*   **Blockchain:**
    *   HeLa Chain (Testnet)
