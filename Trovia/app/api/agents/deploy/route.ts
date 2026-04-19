/**
 * Deploys a generated agent on-chain and registers it in in-memory execution storage.
 * Exports:
 * - POST: verifies wallet signature, publishes the agent, stores runtime code, and returns deployment metadata.
 */

import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { getRegistryContract } from "../../../../lib/contracts";
import { storeAgent } from "../../../../lib/agentRunner";
import type { AgentObject } from "../../../../types/agent";

type DeployRequestBody = {
  agent?: AgentObject;
  executionCode?: string;
  developerAddress?: string;
  signature?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Unknown error";
}

function hasRequiredBodyFields(body: DeployRequestBody): body is {
  agent: AgentObject;
  executionCode: string;
  developerAddress: string;
  signature: string;
} {
  return Boolean(body.agent) &&
    typeof body.executionCode === "string" &&
    body.executionCode.trim().length > 0 &&
    typeof body.developerAddress === "string" &&
    body.developerAddress.trim().length > 0 &&
    typeof body.signature === "string" &&
    body.signature.trim().length > 0;
}

function ensureServerEnv(): { rpcUrl: string; privateKey: string } {
  const rpcUrl = process.env.NEXT_PUBLIC_HELA_RPC;
  const privateKey = process.env.HELA_PRIVATE_KEY || process.env.PRIVATE_KEY;

  if (!rpcUrl || !privateKey) {
    throw new Error("Server misconfigured");
  }

  // getRegistryContract(false) relies on all public contract addresses in lib/contracts.ts
  if (
    !process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS ||
    !process.env.NEXT_PUBLIC_AGENT_ESCROW_ADDRESS ||
    !process.env.NEXT_PUBLIC_AGENT_EXECUTOR_ADDRESS
  ) {
    throw new Error("Server misconfigured");
  }

  return { rpcUrl, privateKey };
}

function extractAgentIdFromStruct(input: unknown): string | null {
  if (typeof input === "bigint") {
    return input.toString();
  }

  if (isRecord(input)) {
    const idValue = input.id;
    if (typeof idValue === "bigint") {
      return idValue.toString();
    }
    if (typeof idValue === "number" && Number.isFinite(idValue)) {
      return Math.trunc(idValue).toString();
    }
    if (typeof idValue === "string" && idValue.trim()) {
      return idValue;
    }
  }

  if (Array.isArray(input) && input.length > 0) {
    return extractAgentIdFromStruct(input[0]);
  }

  return null;
}

async function resolveAgentId(
  receipt: ethers.TransactionReceipt,
  registryContract: ethers.BaseContract
): Promise<string | null> {
  for (const log of receipt.logs) {
    try {
      const parsedLog = registryContract.interface.parseLog({ topics: log.topics, data: log.data });
      if (parsedLog && parsedLog.name.toLowerCase().includes("agent")) {
        const idCandidate = extractAgentIdFromStruct(parsedLog.args?.[0]);
        if (idCandidate) {
          return idCandidate;
        }
      }
    } catch {
      // Ignore non-matching logs.
    }
  }

  try {
    const getAllAgents = registryContract.getFunction("getAllAgents");
    const allAgents = await getAllAgents();
    if (Array.isArray(allAgents) && allAgents.length > 0) {
      return extractAgentIdFromStruct(allAgents[allAgents.length - 1]);
    }
  } catch (error: unknown) {
    console.warn("[DEPLOY] Could not fetch agents for fallback id resolution:", errorMessage(error));
  }

  return null;
}

async function publishAgentWithCompatibility(
  registryContract: ethers.BaseContract,
  agent: AgentObject,
  developerAddress: string
): Promise<ethers.TransactionResponse> {
  const price = ethers.parseUnits(agent.priceHLUSD.toString(), 18);
  const schemaJson = JSON.stringify(agent.configSchema);
  const publishAgent = registryContract.getFunction("publishAgent");

  console.log("[DEPLOY] Attempting publishAgent with developerAddress argument");
  try {
    return await publishAgent(
      agent.name,
      agent.description,
      agent.agentType,
      price,
      developerAddress,
      schemaJson
    );
  } catch (firstError: unknown) {
    console.warn("[DEPLOY] 6-argument publishAgent failed, retrying 5-argument variant:", errorMessage(firstError));
    return await publishAgent(
      agent.name,
      agent.description,
      agent.agentType,
      price,
      schemaJson
    );
  }
}

export async function POST(req: Request) {
  console.log("[DEPLOY] Received request");

  let body: DeployRequestBody;
  try {
    body = (await req.json()) as DeployRequestBody;
  } catch {
    return NextResponse.json({ error: "Malformed JSON body" }, { status: 400 });
  }

  if (!hasRequiredBodyFields(body)) {
    return NextResponse.json(
      {
        error: "agent, executionCode, developerAddress, and signature are required"
      },
      { status: 400 }
    );
  }

  const { agent, executionCode, developerAddress, signature } = body;

  try {
    console.log("[DEPLOY] Step 1: verifying signature");
    const recovered = ethers.verifyMessage(`Deploy agent: ${agent.name}`, signature);
    if (recovered.toLowerCase() !== developerAddress.toLowerCase()) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    console.log("[DEPLOY] Step 2: preparing provider and signer");
    const { rpcUrl, privateKey } = ensureServerEnv();
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    const agentWallet = ethers.Wallet.createRandom();

    console.log("[DEPLOY] Step 3: registering agent on-chain");
    const registryReadContract = await getRegistryContract(false);
    const registryContract = registryReadContract.connect(signer);

    const tx = await publishAgentWithCompatibility(registryContract, agent, developerAddress);
    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error("Contract deployment failed: transaction not confirmed");
    }

    const agentId = await resolveAgentId(receipt, registryContract);
    if (!agentId) {
      throw new Error("Contract deployment failed: unable to determine agentId");
    }

    console.log("[DEPLOY] Step 4: storing deployed agent in memory store");
    await storeAgent(
      agentId,
      agent,
      executionCode,
      developerAddress,
      agentWallet.address,
      agentWallet.privateKey
    );

    console.log("[DEPLOY] Deployment completed");
    return NextResponse.json(
      {
        agentId,
        agentWalletAddress: agentWallet.address,
        txHash: receipt.hash,
        explorerUrl: `https://testnet-explorer.helachain.com/tx/${receipt.hash}`,
        marketplaceUrl: `/agent/${agentId}`,
        deployed: true
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = errorMessage(error);
    console.error("[DEPLOY] Error", message);

    if (message === "Server misconfigured") {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    if (message === "Invalid signature") {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: "Contract deployment failed",
        details: message
      },
      { status: 500 }
    );
  }
}
