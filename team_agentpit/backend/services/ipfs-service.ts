import { createHash } from "node:crypto";
import type {
  AgentIdentityDocument,
  AgentRegistration,
  IdentityUploadRecord,
} from "../../shared/types.js";
import { getContractAddresses } from "../../shared/viem-client.js";

type UploadResponse = {
  IpfsHash?: string;
  cid?: string;
};

export function buildAgentIdentityDocument(
  input: Pick<
    AgentRegistration,
    | "agentId"
    | "agentType"
    | "agentAddress"
    | "description"
    | "skills"
    | "metadata"
    | "verifiedWallet"
    | "identityProfile"
  > & {
    registryAgentId: string;
    registeredAt: string;
  },
): AgentIdentityDocument {
  const contracts = getContractAddresses();
  const supportedProtocols =
    input.agentType === "strategy" ? ["aave-v3"] : ["aave-v3", "erc8004-feedback"];
  const preferredAssets = ["USDC"];

  return {
    schema: "delegent-agent-identity/v1",
    registryAgentId: input.registryAgentId,
    agentId: input.agentId,
    agentType: input.agentType,
    agentAddress: input.agentAddress,
    verifiedWallet: input.verifiedWallet,
    name: input.identityProfile?.name ?? input.agentId,
    description: input.description,
    skills: input.skills,
    metadata: input.metadata,
    profile: input.identityProfile,
    capabilities: {
      mcpTools: input.skills,
      executionStyle: input.agentType === "strategy" ? "propose" : "evaluate-execute",
      supportedProtocols,
      preferredAssets,
    },
    chainContext: {
      chain: "base-sepolia",
      identityRegistry: contracts.identityRegistry,
      reputationRegistry: contracts.reputationRegistry,
    },
    createdAt: input.registeredAt,
  };
}

export async function publishIdentityDocument(
  document: AgentIdentityDocument,
): Promise<IdentityUploadRecord> {
  const json = JSON.stringify(document, null, 2);
  if (process.env.PINATA_JWT) {
    return uploadViaPinataJwt(json);
  }

  if (process.env.PINATA_API_KEY && process.env.PINATA_API_SECRET) {
    return uploadViaPinataKeypair(json);
  }

  if (process.env.IPFS_HTTP_ENDPOINT) {
    return uploadViaGenericEndpoint(json);
  }

  return buildMockUpload(json);
}

async function uploadViaPinataJwt(payload: string): Promise<IdentityUploadRecord> {
  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.PINATA_JWT}`,
    },
    body: JSON.stringify({
      pinataMetadata: {
        name: "delegent-agent-identity.json",
      },
      pinataContent: JSON.parse(payload),
    }),
  });

  if (!response.ok) {
    throw new Error(`Pinata upload failed: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as UploadResponse;
  const cid = data.IpfsHash ?? data.cid;
  if (!cid) {
    throw new Error("Pinata upload succeeded without returning a CID.");
  }

  return {
    uri: `ipfs://${cid}`,
    gatewayUrl: buildGatewayUrl(cid),
    cid,
    source: "pinata",
  };
}

async function uploadViaPinataKeypair(payload: string): Promise<IdentityUploadRecord> {
  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      pinata_api_key: process.env.PINATA_API_KEY ?? "",
      pinata_secret_api_key: process.env.PINATA_API_SECRET ?? "",
    },
    body: JSON.stringify({
      pinataMetadata: {
        name: "delegent-agent-identity.json",
      },
      pinataContent: JSON.parse(payload),
    }),
  });

  if (!response.ok) {
    throw new Error(`Pinata upload failed: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as UploadResponse;
  const cid = data.IpfsHash ?? data.cid;
  if (!cid) {
    throw new Error("Pinata upload succeeded without returning a CID.");
  }

  return {
    uri: `ipfs://${cid}`,
    gatewayUrl: buildGatewayUrl(cid),
    cid,
    source: "pinata",
  };
}

async function uploadViaGenericEndpoint(payload: string): Promise<IdentityUploadRecord> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };

  if (process.env.IPFS_AUTH_TOKEN) {
    headers.authorization = `Bearer ${process.env.IPFS_AUTH_TOKEN}`;
  }

  const response = await fetch(process.env.IPFS_HTTP_ENDPOINT ?? "", {
    method: "POST",
    headers,
    body: payload,
  });

  if (!response.ok) {
    throw new Error(`IPFS upload failed: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as UploadResponse;
  const cid = data.IpfsHash ?? data.cid;
  if (!cid) {
    throw new Error("IPFS endpoint upload succeeded without returning a CID.");
  }

  return {
    uri: `ipfs://${cid}`,
    gatewayUrl: buildGatewayUrl(cid),
    cid,
    source: "generic-ipfs",
  };
}

function buildMockUpload(payload: string): IdentityUploadRecord {
  const digest = createHash("sha256").update(payload).digest("hex");
  const cid = `mock-${digest.slice(0, 32)}`;
  return {
    uri: `ipfs://${cid}`,
    gatewayUrl: buildGatewayUrl(cid),
    cid,
    source: "mock",
  };
}

function buildGatewayUrl(cid: string) {
  const gateway = process.env.IPFS_GATEWAY ?? "https://gateway.pinata.cloud/ipfs";
  return `${gateway.replace(/\/$/, "")}/${cid}`;
}

function resolveAgentUriToHttp(agentUri: string) {
  if (agentUri.startsWith("http://") || agentUri.startsWith("https://")) {
    return agentUri;
  }

  if (!agentUri.startsWith("ipfs://")) {
    return undefined;
  }

  const withoutScheme = agentUri.slice("ipfs://".length);
  const [cid, ...rest] = withoutScheme.split("/");
  if (!cid) {
    return undefined;
  }

  const suffix = rest.length ? `/${rest.join("/")}` : "";
  return `${buildGatewayUrl(cid)}${suffix}`;
}

export async function fetchIdentityDocumentFromUri(agentUri?: string) {
  if (!agentUri) {
    return undefined;
  }

  const uri = resolveAgentUriToHttp(agentUri);
  if (!uri) {
    return undefined;
  }

  try {
    const response = await fetch(uri, {
      headers: {
        accept: "application/json",
      },
    });

    if (!response.ok) {
      return undefined;
    }

    const body = (await response.json()) as unknown;
    if (!body || typeof body !== "object") {
      return undefined;
    }

    return body as Record<string, unknown>;
  } catch {
    return undefined;
  }
}
