const { ethers } = require("ethers");
const express = require("express");

/**
 * StealthCheckout API Routes
 */
module.exports = function createRoutes(getContracts, invoiceStore, provider, wallet, saveStore) {
  const router = express.Router();

  // ── Health ─────────────────────────────────────────────
  router.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  // ── POST /merchant/register ────────────────────────────
  router.post("/merchant/register", async (req, res) => {
    try {
      const { merchantAddress, metaPublicKey } = req.body;
      if (!merchantAddress || !metaPublicKey) {
        return res.status(400).json({ error: "merchantAddress and metaPublicKey required" });
      }

      const { registry } = getContracts();
      const already = await registry.isMerchant(merchantAddress);
      if (already) {
        return res.status(409).json({ error: "Merchant already registered" });
      }

      // In a real app the merchant signs this themselves.
      // For hackathon demo the backend submits on their behalf.
      const tx = await registry.registerMerchant(metaPublicKey);
      const receipt = await tx.wait();

      res.json({
        success: true,
        merchantAddress,
        txHash: receipt.hash,
      });
    } catch (err) {
      console.error("Register error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // ── POST /invoice/save-metadata ────────────────────────
  // Called by frontend after on-chain creation to persist description
  router.post("/invoice/save-metadata", async (req, res) => {
    try {
      const { invoiceId, description, amount, merchantAddress } = req.body;
      if (!invoiceId) return res.status(400).json({ error: "invoiceId required" });

      const storeKey = invoiceId.toLowerCase();
      
      // Store metadata (merging if already exists)
      const existing = invoiceStore.get(storeKey) || {};
      invoiceStore.set(storeKey, {
        ...existing,
        id: invoiceId,
        description: description || "",
        amount: amount || existing.amount,
        merchant: merchantAddress || existing.merchant,
        status: existing.status || "active",
        createdAt: existing.createdAt || Math.floor(Date.now() / 1000)
      });

      if (saveStore) saveStore();
      console.log(`Synced metadata for ${storeKey}: ${description}`);
      res.json({ success: true });
    } catch (err) {
      console.error("Sync metadata error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // ── GET /invoice/status/:id ───────────────────────────
  router.get("/invoice/status/:id", async (req, res) => {
    try {
      const invoiceId = req.params.id;

      // Try on-chain first
      const { router: payRouter } = getContracts();
      const onChain = await payRouter.getInvoice(invoiceId);
      const statusMap = ["active", "paid", "cancelled"];

      res.json({
        id: invoiceId,
        merchant: onChain.merchant,
        amount: ethers.formatEther(onChain.amount),
        status: statusMap[Number(onChain.status)] || "unknown",
        payer: onChain.payer === ethers.ZeroAddress ? null : onChain.payer,
        createdAt: Number(onChain.createdAt),
        paidAt: Number(onChain.paidAt) || null,
      });
    } catch (err) {
      // Fallback to local store
      const local = invoiceStore.get(invoiceId.toLowerCase());
      if (local) return res.json(local);
      res.status(404).json({ error: "Invoice not found" });
    }
  });

  // ── GET /merchant/invoices/:address ───────────────────
  router.get("/merchant/invoices/:address", async (req, res) => {
    try {
      const { router: payRouter, pool: poolContract } = getContracts();
      const address = req.params.address;
      const count = await payRouter.getMerchantInvoiceCount(address);
      const invoices = [];
      const statusMap = ["active", "paid", "claimed", "cancelled"];
 
      const n = Number(count);
      for (let i = n - 1; i >= 0; i--) {
        const id = await payRouter.getMerchantInvoiceAt(address, i);
        const inv = await payRouter.getInvoice(id);
        const lookupKey = id.toLowerCase();
        const local = invoiceStore.get(lookupKey);
        
        let currentStatus = statusMap[Number(inv.status)];
        
        // RECONCILIATION: If router says "paid", check the pool for "claimed"
        if (currentStatus === "paid" && poolContract) {
          try {
             // getDeposit returns [merchant, amount, blockNumber, claimed]
             const dep = await poolContract.getDeposit(id);
             if (dep && dep.claimed) {
               currentStatus = "claimed";
             }
          } catch (e) {
             console.warn(`Pool status check failed for ${id}:`, e.message);
          }
        }
 
        console.log(`History lookup for link ${lookupKey} -> Found: ${!!local}`);
        if (!local) {
          console.log(`Current Map keys:`, Array.from(invoiceStore.keys()));
        }

        invoices.push({
          id,
          amount: ethers.formatEther(inv.amount),
          status: currentStatus,
          description: local ? local.description : "",
          payer: inv.payer === ethers.ZeroAddress ? null : inv.payer,
          createdAt: Number(inv.createdAt),
          paidAt: Number(inv.paidAt) || null,
        });
      }

      res.json({ merchant: address, count: invoices.length, invoices });
    } catch (err) {
      console.error("Merchant invoices error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // ── POST /withdraw/:invoiceId ─────────────────────────
  router.post("/withdraw/:invoiceId", async (req, res) => {
    try {
      const invoiceId = req.params.invoiceId;
      if (!invoiceId) {
        return res.status(400).json({ error: "invoiceId required" });
      }

      const { pool } = getContracts();
      if (!pool) {
        return res.status(500).json({ error: "PrivacyPool contract not configured" });
      }
 
      // 1. Call privacyPool.withdraw(invoiceId)
      // Note: In this demo, the backend wallet acts as the merchant or pays gas.
      const tx = await pool.withdraw(invoiceId);

      // 2. Wait for transaction confirmation
      const receipt = await tx.wait();

      // 3. Store the withdrawal transaction hash locally
      const invoice = invoiceStore.get(invoiceId);
      if (invoice) {
        invoice.status = "claimed";
        invoice.withdrawalTxHash = receipt.hash;
      }

      // 4. Return success response with the hash
      res.json({
        success: true,
        invoiceId: invoiceId,
        withdrawalTxHash: receipt.hash,
      });
    } catch (err) {
      console.error("Withdrawal error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // ── POST /fog-machine ─────────────────────────────────
  // Creates a "Packet Storm" on-chain by sending decoy transactions
  router.post("/fog-machine", async (req, res) => {
    try {
      const { count = 5 } = req.body;
      if (!wallet) return res.status(500).json({ error: "Backend wallet not configured" });

      console.log(`💨 Fog Machine starting: Sending ${count} decoy packets...`);

      // Fire and forget decoy transactions to create noise
      // We don't wait for receipts to keep the UI snappy
      for (let i = 0; i < Math.min(count, 15); i++) {
        const noise = ethers.hexlify(ethers.randomBytes(32));
        wallet.sendTransaction({
          to: wallet.address, // Sends to itself as a decoy
          value: 0,
          data: noise
        }).catch(err => console.warn(`Decoy ${i} failed:`, err.message));
      }

      res.json({ success: true, message: "Fog Machine activated" });
    } catch (err) {
      console.error("Fog Machine error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
