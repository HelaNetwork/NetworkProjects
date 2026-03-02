# 🌊 PayStream: Decentralized Payroll Streaming

**PayStream** is a decentralized payroll application built on the **HeLa Testnet** that enables employers to stream salaries to employees in real-time. Instead of monthly paychecks, employees earn their salary second-by-second and can withdraw their earnings instantly. The system features a dual-dashboard interface (HR Admin & Employee Portal), automatic tax deduction routing, and support for bonuses, all powered by native HLUSD.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MetaMask Wallet (configured for HeLa Testnet)
- Native HLUSD (for gas and funding)

### 1. Clone & Install
```bash
git clone https://github.com/KB156/paystream.git
cd paystream
npm install
```

### 2. Configure Environment
Create a `.env` file in the root directory (see `.env.example`):
```env
PRIVATE_KEY=your_wallet_private_key
HELA_RPC_URL=https://testnet-rpc.helachain.com
```

### 3. Deploy Contracts (Optional)
If you want to deploy your own instances:
```bash
npx hardhat run scripts/deploy.js --network hela
```

### 4. Run Frontend
```bash
cd frontend/paystream-app
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to view the app.

---

## 🔗 Deployment Details (HeLa Testnet)

**Date**: Feb 15, 2026  
**Chain ID**: `666888` (0xA2D08)

| Contract | Address |
|----------|---------|
| **PayStream** | \`0xc582Bc0317dbb0908203541971a358c44b1F3766\` |
| **TaxVault** | \`0xe1Fd27F4390DcBE165f4D60DBF821e4B9Bb02dEd\` |

---

## 📜 Example Transactions

Here are 3 example transactions showcasing the core lifecycle of the PayStream protocol on HeLa Testnet:

1.  **Fund Treasury** (Employer depositing Native HLUSD)  
    [0x304302f35055e42cd8525fe5d2ce8d88481edf8323ccc6253273086a952f58ee](https://testnet-blockexplorer.helachain.com/tx/0x304302f35055e42cd8525fe5d2ce8d88481edf8323ccc6253273086a952f58ee)

2.  **Create Stream** (Employer starting a salary stream)  
    [0xa6beec83a9266ac6d75de47eb8d6a54ead949b6e546a619722dab4dd4e82d46b](https://testnet-blockexplorer.helachain.com/tx/0xa6beec83a9266ac6d75de47eb8d6a54ead949b6e546a619722dab4dd4e82d46b)

3.  **Withdraw** (Employee claiming accrued earnings)  
    [0x97a390d24068f66eb406ab9ab5eb733e4f9a092c7f6e41240c691728aa98ae4b](https://testnet-blockexplorer.helachain.com/tx/0x97a390d24068f66eb406ab9ab5eb733e4f9a092c7f6e41240c691728aa98ae4b)

---

## 🛠 Tech Stack
- **Smart Contracts**: Solidity, Hardhat
- **Frontend**: React, Vite, Tailwind CSS, Ethers.js
- **Auth**: Clerk (Mock/Demo Mode)
- **Network**: HeLa Testnet (Native HLUSD)

---

## 📚 Resources

- **Contract Code**: [contracts/](contracts/)
- **Tests**: [contracts/test/](contracts/test/)
- **Frontend Code**: [frontend/](frontend/)
- **Live Demo**: [https://paystream-amo9-5rfexpbbh-krish-bhagat-s-projects.vercel.app/]
