import * as z from "zod/v4";
import type { ToolRequest } from "../../shared/types.js";

const schema = z.object({
  agentId: z.string().min(1),
  registryAgentId: z.string().min(1),
  agentAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export const transferAgentTokenTool = {
  name: "transfer_agent_token",
  description:
    "Transfer a token-based AgentRegistry NFT on HeLa Testnet from the relayer wallet to the target agentAddress after registration.",
  inputSchema: schema.shape,
  async handler({ args }: ToolRequest) {
    const body = schema.parse(args);
    const response = await fetch(
      `${process.env.BACKEND_URL ?? "http://localhost:3001"}/agents/transfer-token`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  },
};
