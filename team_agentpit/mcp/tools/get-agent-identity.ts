import * as z from "zod/v4";
import type { ToolRequest } from "../../shared/types.js";

const schema = z
  .object({
    agentId: z.string().min(1).optional(),
    agentAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  })
  .refine((value) => Boolean(value.agentId || value.agentAddress), {
    message: "Provide either agentId or agentAddress.",
    path: ["agentId"],
  });

export const getAgentIdentityTool = {
  name: "get_agent_identity",
  description: "Resolve the ERC-8004 identity record using an agentId or agentAddress.",
  inputSchema: schema.shape,
  async handler({ args }: ToolRequest) {
    const { agentId, agentAddress } = schema.parse(args);
    const agent = agentId ?? agentAddress;
    const response = await fetch(
      `${process.env.BACKEND_URL ?? "http://localhost:3001"}/agents/${agent}/identity`,
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  },
};
