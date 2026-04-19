const hre = require("hardhat");

async function main() {
  const husdAddress = "0xEf3cA15C04e82b90B01AF9EccE1A0C620E74E0b3";
  const husd = await hre.ethers.getContractAt("HUSD", husdAddress);
  const owner = await husd.owner();
  const [deployer] = await hre.ethers.getSigners();
  
  console.log(`HUSD Owner: ${owner}`);
  console.log(`Deployer Address: ${deployer.address}`);
  
  if (owner.toLowerCase() === deployer.address.toLowerCase()) {
    console.log("Success: Deployer is the owner.");
  } else {
    console.log("Error: Deployer is NOT the owner.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
