const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    const txHash = "0xf200a585939b48d5dea48eb76d814c38a3e2546a12b1af717c81aa6262a3edb9";

    console.log("🔍 Debugging Failed Transaction...\n");
    console.log("Transaction Hash:", txHash);

    try {
        // Get transaction receipt
        const receipt = await ethers.provider.getTransactionReceipt(txHash);

        if (receipt) {
            console.log("\n📋 Transaction Receipt:");
            console.log("Status:", receipt.status === 1 ? "✅ Success" : "❌ Failed");
            console.log("Block Number:", receipt.blockNumber);
            console.log("Gas Used:", receipt.gasUsed.toString());
            console.log("From:", receipt.from);
            console.log("To (Contract):", receipt.to);

            // Get the transaction details
            const tx = await ethers.provider.getTransaction(txHash);
            console.log("\n📝 Transaction Details:");
            console.log("Value:", ethers.formatEther(tx.value), "HLUSD");
            console.log("Gas Limit:", tx.gasLimit.toString());
            console.log("Gas Price:", ethers.formatUnits(tx.gasPrice, "gwei"), "Gwei");

            // Decode input data
            const PayStream = await ethers.getContractFactory("PayStream");
            const iface = PayStream.interface;

            try {
                const decoded = iface.parseTransaction({ data: tx.data });
                console.log("\n🔧 Function Call:");
                console.log("Function:", decoded.name);
                console.log("Parameters:");
                console.log("  Stream ID:", decoded.args[0].toString());
                console.log("  Recipient:", decoded.args[1]);
                console.log("  Rate Per Second:", ethers.formatEther(decoded.args[2]), "HLUSD/sec");
                console.log("  Deposit:", ethers.formatEther(decoded.args[3]), "HLUSD");
                console.log("  Start Time:", new Date(Number(decoded.args[4]) * 1000).toLocaleString());

                // Now let's check why it failed
                console.log("\n🔎 Checking Potential Issues...");

                const streamId = decoded.args[0];
                const recipient = decoded.args[1];
                const ratePerSecond = decoded.args[2];
                const deposit = decoded.args[3];
                const startTime = decoded.args[4];

                // Connect to contracts
                const payStreamAddress = process.env.PAYSTREAM_CONTRACT_ADDRESS || tx.to;
                const tokenAddress = process.env.MOCK_TOKEN_ADDRESS;

                const payStream = await ethers.getContractAt("PayStream", payStreamAddress);
                const token = await ethers.getContractAt("MockHLUSD", tokenAddress);

                // Check 1: Stream ID exists
                try {
                    const streamExists = await payStream.streamExists(streamId);
                    console.log("1. Stream ID exists?", streamExists ? "❌ YES (DUPLICATE ID)" : "✅ No");
                } catch (e) {
                    console.log("1. Stream ID check: ⚠️ Could not check");
                }

                // Check 2: Token balance
                const balance = await token.balanceOf(receipt.from);
                console.log("2. Token Balance:", ethers.formatEther(balance), "HLUSD");
                console.log("   Required:", ethers.formatEther(deposit), "HLUSD");
                console.log("   Sufficient?", balance >= deposit ? "✅ Yes" : "❌ No");

                // Check 3: Token allowance
                const allowance = await token.allowance(receipt.from, payStreamAddress);
                console.log("3. Token Allowance:", ethers.formatEther(allowance), "HLUSD");
                console.log("   Required:", ethers.formatEther(deposit), "HLUSD");
                console.log("   Sufficient?", allowance >= deposit ? "✅ Yes" : "❌ No (NEED TO APPROVE)");

                // Check 4: Start time
                const currentTime = Math.floor(Date.now() / 1000);
                const startTimestamp = Number(startTime);
                console.log("4. Start Time:", new Date(startTimestamp * 1000).toLocaleString());
                console.log("   Current Time:", new Date(currentTime * 1000).toLocaleString());
                console.log("   Valid?", startTimestamp >= currentTime - 60 ? "✅ Yes" : "❌ No (TOO FAR IN PAST)");

                // Check 5: Rate vs Deposit
                const duration = deposit / ratePerSecond;
                console.log("5. Duration:", duration.toString(), "seconds");
                console.log("   Valid?", duration > 0n ? "✅ Yes" : "❌ No (DEPOSIT TOO SMALL FOR RATE)");

                console.log("\n💡 DIAGNOSIS:");
                if (allowance < deposit) {
                    console.log("❌ MOST LIKELY ISSUE: Insufficient token allowance!");
                    console.log("   Solution: Call approve() on the token contract first");
                    console.log(`   Command: await token.approve("${payStreamAddress}", "${deposit}")`);
                }

            } catch (decodeError) {
                console.log("Could not decode transaction data:", decodeError.message);
            }

            // Try to simulate the transaction to get the revert reason
            console.log("\n🔄 Attempting to get revert reason...");
            try {
                await ethers.provider.call(tx, tx.blockNumber - 1);
            } catch (error) {
                if (error.data) {
                    console.log("Revert Reason:", error.data);
                }
                console.log("Error Message:", error.message);
            }

        } else {
            console.log("❌ Transaction receipt not found");
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
