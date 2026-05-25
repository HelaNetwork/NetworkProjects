// routes/api.js
const express = require("express");
const router = express.Router();
const { registerUser, bookGas, confirmDelivery } = require("../agents/bookingAgent");
const { getByTraceId, getAll, overrideDLE, computeMerkleRoot, readDB } = require("../agents/auditLogger");
const chain = require("../agents/chainService");

// ── Auth: User Registration ───────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const result = await registerUser(req.body);
    res.json(result);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ── Booking ───────────────────────────────────────────────────
router.post("/book", async (req, res) => {
  try {
    const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    const result = await bookGas({ ...req.body, ipAddress });
    res.json(result);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ── Delivery ──────────────────────────────────────────────────
router.post("/deliver", async (req, res) => {
  try {
    const result = await confirmDelivery(req.body);
    res.json(result);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Get pending deliveries for a delivery agent
router.get("/deliveries/pending", (req, res) => {
  const db = readDB();
  const pending = Object.values(db.bookings).filter(b => b.status === "PENDING");
  res.json({ bookings: pending });
});

// Get completed deliveries
router.get("/deliveries/completed", (req, res) => {
  const db = readDB();
  const completed = Object.values(db.bookings)
    .filter(b => b.status === "DELIVERED")
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  res.json({ bookings: completed });
});

// Get all bookings for a wallet
router.get("/bookings/:wallet", (req, res) => {
  const db = readDB();
  const bookings = Object.values(db.bookings)
    .filter(b => b.walletAddress === req.params.wallet)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ bookings });
});

// Get user info
router.get("/user/:wallet", (req, res) => {
  const db = readDB();
  const user = db.users[req.params.wallet];
  if (!user) return res.status(404).json({ error: "User not found" });
  const { zkpCommitment, ...safe } = user; // don't expose commitment
  res.json(safe);
});

// ── Audit ─────────────────────────────────────────────────────
router.get("/audit", (req, res) => {
  const log = getAll();
  res.json({ entries: log, total: log.length, merkleRoot: computeMerkleRoot() });
});

router.get("/audit/:traceId", (req, res) => {
  const entries = getByTraceId(req.params.traceId);
  res.json({ entries, total: entries.length, traceId: req.params.traceId });
});

router.post("/override/:dleId", (req, res) => {
  const { challengedBy, reason, newOutput } = req.body;
  const updated = overrideDLE(req.params.dleId, challengedBy, reason, newOutput);
  if (!updated) return res.status(404).json({ error: "DLE not found" });
  res.json({ success: true, dle: updated });
});

// Anchor Merkle root onchain
router.post("/audit/anchor", async (req, res) => {
  try {
    const root = computeMerkleRoot();
    const count = getAll().length;
    const tx = await chain.anchorAuditRoot(root, count);
    res.json({ success: true, merkleRoot: root, dleCount: count, txHash: tx.txHash });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Stats for Admin ────────────────────────────────────────────
router.get("/stats", (req, res) => {
  const db = readDB();
  const bookings = Object.values(db.bookings);
  const users = Object.values(db.users);
  const dleLog = getAll();

  res.json({
    totalUsers: users.length,
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === "PENDING").length,
    deliveredBookings: bookings.filter(b => b.status === "DELIVERED").length,
    greenBookings: bookings.filter(b => b.riskTier === 0).length,
    yellowBookings: bookings.filter(b => b.riskTier === 1).length,
    redBookings: bookings.filter(b => b.riskTier === 2).length,
    totalDLEs: dleLog.length,
    overriddenDLEs: dleLog.filter(d => d.override_history.length > 0).length,
    merkleRoot: computeMerkleRoot(),
    contractConfig: chain.getContractConfig()
  });
});

// ── AI Chatbot ─────────────────────────────────────────────────
const { chat } = require("../agents/chatAgent");

router.post("/chat", async (req, res) => {
  try {
    const { history = [], message } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: "Message required" });
    const { reply, toolCalls } = await chat(history, message);
    res.json({ reply, toolCalls });
  } catch (e) {
    console.error("[ChatAgent]", e.message);
    res.status(500).json({ error: "AI agent unavailable: " + e.message });
  }
});

module.exports = router;
