import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("──────────────────────────────────────────────");
    console.log("🚀 PayStream Deploy Script");
    console.log("──────────────────────────────────────────────");
    console.log(`Deployer : ${deployer.address}`);
    console.log(`Network  : ${(await ethers.provider.getNetwork()).name} (chainId ${(await ethers.provider.getNetwork()).chainId})`);
    console.log(`Balance  : ${ethers.utils.formatEther(await deployer.getBalance())} native`);
    console.log("");

    // ── 1. HLUSD Token ──────────────────────────────────────
    let hlusdAddress = process.env.HLUSD_ADDRESS || "";

    if (!hlusdAddress) {
        console.log("⚠  HLUSD_ADDRESS not set — deploying HLUSDMock for dev/local...");
        const HLUSDMock = await ethers.getContractFactory("HLUSDMock");
        const hlusdMock = await HLUSDMock.deploy();
        await hlusdMock.deployed();
        hlusdAddress = hlusdMock.address;
        console.log(`✅ HLUSDMock deployed at: ${hlusdAddress}`);
    } else {
        console.log(`✅ Using existing HLUSD at: ${hlusdAddress}`);
    }

    // ── 2. TaxVault ─────────────────────────────────────────
    console.log("\nDeploying TaxVault...");
    const TaxVault = await ethers.getContractFactory("TaxVault");
    const taxVault = await TaxVault.deploy(hlusdAddress);
    await taxVault.deployed();
    console.log(`✅ TaxVault deployed at: ${taxVault.address}`);

    // ── 3. YieldVault ───────────────────────────────────────
    console.log("\nDeploying YieldVault...");
    const YieldVault = await ethers.getContractFactory("YieldVault");
    const yieldVault = await YieldVault.deploy(hlusdAddress);
    await yieldVault.deployed();
    console.log(`✅ YieldVault deployed at: ${yieldVault.address}`);

    // ── 4. StreamManager ────────────────────────────────────
    console.log("\nDeploying StreamManager...");
    const StreamManager = await ethers.getContractFactory("StreamManager");
    const streamManager = await StreamManager.deploy(
        hlusdAddress,
        taxVault.address,
        yieldVault.address
    );
    await streamManager.deployed();
    console.log(`✅ StreamManager deployed at: ${streamManager.address}`);

    // ── 5. Set initial yield rate to 5% (500 bps) ──────────
    //    Must happen before ownership transfer so deployer can still call it.
    console.log("\nSetting initial yield rate to 5% (500 bps)...");
    const txRate = await yieldVault.setYieldRate(500);
    await txRate.wait();
    console.log(`✅ Yield rate set to 500 bps (5%/year)`);

    // ── 6. Transfer YieldVault ownership to StreamManager ───
    console.log("\nTransferring YieldVault ownership to StreamManager...");
    const txOwnership = await yieldVault.transferOwnership(streamManager.address);
    await txOwnership.wait();
    console.log(`✅ YieldVault owner is now: ${streamManager.address}`);

    // ── Summary ─────────────────────────────────────────────
    console.log("\n──────────────────────────────────────────────");
    console.log("📋 Deployed Addresses");
    console.log("──────────────────────────────────────────────");
    console.log(`HLUSD         : ${hlusdAddress}`);
    console.log(`TaxVault      : ${taxVault.address}`);
    console.log(`YieldVault    : ${yieldVault.address}`);
    console.log(`StreamManager : ${streamManager.address}`);
    console.log("──────────────────────────────────────────────");

    // ── .env snippet ────────────────────────────────────────
    console.log("\n📝 Add to frontend/.env:\n");
    console.log(`VITE_HLUSD_ADDRESS=${hlusdAddress}`);
    console.log(`VITE_STREAMMANAGER_ADDRESS=${streamManager.address}`);
    console.log(`VITE_YIELDVAULT_ADDRESS=${yieldVault.address}`);

    // ── Verification Commands ───────────────────────────────
    console.log("\n📝 Verification Commands (run after deployment):\n");
    if (!process.env.HLUSD_ADDRESS) {
        console.log(`npx hardhat verify --network helaTestnet ${hlusdAddress}`);
    }
    console.log(`npx hardhat verify --network helaTestnet ${taxVault.address} "${hlusdAddress}"`);
    console.log(`npx hardhat verify --network helaTestnet ${yieldVault.address} "${hlusdAddress}"`);
    console.log(`npx hardhat verify --network helaTestnet ${streamManager.address} "${hlusdAddress}" "${taxVault.address}" "${yieldVault.address}"`);

    console.log("\n──────────────────────────────────────────────");
    console.log("💡 To deploy:");
    console.log("   npx hardhat run scripts/deploy.ts --network helaTestnet");
    console.log("──────────────────────────────────────────────\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
