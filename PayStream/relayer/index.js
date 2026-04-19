require("dotenv").config();
const express = require("express");
const { ethers } = require("ethers");

// ─── Config ──────────────────────────────────────────────────
const {
    HELA_RPC = "https://testnet-rpc.helachain.com/",
    PRIVATE_KEY,
    STREAMMANAGER_ADDRESS,
    RELAYER_API_KEY = "changeme-super-secret-key",
    PORT = "4000",
} = process.env;

if (!PRIVATE_KEY) {
    console.error("❌  PRIVATE_KEY is required in .env");
    process.exit(1);
}
if (!STREAMMANAGER_ADDRESS) {
    console.error("❌  STREAMMANAGER_ADDRESS is required in .env");
    process.exit(1);
}

// ─── Provider + Wallet ───────────────────────────────────────
const provider = new ethers.providers.JsonRpcProvider(HELA_RPC, {
    name: "hela-testnet",
    chainId: 666888,
});
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// ─── StreamManager ABI (from Hardhat build artifact) ─────────
const { abi: STREAM_MANAGER_ABI } = require("../artifacts/contracts/StreamManager.sol/StreamManager.json");
const streamManager = new ethers.Contract(
    STREAMMANAGER_ADDRESS,
    STREAM_MANAGER_ABI,
    wallet,
);

// ─── Express App ─────────────────────────────────────────────
const app = express();
app.use(express.json());

// Simple API-key auth middleware
function requireApiKey(req, res, next) {
    const key = req.headers["x-api-key"];
    if (!key || key !== RELAYER_API_KEY) {
        return res.status(401).json({ error: "Unauthorized: invalid or missing API key" });
    }
    next();
}

// Health check
app.get("/health", (_req, res) => {
    res.json({ status: "ok", relayer: wallet.address });
});

// ─── POST /relay/withdraw ────────────────────────────────────
app.post("/relay/withdraw", requireApiKey, async (req, res) => {
    const { streamId, nonce, deadline, relayerFee, signature } = req.body;

    // ── Validate payload ──
    const missing = [];
    if (streamId === undefined) missing.push("streamId");
    if (nonce === undefined) missing.push("nonce");
    if (deadline === undefined) missing.push("deadline");
    if (relayerFee === undefined) missing.push("relayerFee");
    if (!signature) missing.push("signature");

    if (missing.length > 0) {
        return res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });
    }

    // Check deadline hasn't passed
    const now = Math.floor(Date.now() / 1000);
    if (Number(deadline) < now) {
        return res.status(400).json({ error: "Deadline has expired" });
    }

    console.log(`\n📩  Relay request: stream=${streamId} nonce=${nonce} deadline=${deadline} fee=${relayerFee}`);

    try {
        const tx = await streamManager.withdrawSigned(
            ethers.BigNumber.from(streamId),
            ethers.BigNumber.from(nonce),
            ethers.BigNumber.from(deadline),
            ethers.BigNumber.from(relayerFee),
            signature,
            {
                gasLimit: 300_000, // safe upper bound
            },
        );

        console.log(`✅  TX submitted: ${tx.hash}`);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log(`✅  TX confirmed in block ${receipt.blockNumber} (gas used: ${receipt.gasUsed.toString()})`);

        return res.json({
            success: true,
            txHash: tx.hash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
        });
    } catch (err) {
        const reason = err.reason || err.message || "Unknown error";
        console.error(`❌  Relay failed: ${reason}`);

        return res.status(500).json({
            error: "Transaction failed",
            reason,
        });
    }
});

// ─── Start ───────────────────────────────────────────────────
app.listen(Number(PORT), () => {
    console.log("──────────────────────────────────────────────");
    console.log("🔁 PayStream Relayer");
    console.log("──────────────────────────────────────────────");
    console.log(`Relayer wallet : ${wallet.address}`);
    console.log(`StreamManager  : ${STREAMMANAGER_ADDRESS}`);
    console.log(`Chain          : HeLa Testnet (666888)`);
    console.log(`Listening on   : http://localhost:${PORT}`);
    console.log("──────────────────────────────────────────────\n");
});
