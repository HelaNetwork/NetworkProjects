require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { testConnection } = require("./config/blockchain");
const { startPayrollListeners } = require("./listeners");
const { stats } = require("./analytics");

const app = express();

// 1. CORS Fix: This allows Shreya and Vedika's frontends to talk to your backend
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST"]
}));
app.use(express.json());

// 2. API Endpoints for the Frontend
// Shreya will call this for the main dashboard
app.get("/api/stats", (req, res) => {
    res.json({
        success: true,
        data: stats
    });
});

// Simple health endpoint for frontend connectivity checks
app.get("/health", (req, res) => {
    res.json({
        ok: true,
        service: "paystream-backend",
        network: "HeLa Testnet",
        chainId: 666888,
        timestamp: new Date().toISOString()
    });
});

// Vedika will call this for the tax/compliance page
app.get("/api/compliance", (req, res) => {
    res.json({
        success: true,
        taxRate: "10%",
        totalTaxWithheld: stats.totalTaxWithheld,
        vaultAddress: process.env.VAULT_ADDRESS,
        network: "HeLa Testnet"
    });
});

// 3. Simulation Route (Use this in your browser if Ash is late!)
// Just visit http://localhost:<PORT>/api/simulate-onboard
app.get("/api/simulate-onboard", (req, res) => {
    stats.activeStreams += 1;
    res.json({ message: "Simulated a new stream on HeLa!", stats });
});

// 4. Start the Server
const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, async () => {
    console.log(`🚀 PayStream Backend Running on Port ${PORT}`);
    
    // Test the HeLa Connection
    await testConnection();
    
    // Start listening for events (or heartbeat)
    startPayrollListeners();
});