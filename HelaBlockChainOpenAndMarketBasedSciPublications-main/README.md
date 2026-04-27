# ResearchVerify 🔬

A blockchain-based research paper verification platform combining traditional file storage with immutable on-chain verification using smart contracts.

## Overview

ResearchVerify is a decentralized application (dApp) that enables researchers to upload, verify, and share research papers with cryptographic proof of authenticity stored on the **HeLa Testnet** blockchain. Every uploaded paper receives a SHA256 hash that gets recorded on-chain, creating an immutable record of research verification.

### Key Features

- 📄 **PDF Upload & Storage** — Upload research papers with title and metadata
- ⛓️ **Blockchain Verification** — Papers are hashed and stored on HeLa testnet via smart contract
- 🔐 **Immutable Records** — SHA256 hashes prove paper authenticity and upload timestamp
- 🎨 **Modern UI** — Clean, responsive interface built with Next.js and Tailwind CSS
- 👝 **MetaMask Integration** — Connect Web3 wallet for on-chain interactions
- 📊 **Paper Registry** — Browse all verified papers with on-chain status
- 🔍 **Individual Records** — View paper details, hash, uploader, and blockchain timestamp

---

## Tech Stack

### Frontend
- **Next.js 16** — React framework for production
- **React 19** — UI component library
- **TailwindCSS** — Utility-first styling
- **ethers.js** — Web3 library for blockchain interactions
- **Axios** — HTTP client for API requests

### Backend
- **Express.js** — Node.js web server
- **Multer** — File upload handling
- **crypto-js** — Cryptographic hashing utilities
- **CORS** — Cross-origin request handling
- **dotenv** — Environment variable management

### Blockchain
- **Solidity 0.8.9** — Smart contract language
- **HeLa Testnet** — Blockchain network (Chain ID: 666888)
- **HLUSD** — HeLa's stablecoin (gas token)

---

## Prerequisites

Before running the project, ensure you have:

- **Node.js 16+** and **npm** or **yarn**
- **MetaMask** browser extension
- **HLUSD tokens** from the [HeLa faucet](https://testnet-faucet.helachain.com)
- **HeLa Testnet** added to MetaMask

### Add HeLa Testnet to MetaMask

1. Open MetaMask → **Networks** → **Add Network manually**
2. Fill in these details:
   - **Network Name:** HeLa Testnet
   - **RPC URL:** `https://testnet-rpc.helachain.com`
   - **Chain ID:** `666888`
   - **Currency Symbol:** `HLUSD`
   - **Block Explorer:** `https://testnet-blockexplorer.helachain.com`
3. Save and switch to HeLa Testnet

### Get HLUSD Tokens

Visit the [HeLa Faucet](https://testnet-faucet.helachain.com), connect your wallet, and claim **10 HLUSD per day** (free).

---

## Installation

### 1. Clone or Download Project

```bash
cd proj
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
PORT=4000
ALLOWED_ORIGINS=http://localhost:3000
NODE_ENV=development
```

Start the server:

```bash
npm run dev
```

✅ Server should be running on `http://localhost:4000`

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

Create a `.env.local` file in the `frontend/` folder:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS_HERE
NEXT_PUBLIC_CONTRACT_ABI=[ABI_JSON_HERE]
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

Start the development server:

```bash
npm run dev
```

✅ Frontend should be running on `http://localhost:3000`

### 4. Deploy Smart Contract

#### Quick Deploy with Remix (Recommended for Hackathons)

1. Go to [Remix IDE](https://remix.ethereum.org)
2. Create a new file: `ResearchVerify.sol`
3. Copy the contract code from `contract/ResearchVerify.sol`
4. In the **Solidity Compiler** tab:
   - Select compiler version: **0.8.9**
   - Click **Compile ResearchVerify.sol**
5. In the **Deploy & Run Transactions** tab:
   - Select environment: **Injected Provider - MetaMask**
   - Ensure MetaMask is on **HeLa Testnet**
   - Click **Deploy**
   - Confirm transaction in MetaMask (gas paid in HLUSD)
6. Copy the deployed contract address
7. Paste it in `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x...your_address...
   ```

#### Get Contract ABI

After deployment in Remix:
1. Click the contract in the **Deploy & Run** sidebar
2. Copy the ABI from the contract details panel
3. Paste into `frontend/.env.local` as `NEXT_PUBLIC_CONTRACT_ABI`

Or use the pre-built ABI from `contract/ResearchVerify.abi.json`

---

## Project Structure

```
proj/
├── backend/
│   ├── server.js              # Express server setup
│   ├── package.json           # Backend dependencies
│   ├── .env                   # Backend environment variables
│   ├── data/
│   │   └── papers.json        # Paper database (JSON file)
│   └── uploads/               # Uploaded PDF files
│
├── frontend/
│   ├── pages/
│   │   ├── index.js           # Home page (paper list)
│   │   ├── upload.js          # Paper upload page
│   │   ├── paper/
│   │   │   └── [id].js        # Single paper details
│   │   └── _app.js            # Next.js app wrapper
│   ├── components/
│   │   ├── Navbar.js          # Navigation & wallet connect
│   │   └── PaperCard.js       # Paper item component
│   ├── lib/
│   │   ├── api.js             # Backend API client
│   │   └── web3.js            # Web3/contract utilities
│   ├── styles/
│   │   └── globals.css        # Global styles
│   ├── next.config.js         # Next.js configuration
│   ├── tailwind.config.js     # Tailwind CSS config
│   ├── postcss.config.js      # PostCSS configuration
│   ├── package.json           # Frontend dependencies
│   └── .env.local             # Frontend environment variables
│
├── contract/
│   ├── ResearchVerify.sol     # Smart contract source
│   ├── ResearchVerify.abi.json # Contract ABI
│   └── README.md              # Deployment guide
│
└── README.md (this file)
```

---

## Usage

### 1. Connect Wallet

- Open the app at `http://localhost:3000`
- Click **"Connect Wallet"** in the navbar
- MetaMask will prompt you to connect
- Ensure you're on **HeLa Testnet**

### 2. Upload a Paper

1. Navigate to **Upload** page
2. Enter paper title
3. Drag & drop or select a PDF file
4. Click **Upload**
5. Backend creates SHA256 hash
6. Frontend prompts to sign blockchain transaction
7. MetaMask confirms transaction (paying gas in HLUSD)
8. Paper appears in registry with on-chain verification

### 3. View Papers

- **Home page** lists all verified papers
- Shows total count and on-chain verification status
- Click any paper card to view full details
- Details page shows:
  - Paper title
  - SHA256 hash
  - Uploader wallet address
  - Block timestamp
  - Download link

---

## API Endpoints

### Backend API (Express)

#### GET `/api/papers`
Retrieve all uploaded papers
```bash
curl http://localhost:4000/api/papers
```

**Response:**
```json
[
  {
    "id": "uuid-1234",
    "title": "AI Research Paper",
    "hash": "abc123...",
    "uploader": "0xabc...",
    "filename": "paper.pdf",
    "filesize": 2048576,
    "onChain": true,
    "timestamp": 1234567890
  }
]
```

#### POST `/api/papers`
Upload a new paper (multipart/form-data)
```bash
curl -X POST http://localhost:4000/api/papers \
  -F "title=My Paper" \
  -F "file=@paper.pdf" \
  -F "hash=abc123..." \
  -F "uploader=0xabc..."
```

#### POST `/api/verify`
Verify paper on blockchain
```bash
curl -X POST http://localhost:4000/api/verify \
  -H "Content-Type: application/json" \
  -d '{"paperHash":"abc123...","txHash":"0x..."}'
```

---

## Environment Variables

### Backend (.env)
```env
PORT=4000                              # Server port
ALLOWED_ORIGINS=http://localhost:3000  # Frontend URL
NODE_ENV=development                   # Environment
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...    # Deployed contract address
NEXT_PUBLIC_CONTRACT_ABI=[...]        # Contract ABI (JSON)
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000  # Backend URL
```

---

## Smart Contract Functions

### `addHash(string memory hash)`
**Type:** Write (requires wallet connection)

Stores a paper hash on the blockchain along with uploader address and timestamp.

```solidity
function addHash(string memory hash) public
```

### `getAllHashes()`
**Type:** Read (view)

Returns all paper records stored on-chain.

```solidity
function getAllHashes() public view returns (PaperRecord[] memory)
```

### `getRecord(uint256 index)`
**Type:** Read (view)

Retrieves a single paper record by index.

```solidity
function getRecord(uint256 index) public view returns (PaperRecord memory)
```

### `totalRecords()`
**Type:** Read (view)

Returns the total number of records stored.

```solidity
function totalRecords() public view returns (uint256)
```

---

## Troubleshooting

### "Cannot reach backend — is it running on :4000?"
- ✅ Check if backend is running: `npm run dev` in `/backend`
- ✅ Verify `NEXT_PUBLIC_BACKEND_URL` in `.env.local`
- ✅ Check CORS settings in `backend/.env`

### MetaMask Won't Connect
- ✅ Ensure HeLa Testnet is added to MetaMask (Chain ID: 666888)
- ✅ Switch to HeLa Testnet before connecting
- ✅ Try refreshing the page

### Transaction Failed (Insufficient Gas)
- ✅ Get more HLUSD from [faucet](https://testnet-faucet.helachain.com)
- ✅ Wait 24 hours for another claim if already claimed today

### Contract Deployment Failed
- ✅ Verify compiler version is **0.8.9** in Remix
- ✅ Ensure MetaMask is connected to HeLa Testnet
- ✅ Check you have enough HLUSD for gas

### Upload Failed
- ✅ Ensure file is a PDF
- ✅ Check file size (typically under 50MB)
- ✅ Verify backend is running and accessible

---

## Development Commands

### Backend
```bash
cd backend
npm install          # Install dependencies
npm run dev          # Start dev server with nodemon
npm start            # Start production server
npm test             # Run tests (not configured)
```

### Frontend
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests (not configured)
```

---

## HeLa Testnet Reference

| Property | Value |
|----------|-------|
| **Network Name** | HeLa Official Runtime Testnet |
| **Chain ID** | `666888` |
| **RPC URL** | `https://testnet-rpc.helachain.com` |
| **Gas Token** | HLUSD (stablecoin, not HELA) |
| **Block Explorer** | [testnet-blockexplorer.helachain.com](https://testnet-blockexplorer.helachain.com) |
| **Faucet** | [testnet-faucet.helachain.com](https://testnet-faucet.helachain.com) |

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## License

This project is licensed under the ISC License — see the LICENSE file for details.

---

## Support & Feedback

For issues, questions, or suggestions:
- 📧 Open an issue on the repository
- 💬 Reach out through project discussions
- 🐦 Share feedback and improvements

---

## Acknowledgments

- **HeLa Testnet** for providing the blockchain infrastructure
- **Remix IDE** for smart contract development
- **Next.js** for the modern web framework
- **ethers.js** for Web3 integration

---

**Built with ❤️ for decentralized research verification**
