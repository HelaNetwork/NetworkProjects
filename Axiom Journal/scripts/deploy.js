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

  console.log("Deploying DeSciJournal...");
  const DeSciJournal = await ethers.getContractFactory("DeSciJournal");
  const descijournal = await DeSciJournal.deploy();
  await descijournal.waitForDeployment();
  const descijournalAddress = await descijournal.getAddress();
  console.log("✅ DeSciJournal deployed to:", descijournalAddress);

  console.log("Deploying PredictionMarket...");
  const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
  const predictionmarket = await PredictionMarket.deploy();
  await predictionmarket.waitForDeployment();
  const predictionmarketAddress = await predictionmarket.getAddress();
  console.log("✅ PredictionMarket deployed to:", predictionmarketAddress);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
