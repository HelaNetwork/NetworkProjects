import { NextResponse } from "next/server";
import { JsonRpcProvider, Wallet, formatEther, parseEther } from "ethers";
import { getAgentJob, getStoredAgent } from "@/lib/automationStore";
import { getFundingSnapshot } from "@/lib/automationFunding";

type RouteContext = {
  params: {
    jobId: string;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readAmount(body: unknown): string {
  if (!isRecord(body)) {
    return "0.01";
  }

  const raw = body.amount;
  if (typeof raw !== "string" && typeof raw !== "number") {
    return "0.01";
  }

  const value = String(raw).trim();
  if (!value) {
    return "0.01";
  }

  return value;
}

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

export async function POST(req: Request, context: RouteContext) {
  const job = await getAgentJob(context.params.jobId);
  if (!job) {
    return NextResponse.json({ error: "Automation job not found" }, { status: 404 });
  }

  const storedAgent = await getStoredAgent(job.agentId);
  if (!storedAgent) {
    return NextResponse.json({ error: "Stored agent not found" }, { status: 404 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const amount = readAmount(body);

    const rpcUrl = requireEnv("NEXT_PUBLIC_HELA_RPC");
    const fundingKey = requireEnv("PRIVATE_KEY");
    const provider = new JsonRpcProvider(rpcUrl);
    const signer = new Wallet(fundingKey.startsWith("0x") ? fundingKey : `0x${fundingKey}`, provider);

    const tx = await signer.sendTransaction({
      to: storedAgent.agentWalletAddress,
      value: parseEther(amount)
    });
    const receipt = await tx.wait();
    const funding = await getFundingSnapshot(storedAgent.agentWalletAddress, job, storedAgent.agent.agentType);
    const nativeBalance = await provider.getBalance(storedAgent.agentWalletAddress);

    return NextResponse.json(
      {
        job,
        agentWalletAddress: storedAgent.agentWalletAddress,
        fundedAmount: amount,
        txHash: receipt?.hash || tx.hash,
        nativeBalanceAfterFundingHELA: formatEther(nativeBalance),
        ...funding
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fund agent gas wallet"
      },
      { status: 500 }
    );
  }
}
