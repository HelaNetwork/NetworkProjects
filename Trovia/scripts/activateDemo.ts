import fs from "fs";
import path from "path";
import { Contract } from "ethers";
import { ethers, network } from "hardhat";

type Deployment = {
  contracts: {
    agentRegistry: string;
    agentEscrow: string;
  };
  hlusdAddress: string;
};

const REGISTRY_ABI = [
  "function getAgent(uint256 id) view returns ((uint256 id,string name,string description,string agentType,uint256 priceHLUSD,address developer,bool isActive,string configSchema))"
];

const ESCROW_ABI = [
  "function activateAgent(uint256 agentId, string userConfig)",
  "function activationCount() view returns (uint256)",
  "function hasActivatedAgent(address user, uint256 agentId) view returns (bool)",
  "event AgentActivated(uint256 indexed activationId,uint256 indexed agentId,address indexed buyer,string config,uint256 paidAmount,uint256 timestamp)"
];

const ERC20_ABI = [
  "function approve(address spender, uint256 value) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)"
];

function readDeployment(): Deployment {
  const file = path.join(process.cwd(), "deployments", `${network.name}.json`);
  if (!fs.existsSync(file)) {
    throw new Error(`Missing deployment file: ${file}`);
  }
  return JSON.parse(fs.readFileSync(file, "utf8")) as Deployment;
}

async function main() {
  const deployment = readDeployment();
  const [signer] = await ethers.getSigners();

  const agentId = Number(process.env.DEMO_ACTIVATE_AGENT_ID || "3");
  const userConfig =
    process.env.DEMO_ACTIVATE_CONFIG ||
    '{"recipient":"0x4E81d5892034B31f9d36F903605940f697446B6b","amount":"1","frequency":"weekly","startDate":"2026-04-19"}';

  const registry = new Contract(deployment.contracts.agentRegistry, REGISTRY_ABI, signer);
  const escrow = new Contract(deployment.contracts.agentEscrow, ESCROW_ABI, signer);
  const token = new Contract(deployment.hlusdAddress, ERC20_ABI, signer);

  const agent = await registry.getAgent(agentId);
  if (!agent.isActive) {
    throw new Error(`Agent ${agentId} is inactive`);
  }

  const alreadyActivated = await escrow.hasActivatedAgent(signer.address, agentId);
  if (alreadyActivated) {
    throw new Error(`Signer already activated agent ${agentId}`);
  }

  const price = BigInt(agent.priceHLUSD);

  console.log("Running activation demo transaction");
  console.log("Network:", network.name);
  console.log("Signer:", signer.address);
  console.log("Agent:", `${agentId} - ${agent.name}`);
  console.log("Price (wei):", price.toString());

  if (price > 0n) {
    const balance = BigInt(await token.balanceOf(signer.address));
    if (balance < price) {
      throw new Error(`Insufficient HLUSD balance. Have ${balance.toString()} need ${price.toString()}`);
    }

    const allowance = BigInt(await token.allowance(signer.address, deployment.contracts.agentEscrow));
    if (allowance < price) {
      const approveTx = await token.approve(deployment.contracts.agentEscrow, price);
      const approveReceipt = await approveTx.wait();
      console.log("Approve tx:", approveReceipt.hash);
    }
  }

  const before = BigInt(await escrow.activationCount());
  const activateTx = await escrow.activateAgent(agentId, userConfig);
  const activateReceipt = await activateTx.wait();
  const after = BigInt(await escrow.activationCount());

  console.log("Activation tx:", activateReceipt.hash);
  console.log("Activation count before:", before.toString());
  console.log("Activation count after:", after.toString());
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
