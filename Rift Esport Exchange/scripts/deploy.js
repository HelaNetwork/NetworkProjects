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

  console.log("Deploying EsportsExchange...");
  const EsportsExchange = await ethers.getContractFactory("EsportsExchange");
  const esportsexchange = await EsportsExchange.deploy();
  await esportsexchange.waitForDeployment();
  const esportsexchangeAddress = await esportsexchange.getAddress();
  console.log("✅ EsportsExchange deployed to:", esportsexchangeAddress);

  console.log("Deploying LandNFT...");
  const LandNFT = await ethers.getContractFactory("LandNFT");
  const landnft = await LandNFT.deploy();
  await landnft.waitForDeployment();
  const landnftAddress = await landnft.getAddress();
  console.log("✅ LandNFT deployed to:", landnftAddress);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
