# Sangam — HeLa Labs Blockchain Track Submission
## HackJKLU v5.0

---

## 📦 Project Details

| Field | Value |
|---|---|
| **Project Name** | Sangam (ChainDate) |
| **Track** | Blockchain Track powered by HeLa Labs |
| **Hackathon** | HackJKLU v5.0 |
| **Team** | Team Sangam |

---

## 🔗 Repository

**GitHub:** https://github.com/ajayyadav432/ChainDate

The repository contains:
- ✅ `README.md` — Full project documentation
- ✅ `blockchain/contracts/` — Smart contract source code (3 contracts)
- ✅ `blockchain/test/` — Hardhat test suite (12 tests)
- ✅ `frontend/` — Next.js 14 frontend

---

## 🌐 Live Demo

**[https://chain-date.vercel.app](https://chain-date.vercel.app)**

> Connect MetaMask on **Hela Official Runtime Testnet** (Chain ID: 666888)

**Network Config:**
| Field | Value |
|---|---|
| Network Name | Hela Testnet |
| Chain ID | `666888` |
| RPC URL | `https://testnet-rpc.helachain.com` |
| Explorer | `https://testnet.helascan.io` |
| Currency | HELA |

---

## 📋 Deployment Addresses (Hela Testnet)

| Contract | Address |
|---|---|
| `MockZKVerifier` | `0x88e3515B1925b1E19223E99758340C607baeD473` |
| `DatingCore` | `0x7D722A548862AfC52d8FAec245876218c787d04F` |
| `EscrowContent` | `0xf6E635A4400a3faac846D955Bb5d25A69A2FaD0C` |

**Deployer:** `0x84d512aD93EA1E954a4A74C5DdE03D4a254Cdc7B`

**Block Explorer Links:**
- [MockZKVerifier on Helascan ↗](https://testnet.helascan.io/address/0x88e3515B1925b1E19223E99758340C607baeD473)
- [DatingCore on Helascan ↗](https://testnet.helascan.io/address/0x7D722A548862AfC52d8FAec245876218c787d04F)
- [EscrowContent on Helascan ↗](https://testnet.helascan.io/address/0xf6E635A4400a3faac846D955Bb5d25A69A2FaD0C)

---

## 🔗 Example Transaction Hashes

| # | Description | Full Hash | Explorer Link |
|---|---|---|---|
| 1 | `MockZKVerifier` deployment | `0xc41478b51ddbdf4b15307285e6aeffd47247e4a7a906c4b9ae5ef38c47953c98` | [View ↗](https://testnet.helascan.io/tx/0xc41478b51ddbdf4b15307285e6aeffd47247e4a7a906c4b9ae5ef38c47953c98) |
| 2 | `DatingCore` deployment | `0x0bde33d71c88c8113b1d5c16f04cf565436d34f41c2a41820f39ce389b9bcb32` | [View ↗](https://testnet.helascan.io/tx/0x0bde33d71c88c8113b1d5c16f04cf565436d34f41c2a41820f39ce389b9bcb32) |
| 3 | `EscrowContent` deployment | `0xf15cfb6d0fea189a0e5f6820e37c8e65ceec0e1128d8a20a06b07d0a8f64352e` | [View ↗](https://testnet.helascan.io/tx/0xf15cfb6d0fea189a0e5f6820e37c8e65ceec0e1128d8a20a06b07d0a8f64352e) |

---

## 🎥 Demo Video

> **[▶ Watch the Demo on YouTube](https://youtu.be/8_Tz6OEL0Ws)**  
> *(Demo recording added for final submission)*

**Demo should cover:**
1. Connecting MetaMask to Hela Testnet
2. Registering an encrypted profile
3. Swiping with ZK proof verification
4. Getting matched (mutual like)
5. Unlocking escrow content

---

## 💡 Key Technical Highlights

- **ZK Privacy**: Age + interest overlap proven via zero-knowledge proof — no PII on-chain
- **Micro-Economy**: 0.001 HELA/swipe; 80% of message fees go to recipient
- **Encrypted Profiles**: AES-CBC client-side encryption; only hash stored on-chain
- **Exclusive Content Escrow**: Creator-controlled content with 2.5% protocol fee
- **Modular ZK**: `MockZKVerifier` is swap-ready for real SnarkJS Groth16 verifier

---

## 📐 Tokenomics Summary

| Flow | Amount | Distribution |
|---|---|---|
| Swipe fee | 0.001 HELA | 100% → Protocol treasury |
| Message fee | 0.0005 HELA | 80% → Recipient, 20% → Protocol |
| Content unlock fee | Variable | 97.5% → Creator, 2.5% → Protocol |

---

## ✅ Submission Checklist

- [x] Public GitHub repo with README
- [x] Smart contract source code (`DatingCore.sol`, `EscrowContent.sol`, `MockZKVerifier.sol`)
- [x] Hardhat test suite (`blockchain/test/DatingCore.test.ts`)
- [x] Frontend code (`frontend/` — Next.js 14)
- [x] Live demo link (Vercel)
- [x] Deployment addresses (Hela Testnet)
- [x] 3 example transaction hashes
- [ ] Demo video (record and update link above)
- [ ] Submit to https://github.com/HelaNetwork/NetworkProjects

---

*Submitted for HackJKLU v5.0 · HeLa Labs Blockchain Track*
