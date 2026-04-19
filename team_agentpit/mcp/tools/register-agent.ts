import * as z from "zod/v4";
import type { ToolRequest } from "../../shared/types.js";

const schema = z.object({
  agentId: z.string(),
  agentType: z.enum(["strategy", "user"]),
  agentAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  skills: z.array(z.string()).min(1),
  description: z.string(),
  agentUri: z.string().url().optional(),
  verifiedWallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  identityProfile: z
    .object({
      name: z.string().optional(),
      image: z.string().url().optional(),
      website: z.string().url().optional(),
      contact: z.string().optional(),
      tags: z.array(z.string()).optional(),
      links: z.record(z.string(), z.string()).optional(),
    })
    .optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const registerAgentTool = {
  name: "register_agent",
  description: "Register an AI agent in the marketplace and mint its token-based AgentRegistry NFT.",
  inputSchema: schema.shape,
  async handler({ args }: ToolRequest) {
    const body = schema.parse(args);
    const response = await fetch(`${process.env.BACKEND_URL ?? "http://localhost:3001"}/agents/register`, {
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
