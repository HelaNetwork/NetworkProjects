import * as z from "zod/v4";
import type { ToolRequest } from "../../shared/types.js";

const schema = z.object({
  ownerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  vaultAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
});

export const getVaultSignalsTool = {
  name: "get_vault_signals",
  description:
    "Read offchain vault readiness signals published by user agents after vault creation or funding. Returns record-based views keyed by vault and owner.",
  inputSchema: schema.shape,
  async handler({ args }: ToolRequest) {
    const query = schema.parse(args);
    const params = new URLSearchParams();
    if (query.ownerAddress) params.set("ownerAddress", query.ownerAddress);
    if (query.vaultAddress) params.set("vaultAddress", query.vaultAddress);

    const response = await fetch(
      `${process.env.BACKEND_URL ?? "http://localhost:3001"}/vault-signals?${params.toString()}`,
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const signals = (await response.json()) as VaultSignal[];

    return {
      signals,
      byVault: indexSignals(signals, "vaultAddress"),
      byOwner: indexSignals(signals, "ownerAddress"),
      latestByVault: latestBy(signals, "vaultAddress"),
      latestByOwner: latestBy(signals, "ownerAddress"),
    };
  },
};

type VaultSignal = {
  id: string;
  ownerAddress: string;
  vaultAddress: string;
  assetAddress: string;
  assetSymbol: string;
  fundedAmount: string;
  status: "vault-created" | "vault-funded" | "ready-for-strategy";
  userAgentId: string;
  chain: string;
  notes?: string;
  createdAt: string;
};

function indexSignals<T extends Record<string, string>>(
  signals: T[],
  key: keyof T,
): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  for (const signal of signals) {
    const groupKey = signal[key];
    if (!out[groupKey]) {
      out[groupKey] = [];
    }
    out[groupKey].push(signal);
  }
  return out;
}

function latestBy<T extends { createdAt: string } & Record<string, string>>(
  signals: T[],
  key: keyof T,
): Record<string, T> {
  const out: Record<string, T> = {};
  for (const signal of signals) {
    const groupKey = signal[key];
    const current = out[groupKey];
    if (!current || new Date(signal.createdAt).getTime() > new Date(current.createdAt).getTime()) {
      out[groupKey] = signal;
    }
  }
  return out;
}
