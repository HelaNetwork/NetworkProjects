const { ethers } = require('hardhat');

async function checkStream() {
    const payStreamAddress = "0x42695F3a74973ce3A2438ed59d9Effed9688CAEd";
    const tokenAddress = "0xF37C2de2781aCcC66Fdd9063C527984348D90076";
    const streamId = 1;

    const PayStream = await ethers.getContractAt("PayStream", payStreamAddress);
    const Token = await ethers.getContractAt("MockHLUSD", tokenAddress);

    console.log("\n=== Stream Diagnostics ===\n");

    // Get stream data
    const stream = await PayStream.getStream(streamId);
    console.log("Stream Data:");
    console.log("  Sender:", stream.sender);
    console.log("  Recipient:", stream.recipient);
    console.log("  Deposit:", ethers.formatEther(stream.deposit), "HLUSD");
    console.log("  Withdrawn:", ethers.formatEther(stream.withdrawn), "HLUSD");
    console.log("  Active:", stream.active);
    console.log("  Start Time:", new Date(Number(stream.startTime) * 1000).toLocaleString());
    console.log("  Stop Time:", new Date(Number(stream.stopTime) * 1000).toLocaleString());

    // Get vested amount
    const vested = await PayStream.getVestedAmount(streamId);
    console.log("\nVested Amount:", ethers.formatEther(vested), "HLUSD");

    // Calculate available
    const available = vested - stream.withdrawn;
    console.log("Available to Withdraw:", ethers.formatEther(available), "HLUSD");

    // Check contract balance
    const contractBalance = await Token.balanceOf(payStreamAddress);
    console.log("\nContract Token Balance:", ethers.formatEther(contractBalance), "HLUSD");

    // Check if contract has enough for the withdrawal
    console.log("\nCan contract pay out available amount?", contractBalance >= available ? "YES" : "NO");

    if (contractBalance < available) {
        console.log("⚠️  WARNING: Contract doesn't have enough tokens!");
        console.log("   Shortfall:", ethers.formatEther(available - contractBalance), "HLUSD");
    }
}

checkStream()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
