require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ── Provider & Wallet ──────────────────────────────────────
const RPC_URL = process.env.HELA_RPC_URL || "https://testnet-rpc.helachain.com";
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = process.env.PRIVATE_KEY
  ? new ethers.Wallet(process.env.PRIVATE_KEY, provider)
  : null;

// ── ABIs (minimal interfaces used by the backend) ──────────
const HUSD_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount)",
];

const REGISTRY_ABI = [
  "function registerMerchant(bytes metaPublicKey)",
  "function isMerchant(address) view returns (bool)",
  "function merchants(address) view returns (address wallet, bytes metaPublicKey, bool registered, uint256 registeredAt)",
  "event MerchantRegistered(address indexed wallet, bytes metaPublicKey, uint256 timestamp)",
];

const ROUTER_ABI = [
  "function createInvoice(uint256 amount) returns (bytes32)",
  "function payInvoice(bytes32 invoiceId)",
  "function claimInvoice(bytes32 invoiceId)",
  "function getInvoice(bytes32) view returns (address merchant, uint256 amount, uint8 status, address payer, uint256 createdAt, uint256 paidAt, address vault)",
  "function getMerchantInvoiceCount(address) view returns (uint256)",
  "function getMerchantInvoiceAt(address, uint256) view returns (bytes32)",
  "event InvoiceCreated(bytes32 indexed invoiceId, address indexed merchant, uint256 amount, uint256 nonce, uint256 timestamp, address vault)",
  "event PaymentProcessed(bytes32 indexed invoiceId, address indexed payer, address indexed merchant, uint256 amount, uint256 timestamp, address vault)",
  "event InvoiceClaimed(bytes32 indexed invoiceId, address indexed merchant, uint256 amount, uint256 timestamp, address vault)",
];

const POOL_ABI = [
  "function withdraw(bytes32 invoiceId)",
  "function getDeposit(bytes32 invoiceId) view returns (address merchant, uint256 amount, uint256 blockNumber, bool claimed)",
  "event DepositAdded(bytes32 indexed invoiceId, address indexed vault, address indexed merchant, uint256 amount)",
  "event WithdrawalCompleted(bytes32 indexed invoiceId, address indexed merchant, uint256 amount)"
];

const FEE_ABI = [
  "function protocolFee() view returns (uint256)",
  "function treasury() view returns (address)",
];

// ── Contract instances ─────────────────────────────────────
function getContracts() {
  const signer = wallet || provider;
  return {
    husd: new ethers.Contract(process.env.HUSD_ADDRESS, HUSD_ABI, signer),
    registry: new ethers.Contract(process.env.REGISTRY_ADDRESS, REGISTRY_ABI, signer),
    router: new ethers.Contract(process.env.ROUTER_ADDRESS, ROUTER_ABI, signer),
    pool: new ethers.Contract(process.env.POOL_ADDRESS, POOL_ABI, signer),
    feeManager: new ethers.Contract(process.env.FEE_MANAGER_ADDRESS, FEE_ABI, signer),
  };
}

// ── In-memory invoice store with file persistence ─────────
const DATA_FILE = path.join(__dirname, "invoices.json");

function loadStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(data);
      const map = new Map();
      // Force lowercased keys for consistent matching
      Object.entries(parsed).forEach(([key, val]) => {
        map.set(key.toLowerCase(), val);
      });
      return map;
    }
  } catch (e) { console.error("Load error:", e); }
  return new Map();
}

const invoiceStore = loadStore();

function saveStore() {
  try {
    const obj = Object.fromEntries(invoiceStore);
    fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2));
  } catch (e) { console.error("Save error:", e); }
}

// ── Routes ─────────────────────────────────────────────────
const routes = require("./routes");
app.use("/", routes(getContracts, invoiceStore, provider, wallet, saveStore));

// ── Event listener (payment monitor) ───────────────────────
function startEventListener() {
  try {
    const { router, pool } = getContracts();
    
    // Router events
    router.on("PaymentProcessed", (invoiceId, payer, merchant, amount, timestamp, vault) => {
      console.log(`⚡ Payment detected: ${invoiceId} via vault ${vault}`);
      const inv = invoiceStore.get(invoiceId.toLowerCase());
      if (inv) {
        inv.status = "paid";
        inv.payer = payer;
        inv.paidAt = Number(timestamp);
        saveStore();
      }
    });

    router.on("InvoiceCreated", (invoiceId, merchant, amount, nonce, timestamp, vault) => {
      console.log(`📄 Invoice created on-chain: ${invoiceId} | Vault: ${vault}`);
    });

    // PrivacyPool events
    if (pool) {
      pool.on("DepositAdded", (invoiceId, vault, merchant, amount, event) => {
        console.log(`🔒 Deposit added to PrivacyPool for ${invoiceId} from vault ${vault}`);
        const inv = invoiceStore.get(invoiceId.toLowerCase());
        if (inv) {
          inv.depositTxHash = event.log.transactionHash;
          saveStore();
        }
      });

      pool.on("WithdrawalCompleted", (invoiceId, merchant, amount, event) => {
        console.log(`🏦 Merchant withdrew from PrivacyPool: ${invoiceId}`);
        const inv = invoiceStore.get(invoiceId.toLowerCase());
        if (inv) {
          inv.status = "claimed";
          inv.withdrawalTxHash = event.log.transactionHash;
          saveStore();
        }
      });
    }

    console.log("🔗 Blockchain event listener active");
  } catch (err) {
    console.warn("⚠️  Event listener not started (contracts not configured):", err.message);
  }
}

// ── Start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n🚀 StealthCheckout backend running on http://localhost:${PORT}`);
  if (!process.env.HUSD_ADDRESS) {
    console.log("⚠️  Contract addresses not set. Deploy contracts first.\n");
  } else {
    startEventListener();
  }
});
