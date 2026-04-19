// chainService.js — All onchain interactions for Booking Agent
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

let _contract = null;
let _wallet = null;

function getContractConfig() {
  const cfgPath = path.join(__dirname, "../data/contract.json");
  if (!fs.existsSync(cfgPath)) return null;
  return JSON.parse(fs.readFileSync(cfgPath, "utf8"));
}

function init() {
  if (_contract) return { contract: _contract, wallet: _wallet };

  const cfg = getContractConfig();
  if (!cfg || !process.env.PRIVATE_KEY) {
    console.warn("⚠️  Chain service running in MOCK mode (no contract deployed yet)");
    return null;
  }

  const provider = new ethers.JsonRpcProvider(
    process.env.HELA_RPC_URL || "https://testnet-rpc.helachain.com"
  );
  _wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  _contract = new ethers.Contract(cfg.contractAddress, cfg.abi, _wallet);
  return { contract: _contract, wallet: _wallet };
}

// ── SBT ──────────────────────────────────────────────────────
async function issueSBT(beneficiaryAddress, addressHash, zkpCommitment) {
  const ctx = init();
  if (!ctx) return mockTx("issueSBT", { beneficiaryAddress, addressHash });

  const existing = await ctx.contract.getSBT(beneficiaryAddress);
  if (existing.exists) {
    throw new Error(`SBT already exists for ${beneficiaryAddress} — use a different wallet`);
  }

  const tx = await ctx.contract.issueSBT(
    beneficiaryAddress,
    ethers.keccak256(ethers.toUtf8Bytes(addressHash)),
    ethers.keccak256(ethers.toUtf8Bytes(zkpCommitment))
  );
  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber, success: true };
}

async function getSBT(address) {
  const ctx = init();
  if (!ctx) return mockSBT(address);
  try {
    const sbt = await ctx.contract.getSBT(address);
    return {
      exists: sbt.exists,
      vouchersRemaining: Number(sbt.vouchersRemaining),
      riskTier: Number(sbt.riskTier),
      addressHash: sbt.addressHash,
      issuedAt: Number(sbt.issuedAt)
    };
  } catch {
    return { exists: false };
  }
}

// ── Escrow ────────────────────────────────────────────────────
async function lockSubsidy(bookingId, beneficiary, riskTier, fraudScore, traceId) {
  const ctx = init();
  const bookingIdBytes = ethers.keccak256(ethers.toUtf8Bytes(bookingId));

  if (!ctx) return mockTx("lockSubsidy", { bookingId, riskTier, fraudScore });

  const subsidyAmount = await ctx.contract.SUBSIDY_AMOUNT();
  const tx = await ctx.contract.lockSubsidy(
    bookingIdBytes, beneficiary, riskTier, fraudScore, traceId,
    { value: subsidyAmount }
  );
  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber, success: true };
}

async function releaseSubsidy(bookingId, proofData, agencyAddress) {
  const ctx = init();
  const bookingIdBytes = ethers.keccak256(ethers.toUtf8Bytes(bookingId));
  const proofHash = ethers.keccak256(ethers.toUtf8Bytes(proofData));

  if (!ctx) return mockTx("releaseSubsidy", { bookingId, proofData });

  const tx = await ctx.contract.releaseSubsidy(bookingIdBytes, proofHash, agencyAddress);
  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber, success: true };
}

async function overrideBooking(bookingId, reason) {
  const ctx = init();
  const bookingIdBytes = ethers.keccak256(ethers.toUtf8Bytes(bookingId));

  if (!ctx) return mockTx("overrideBooking", { bookingId, reason });

  const tx = await ctx.contract.overrideBooking(bookingIdBytes, reason);
  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber, success: true };
}

async function anchorAuditRoot(merkleRoot, dleCount) {
  const ctx = init();
  if (!ctx) return mockTx("anchorAuditRoot", { merkleRoot, dleCount });

  const tx = await ctx.contract.anchorAuditRoot(
    ethers.keccak256(ethers.toUtf8Bytes(merkleRoot)), dleCount
  );
  const receipt = await tx.wait();
  return { txHash: receipt.hash, success: true };
}

// ── Mock helpers (when contract not deployed) ─────────────────
function mockTx(fn, params) {
  const hash = "0xMOCK_" + Math.random().toString(16).slice(2, 18).toUpperCase();
  return { txHash: hash, blockNumber: Math.floor(Math.random() * 1000000) + 3000000, success: true, mock: true };
}

function mockSBT(address) {
  return { exists: true, vouchersRemaining: 12, riskTier: 0, addressHash: "0x0", issuedAt: Date.now() / 1000, mock: true };
}

module.exports = { issueSBT, getSBT, lockSubsidy, releaseSubsidy, overrideBooking, anchorAuditRoot, getContractConfig };
