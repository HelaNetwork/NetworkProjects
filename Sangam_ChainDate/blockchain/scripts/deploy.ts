import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Sangam — Deploy Script");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Deployer : ${deployer.address}`);
  console.log(`  Network  : ${(await ethers.provider.getNetwork()).name}`);
  console.log(`  Balance  : ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} HELA`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Common gas override for Hela Testnet
  const gasOverride = { gasLimit: 5000000 };

  // 1. Deploy MockZKVerifier
  console.log("\n[1/3] Deploying MockZKVerifier...");
  const MockZKVerifier = await ethers.getContractFactory("MockZKVerifier");
  const zkVerifier = await MockZKVerifier.deploy(gasOverride);
  await zkVerifier.waitForDeployment();
  const zkAddress = await zkVerifier.getAddress();
  console.log(`      ✓ MockZKVerifier deployed at: ${zkAddress}`);

  // 2. Deploy DatingCore (depends on MockZKVerifier)
  console.log("\n[2/3] Deploying DatingCore...");
  const DatingCore = await ethers.getContractFactory("DatingCore");
  const datingCore = await DatingCore.deploy(zkAddress, gasOverride);
  await datingCore.waitForDeployment();
  const coreAddress = await datingCore.getAddress();
  console.log(`      ✓ DatingCore deployed at:    ${coreAddress}`);

  // 3. Deploy EscrowContent
  console.log("\n[3/3] Deploying EscrowContent...");
  const EscrowContent = await ethers.getContractFactory("EscrowContent");
  const escrow = await EscrowContent.deploy(gasOverride);
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log(`      ✓ EscrowContent deployed at: ${escrowAddress}`);

  // Write deployed addresses to frontend
  const addresses = {
    MockZKVerifier: zkAddress,
    DatingCore: coreAddress,
    EscrowContent: escrowAddress,
    deployedAt: new Date().toISOString(),
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
  };

  const outPath = path.join(__dirname, "../../frontend/lib/deployedAddresses.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(addresses, null, 2));
  console.log(`\n✓ Addresses written to: frontend/lib/deployedAddresses.json`);
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Deployment complete! 🚀");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

