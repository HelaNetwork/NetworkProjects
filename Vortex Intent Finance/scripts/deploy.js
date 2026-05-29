const hre = require("hardhat");
const { ethers, network } = hre;

async function main() {
  console.log("Deploying contracts with account:", (await ethers.getSigners())[0].address);
  
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "HLUSD");

  if (balance === 0n) {
    console.log("⚠️  Warning: Account has 0 balance. Get testnet HLUSD from: https://testnet-faucet.helachain.com");
  }

  console.log("Deploying IntentSwap...");
  const IntentSwap = await ethers.getContractFactory("IntentSwap");
  const intentswap = await IntentSwap.deploy();
  await intentswap.waitForDeployment();
  const intentswapAddress = await intentswap.getAddress();
  console.log("✅ IntentSwap deployed to:", intentswapAddress);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
