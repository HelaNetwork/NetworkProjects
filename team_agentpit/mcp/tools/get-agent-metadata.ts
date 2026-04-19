import * as z from "zod/v4";
import type { ToolRequest } from "../../shared/types.js";

const schema = z.object({
  registryAgentId: z.string().min(1),
  key: z.string().min(1),
});

export const getAgentMetadataTool = {
  name: "get_agent_metadata",
  description: "Read on-chain token-based AgentRegistry fields such as metadataURI, creditScore, totalTasks, successRate, or active.",
  inputSchema: schema.shape,
  async handler({ args }: ToolRequest) {
    const { registryAgentId, key } = schema.parse(args);
    const url = new URL(
      `${process.env.BACKEND_URL ?? "http://localhost:3001"}/agents/${registryAgentId}/metadata`,
    );
    url.searchParams.set("key", key);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  },
};
