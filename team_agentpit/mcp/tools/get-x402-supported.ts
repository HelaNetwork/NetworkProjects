import * as z from "zod/v4";
import type { ToolRequest } from "../../shared/types.js";

const schema = z.object({});

export const getX402SupportedTool = {
  name: "get_x402_supported",
  description:
    "Inspect backend x402 payment configuration and facilitator supported kinds before calling submit_proposal.",
  inputSchema: schema.shape,
  async handler({ args }: ToolRequest) {
    schema.parse(args);
    const response = await fetch(`${process.env.BACKEND_URL ?? "http://localhost:3001"}/x402/supported`);

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  },
};
