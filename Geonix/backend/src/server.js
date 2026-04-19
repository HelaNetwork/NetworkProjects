const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { initDatabase } = require("./db/init");
const { getDb } = require("./db/connection");
const { getServerWalletInfo, provider } = require("./services/hela");

// Initialize database on startup
initDatabase();

const app = express();
app.use(cors());
app.use(express.json());

// ── Routes ──
const authRoutes = require("./routes/auth");
const streamRoutes = require("./routes/streams");

app.use("/api/auth", authRoutes);
app.use("/api/streams", streamRoutes);

// ── Health Check ──
app.get("/api/health", async (req, res) => {
  let blockNumber = null;
  try {
    blockNumber = await provider.getBlockNumber();
  } catch (e) {}

  const walletInfo = await getServerWalletInfo();

  res.json({
    status: "ok",
    network: "HeLa Testnet",
    chainId: 666888,
    blockNumber,
    serverWallet: walletInfo,
    timestamp: Date.now(),
    version: "2.0.0",
  });
});

// ── Chain Config (for frontend — no MetaMask, just info) ──
app.get("/api/chain-config", (req, res) => {
  res.json({
    chainId: 666888,
    chainName: "HeLa Testnet",
    nativeCurrency: { name: "HLUSD", symbol: "HLUSD", decimals: 18 },
    rpcUrl: process.env.HELA_RPC_URL,
    blockExplorer: "https://testnet-blockscout.helachain.com",
    contractAddress: process.env.PAYSTREAM_CONTRACT,
    hlusdToken: process.env.HLUSD_TOKEN,
    note: "All transactions are signed by the server wallet. No MetaMask required.",
  });
});

// ── Recent On-Chain Events ──
app.get("/api/events/recent", async (req, res) => {
  try {
    const { readContract } = require("./services/hela");
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 1000);

    const [created, withdrawn, cancelled] = await Promise.all([
      readContract.queryFilter("StreamCreated", fromBlock),
      readContract.queryFilter("Withdrawn", fromBlock),
      readContract.queryFilter("StreamCancelled", fromBlock),
    ]);

    const { ethers } = require("ethers");

    res.json({
      created: created.map((e) => ({
        streamId: e.args[0].toString(),
        employer: e.args[1],
        employee: e.args[2],
        txHash: e.transactionHash,
      })),
      withdrawn: withdrawn.map((e) => ({
        streamId: e.args[0].toString(),
        employee: e.args[1],
        amount: ethers.formatEther(e.args[2]),
        txHash: e.transactionHash,
      })),
      cancelled: cancelled.map((e) => ({
        streamId: e.args[0].toString(),
        refund: ethers.formatEther(e.args[1]),
        txHash: e.transactionHash,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Users list (HR only) ──
const { authMiddleware, hrOnly } = require("./middleware/auth");
app.get("/api/users/employees", authMiddleware, hrOnly, (req, res) => {
  const db = getDb();
  const employees = db.prepare(
    "SELECT id, email, name, wallet_address, created_at FROM users WHERE role = 'employee' ORDER BY created_at DESC"
  ).all();
  res.json({ employees });
});

// ── 404 handler ──
app.use((req, res) => {
  res.status(404).json({ error: "Not found", path: req.originalUrl });
});

// ── Start server ──
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n🚀 PayStream API v2.0 running on port ${PORT}`);
  console.log(`📡 Network: HeLa Testnet (chainId: 666888)`);
  console.log(`🔗 Contract: ${process.env.PAYSTREAM_CONTRACT || "NOT SET"}`);
  console.log(`💰 HLUSD Token: ${process.env.HLUSD_TOKEN || "NOT SET"}`);
  console.log(`🗄️  Database: SQLite (data/paystream.db)\n`);
});