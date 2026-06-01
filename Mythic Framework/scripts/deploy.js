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

  console.log("Deploying TCGBattleEngine...");
  const TCGBattleEngine = await ethers.getContractFactory("TCGBattleEngine");
  const tcgbattleengine = await TCGBattleEngine.deploy();
  await tcgbattleengine.waitForDeployment();
  const tcgbattleengineAddress = await tcgbattleengine.getAddress();
  console.log("✅ TCGBattleEngine deployed to:", tcgbattleengineAddress);

  console.log("Deploying TCGCardNFT...");
  const TCGCardNFT = await ethers.getContractFactory("TCGCardNFT");
  const tcgcardnft = await TCGCardNFT.deploy();
  await tcgcardnft.waitForDeployment();
  const tcgcardnftAddress = await tcgcardnft.getAddress();
  console.log("✅ TCGCardNFT deployed to:", tcgcardnftAddress);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
