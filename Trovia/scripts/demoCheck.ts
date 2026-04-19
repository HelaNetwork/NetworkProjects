import fs from "fs";
import path from "path";
import { Contract, JsonRpcProvider, isAddress } from "ethers";
import { network } from "hardhat";

type Deployment = {
  network: string;
  chainId: string;
  hlusdAddress: string;
  contracts: {
    agentRegistry: string;
    agentEscrow: string;
    agentExecutor: string;
  };
};

const REGISTRY_ABI = [
  "function getAllAgents() view returns ((uint256 id,string name,string description,string agentType,uint256 priceHLUSD,address developer,bool isActive,string configSchema)[])",
  "function agentCount() view returns (uint256)"
];

const ESCROW_ABI = [
  "function hlusd() view returns (address)",
  "function registry() view returns (address)",
  "function activationCount() view returns (uint256)"
];

const REQUIRED_AGENT_NAMES = [
  "Trading Agent",
  "Farming Agent",
  "Scheduling Agent",
  "Portfolio Rebalancing Agent",
  "Content Reply Agent",
  "Business Assistant Agent"
];

function readDeployment(): Deployment {
  const deploymentFile = path.join(process.cwd(), "deployments", `${network.name}.json`);
  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`Deployment file not found: ${deploymentFile}`);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8")) as Deployment;
  const { contracts } = deployment;

  if (
    !isAddress(contracts.agentRegistry) ||
    !isAddress(contracts.agentEscrow) ||
    !isAddress(contracts.agentExecutor) ||
    !isAddress(deployment.hlusdAddress)
  ) {
    throw new Error("Deployment file contains invalid address values");
  }

  return deployment;
}

async function main() {
  const deployment = readDeployment();
  const rpcUrl = process.env.HELA_RPC_URL;
  if (!rpcUrl) {
    throw new Error("HELA_RPC_URL is required in .env");
  }

  const provider = new JsonRpcProvider(rpcUrl);

  console.log("Demo preflight check");
  console.log("Network:", deployment.network);
  console.log("Chain ID:", deployment.chainId);

  const codeRegistry = await provider.getCode(deployment.contracts.agentRegistry);
  const codeEscrow = await provider.getCode(deployment.contracts.agentEscrow);
  const codeExecutor = await provider.getCode(deployment.contracts.agentExecutor);
  const codeHLUSD = await provider.getCode(deployment.hlusdAddress);

  if (codeRegistry === "0x" || codeEscrow === "0x" || codeExecutor === "0x") {
    throw new Error("One or more deployed contract addresses do not contain contract code");
  }

  if (codeHLUSD === "0x") {
    throw new Error("HLUSD address does not point to a contract. Activation with payment will fail.");
  }

  const registry = new Contract(deployment.contracts.agentRegistry, REGISTRY_ABI, provider);
  const escrow = new Contract(deployment.contracts.agentEscrow, ESCROW_ABI, provider);

  const [agentCount, agents, escrowRegistry, escrowHlusd, activationCount] = await Promise.all([
    registry.agentCount(),
    registry.getAllAgents(),
    escrow.registry(),
    escrow.hlusd(),
    escrow.activationCount()
  ]);

  if (escrowRegistry.toLowerCase() !== deployment.contracts.agentRegistry.toLowerCase()) {
    throw new Error("Escrow registry address mismatch with deployment metadata");
  }

  if (escrowHlusd.toLowerCase() !== deployment.hlusdAddress.toLowerCase()) {
    throw new Error("Escrow HLUSD address mismatch with deployment metadata");
  }

  const presentNames = new Set((agents as Array<{ name: string }>).map((a) => a.name.toLowerCase()));
  const missingNames = REQUIRED_AGENT_NAMES.filter((name) => !presentNames.has(name.toLowerCase()));
  if (missingNames.length > 0) {
    throw new Error(`Missing seeded agents: ${missingNames.join(", ")}`);
  }

  console.log("Registry contract code: OK");
  console.log("Escrow contract code: OK");
  console.log("Executor contract code: OK");
  console.log("HLUSD contract code: OK");
  console.log("Agent count:", agentCount.toString());
  console.log("Activation count:", activationCount.toString());
  console.log("Required 6 agents seeded: OK");
  console.log("Demo preflight passed");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
