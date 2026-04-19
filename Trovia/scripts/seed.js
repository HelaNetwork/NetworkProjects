const fs = require("fs");
const path = require("path");
const hre = require("hardhat");
const { Contract, isAddress, parseUnits } = require("ethers");

const REGISTRY_ABI = [
  "function publishAgent(string name,string description,string agentType,uint256 priceHLUSD,string configSchema) returns (uint256)",
  "function getAllAgents() view returns ((uint256 id,string name,string description,string agentType,uint256 priceHLUSD,address developer,bool isActive,string configSchema)[])"
];

const SEED_AGENTS = [
  {
    name: "Trading Agent",
    description: "Monitors token thresholds, alerts users, and simulates trade actions.",
    agentType: "trading",
    price: "5",
    configSchema: '{"tokenPair":"string","threshold":"number","action":"string","amount":"number"}'
  },
  {
    name: "Farming Agent",
    description: "Tracks LP positions and suggests or triggers compounding at configured APY thresholds.",
    agentType: "farming",
    price: "5",
    configSchema: '{"lpAddress":"string","compoundThreshold":"number","frequency":"string"}'
  },
  {
    name: "Scheduling Agent",
    description: "Schedules recurring HLUSD transfers to target recipients on defined intervals.",
    agentType: "scheduling",
    price: "3",
    configSchema: '{"recipient":"address","amount":"number","frequency":"string","startDate":"string"}'
  },
  {
    name: "Portfolio Rebalancing Agent",
    description: "Monitors allocation drift and emits plain-language rebalance recommendations.",
    agentType: "rebalancing",
    price: "4",
    configSchema: '{"targets":"object","driftTolerance":"number","tokens":"string[]"}'
  },
  {
    name: "Content Reply Agent",
    description: "Generates tone-controlled social and email replies with 3 ready options.",
    agentType: "content",
    price: "2",
    configSchema: '{"tone":"string","persona":"string"}'
  },
  {
    name: "Business Assistant Agent",
    description: "Handles business drafting, summaries, and query responses with structured output.",
    agentType: "business",
    price: "2",
    configSchema: '{"businessContext":"string","language":"string","formality":"string"}'
  }
];

function getRegistryAddress(networkName) {
  const envAddress = process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS;
  if (envAddress && isAddress(envAddress)) {
    return envAddress;
  }

  const deploymentFile = path.join(process.cwd(), "deployments", `${networkName}.json`);
  if (!fs.existsSync(deploymentFile)) {
    throw new Error("Registry address not found in env or deployment file");
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const address = deployment.contracts?.agentRegistry;
  if (!address || !isAddress(address)) {
    throw new Error("Invalid registry address in deployment file");
  }

  return address;
}

async function main() {
  const { ethers, network } = hre;
  const [deployer] = await ethers.getSigners();
  const registryAddress = getRegistryAddress(network.name);
  const registry = new Contract(registryAddress, REGISTRY_ABI, deployer);

  console.log("Seeding agent registry on", network.name);
  console.log("Registry:", registryAddress);
  console.log("Seeder:", deployer.address);

  const existingAgents = await registry.getAllAgents();
  const existingNames = new Set(existingAgents.map((agent) => agent.name.toLowerCase()));

  let created = 0;

  for (const agent of SEED_AGENTS) {
    if (existingNames.has(agent.name.toLowerCase())) {
      console.log(`Skipping existing agent: ${agent.name}`);
      continue;
    }

    const tx = await registry.publishAgent(
      agent.name,
      agent.description,
      agent.agentType,
      parseUnits(agent.price, 18),
      agent.configSchema
    );
    await tx.wait();
    created += 1;
    console.log(`Published agent: ${agent.name}`);
  }

  const finalAgents = await registry.getAllAgents();
  const finalNames = new Set(finalAgents.map((agent) => agent.name.toLowerCase()));

  const missing = SEED_AGENTS.filter((agent) => !finalNames.has(agent.name.toLowerCase()));
  if (missing.length > 0) {
    throw new Error(`Seed incomplete. Missing agents: ${missing.map((agent) => agent.name).join(", ")}`);
  }

  console.log("Seed complete. Total agents on registry:", finalAgents.length);
  console.log("Newly created in this run:", created);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
