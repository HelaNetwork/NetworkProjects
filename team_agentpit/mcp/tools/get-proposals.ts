import * as z from "zod/v4";
import type { ToolRequest } from "../../shared/types.js";

const schema = z.object({
  vault: z.string().min(1),
});

export const getProposalsTool = {
  name: "get_proposals",
  description: "Fetch all proposals that target a specific user vault.",
  inputSchema: schema.shape,
  async handler({ args }: ToolRequest) {
    const { vault } = schema.parse(args);
    const response = await fetch(`${process.env.BACKEND_URL ?? "http://localhost:3001"}/proposals/${vault}`);

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  },
};
