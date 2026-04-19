const { ethers } = require("ethers");
require("dotenv").config();

// ── HeLa Provider (Testnet) ──
// Explicitly set chainId: 666888 so ethers never auto-detects the wrong chain.
const HELA_CHAIN_ID = 666888;
const provider = new ethers.JsonRpcProvider(
  process.env.HELA_RPC_URL || "https://testnet-rpc.helachain.com",
  { chainId: HELA_CHAIN_ID, name: "helaTestnet" }
);

// ── Server Wallet ──
let serverWallet = null;
if (process.env.PRIVATE_KEY) {
  serverWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  console.log("🔐 Server wallet loaded:", serverWallet.address);
} else {
  console.warn("⚠️  No PRIVATE_KEY set — on-chain writes disabled");
}

// ── PayStream Contract ABI (with pause/resume) ──
const PAYSTREAM_ABI = [
  // Read functions
  "function nextStreamId() view returns (uint256)",
  "function streams(uint256) view returns (address employer, address employee, address token, uint256 ratePerSecond, uint256 startTime, uint256 endTime, uint256 withdrawnAmount, bool active, bool paused, uint256 pausedTime, uint256 totalPausedDuration)",
  "function availableBalance(uint256) view returns (uint256)",
  "function getEmployeeStreams(address) view returns (uint256[])",
  "function getEmployerStreams(address) view returns (uint256[])",
  "function getStream(uint256) view returns (address employer, address employee, address token, uint256 ratePerSecond, uint256 startTime, uint256 endTime, uint256 withdrawnAmount, bool active, bool paused, uint256 pausedTime, uint256 totalPausedDuration)",
  "function taxVault() view returns (address)",
  "function taxRate() view returns (uint256)",

  // Write functions
  "function createStream(address employee, address token, uint256 totalAmount, uint256 duration) returns (uint256)",
  "function withdraw(uint256 streamId)",
  "function cancelStream(uint256 streamId)",
  "function pauseStream(uint256 streamId)",
  "function resumeStream(uint256 streamId)",
  "function setTaxVault(address newVault)",
  "function setTaxRate(uint256 newRate)",

  // Role management
  "function grantRole(bytes32 role, address account)",
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function HR_ROLE() view returns (bytes32)",
  "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",

  // Events
  "event StreamCreated(uint256 indexed streamId, address indexed employer, address indexed employee, address token, uint256 ratePerSecond, uint256 startTime, uint256 endTime)",
  "event StreamWithdrawn(uint256 indexed streamId, address indexed employee, uint256 amount, uint256 taxAmount)",
  "event StreamCancelled(uint256 indexed streamId)",
  "event StreamPaused(uint256 indexed streamId, address indexed pausedBy, uint256 pausedAt)",
  "event StreamResumed(uint256 indexed streamId, address indexed resumedBy, uint256 resumedAt)",
  "event TaxRateUpdated(uint256 newRate)",
  "event TaxVaultUpdated(address newVault)",
];

// ── ERC20 ABI (for HLUSD token approval) ──
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

// ── Contract instances ──
const readContract = new ethers.Contract(
  process.env.PAYSTREAM_CONTRACT || ethers.ZeroAddress,
  PAYSTREAM_ABI,
  provider
);

const writeContract = serverWallet
  ? new ethers.Contract(
      process.env.PAYSTREAM_CONTRACT || ethers.ZeroAddress,
      PAYSTREAM_ABI,
      serverWallet
    )
  : null;

const hlusdContract = serverWallet
  ? new ethers.Contract(
      process.env.HLUSD_TOKEN || ethers.ZeroAddress,
      ERC20_ABI,
      serverWallet
    )
  : null;

// ── Helper: Ensure token approval before creating stream ──
async function ensureApproval(amount) {
  if (!hlusdContract || !writeContract) {
    throw new Error("Server wallet not configured");
  }

  try {
    const currentAllowance = await hlusdContract.allowance(
      serverWallet.address,
      process.env.PAYSTREAM_CONTRACT
    );

    if (currentAllowance < amount) {
      console.log("📝 Approving HLUSD for PayStream contract...");
      const tx = await hlusdContract.approve(
        process.env.PAYSTREAM_CONTRACT,
        ethers.MaxUint256,
        {
          gasLimit: 100000,
        }
      );
      console.log("Approval transaction sent:", tx.hash);
      console.log("Waiting for approval confirmation...");
      await tx.wait(1, 120000);
      console.log("✅ HLUSD approved:", tx.hash);
    } else {
      console.log("✅ HLUSD already approved, current allowance:", ethers.formatEther(currentAllowance));
    }
  } catch (error) {
    console.error("❌ Approval failed:", error.message);
    throw new Error(`Token approval failed: ${error.message}`);
  }
}

// ── Read stream details ──
async function getStreamDetails(streamId) {
  const s = await readContract.getStream(streamId);
  const available = await readContract.availableBalance(streamId);

  return {
    id: streamId,
    employer: s.employer,
    employee: s.employee,
    token: s.token,
    ratePerSecond: s.ratePerSecond.toString(),
    startTime: Number(s.startTime),
    endTime: Number(s.endTime),
    withdrawnAmount: ethers.formatEther(s.withdrawnAmount),
    active: s.active,
    paused: s.paused,
    pausedTime: Number(s.pausedTime),
    totalPausedDuration: Number(s.totalPausedDuration),
    availableBalance: ethers.formatEther(available),
    earnedPerSecond: ethers.formatEther(s.ratePerSecond),
  };
}

// ── Get server wallet balance ──
async function getServerWalletInfo() {
  if (!serverWallet) return { error: "No wallet configured" };

  const balance = await provider.getBalance(serverWallet.address);
  let hlusdBalance = "0";
  if (hlusdContract) {
    try {
      const bal = await hlusdContract.balanceOf(serverWallet.address);
      hlusdBalance = ethers.formatEther(bal);
    } catch (e) {}
  }

  return {
    address: serverWallet.address,
    helaBalance: ethers.formatEther(balance),
    hlusdBalance,
  };
}

module.exports = {
  provider,
  serverWallet,
  readContract,
  writeContract,
  hlusdContract,
  getStreamDetails,
  getServerWalletInfo,
  ensureApproval,
  PAYSTREAM_ABI,
};