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

  console.log("Deploying CreatorBank...");
  const CreatorBank = await ethers.getContractFactory("CreatorBank");
  const creatorbank = await CreatorBank.deploy();
  await creatorbank.waitForDeployment();
  const creatorbankAddress = await creatorbank.getAddress();
  console.log("✅ CreatorBank deployed to:", creatorbankAddress);

  console.log("Deploying EventTicket...");
  const EventTicket = await ethers.getContractFactory("EventTicket");
  const eventticket = await EventTicket.deploy();
  await eventticket.waitForDeployment();
  const eventticketAddress = await eventticket.getAddress();
  console.log("✅ EventTicket deployed to:", eventticketAddress);

  console.log("Deploying ReputationCredit...");
  const ReputationCredit = await ethers.getContractFactory("ReputationCredit");
  const reputationcredit = await ReputationCredit.deploy();
  await reputationcredit.waitForDeployment();
  const reputationcreditAddress = await reputationcredit.getAddress();
  console.log("✅ ReputationCredit deployed to:", reputationcreditAddress);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
