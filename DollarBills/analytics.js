const { contract, provider } = require("./config/blockchain");
const { ethers } = require("ethers");

let stats = {
    activeStreams: 0,
    totalTaxWithheld: 0,
    treasuryBalance: "0.0",
    runwayDays: "Calculating..."
};

async function updateAnalytics() {
    try {
        // 1. Get the actual token balance of the contract
        const tokenAddress = await contract.token();
        const tokenContract = new ethers.Contract(
            tokenAddress,
            ["function balanceOf(address) view returns (uint256)"],
            provider
        );
        
        const balance = await tokenContract.balanceOf(process.env.CONTRACT_ADDRESS);
        stats.treasuryBalance = ethers.formatEther(balance);

        console.log("📊 Stats Updated:", stats);
    } catch (error) {
        console.error("❌ Analytics sync failed:", error.message);
    }
}

module.exports = { stats, updateAnalytics };