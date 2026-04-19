const { ethers } = require("hardhat");

async function main() {
  const CryptoX = await ethers.getContractFactory("CryptoX");
  console.log("Deploying CryptoX...");
  const cryptoX = await CryptoX.deploy();
  await cryptoX.waitForDeployment();
  console.log("CryptoX deployed to:", await cryptoX.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});