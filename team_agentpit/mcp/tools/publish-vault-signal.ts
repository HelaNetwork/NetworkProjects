import * as z from "zod/v4";
import type { ToolRequest } from "../../shared/types.js";

const schema = z.object({
  ownerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  vaultAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  assetAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  assetSymbol: z.string().min(1),
  fundedAmount: z.string().min(1),
  status: z.enum(["vault-created", "vault-funded", "ready-for-strategy"]),
  userAgentId: z.string().min(1),
  chain: z.literal("base-sepolia").default("base-sepolia"),
  notes: z.string().optional(),
});

export const publishVaultSignalTool = {
  name: "publish_vault_signal",
  description: "Publish an offchain vault readiness signal after vault creation or funding so strategy agents can react.",
  inputSchema: schema.shape,
  async handler({ args }: ToolRequest) {
    const body = schema.parse(args);
    const response = await fetch(`${process.env.BACKEND_URL ?? "http://localhost:3001"}/vault-signals`, {
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
