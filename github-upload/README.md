# 🔐 Zero-Trust Web3 Messenger

A decentralized, peer-to-peer encrypted messaging application built for the **HackJKLU v5.0 Blockchain Track** (powered by HeLa Labs).

> **No central database. No email. No passwords.** Authenticate with your Web3 wallet and chat directly with peers over encrypted WebRTC connections. When you disconnect, your messages disappear forever.

---

## 🚀 Hackathon Submission Details (HeLa Labs Track)

| Requirement | Details |
|---|---|
| **Live Demo Link** | [web3-messenger-psi.vercel.app](https://web3-messenger-psi.vercel.app) |
| **Short Demo Video** | [Watch Demo on Google Drive](https://drive.google.com/file/d/1eHOt1Ln1-AOs6y-GrNsXi959ahVcI57o/view?usp=sharing) |
| **Repository** | Public on GitHub with full source code |

### Smart Contracts & On-Chain Architecture

This project follows a **Zero-Trust, No-Database** architecture by design:

- **Wallet Authentication:** Users authenticate using their MetaMask / Web3 wallet via `ethers.js`. The wallet address serves as the user's cryptographic identity — no emails, no passwords, no accounts.
- **Peer ID Derivation:** A unique Peer ID (Node ID) is deterministically derived from each user's verified wallet address, ensuring on-chain identity verification without storing any data.
- **P2P Messaging:** Messages are sent directly between peers over WebRTC (via PeerJS). **No data is stored anywhere — not on a server, not on-chain, not in a database.** This is the core "Zero Trust" principle.
- **Ephemeral by Design:** When either peer disconnects, the conversation is permanently lost — there is no message history, no logs, and no recovery.

> **Why no deployed smart contract?** In a traditional Web3 chat, messages would be stored on-chain (e.g., via a Solidity contract). However, our Zero-Trust architecture explicitly **rejects** persistent storage to maximize privacy. The blockchain is used solely for **identity verification** through wallet signatures, not for data storage.

### Example Wallet Authentication Flow

1. User clicks "Connect Wallet" → MetaMask prompts signature
2. `ethers.BrowserProvider` verifies the wallet → address is extracted
3. Peer ID is derived from the wallet address (e.g., `0x1234...` → `1234-5678-9ABC-DEF0`)
4. User is registered on the PeerJS signaling network under this deterministic ID
5. Another user enters this Peer ID to establish a direct WebRTC connection

### Additional Information
- **Protocol:** WebRTC (PeerJS) for P2P communication
- **Identity Layer:** Ethereum-compatible wallet (MetaMask, etc.) via Ethers.js v6
- **Encryption:** WebRTC DTLS/SRTP (built-in transport encryption)
- **Storage:** None — fully ephemeral architecture

---

## 💻 Local Development

### Prerequisites
- Node.js (v18+)
- npm / yarn / pnpm
- MetaMask browser extension (for wallet mode) or use Demo Mode

### Getting Started

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd web3-messenger
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### How to Test P2P Chat

1. Open the app in **two separate browser windows**
2. Click **"Enter Demo Mode"** (or **"Connect Wallet"** with MetaMask) in both
3. In Window 1: Click **"Host"** → copy the Host Code
4. In Window 2: Click **"Join"** → paste the Host Code → click **"Connect"**
5. Start chatting! Messages are encrypted and sent directly between browsers.

---

## 🏗 Architecture

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + TypeScript + Vite |
| **Web3 Auth** | Ethers.js v6 + MetaMask |
| **P2P Transport** | PeerJS (WebRTC) |
| **Styling** | TailwindCSS v4 |
| **Animations** | GSAP, Framer Motion, React Three Fiber |
| **3D/Canvas** | Three.js, React Three Fiber, OGL |
| **Deployment** | Vercel (frontend only — no backend needed) |

### Key Files
- `src/App.tsx` — Main application with wallet auth, PeerJS connection, and chat UI
- `src/components/` — Reusable UI components (BlurText, Ribbons, Waves, LetterGlitch, etc.)
- `relay-server.ts` — Legacy WebSocket relay (replaced by PeerJS for serverless P2P)

---

## 👥 Team

| Name | Role |
|---|---|
| **Rishabh Chobey** | Team Leader & UI/UX |
| **Prince Mewara** | Backend & Integration |
| **Kapil Saini** | R&D & Testing |

---

## 📄 License

Built for HackJKLU v5.0 • Blockchain Track powered by HeLa Labs
