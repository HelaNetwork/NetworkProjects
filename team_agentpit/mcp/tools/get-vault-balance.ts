import * as z from "zod/v4";
import type { ToolRequest } from "../../shared/types.js";

const schema = z.object({
  vault: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  assetAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
});

export const getVaultBalanceTool = {
  name: "get_vault_balance",
  description: "Read the live token balance available in a user vault for execution.",
  inputSchema: schema.shape,
  async handler({ args }: ToolRequest) {
    const { vault, assetAddress } = schema.parse(args);
    const url = new URL(`${process.env.BACKEND_URL ?? "http://localhost:3001"}/vault-balance/${vault}`);
    if (assetAddress) {
      url.searchParams.set("asset", assetAddress);
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  },
};
