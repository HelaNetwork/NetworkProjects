const hre = require("hardhat");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const { isAddress } = require("ethers");

dotenv.config();

function requireAddress(name, value) {
  if (!value) {
    throw new Error(`${name} is required in .env`);
  }
  if (!isAddress(value)) {
    throw new Error(`${name} must be a valid EVM address`);
  }
  return value;
}

async function main() {
  const { ethers, network } = hre;

  const hlusdAddress = requireAddress("HLUSD_ADDRESS", process.env.HLUSD_ADDRESS);
  const explorerUrl = process.env.HELA_EXPLORER_URL || "";
  const platformFeeRecipient = process.env.PLATFORM_FEE_RECIPIENT || "";
  const platformFeeBps = Number(process.env.PLATFORM_FEE_BPS || "500");

  const [deployer] = await ethers.getSigners();
  const chain = await ethers.provider.getNetwork();
  const feeRecipient =
    platformFeeRecipient.length > 0
      ? requireAddress("PLATFORM_FEE_RECIPIENT", platformFeeRecipient)
      : deployer.address;

  if (!Number.isInteger(platformFeeBps) || platformFeeBps < 0 || platformFeeBps > 10_000) {
    throw new Error("PLATFORM_FEE_BPS must be an integer between 0 and 10000.");
  }

  console.log("Deploying contracts...");
  console.log("Network:", network.name);
  console.log("Chain ID:", chain.chainId.toString());
  console.log("Deployer:", deployer.address);
  console.log("HLUSD:", hlusdAddress);
  console.log("Platform fee recipient:", feeRecipient);
  console.log("Platform fee bps:", platformFeeBps);

  const hlusdCode = await ethers.provider.getCode(hlusdAddress);
  if (hlusdCode === "0x") {
    throw new Error("HLUSD_ADDRESS points to a non-contract account. Set the real HLUSD token contract address.");
  }

  const registryFactory = await ethers.getContractFactory("AgentRegistry");
  const registry = await registryFactory.deploy();
  await registry.waitForDeployment();

  const escrowFactory = await ethers.getContractFactory("AgentEscrow");
  const escrow = await escrowFactory.deploy(await registry.getAddress(), hlusdAddress, feeRecipient, platformFeeBps);
  await escrow.waitForDeployment();

  const executorFactory = await ethers.getContractFactory("AgentExecutor");
  const executor = await executorFactory.deploy();
  await executor.waitForDeployment();

  const deployment = {
    network: network.name,
    chainId: chain.chainId.toString(),
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    hlusdAddress,
    platformFeeRecipient: feeRecipient,
    platformFeeBps,
    contracts: {
      agentRegistry: await registry.getAddress(),
      agentEscrow: await escrow.getAddress(),
      agentExecutor: await executor.getAddress()
    }
  };

  const deploymentsDir = path.join(process.cwd(), "deployments");
  fs.mkdirSync(deploymentsDir, { recursive: true });

  const networkFile = path.join(deploymentsDir, `${network.name}.json`);
  fs.writeFileSync(networkFile, JSON.stringify(deployment, null, 2));

  const latestFile = path.join(deploymentsDir, "latest.json");
  fs.writeFileSync(latestFile, JSON.stringify(deployment, null, 2));

  console.log("\nDeployment complete");
  console.log("AgentRegistry:", deployment.contracts.agentRegistry);
  console.log("AgentEscrow:", deployment.contracts.agentEscrow);
  console.log("AgentExecutor:", deployment.contracts.agentExecutor);

  if (explorerUrl) {
    const cleanExplorer = explorerUrl.replace(/\/$/, "");
    console.log("\nExplorer links:");
    console.log(`Registry: ${cleanExplorer}/address/${deployment.contracts.agentRegistry}`);
    console.log(`Escrow: ${cleanExplorer}/address/${deployment.contracts.agentEscrow}`);
    console.log(`Executor: ${cleanExplorer}/address/${deployment.contracts.agentExecutor}`);
  }

  console.log("\nCopy into .env.local:");
  console.log(`NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS=${deployment.contracts.agentRegistry}`);
  console.log(`NEXT_PUBLIC_AGENT_ESCROW_ADDRESS=${deployment.contracts.agentEscrow}`);
  console.log(`NEXT_PUBLIC_AGENT_EXECUTOR_ADDRESS=${deployment.contracts.agentExecutor}`);
  console.log(`NEXT_PUBLIC_PLATFORM_FEE_BPS=${platformFeeBps}`);

  console.log(`\nSaved deployment artifact: ${networkFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
