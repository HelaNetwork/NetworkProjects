import { ethers, run } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    console.log("🚀 Starting Production Deployment to HeLa Testnet...");

    const [deployer] = await ethers.getSigners();
    console.log(`👨‍✈️ Deployer: ${deployer.address}`);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} HLUSD`);

    if (balance === 0n) {
        throw new Error("❌ Insufficient funds. Please fund the deployer wallet.");
    }

    const HLUSD_ADDRESS = process.env.HLUSD_ADDRESS || "0xBE75FDe9DeDe700635E3dDBe7e29b5db1A76C125";
    console.log(`Using HLUSD: ${HLUSD_ADDRESS}`);

    // Helper to wait for confirmations
    const wait = (tx: any) => tx.wait(2); // Wait for 2 blocks for safety on testnet

    try {
        // 1. Deploy TaxVault
        console.log("\n1️⃣ Deploying TaxVault...");
        const TaxVault = await ethers.getContractFactory("TaxVault");
        const taxVault = await TaxVault.deploy(HLUSD_ADDRESS);
        await taxVault.waitForDeployment();
        const taxVaultAddr = await taxVault.getAddress();
        console.log(`   ✅ TaxVault: ${taxVaultAddr}`);

        // 2. Deploy PayrollTreasury
        console.log("\n2️⃣ Deploying PayrollTreasury...");
        const Treasury = await ethers.getContractFactory("PayrollTreasury");
        const treasury = await Treasury.deploy(HLUSD_ADDRESS);
        await treasury.waitForDeployment();
        const treasuryAddr = await treasury.getAddress();
        console.log(`   ✅ PayrollTreasury: ${treasuryAddr}`);

        // 3. Deploy PayStream
        console.log("\n3️⃣ Deploying PayStream...");
        const PayStream = await ethers.getContractFactory("PayStream");
        const payStream = await PayStream.deploy(HLUSD_ADDRESS, treasuryAddr, taxVaultAddr);
        await payStream.waitForDeployment();
        const payStreamAddr = await payStream.getAddress();
        console.log(`   ✅ PayStream: ${payStreamAddr}`);

        // 4. Wire up: set PayStream on Treasury
        console.log("\n4️⃣ Wiring up Treasury -> PayStream...");
        const tx1 = await treasury.setPayStream(payStreamAddr);
        await wait(tx1);
        console.log("   ✅ Treasury linked");

        // 5. Grant deployer as HR
        console.log("\n5️⃣ Granting HR Role to Deployer...");
        const tx2 = await payStream.grantHR(deployer.address);
        await wait(tx2);
        console.log("   ✅ Deployer granted HR");

        // 6. Save addresses
        const addresses = {
            network: "hela_testnet",
            chainId: 666888,
            hlusd: HLUSD_ADDRESS,
            taxVault: taxVaultAddr,
            treasury: treasuryAddr,
            payStream: payStreamAddr,
            deployer: deployer.address,
            deployedAt: new Date().toISOString(),
        };

        const outPath = path.join(__dirname, "..", "deployed-addresses.json");
        fs.writeFileSync(outPath, JSON.stringify(addresses, null, 2));
        console.log(`\n💾 Saved to: ${outPath}`);

        // 7. Update Frontend
        const frontendPath = path.join(__dirname, "..", "..", "frontend", "src", "config", "deployed-addresses.json");
        const frontendDir = path.dirname(frontendPath);
        if (!fs.existsSync(frontendDir)) {
            fs.mkdirSync(frontendDir, { recursive: true });
        }
        fs.writeFileSync(frontendPath, JSON.stringify(addresses, null, 2));
        console.log(`💾 Copied to Frontend: ${frontendPath}`);

        console.log("\n🎉 Deployment Complete! System is ready.");

        // Verification commands
        console.log("\n🔍 To verify contracts:");
        console.log(`npx hardhat verify --network hela_testnet ${taxVaultAddr} ${HLUSD_ADDRESS}`);
        console.log(`npx hardhat verify --network hela_testnet ${treasuryAddr} ${HLUSD_ADDRESS}`);
        console.log(`npx hardhat verify --network hela_testnet ${payStreamAddr} ${HLUSD_ADDRESS} ${treasuryAddr} ${taxVaultAddr}`);

    } catch (error) {
        console.error("\n❌ Deployment Failed:", error);
        process.exit(1);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
