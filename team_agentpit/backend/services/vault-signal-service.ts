import { randomUUID } from "node:crypto";
import type { VaultFundingSignal } from "../../shared/types.js";
import { getBroker } from "../lib/broker-registry.js";
import { getMarketplaceRepository } from "../repositories/index.js";

export async function publishVaultSignal(
  input: Omit<VaultFundingSignal, "id" | "createdAt">,
) {
  const signal: VaultFundingSignal = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };

  await getMarketplaceRepository().saveVaultSignal(signal);
  getBroker()?.broadcast("vault.signal_published", signal);
  return signal;
}

export async function getVaultSignals(filters?: { ownerAddress?: string; vaultAddress?: string }) {
  return getMarketplaceRepository().listVaultSignals(filters);
}
