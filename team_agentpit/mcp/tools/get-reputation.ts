import * as z from "zod/v4";
import type { ToolRequest } from "../../shared/types.js";

const schema = z.object({
  agentAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export const getReputationTool = {
  name: "get_reputation",
  description: "Read an agent reputation score from the token-based AgentRegistry contract.",
  inputSchema: schema.shape,
  async handler({ args }: ToolRequest) {
    const { agentAddress } = schema.parse(args);
    const response = await fetch(
      `${process.env.BACKEND_URL ?? "http://localhost:3001"}/reputation/${agentAddress}`,
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  },
};
