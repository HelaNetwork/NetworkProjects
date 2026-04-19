import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    // 1. Deploy MockHLUSD (our own test token)
    console.log("\n1. Deploying MockHLUSD token...");
    const MockToken = await ethers.getContractFactory("MockHLUSD");
    const hlusd = await MockToken.deploy();
    await hlusd.waitForDeployment();
    const hlusdAddr = await hlusd.getAddress();
    console.log("   MockHLUSD deployed at:", hlusdAddr);

    // 2. Mint tokens to deployer
    console.log("\n2. Minting 1,000,000 HLUSD to deployer...");
    await hlusd.mint(deployer.address, ethers.parseEther("1000000"));
    const bal = await hlusd.balanceOf(deployer.address);
    console.log("   Deployer balance:", ethers.formatEther(bal), "HLUSD");

    // 3. Deploy TaxVault
    console.log("\n3. Deploying TaxVault...");
    const TaxVaultFactory = await ethers.getContractFactory("TaxVault");
    const taxVault = await TaxVaultFactory.deploy(hlusdAddr);
    await taxVault.waitForDeployment();
    console.log("   TaxVault deployed at:", await taxVault.getAddress());

    // 4. Deploy PayrollTreasury
    console.log("\n4. Deploying PayrollTreasury...");
    const TreasuryFactory = await ethers.getContractFactory("PayrollTreasury");
    const treasury = await TreasuryFactory.deploy(hlusdAddr);
    await treasury.waitForDeployment();
    console.log("   PayrollTreasury deployed at:", await treasury.getAddress());

    // 5. Deploy PayStream
    console.log("\n5. Deploying PayStream...");
    const PayStreamFactory = await ethers.getContractFactory("PayStream");
    const payStream = await PayStreamFactory.deploy(
        hlusdAddr,
        await treasury.getAddress(),
        await taxVault.getAddress()
    );
    await payStream.waitForDeployment();
    console.log("   PayStream deployed at:", await payStream.getAddress());

    // 6. Wire up
    console.log("\n6. Wiring up...");
    await treasury.setPayStream(await payStream.getAddress());
    console.log("   Treasury.setPayStream done");
    console.log("   Deployer granted HR role (owner is HR by default)");

    // 7. Pre-fund treasury with 10,000 HLUSD for demo
    console.log("\n7. Pre-funding treasury with 10,000 HLUSD...");
    const fundAmount = ethers.parseEther("10000");
    await hlusd.approve(await treasury.getAddress(), fundAmount);
    await treasury.deposit(fundAmount);
    const treasuryBal = await treasury.getBalance();
    console.log("   Treasury balance:", ethers.formatEther(treasuryBal), "HLUSD");

    // Save addresses
    const addresses = {
        network: "hela_testnet",
        chainId: 666888,
        hlusd: hlusdAddr,
        taxVault: await taxVault.getAddress(),
        treasury: await treasury.getAddress(),
        payStream: await payStream.getAddress(),
        deployer: deployer.address,
        deployedAt: new Date().toISOString(),
    };

    const outPath = path.join(__dirname, "..", "deployed-addresses.json");
    fs.writeFileSync(outPath, JSON.stringify(addresses, null, 2));
    console.log("\nAddresses saved to:", outPath);

    // Also copy to frontend
    const frontendPath = path.join(__dirname, "..", "..", "frontend", "src", "config", "deployed-addresses.json");
    fs.writeFileSync(frontendPath, JSON.stringify(addresses, null, 2));
    console.log("Addresses copied to frontend:", frontendPath);

    console.log("\n" + JSON.stringify(addresses, null, 2));

    console.log("\n✅ All done! Treasury is pre-funded with 10,000 HLUSD for demo.");
    console.log("   Update frontend/src/config/contracts.ts with the new addresses above.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
