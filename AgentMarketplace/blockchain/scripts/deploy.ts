import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  AgentMarketplace — Deploy Script");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Deployer : ${deployer.address}`);
  console.log(`  Network  : ${(await ethers.provider.getNetwork()).name}`);
  console.log(`  Balance  : ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} HELA`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Common gas override for Hela Testnet
  const gasOverride = { gasLimit: 5000000 };

  console.log("\n[1/1] Deploying AgentMarketplace...");
  const AgentMarketplace = await ethers.getContractFactory("AgentMarketplace");
  const marketplace = await AgentMarketplace.deploy(deployer.address, gasOverride); // Treasury is the deployer for now
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log(`      ✓ AgentMarketplace deployed at: ${marketplaceAddress}`);

  // Write deployed addresses to frontend
  const addresses = {
    AgentMarketplace: marketplaceAddress,
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
