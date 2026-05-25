import * as z from "zod/v4";
import type { ToolRequest } from "../../shared/types.js";

const schema = z.object({
  registryAgentId: z.string().min(1),
  score: z.number().int().min(0).max(100),
  category: z.enum(["strategy", "execution", "trust", "general"]),
  comment: z.string().optional(),
});

export const giveFeedbackTool = {
  name: "give_feedback",
  description: "Submit on-chain feedback for an ERC-8004 agent identity.",
  inputSchema: schema.shape,
  async handler({ args }: ToolRequest) {
    const response = await fetch(`${process.env.BACKEND_URL ?? "http://localhost:3001"}/feedback`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(schema.parse(args)),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  },
};
