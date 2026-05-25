import * as z from "zod/v4";
import type { ToolRequest } from "../../shared/types.js";

const schema = z.object({
  agentId: z.string().min(1),
  registryAgentId: z.string().min(1),
  proof: z.object({
    wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    deadline: z.union([z.string(), z.number()]),
    signature: z.string().startsWith("0x"),
  }),
});

export const setAgentWalletTool = {
  name: "set_agent_wallet",
  description: "Set a verified receiving wallet for an on-chain agent identity.",
  inputSchema: schema.shape,
  async handler({ args }: ToolRequest) {
    const body = schema.parse(args);
    const response = await fetch(`${process.env.BACKEND_URL ?? "http://localhost:3001"}/agents/wallet`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  },
};
