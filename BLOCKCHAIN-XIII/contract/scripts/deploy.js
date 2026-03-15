const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying ZapPay to Hela Testnet...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "HELA");

  const ZapPay = await ethers.getContractFactory("ZapPay");
  const contract = await ZapPay.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ ZapPay deployed to:", address);
  console.log("\nAdd this to your backend .env file:");
  console.log(`CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
