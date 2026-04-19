const express = require("express");
const bcrypt = require("bcryptjs");
const { getDb } = require("../db/connection");
const { generateToken, authMiddleware } = require("../middleware/auth");

const router = express.Router();

// ── POST /api/auth/register ──
router.post("/register", (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: "All fields required: email, password, name, role" });
    }

    if (!["hr", "employee"].includes(role)) {
      return res.status(400).json({ error: "Role must be 'hr' or 'employee'" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const db = getDb();

    // Check if email already exists
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const result = db.prepare(`
      INSERT INTO users (email, password_hash, name, role)
      VALUES (?, ?, ?, ?)
    `).run(email, passwordHash, name, role);

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);

    const token = generateToken(user);

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        walletAddress: user.wallet_address,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/login ──
router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const db = getDb();
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        walletAddress: user.wallet_address,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/auth/me ──
router.get("/me", authMiddleware, (req, res) => {
  const db = getDb();
  const user = db.prepare("SELECT id, email, name, role, wallet_address, company, created_at FROM users WHERE id = ?").get(req.user.id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ user });
});

// ── PUT /api/auth/wallet ── (assign wallet address to user)
router.put("/wallet", authMiddleware, (req, res) => {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ error: "walletAddress required" });
  }

  const db = getDb();
  db.prepare("UPDATE users SET wallet_address = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(walletAddress, req.user.id);

  res.json({ message: "Wallet address updated", walletAddress });
});

module.exports = router;