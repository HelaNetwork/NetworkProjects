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

  console.log("Deploying LearnToEarn...");
  const LearnToEarn = await ethers.getContractFactory("LearnToEarn");
  const learntoearn = await LearnToEarn.deploy();
  await learntoearn.waitForDeployment();
  const learntoearnAddress = await learntoearn.getAddress();
  console.log("✅ LearnToEarn deployed to:", learntoearnAddress);

  console.log("Deploying RewardToken...");
  const RewardToken = await ethers.getContractFactory("RewardToken");
  const rewardtoken = await RewardToken.deploy();
  await rewardtoken.waitForDeployment();
  const rewardtokenAddress = await rewardtoken.getAddress();
  console.log("✅ RewardToken deployed to:", rewardtokenAddress);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
