const hre = require("hardhat");

async function main() {
  const JobVerification = await hre.ethers.getContractFactory("JobVerification");
  const contract = await JobVerification.deploy();
  await contract.waitForDeployment();
  console.log("JobVerification deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
