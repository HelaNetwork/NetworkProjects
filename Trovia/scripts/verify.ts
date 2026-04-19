import fs from "fs";
import path from "path";
import { isAddress } from "ethers";
import { network, run } from "hardhat";

type Deployment = {
  network: string;
  chainId: string;
  hlusdAddress: string;
  platformFeeRecipient: string;
  platformFeeBps: number;
  contracts: {
    agentRegistry: string;
    agentEscrow: string;
    agentExecutor: string;
  };
};

function readDeployment(): Deployment {
  const filePath = path.join(process.cwd(), "deployments", `${network.name}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Deployment file not found: ${filePath}. Run deploy first.`);
  }

  const deployment = JSON.parse(fs.readFileSync(filePath, "utf8")) as Deployment;

  if (!isAddress(deployment.hlusdAddress)) {
    throw new Error("Invalid HLUSD address in deployment file");
  }
  if (!isAddress(deployment.platformFeeRecipient)) {
    throw new Error("Invalid platform fee recipient in deployment file");
  }
  if (!isAddress(deployment.contracts.agentRegistry)) {
    throw new Error("Invalid AgentRegistry address in deployment file");
  }
  if (!isAddress(deployment.contracts.agentEscrow)) {
    throw new Error("Invalid AgentEscrow address in deployment file");
  }
  if (!isAddress(deployment.contracts.agentExecutor)) {
    throw new Error("Invalid AgentExecutor address in deployment file");
  }

  return deployment;
}

async function verifyOne(address: string, constructorArguments: unknown[], label: string) {
  try {
    await run("verify:verify", {
      address,
      constructorArguments
    });
    console.log(`${label} verified: ${address}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.toLowerCase().includes("already verified")) {
      console.log(`${label} already verified: ${address}`);
      return;
    }
    throw error;
  }
}

async function main() {
  const deployment = readDeployment();

  console.log("Verifying contracts on", network.name);

  await verifyOne(deployment.contracts.agentRegistry, [], "AgentRegistry");
  await verifyOne(
    deployment.contracts.agentEscrow,
    [
      deployment.contracts.agentRegistry,
      deployment.hlusdAddress,
      deployment.platformFeeRecipient,
      deployment.platformFeeBps
    ],
    "AgentEscrow"
  );
  await verifyOne(deployment.contracts.agentExecutor, [], "AgentExecutor");

  console.log("Verification workflow complete");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
