const express = require("express");
const twilio = require("twilio");
const { ethers } = require("ethers");
const cors = require("cors");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors({ origin: "*" }));

const DASHBOARD_URL = "https://shell-reservoir-raleigh-miniature.trycloudflare.com";
const SESSION_DURATION = 10 * 60 * 1000; // 10 minutes

// ─── Local File Storage ───────────────────────────────────────────────────────
const DATA_FILE = path.join(__dirname, "data.json");

function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ users: {}, transactions: [] }));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

let { users, transactions } = loadData();
console.log(`📂 Loaded ${Object.keys(users).length} users and ${transactions.length} transactions`);

// ─── Session Management (4-digit PIN, 10 min expiry) ──────────────────────────
const sessions = {}; // { phone -> expiresAt }

function isSessionActive(phone) {
  if (!sessions[phone]) return false;
  if (Date.now() > sessions[phone]) {
    delete sessions[phone];
    return false;
  }
  return true;
}

function startSession(phone) {
  sessions[phone] = Date.now() + SESSION_DURATION;
}

// ─── Encryption ───────────────────────────────────────────────────────────────
const ENC_KEY = Buffer.from(
  process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex"), "hex"
);

function encrypt(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", ENC_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return iv.toString("hex") + ":" + tag.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(data) {
  const [ivHex, tagHex, encHex] = data.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const encrypted = Buffer.from(encHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", ENC_KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

// ─── Hela Network ─────────────────────────────────────────────────────────────
const provider = new ethers.JsonRpcProvider(
  process.env.HELA_RPC || "https://testnet-rpc.helachain.com"
);

const CONTRACT_ABI = [
  "function deposit() payable",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function withdraw(uint256 amount)",
  "function getBalance(address user) view returns (uint256)",
  "function getRemainingDailyLimit(address user) view returns (uint256)",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function normalizePhone(phone) {
  return phone.replace(/^whatsapp:/i, "").trim();
}

function getOrCreateUser(phone) {
  const clean = normalizePhone(phone);
  if (!users[clean]) {
    const wallet = ethers.Wallet.createRandom();
    users[clean] = {
      phone: clean,
      walletAddress: wallet.address,
      privateKeyEncrypted: encrypt(wallet.privateKey),
      createdAt: new Date().toISOString(),
    };
    saveData({ users, transactions });
    console.log(`✅ New user: ${clean} → ${wallet.address}`);
  }
  return users[clean];
}

function findRecipient(raw) {
  return users[normalizePhone(raw)] || null;
}

function addTransaction(tx) {
  transactions.unshift({ id: Date.now(), ...tx, createdAt: new Date().toISOString() });
  saveData({ users, transactions });
}

function parseCommand(message) {
  const msg = message.trim();
  const lower = msg.toLowerCase();

  if (msg.match(/^\d{4}$/)) return { command: "pin", pin: msg };

  const sendMatch = msg.match(/send\s+([\d.]+)\s+hela\s+to\s+(\S+)/i);
  if (sendMatch) return { command: "send", amount: parseFloat(sendMatch[1]), to: sendMatch[2] };

  const depositMatch = msg.match(/deposit\s+([\d.]+)\s*hela/i);
  if (depositMatch) return { command: "deposit", amount: parseFloat(depositMatch[1]) };

  const withdrawMatch = msg.match(/withdraw\s+([\d.]+)\s*hela/i);
  if (withdrawMatch) return { command: "withdraw", amount: parseFloat(withdrawMatch[1]) };

  if (lower.includes("open dashboard") || lower.includes("dashboard")) return { command: "dashboard" };
  if (lower.includes("balance") || lower.includes("check")) return { command: "balance" };
  if (lower.includes("history") || lower.includes("transactions")) return { command: "history" };
  if (lower.includes("limit")) return { command: "limit" };
  if (lower.includes("wallet") || lower.includes("address")) return { command: "wallet" };
  if (lower.match(/^(hi|hello|hey|start|register)\b/)) return { command: "register" };
  return { command: "help" };
}

function sendReply(res, message) {
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(message);
  res.type("text/xml").send(twiml.toString());
}

function askForPin(res, reason) {
  if (reason === "expired") {
    return sendReply(res,
      `⏱ Session expired!\n\nEnter your *4-digit PIN* to continue.`
    );
  }
  return sendReply(res,
    `🔐 Welcome to ZapPay! ⚡\n\nChoose a *4-digit PIN* to secure your account.\n\nYou'll need to enter it every 10 minutes.`
  );
}

const COMMANDS_LIST =
  `• Deposit 10 HELA\n` +
  `• Send 10 HELA to +91XXXXXXXXXX\n` +
  `• Check balance\n` +
  `• Withdraw 10 HELA\n` +
  `• Transaction history\n` +
  `• Daily limit\n` +
  `• My wallet\n` +
  `• Open dashboard`;

// ─── WhatsApp Webhook ─────────────────────────────────────────────────────────
app.post("/webhook", async (req, res) => {
  const incomingMsg = req.body.Body || "";
  const fromPhone = req.body.From || "";
  console.log(`📱 ${fromPhone}: ${incomingMsg}`);

  try {
    const user = getOrCreateUser(fromPhone);
    const clean = normalizePhone(fromPhone);
    const parsed = parseCommand(incomingMsg);

    // ── PIN ENTRY ─────────────────────────────────────────────────────────────
    if (parsed.command === "pin") {
      const inputHash = crypto.createHash("sha256").update(parsed.pin).digest("hex");

      // First time — set PIN
      if (!users[clean].pinHash) {
        users[clean].pinHash = inputHash;
        saveData({ users, transactions });
        startSession(clean);
        return sendReply(res,
          `✅ PIN set!\n\nSession active for 10 minutes.\n\n` +
          `🎉 Welcome to ZapPay! ⚡\n` +
          `📬 ${user.walletAddress}\n\n` +
          `Commands:\n${COMMANDS_LIST}`
        );
      }

      // Returning user — verify PIN
      if (inputHash !== users[clean].pinHash) {
        return sendReply(res, `❌ Wrong PIN! Please try again.`);
      }

      startSession(clean);
      return sendReply(res,
        `✅ PIN verified!\n\nSession active for 10 minutes.\n\nCommands:\n${COMMANDS_LIST}`
      );
    }

    // ── SESSION CHECK ─────────────────────────────────────────────────────────
    if (!isSessionActive(clean)) {
      return askForPin(res, users[clean].pinHash ? "expired" : "first_time");
    }

    // ── COMMANDS ──────────────────────────────────────────────────────────────

    if (parsed.command === "register") {
      return sendReply(res,
        `👋 You're already registered!\n\n📬 ${user.walletAddress}\n\nCommands:\n${COMMANDS_LIST}`
      );
    }

    if (parsed.command === "dashboard") {
      return sendReply(res,
        `📊 Live Dashboard\n\n${DASHBOARD_URL}\n\nView all transactions and network stats in real time.`
      );
    }

    if (parsed.command === "wallet") {
      return sendReply(res, `👛 Your Wallet\n\n📬 ${user.walletAddress}\n\nShare this to receive HELA!`);
    }

    if (parsed.command === "balance") {
      try {
        const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        const raw = await contract.getBalance(user.walletAddress);
        return sendReply(res, `💰 Your Balance\n\n${ethers.formatEther(raw)} HELA`);
      } catch (e) {
        return sendReply(res, `❌ Could not fetch balance. Try again later.`);
      }
    }

    if (parsed.command === "limit") {
      try {
        const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        const raw = await contract.getRemainingDailyLimit(user.walletAddress);
        return sendReply(res, `📊 Daily Limit Remaining\n\n${ethers.formatEther(raw)} HELA left today`);
      } catch (e) {
        return sendReply(res, `❌ Could not fetch limit. Try again later.`);
      }
    }

    if (parsed.command === "history") {
      const userTxs = transactions.filter(tx => tx.fromPhone === clean || tx.toPhone === clean).slice(0, 5);
      if (userTxs.length === 0) return sendReply(res, `📋 No transactions yet!\n\nDeposit first: Deposit 10 HELA`);
      let msg = `📋 Last ${userTxs.length} Transactions:\n\n`;
      userTxs.forEach((tx, i) => {
        const type = tx.fromPhone === clean ? "📤 Sent" : "📥 Received";
        const status = tx.status === "success" ? "✅" : "❌";
        msg += `${i + 1}. ${status} ${type} ${tx.amount} HELA\n   ${new Date(tx.createdAt).toLocaleDateString()}\n\n`;
      });
      return sendReply(res, msg);
    }

    if (parsed.command === "deposit") {
      const { amount } = parsed;
      try {
        const privateKey = decrypt(user.privateKeyEncrypted);
        const wallet = new ethers.Wallet(privateKey, provider);
        const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
        const amountWei = ethers.parseEther(amount.toString());
        const nativeBal = await provider.getBalance(user.walletAddress);
        if (nativeBal < amountWei) {
          return sendReply(res, `❌ Insufficient balance!\n\nYou need ${amount} HELA in:\n📬 ${user.walletAddress}`);
        }
        const tx = await contract.deposit({ value: amountWei });
        await tx.wait();
        addTransaction({ fromPhone: clean, toPhone: "contract", amount, txHash: tx.hash, status: "success" });
        return sendReply(res, `✅ Deposited ${amount} HELA successfully!`);
      } catch (e) {
        return sendReply(res, `❌ Deposit failed: ${e.message}`);
      }
    }

    if (parsed.command === "withdraw") {
      const { amount } = parsed;
      try {
        const privateKey = decrypt(user.privateKeyEncrypted);
        const wallet = new ethers.Wallet(privateKey, provider);
        const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
        const amountWei = ethers.parseEther(amount.toString());
        const contractBal = await contract.getBalance(user.walletAddress);
        if (contractBal < amountWei) {
          return sendReply(res, `❌ Insufficient balance!\n\nYou have ${ethers.formatEther(contractBal)} HELA deposited.`);
        }
        const tx = await contract.withdraw(amountWei);
        await tx.wait();
        addTransaction({ fromPhone: "contract", toPhone: clean, amount, txHash: tx.hash, status: "success" });
        return sendReply(res, `✅ Withdrew ${amount} HELA successfully!`);
      } catch (e) {
        return sendReply(res, `❌ Withdrawal failed: ${e.message}`);
      }
    }

    if (parsed.command === "send") {
      const { amount, to } = parsed;
      if (normalizePhone(to) === clean) {
        return sendReply(res, `❌ You can't send HELA to yourself!`);
      }
      const recipient = findRecipient(to);
      if (!recipient) {
        return sendReply(res,
          `❌ User ${to} not found!\n\nAsk them to:\n1. Save this number\n2. Send the join message\n3. Enter their PIN`
        );
      }
      try {
        const privateKey = decrypt(user.privateKeyEncrypted);
        const wallet = new ethers.Wallet(privateKey, provider);
        const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
        const amountWei = ethers.parseEther(amount.toString());
        const contractBal = await contract.getBalance(user.walletAddress);
        if (contractBal < amountWei) {
          return sendReply(res, `❌ Insufficient balance!\n\nYou have ${ethers.formatEther(contractBal)} HELA.\n\nDeposit more: Deposit ${amount} HELA`);
        }
        const remaining = await contract.getRemainingDailyLimit(user.walletAddress);
        if (remaining < amountWei) {
          return sendReply(res, `❌ Daily limit exceeded!\n\nYou can send ${ethers.formatEther(remaining)} HELA more today.`);
        }
        const tx = await contract.transfer(recipient.walletAddress, amountWei);
        await tx.wait();
        addTransaction({ fromPhone: clean, toPhone: normalizePhone(to), amount, txHash: tx.hash, status: "success" });
        return sendReply(res, `✅ Transfer Successful!\n\nSent: ${amount} HELA\nTo: ${to}`);
      } catch (e) {
        addTransaction({ fromPhone: clean, toPhone: normalizePhone(to), amount, txHash: null, status: "failed" });
        return sendReply(res, `❌ Transfer failed: ${e.message}`);
      }
    }

    return sendReply(res, `🤖 ZapPay Bot\n\nCommands:\n${COMMANDS_LIST}`);

  } catch (err) {
    console.error("Webhook error:", err);
    return sendReply(res, `❌ Something went wrong. Please try again.`);
  }
});

// ─── Dashboard API ────────────────────────────────────────────────────────────
app.get("/api/transactions", (req, res) => res.json(transactions.slice(0, 50)));

app.get("/api/users", (req, res) => {
  res.json(Object.values(users).map(u => ({
    phone: u.phone, walletAddress: u.walletAddress, createdAt: u.createdAt,
  })));
});

app.get("/api/stats", (req, res) => {
  const totalUsers = Object.keys(users).length;
  const totalTransactions = transactions.length;
  const totalVolume = transactions
    .filter(tx => tx.status === "success" && tx.fromPhone !== "contract" && tx.toPhone !== "contract")
    .reduce((sum, tx) => sum + tx.amount, 0);
  res.json({ totalUsers, totalTransactions, totalVolume });
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`⚡ ZapPay Server running on port ${PORT}`);
  console.log(`📱 Webhook: http://localhost:${PORT}/webhook`);
  console.log(`📊 Dashboard API: http://localhost:${PORT}/api/stats`);
});
