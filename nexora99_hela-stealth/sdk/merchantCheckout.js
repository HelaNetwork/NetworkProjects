/**
 * StealthCheckout Merchant SDK
 *
 * Lightweight wrapper around the StealthCheckout smart contracts.
 * Works in both Node.js and browser environments with ethers.js v6.
 *
 * Usage:
 *   import { StealthCheckout } from "./merchantCheckout.js";
 *   const sc = new StealthCheckout(provider, signer, addresses);
 *   await sc.registerMerchant("0xabc...");
 *   const invoice = await sc.createInvoice("25.00");
 *   await sc.payInvoice(invoice.id);
 */

const { ethers } = require("ethers");

// ── Minimal ABIs ──────────────────────────────────────────
const HUSD_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

const REGISTRY_ABI = [
  "function registerMerchant(bytes metaPublicKey)",
  "function isMerchant(address) view returns (bool)",
];

const ROUTER_ABI = [
  "function createInvoice(uint256 amount) returns (bytes32)",
  "function payInvoice(bytes32 invoiceId)",
  "function getInvoice(bytes32) view returns (address, uint256, uint8, address, uint256, uint256)",
  "function getMerchantInvoiceCount(address) view returns (uint256)",
  "function getMerchantInvoiceAt(address, uint256) view returns (bytes32)",
  "event InvoiceCreated(bytes32 indexed invoiceId, address indexed merchant, uint256 amount, uint256 nonce, uint256 timestamp)",
  "event PaymentProcessed(bytes32 indexed invoiceId, address indexed payer, address indexed merchant, uint256 amount, uint256 timestamp)",
];

const FEE_ABI = [
  "function protocolFee() view returns (uint256)",
  "function treasury() view returns (address)",
];

class StealthCheckout {
  /**
   * @param {ethers.Provider}  provider
   * @param {ethers.Signer}    signer
   * @param {Object}           addresses  { husd, registry, router, feeManager }
   */
  constructor(provider, signer, addresses) {
    this.provider = provider;
    this.signer = signer;
    this.husd = new ethers.Contract(addresses.husd, HUSD_ABI, signer);
    this.registry = new ethers.Contract(addresses.registry, REGISTRY_ABI, signer);
    this.router = new ethers.Contract(addresses.router, ROUTER_ABI, signer);
    this.feeManager = new ethers.Contract(addresses.feeManager, FEE_ABI, signer);
  }

  /** Register the connected wallet as a merchant */
  async registerMerchant(metaPublicKey) {
    const key = typeof metaPublicKey === "string"
      ? ethers.toUtf8Bytes(metaPublicKey)
      : metaPublicKey;
    const tx = await this.registry.registerMerchant(key);
    return tx.wait();
  }

  /** Check if an address is a registered merchant */
  async isMerchant(address) {
    return this.registry.isMerchant(address);
  }

  /** Create a payment invoice (merchant calls this) */
  async createInvoice(amountHusd) {
    const amountWei = ethers.parseEther(amountHusd.toString());

    // Ensure approval for protocol fee
    const fee = await this.feeManager.protocolFee();
    if (fee > 0n) {
      const allowance = await this.husd.allowance(
        await this.signer.getAddress(),
        this.router.target
      );
      if (allowance < fee) {
        const approveTx = await this.husd.approve(this.router.target, ethers.MaxUint256);
        await approveTx.wait();
      }
    }

    const tx = await this.router.createInvoice(amountWei);
    const receipt = await tx.wait();

    // Parse InvoiceCreated event
    const iface = new ethers.Interface(ROUTER_ABI);
    for (const log of receipt.logs) {
      try {
        const parsed = iface.parseLog({ topics: log.topics, data: log.data });
        if (parsed?.name === "InvoiceCreated") {
          return {
            id: parsed.args.invoiceId,
            merchant: parsed.args.merchant,
            amount: ethers.formatEther(parsed.args.amount),
            nonce: Number(parsed.args.nonce),
            txHash: receipt.hash,
          };
        }
      } catch (_) {}
    }
    throw new Error("InvoiceCreated event not found in receipt");
  }

  /** Pay an invoice (customer calls this) */
  async payInvoice(invoiceId) {
    // Get invoice details to know amount
    const inv = await this.router.getInvoice(invoiceId);
    const amount = inv[1]; // amount is second return value

    // Approve HUSD transfer
    const allowance = await this.husd.allowance(
      await this.signer.getAddress(),
      this.router.target
    );
    if (allowance < amount) {
      const approveTx = await this.husd.approve(this.router.target, ethers.MaxUint256);
      await approveTx.wait();
    }

    const tx = await this.router.payInvoice(invoiceId);
    return tx.wait();
  }

  /** Get invoice details from chain */
  async getInvoiceStatus(invoiceId) {
    const inv = await this.router.getInvoice(invoiceId);
    const statusMap = ["active", "paid", "cancelled"];
    return {
      merchant: inv[0],
      amount: ethers.formatEther(inv[1]),
      status: statusMap[Number(inv[2])],
      payer: inv[3] === ethers.ZeroAddress ? null : inv[3],
      createdAt: Number(inv[4]),
      paidAt: Number(inv[5]) || null,
    };
  }

  /** Get HUSD balance */
  async getBalance(address) {
    const bal = await this.husd.balanceOf(address);
    return ethers.formatEther(bal);
  }
}

module.exports = { StealthCheckout };
