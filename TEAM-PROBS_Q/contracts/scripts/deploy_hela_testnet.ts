import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    const HLUSD_ADDRESS = process.env.HLUSD_ADDRESS || "0xBE75FDe9DeDe700635E3dDBe7e29b5db1A76C125";

    // 1. Deploy TaxVault
    console.log("\n1. Deploying TaxVault...");
    const TaxVault = await ethers.getContractFactory("TaxVault");
    const taxVault = await TaxVault.deploy(HLUSD_ADDRESS);
    await taxVault.waitForDeployment();
    const taxVaultAddr = await taxVault.getAddress();
    console.log("   TaxVault deployed at:", taxVaultAddr);

    // 2. Deploy PayrollTreasury
    console.log("\n2. Deploying PayrollTreasury...");
    const Treasury = await ethers.getContractFactory("PayrollTreasury");
    const treasury = await Treasury.deploy(HLUSD_ADDRESS);
    await treasury.waitForDeployment();
    const treasuryAddr = await treasury.getAddress();
    console.log("   PayrollTreasury deployed at:", treasuryAddr);

    // 3. Deploy PayStream
    console.log("\n3. Deploying PayStream...");
    const PayStream = await ethers.getContractFactory("PayStream");
    const payStream = await PayStream.deploy(HLUSD_ADDRESS, treasuryAddr, taxVaultAddr);
    await payStream.waitForDeployment();
    const payStreamAddr = await payStream.getAddress();
    console.log("   PayStream deployed at:", payStreamAddr);

    // 4. Wire up: set PayStream on Treasury
    console.log("\n4. Wiring up...");
    const tx = await treasury.setPayStream(payStreamAddr);
    await tx.wait();
    console.log("   Treasury.setPayStream done");

    // 5. Grant deployer as HR
    const tx2 = await payStream.grantHR(deployer.address);
    await tx2.wait();
    console.log("   Deployer granted HR role");

    // Save addresses
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
    console.log("\nAddresses saved to:", outPath);
    console.log(JSON.stringify(addresses, null, 2));

    // Also copy to frontend config
    const frontendPath = path.join(__dirname, "..", "..", "frontend", "src", "config", "deployed-addresses.json");
    const frontendDir = path.dirname(frontendPath);
    if (!fs.existsSync(frontendDir)) {
        fs.mkdirSync(frontendDir, { recursive: true });
    }
    fs.writeFileSync(frontendPath, JSON.stringify(addresses, null, 2));
    console.log("Addresses copied to frontend:", frontendPath);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
