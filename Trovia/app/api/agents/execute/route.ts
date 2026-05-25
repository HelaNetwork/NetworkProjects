/**
 * Executes deployed/generated agents by id and logs runs on-chain.
 * Exports:
 * - POST: executes runtime code using user config and optionally records execution on-chain.
 */

import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { getExecutorContract } from "../../../../lib/contracts";
import { getAgent, runAgent } from "../../../../lib/agentRunner";

type ExecuteRequestBody = {
  agentId?: string;
  userConfig?: Record<string, any>;
  userAddress?: string;
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

function hasRequiredBodyFields(body: ExecuteRequestBody): body is {
  agentId: string;
  userConfig: Record<string, any>;
  userAddress: string;
} {
  return (
    typeof body.agentId === "string" &&
    body.agentId.trim().length > 0 &&
    isRecord(body.userConfig) &&
    typeof body.userAddress === "string" &&
    body.userAddress.trim().length > 0
  );
}

function ensureServerEnv(): { rpcUrl: string; privateKey: string } {
  const rpcUrl = process.env.NEXT_PUBLIC_HELA_RPC;
  const privateKey = process.env.HELA_PRIVATE_KEY;

  if (!rpcUrl || !privateKey) {
    throw new Error("Server misconfigured");
  }

  if (
    !process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS ||
    !process.env.NEXT_PUBLIC_AGENT_ESCROW_ADDRESS ||
    !process.env.NEXT_PUBLIC_AGENT_EXECUTOR_ADDRESS
  ) {
    throw new Error("Server misconfigured");
  }

  return { rpcUrl, privateKey };
}

export async function POST(req: Request) {
  console.log("[EXECUTE] Received request");

  let body: ExecuteRequestBody;
  try {
    body = (await req.json()) as ExecuteRequestBody;
  } catch {
    return NextResponse.json({ error: "Malformed JSON body" }, { status: 400 });
  }

  if (!hasRequiredBodyFields(body)) {
    return NextResponse.json(
      {
        error: "agentId, userConfig, and userAddress are required"
      },
      { status: 400 }
    );
  }

  const { agentId, userConfig, userAddress } = body;

  try {
    console.log("[EXECUTE] Step 1: checking agent availability");
    const storedAgent = await getAgent(agentId);
    if (!storedAgent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    console.log("[EXECUTE] Step 2: running agent");
    const execution = await runAgent(agentId, userConfig);

    let txHash: string | undefined;
    try {
      console.log("[EXECUTE] Step 3: logging execution on-chain");
      const { rpcUrl, privateKey } = ensureServerEnv();
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const signer = new ethers.Wallet(privateKey, provider);

      const executorReadContract = await getExecutorContract(false);
      const executorContract = executorReadContract.connect(signer);
      const logExecution = executorContract.getFunction("logExecution");
      const tx = await logExecution(agentId, userAddress, "agent_run", execution.result);
      const receipt = await tx.wait();
      txHash = receipt?.hash || tx.hash;
      console.log("[EXECUTE] On-chain execution log complete", txHash);
    } catch (logError: unknown) {
      console.warn("[EXECUTE] Non-blocking on-chain log failed:", errorMessage(logError));
    }

    return NextResponse.json(
      {
        success: execution.success,
        result: execution.result,
        data: execution.data,
        txHash,
        executedAt: execution.executedAt
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = errorMessage(error);
    console.error("[EXECUTE] Error", message);

    if (message === "Agent not found") {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Execution failed" }, { status: 500 });
  }
}
