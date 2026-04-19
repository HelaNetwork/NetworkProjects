const hre = require("hardhat");

async function main() {
  // Tax vault address - funds withheld as tax go here
  // Use your own address or a dedicated tax vault
  const TAX_VAULT = process.env.TAX_VAULT_ADDRESS;
  if (!TAX_VAULT) {
    console.error("\n❌ Set TAX_VAULT_ADDRESS in .env");
    console.error("   Example: TAX_VAULT_ADDRESS=0x1234...\n");
    process.exit(1);
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying CorePayroll with account:", deployer.address);
  console.log("Employer (msg.sender):", deployer.address);
  console.log("Tax vault:", TAX_VAULT);

  const CorePayroll = await hre.ethers.getContractFactory("CorePayroll");
  const contract = await CorePayroll.deploy(TAX_VAULT);

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("\n✅ CorePayroll deployed to:", address);
  console.log("\nAdd to Backend/.env:");
  console.log(`CONTRACT_ADDRESS=${address}`);
  console.log(`TAX_VAULT_ADDRESS=${TAX_VAULT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
