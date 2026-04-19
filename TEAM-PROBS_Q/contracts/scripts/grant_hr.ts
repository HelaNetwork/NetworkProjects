import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    // 1. Get the target address from command line
    const targetAddress = process.env.TARGET_ADDRESS;

    if (!targetAddress || !ethers.isAddress(targetAddress)) {
        console.error("Error: Please provide a valid TARGET_ADDRESS environment variable.");
        console.error("Usage: TARGET_ADDRESS=0x... npx hardhat run scripts/grant_hr.ts --network hela_testnet");
        process.exit(1);
    }

    // 2. Load deployed addresses
    const deploymentPath = path.join(__dirname, "..", "deployed-addresses.json");
    if (!fs.existsSync(deploymentPath)) {
        console.error("Error: deployed-addresses.json not found. Have you deployed?");
        process.exit(1);
    }
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
    const payStreamAddress = deployment.payStream;

    console.log(`Connecting to PayStream at: ${payStreamAddress}`);
    console.log(`Target Address to Grant HR: ${targetAddress}`);

    // 3. Connect to contract
    const [deployer] = await ethers.getSigners();
    console.log(`Using deployer account: ${deployer.address}`);

    const PayStream = await ethers.getContractFactory("PayStream");
    const payStream = PayStream.attach(payStreamAddress) as any;

    // 4. Check if already HR
    const isHR = await payStream.isHR(targetAddress);
    if (isHR) {
        console.log(`Address ${targetAddress} is ALREADY an HR admin.`);
        return;
    }

    // 5. Grant Role
    console.log("Granting HR role...");
    const tx = await payStream.grantHR(targetAddress);
    console.log(`Transaction sent: ${tx.hash}`);

    await tx.wait();
    console.log("✅ Success! HR role granted.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
