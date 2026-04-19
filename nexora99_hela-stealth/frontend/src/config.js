// Contract addresses – update after deployment
// Helper to clean env vars
const clean = (val) => (val && val !== "undefined" && val !== "null") ? val.trim() : "";

export const CONTRACTS = {
  HUSD: clean(import.meta.env.VITE_HUSD_ADDRESS),
  REGISTRY: clean(import.meta.env.VITE_REGISTRY_ADDRESS),
  ROUTER: clean(import.meta.env.VITE_ROUTER_ADDRESS),
  POOL: clean(import.meta.env.VITE_POOL_ADDRESS),
  FEE_MANAGER: clean(import.meta.env.VITE_FEE_MANAGER_ADDRESS),
};

export const HELA_CHAIN = {
  chainId: "0xa2d08", // 666888
  chainName: "HeLa Testnet",
  rpcUrls: ["https://testnet-rpc.helachain.com"],
  nativeCurrency: { name: "HLUSD", symbol: "HLUSD", decimals: 18 },
  blockExplorerUrls: ["https://testnet-blockexplorer.helachain.com"],
};

export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

// Minimal ABIs for frontend
export const HUSD_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
];

export const REGISTRY_ABI = [
  "function registerMerchant(bytes metaPublicKey)",
  "function isMerchant(address) view returns (bool)",
];

export const ROUTER_ABI = [
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

export const FEE_ABI = [
  "function protocolFee() view returns (uint256)",
  "function treasury() view returns (address)",
];

// StealthVault ABI (for approving the vault address)
export const VAULT_ABI = [
  "function deposit(address from)",
  "function forwardToPool()",
  "function deposited() view returns (bool)",
  "function forwarded() view returns (bool)",
  "function privacyPool() view returns (address)",
  "function amount() view returns (uint256)",
];

export const POOL_ABI = [
  "function deposits(bytes32) view returns (uint256)",
  "function recordDeposit(bytes32 invoiceId, uint256 amount)",
  "function withdraw(bytes32 invoiceId) external",
  "function getDeposit(bytes32 invoiceId) view returns (address merchant, uint256 amount, uint256 blockNumber, bool claimed)",
];
