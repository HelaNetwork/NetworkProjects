const { contract } = require("./config/blockchain");
const { updateAnalytics, stats } = require("./analytics");
const { ethers } = require("ethers");

function startPayrollListeners() {
    console.log("👂 Observer Active: Watching HeLa Blockchain...");

    // This triggers when HR starts a new stream
    contract.on("StreamCreated", (sender, recipient, rate) => {
        console.log("🌊 New Stream Detected on HeLa!");
        stats.activeStreams++;
        updateAnalytics(); 
    });

    // This triggers when an employee withdraws their pay
    contract.on("WithdrawalMade", (user, amount) => {
        console.log("💰 Withdrawal Detected!");
        // Compliance: Log the 10% tax redirection logic
        const amt = parseFloat(ethers.formatEther(amount));
        stats.totalTaxWithheld += (amt * 0.10);
        updateAnalytics();
    });
}

module.exports = { startPayrollListeners };