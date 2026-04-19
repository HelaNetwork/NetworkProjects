import * as z from "zod/v4";
import type { ToolRequest } from "../../shared/types.js";

const schema = z.object({
  registryAgentId: z.string().min(1),
});

export const readAllFeedbackTool = {
  name: "read_all_feedback",
  description: "Read all feedback entries for an ERC-8004 agent identity.",
  inputSchema: schema.shape,
  async handler({ args }: ToolRequest) {
    const { registryAgentId } = schema.parse(args);
    const response = await fetch(
      `${process.env.BACKEND_URL ?? "http://localhost:3001"}/feedback/${registryAgentId}/all`,
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  },
};
