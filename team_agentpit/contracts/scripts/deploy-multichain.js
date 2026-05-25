import hre from "hardhat";

const deployOptions = { gasLimit: 25_000_000n };

async function deployAgentRegistryOnHela() {
  const network = await hre.network.connect("helaTestnet");
  const { ethers } = network;
  const [deployer] = await ethers.getSigners();

  console.log(`Deploying AgentRegistery on ${network.networkName} with: ${deployer.address}`);

  const agentRegistry = await ethers.deployContract("AgentRegistery", deployOptions);
  await agentRegistry.waitForDeployment();

  const address = await agentRegistry.getAddress();

  console.log(`AgentRegistery (helaTestnet): ${address}`);

  await network.close();

  return {
    chainId: 666888,
    deployer: deployer.address,
    agentRegistry: address,
  };
}

async function deployBaseContracts(agentRegistryAddress) {
  const network = await hre.network.connect("baseSepolia");
  const { ethers } = network;
  const [deployer] = await ethers.getSigners();

  console.log(`Deploying base contracts on ${network.networkName} with: ${deployer.address}`);
  console.log(`Using AgentRegistery address from Hela: ${agentRegistryAddress}`);

  const vaultFactory = await ethers.deployContract("VaultFactory", deployOptions);
  await vaultFactory.waitForDeployment();
  const vaultFactoryAddress = await vaultFactory.getAddress();
  console.log(`VaultFactory (baseSepolia): ${vaultFactoryAddress}`);

  const multicallExecutor = await ethers.deployContract("MulticallExecutor", deployOptions);
  await multicallExecutor.waitForDeployment();
  const multicallExecutorAddress = await multicallExecutor.getAddress();
  console.log(`MulticallExecutor (baseSepolia): ${multicallExecutorAddress}`);

  const strategyExecutor = await ethers.deployContract(
    "StrategyExecutor",
    [agentRegistryAddress, multicallExecutorAddress],
    deployOptions,
  );
  await strategyExecutor.waitForDeployment();
  const strategyExecutorAddress = await strategyExecutor.getAddress();
  console.log(`StrategyExecutor (baseSepolia): ${strategyExecutorAddress}`);

  const deployment = {
    chainId: 84532,
    deployer: deployer.address,
    vaultFactory: vaultFactoryAddress,
    multicallExecutor: multicallExecutorAddress,
    strategyExecutor: strategyExecutorAddress,
  };

  await network.close();

  return deployment;
}

async function main() {
  const helaDeployment = await deployAgentRegistryOnHela();
  const baseDeployment = await deployBaseContracts(helaDeployment.agentRegistry);

  console.log("\nDeployment Summary");
  console.log(`helaTestnet.AgentRegistery: ${helaDeployment.agentRegistry}`);
  console.log(`baseSepolia.VaultFactory: ${baseDeployment.vaultFactory}`);
  console.log(`baseSepolia.MulticallExecutor: ${baseDeployment.multicallExecutor}`);
  console.log(`baseSepolia.StrategyExecutor: ${baseDeployment.strategyExecutor}`);

  console.log(
    JSON.stringify(
      {
        helaTestnet: helaDeployment,
        baseSepolia: baseDeployment,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
