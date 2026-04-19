import * as z from "zod/v4";
import type { ToolRequest } from "../../shared/types.js";

const schema = z.object({
  vault: z.string().min(1),
  proposalId: z.string().min(1),
  userAgentId: z.string().min(1),
  approval: z.object({
    vault: z.string(),
    proposalId: z.string(),
    signer: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    nonce: z.union([z.string(), z.number()]),
    deadline: z.union([z.string(), z.number()]),
    signature: z.string().startsWith("0x"),
  }),
});

export const submitExecutionTool = {
  name: "submit_execution",
  description: "Submit a signed execution approval so the relayer can execute the winning strategy.",
  inputSchema: schema.shape,
  async handler({ args }: ToolRequest) {
    const body = schema.parse(args);
    const response = await fetch(`${process.env.BACKEND_URL ?? "http://localhost:3001"}/execute`, {
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
