import hre from "hardhat";

async function main() {
  const network = await hre.network.connect();
  const { ethers } = network;
  const [deployer] = await ethers.getSigners();
  const deployOptions = { gasLimit: 25_000_000n };

  console.log(`Deploying AgentPayToken on Hela with: ${deployer.address}`);
  console.log(`Network: ${network.networkName}`);

  const agentPayToken = await ethers.deployContract("AgentPayToken", deployOptions);
  await agentPayToken.waitForDeployment();

  const tokenAddress = await agentPayToken.getAddress();

  const deployment = {
    contract: "AgentPayToken",
    address: tokenAddress,
    network: network.networkName,
    deployer: deployer.address,
  };

  console.log("\n✓ Deployment successful!");
  console.log(JSON.stringify(deployment, null, 2));

  await network.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
