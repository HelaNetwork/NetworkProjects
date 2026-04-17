const hre = require("hardhat");

async function main() {
  console.log("Deploying CryptoDuo contract to Hela Testnet...");

  const CryptoDuo = await hre.ethers.getContractFactory("CryptoDuo");
  const cryptoDuo = await CryptoDuo.deploy();

  await cryptoDuo.waitForDeployment();

  console.log(`CryptoDuo deployed to: ${await cryptoDuo.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.env.exitCode = 1;
});
