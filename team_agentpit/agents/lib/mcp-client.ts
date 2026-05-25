import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";
import { wrapFetchWithPaymentFromConfig } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm";

const mcpUrl = new URL(process.env.MCP_URL ?? "http://localhost:3002/mcp");

export interface AgentLocalX402Signer {
  address: `0x${string}`;
  signTypedData(message: {
    domain: Record<string, unknown>;
    types: Record<string, unknown>;
    primaryType: string;
    message: Record<string, unknown>;
  }): Promise<`0x${string}`>;
}

export interface AgentPaymentOverrides {
  x402Network?: `${string}:${string}`;
  x402LocalSigner?: AgentLocalX402Signer;
  x402Signer?: {
    address: `0x${string}`;
    endpoint: string;
    authToken?: string;
  };
}

const agentPaymentRegistry = new Map<string, AgentPaymentOverrides>();

export function setAgentPaymentConfig(agentId: string, config: AgentPaymentOverrides) {
  agentPaymentRegistry.set(agentId, config);
}

export function setAgentPaymentSigner(agentId: string, signer: AgentLocalX402Signer) {
  const existing = agentPaymentRegistry.get(agentId) ?? {};
  agentPaymentRegistry.set(agentId, {
    ...existing,
    x402LocalSigner: signer,
  });
}

export function clearAgentPaymentConfig(agentId: string) {
  agentPaymentRegistry.delete(agentId);
}

let clientPromise: Promise<Client> | undefined;

async function getClient() {
  if (!clientPromise) {
    clientPromise = (async () => {
      const transport = new StreamableHTTPClientTransport(mcpUrl);
      const client = new Client({
        name: "delegent-agent-runtime",
        version: "0.1.0",
      });

      await client.connect(transport);
      return client;
    })();
  }

  return clientPromise;
}

export async function callTool<TArgs, TResult>(
  name: string,
  _agentId: string,
  args: TArgs,
  paymentOverrides?: AgentPaymentOverrides,
): Promise<TResult> {
  if (name === "submit_proposal") {
    return submitProposalDirect<TResult>(_agentId, args as Record<string, unknown>, paymentOverrides);
  }

  const client = await getClient();
  const result = await client.callTool({
    name,
    arguments: args as Record<string, unknown>,
  }, CallToolResultSchema);

  const content = (Array.isArray(result.content) ? result.content : []) as Array<{
    type: string;
    text?: string;
  }>;

  if (result.isError) {
    const message = content.find((item) => item.type === "text")?.text ?? `Tool ${name} failed.`;
    throw new Error(message);
  }

  if (result.structuredContent) {
    return result.structuredContent as TResult;
  }

  const text = content.find((item) => item.type === "text")?.text;
  return (text ? JSON.parse(text) : {}) as TResult;
}

async function submitProposalDirect<TResult>(
  agentId: string,
  args: Record<string, unknown>,
  paymentOverrides?: AgentPaymentOverrides,
): Promise<TResult> {
  const effectiveOverrides = {
    ...(agentPaymentRegistry.get(agentId) ?? {}),
    ...(paymentOverrides ?? {}),
  };

  const signer = buildX402Signer(agentId, args, effectiveOverrides);
  if (!signer) {
    throw new Error(
      `Missing x402 signer for ${agentId}. Inject an agent-local signer via setAgentPaymentSigner()/setAgentPaymentConfig(), or provide x402.signer endpoint settings.`,
    );
  }

  const paidFetch = wrapFetchWithPaymentFromConfig(fetch, {
    schemes: [
      {
        network: resolveNetwork(effectiveOverrides.x402Network ?? process.env.X402_PROPOSAL_NETWORK),
        client: new ExactEvmScheme(signer),
      },
    ],
  });

  const response = await paidFetch(`${process.env.BACKEND_URL ?? "http://localhost:3001"}/proposals`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(args),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return (await response.json()) as TResult;
}

function buildX402Signer(
  agentId: string,
  args: Record<string, unknown>,
  paymentOverrides?: AgentPaymentOverrides,
) {
  if (paymentOverrides?.x402LocalSigner) {
    return paymentOverrides.x402LocalSigner;
  }

  if (paymentOverrides?.x402Signer) {
    return createExternalX402Signer(paymentOverrides.x402Signer, { agentId });
  }

  const managedEndpoint = process.env.X402_SIGNER_ENDPOINT;
  const inferredAddress = inferSignerAddress(args);
  if (managedEndpoint && inferredAddress) {
    return createExternalX402Signer(
      {
        address: inferredAddress,
        endpoint: managedEndpoint,
        authToken: process.env.X402_SIGNER_AUTH_TOKEN,
      },
      { agentId },
    );
  }

  return undefined;
}

function inferSignerAddress(args: Record<string, unknown>): `0x${string}` | undefined {
  const proposerAddress = args.proposerAddress;
  if (typeof proposerAddress === "string" && /^0x[a-fA-F0-9]{40}$/.test(proposerAddress)) {
    return proposerAddress as `0x${string}`;
  }

  return undefined;
}

function createExternalX402Signer(signer: {
  address: `0x${string}`;
  endpoint: string;
  authToken?: string;
}, meta?: { agentId?: string }) {
  const endpoint = signer.endpoint;
  const authToken = signer.authToken;

  return {
    address: signer.address,
    async signTypedData(payload: {
      domain: Record<string, unknown>;
      types: Record<string, unknown>;
      primaryType: string;
      message: Record<string, unknown>;
    }) {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(authToken ? { authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          method: "signTypedData",
          agentId: meta?.agentId,
          signerAddress: signer.address,
          payload,
        }),
      });

      if (!response.ok) {
        throw new Error(`External x402 signer failed: ${response.status} ${await response.text()}`);
      }

      const data = (await response.json()) as { signature?: string } | string;
      const signature = typeof data === "string" ? data : data.signature;
      if (!signature?.startsWith("0x")) {
        throw new Error("External x402 signer returned invalid signature format.");
      }

      return signature as `0x${string}`;
    },
  };
}

function resolveNetwork(raw: string | undefined): `${string}:${string}` {
  const value = raw?.trim().toLowerCase();
  if (!value || value === "auto" || value === "any" || value === "eip155:*") {
    return "eip155:*";
  }

  if (value === "base-sepolia" || value === "84532" || value === "eip155:84532") {
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
