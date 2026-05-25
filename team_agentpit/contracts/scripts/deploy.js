import hre from "hardhat";

async function main() {
  const network = await hre.network.connect();
  const { ethers } = network;
  const [deployer] = await ethers.getSigners();
  const deployOptions = { gasLimit: 25_000_000n };

  console.log(`Deploying contracts with: ${deployer.address}`);
  console.log(`Network: ${network.networkName}`);

  const vaultFactory = await ethers.deployContract("VaultFactory", deployOptions);
  await vaultFactory.waitForDeployment();

  const multicallExecutor = await ethers.deployContract("MulticallExecutor", deployOptions);
  await multicallExecutor.waitForDeployment();

  const agentRegistry = await ethers.deployContract("AgentRegistery", deployOptions);
  await agentRegistry.waitForDeployment();

  const strategyExecutor = await ethers.deployContract("StrategyExecutor", [
    await agentRegistry.getAddress(),
    await multicallExecutor.getAddress(),
  ], deployOptions);
  await strategyExecutor.waitForDeployment();

  const deployment = {
    vaultFactory: await vaultFactory.getAddress(),
    multicallExecutor: await multicallExecutor.getAddress(),
    strategyExecutor: await strategyExecutor.getAddress(),
    agentRegistry: await agentRegistry.getAddress(),
  };

  console.log(JSON.stringify(deployment, null, 2));

  await network.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});