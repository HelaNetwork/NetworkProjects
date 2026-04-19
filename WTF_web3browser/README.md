# 🌐 Web3 Browser Platform (#blockchain-14)

An immersive, decentralized web browser and application gateway built for the next generation of the internet. This platform is designed to promote Web3 adoption for beginners through a gamified, secure, and intuitive experience while integrating powerful features like a built-in wallet and native ad-blocking.

## ▶️Demo Youtube Link
https://youtu.be/tfX2hKEimkA?si=cyxPvtFyo0JVyq-6

## Live Demo Link
https://web3browser-sooty.vercel.app/

## Team name : WTF CoderZ (HackJKLU v5.0)


## 🚀 Product Overview
**What is our dApp about?**

An immersive, decentralized web browser and application gateway built for the next generation of the internet. This platform promotes Web3 adoption for beginners through a gamified, secure, and intuitive experience featuring an inbuilt wallet and native ad-blocking.

**What problem are we solving?**

The steep learning curve, fragmentation, and security risks associated with Web3. Beginners often fall victim to phishing sites or get overwhelmed by wallet setups. We provide a safe, unified educational gateway that protects users with active threat mitigation while gamifying their learning process.

---

## 🎯 Use Case
**Who is this product built for?**
- Web2 users exploring Web3 for the first time.
- Users concerned about privacy, trackers, and malicious dApps.
- Individuals looking to earn crypto rewards through onboarding quests.

**Why does this matter for users?**
It removes the friction from decentralized technologies. By natively rewarding users for learning security best practices and engaging with DApps, we foster a more educated, technically empowered, and financially self-sovereign community without the overwhelming complexity of traditional crypto tools.

---

## 📸 Screenshots

<div align="center">
  <img src="screenshots/media__1773548497610.png" width="45%" alt="Browser Interface" />
  <img src="screenshots/media__1773548500528.png" width="45%" alt="DApp View" />
  <img src="screenshots/media__1773548503095.png" width="45%" alt="Wallet Gateway" />
  <img src="screenshots/media__1773548507357.png" width="45%" alt="Identity Matrix" />
  <img src="https://i.imgur.com/LN4dnU2.png" width="45%" alt="Mobile View" />
  <img src="https://i.imgur.com/HmA8rmx.png" width="45%" alt="Mobile View2" />
</div>

---

## 🏗️ Architecture
**How does your product work?**
1. **Identity Handshake**: Users are greeted with a "Wallet Gatekeeper" modal to authenticate via their Web3 wallet. 
2. **The Workspace**: Users gain access to a customized, desktop-like immersive interface containing DApps, Rewards, WTF Zone (Games), Education, and Security tabs.
3. **Immersive Browsing**: The explore section acts as a search engine. When a user opens a DApp, it loads seamlessly within the browser workspace using iframe neural link technology.
4. **Economic Engine**: As users browse and read articles, the frontend communicates with the backend to record points, which can be redeemed on-chain.

**What components are involved?**
The frontend is a highly interactive Single Page Application built using **React** and **Vite**.
- **`components/`**: Modular UI elements like the Wallet Gatekeeper, DApp Viewer, and Security Dashboards.
- **Neural Guard**: The active security layer blocking ads and trackers on decentralized websites.
- **Python Backend Engine**: An external service validating gamification metrics and managing the DApp directory.
- 
**Github Repo Links**
  
Frontend : https://github.com/Apoorv-sharma1/web3browser

Backend : https://github.com/Apoorv-sharma1/web3browser_backend

---

## 🔗 HeLa Integration
**How is your dApp leveraging the HeLa Network?**
The platform is natively built for the **Hela Network**. The browser tracks user educational and browsing metrics as "Sync" points. When a user accumulates enough points, the frontend interacts directly with our deployed smart contract on the Hela Testnet to distribute **HLUSD** rewards to their connected wallet, showcasing the speed and efficiency of Hela transactions.

### Deployed Contract Details (Hela Testnet)
- **Token / Contract Address**: `0xBE75FDe9DeDe700635E3dDBe7e29b5db1A76C125`

**Proof of Transactions (Tx Hashes):**
1. `0x189b830b54a34d492d1ba594211f9bb7a54f853dda5cae343b89cb7acd9dc987`
2. `0x661e041ea358d82da5d8ea2fdf37f7bea92370fce6a6f7ae880244abee42b7c2`
3. `0xe80ffdf3b88357dd5490f63ac42a457be69b749168ddc742abd3baf96f51ed9e`

---

## 💻 Setup & Installation

To run the frontend locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Apoorv-sharma1/web3browser.git
   cd web3browser
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5000 # Or your deployed backend URL
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   *The application will be available at http://localhost:5173/*
