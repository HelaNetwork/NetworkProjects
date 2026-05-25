export const env = {
  backendPort: Number(process.env.BACKEND_PORT ?? 3001),
  backendUrl: process.env.BACKEND_URL ?? "http://localhost:3001",
  mcpPort: Number(process.env.MCP_PORT ?? 3002),
  databaseUrl: process.env.DATABASE_URL,
  proposalSubmissionPayTo: process.env.X402_PROPOSAL_PAY_TO,
  proposalSubmissionPriceUsd: process.env.X402_PROPOSAL_PRICE_USD ?? "$0.01",
  proposalSubmissionNetwork: resolveProposalNetwork(process.env.X402_PROPOSAL_NETWORK),
  proposalSubmissionAsset: process.env.X402_PROPOSAL_ASSET,
  proposalSubmissionAmountAtomic: process.env.X402_PROPOSAL_AMOUNT_ATOMIC,
  proposalSubmissionAssetName: process.env.X402_PROPOSAL_ASSET_NAME,
  proposalSubmissionAssetVersion: process.env.X402_PROPOSAL_ASSET_VERSION,
  proposalSubmissionAssetTransferMethod: process.env.X402_PROPOSAL_ASSET_TRANSFER_METHOD,
  x402FacilitatorUrl: process.env.X402_FACILITATOR_URL,
  x402SyncOnStart: resolveBoolean(process.env.X402_SYNC_ON_START, false),
};

export function hasDatabaseUrl() {
  return Boolean(env.databaseUrl);
}

function resolveProposalNetwork(raw: string | undefined): `${string}:${string}` {
  const value = raw?.trim().toLowerCase();
  if (!value || value === "base-sepolia" || value === "84532" || value === "eip155:84532") {
    return "eip155:84532";
  }

  if (value === "base" || value === "8453" || value === "eip155:8453") {
    return "eip155:8453";
  }

  if (value === "hela" || value === "hela-testnet" || value === "666888" || value === "eip155:666888") {
    return "eip155:666888";
  }

  if (value === "hela-mainnet" || value === "8668" || value === "eip155:8668") {
    return "eip155:8668";
  }

  if (value.startsWith("eip155:")) {
    return value as `${string}:${string}`;
  }

  throw new Error(`Unsupported X402_PROPOSAL_NETWORK value: ${raw}`);
}

function resolveBoolean(raw: string | undefined, fallback: boolean) {
  if (raw === undefined) {
    return fallback;
  }

  const value = raw.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(value)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(value)) {
    return false;
  }

  return fallback;
}
