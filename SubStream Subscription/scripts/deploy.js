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

  console.log("Deploying ContentNFT...");
  const ContentNFT = await ethers.getContractFactory("ContentNFT");
  const contentnft = await ContentNFT.deploy();
  await contentnft.waitForDeployment();
  const contentnftAddress = await contentnft.getAddress();
  console.log("✅ ContentNFT deployed to:", contentnftAddress);

  console.log("Deploying CreatorToken...");
  const CreatorToken = await ethers.getContractFactory("CreatorToken");
  const creatortoken = await CreatorToken.deploy();
  await creatortoken.waitForDeployment();
  const creatortokenAddress = await creatortoken.getAddress();
  console.log("✅ CreatorToken deployed to:", creatortokenAddress);

  console.log("Deploying SubscriptionManager...");
  const SubscriptionManager = await ethers.getContractFactory("SubscriptionManager");
  const subscriptionmanager = await SubscriptionManager.deploy();
  await subscriptionmanager.waitForDeployment();
  const subscriptionmanagerAddress = await subscriptionmanager.getAddress();
  console.log("✅ SubscriptionManager deployed to:", subscriptionmanagerAddress);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
