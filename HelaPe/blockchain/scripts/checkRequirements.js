const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Checking Stream Creation Requirements...\n");

    const payStreamAddress = "0x3D43Bbf239A128f5b91fdFb5e086fefe8926830f";
    const tokenAddress = "0x90E16CAa8b7D6a48Af4e145B88e37d82f3B1C862";
    const userAddress = "0x9A0D450bC81D9487e727b0a8e91B3a0886fE179D";
    const streamId = 123432;
    const depositAmount = "1000"; // HLUSD

    console.log("📋 Configuration:");
    console.log("PayStream Contract:", payStreamAddress);
    console.log("Token Contract:", tokenAddress);
    console.log("Your Address:", userAddress);
    console.log("Stream ID:", streamId);
    console.log("Deposit Amount:", depositAmount, "HLUSD\n");

    try {
        const payStream = await ethers.getContractAt("PayStream", payStreamAddress);
        const token = await ethers.getContractAt("MockHLUSD", tokenAddress);

        // Check 1: Stream ID exists
        console.log("1️⃣  Checking if Stream ID exists...");
        const streamExists = await payStream.streamExists(streamId);
        console.log("   Stream ID", streamId, streamExists ? "❌ ALREADY EXISTS" : "✅ Available");

        if (streamExists) {
            console.log("   ⚠️  You need to use a different Stream ID!\n");
        }

        // Check 2: Token balance
        console.log("2️⃣  Checking token balance...");
        const balance = await token.balanceOf(userAddress);
        const balanceFormatted = ethers.formatEther(balance);
        console.log("   Balance:", balanceFormatted, "HLUSD");
        console.log("   Required:", depositAmount, "HLUSD");
        console.log("   Status:", parseFloat(balanceFormatted) >= parseFloat(depositAmount) ? "✅ Sufficient" : "❌ Insufficient");

        if (parseFloat(balanceFormatted) < parseFloat(depositAmount)) {
            console.log("   ⚠️  You need to mint more tokens!\n");
        }

        // Check 3: Token allowance
        console.log("\n3️⃣  Checking token allowance...");
        const allowance = await token.allowance(userAddress, payStreamAddress);
        const allowanceFormatted = ethers.formatEther(allowance);
        console.log("   Allowance:", allowanceFormatted, "HLUSD");
        console.log("   Required:", depositAmount, "HLUSD");
        console.log("   Status:", parseFloat(allowanceFormatted) >= parseFloat(depositAmount) ? "✅ Sufficient" : "❌ Insufficient");

        if (parseFloat(allowanceFormatted) < parseFloat(depositAmount)) {
            console.log("   ⚠️  You need to approve tokens first!");
            console.log("   Run: Click 'Approve Tokens' button on the dashboard\n");
        }

        // Summary
        console.log("\n" + "=".repeat(50));
        console.log("📊 SUMMARY\n");

        const issues = [];
        if (streamExists) issues.push("❌ Stream ID already exists - use a different ID");
        if (parseFloat(balanceFormatted) < parseFloat(depositAmount)) issues.push("❌ Insufficient token balance - mint more tokens");
        if (parseFloat(allowanceFormatted) < parseFloat(depositAmount)) issues.push("❌ Insufficient allowance - approve tokens");

        if (issues.length > 0) {
            console.log("⚠️  Issues found:");
            issues.forEach(issue => console.log("   " + issue));
            console.log("\n💡 Fix these issues before creating the stream!");
        } else {
            console.log("✅ All checks passed!");
            console.log("   You're ready to create the stream!");
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
