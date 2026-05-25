import { NextResponse } from "next/server";
import { getStoredAgent, listExecutionLogsForOwner, listJobsForOwner } from "@/lib/automationStore";
import { getFundingSnapshot } from "@/lib/automationFunding";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ownerAddress = searchParams.get("ownerAddress");

  if (!ownerAddress) {
    return NextResponse.json({ error: "ownerAddress is required" }, { status: 400 });
  }

  const jobs = await Promise.all(
    (await listJobsForOwner(ownerAddress)).map(async (job) => {
      const storedAgent = await getStoredAgent(job.agentId);
      const agentWalletAddress = storedAgent?.agentWalletAddress || null;
      const funding = await getFundingSnapshot(agentWalletAddress, job, storedAgent?.agent.agentType || null);

      return {
        ...job,
        agentWalletAddress,
        agentStatus: storedAgent?.status || null,
        ...funding
      };
    })
  );

  const logs = await listExecutionLogsForOwner(ownerAddress);

  return NextResponse.json(
    {
      jobs,
      logs
    },
    { status: 200 }
  );
}
