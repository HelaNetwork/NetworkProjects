import {
  createPublicClient,
  createWalletClient,
  defineChain,
  encodeFunctionData,
  http,
  keccak256,
  parseAbi,
  toBytes,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { loadEnv } from "./load-env.js";
import type {
  Address,
  AgentIdentityRecord,
  AgentWalletProof,
  ExecutionApproval,
  ExecutionResult,
  FeedbackRecord,
  FeedbackSummary,
  ReputationRecord,
  StrategyProposal,
} from "./types.js";
import agentRegistryArtifact from "../backend/abi/AgentRegistry.json" with { type: "json" };
import strategyExecutorArtifact from "../backend/abi/StrategyExecutor.json" with { type: "json" };
import multicallExecutorArtifact from "../backend/abi/MulticallExecutor.json" with { type: "json" };
loadEnv();

type AgentRegistryRecord = {
  creditScore: bigint;
  totalTasks: bigint;
  successfulTasks: bigint;
  stake: bigint;
  active: boolean;
  metadataURI: string;
};

const agentRegistryAbi = agentRegistryArtifact.abi;
const agentRegisteredEventTopic = keccak256(toBytes("AgentRegistered(uint256,address,uint256)"));

const strategyExecutorAbi = strategyExecutorArtifact.abi;

const vaultFactoryAbi = parseAbi([
  "function getVault(address user) view returns (address)",
  "function getVaultBalance(address user) view returns (uint256)",
]);

const userVaultAbi = parseAbi([
  "error Unauthorized()",
  "error InsufficientBalance(uint256 requested, uint256 available)",
  "function executer() view returns (address)",
  "function delegateExecute(address executer, bytes data) returns (bytes)",
  "function deposit(address token, uint256 amount)",
  "function setExecuter(address executer)",
]);

const erc721TransferAbi = parseAbi([
  "function transferFrom(address from, address to, uint256 tokenId)",
]);

const erc20Abi = parseAbi([
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
]);

const aavePoolAbi = parseAbi([
  "function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)",
  "function withdraw(address asset, uint256 amount, address to) returns (uint256)",
]);

const multicallAbi = multicallExecutorArtifact.abi;

const defaultRpcUrl = process.env.RPC_URL ?? "https://sepolia.base.org";
const helaRpcUrl = process.env.HELA_RPC_URL ?? "https://testnet-rpc.helachain.com";

const helaTestnet = defineChain({
  id: 666888,
  name: "HeLa Testnet",
  nativeCurrency: {
    name: "HLUSD",
    symbol: "HLUSD",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [helaRpcUrl],
    },
  },
  blockExplorers: {
    default: {
      name: "HeLa Explorer",
      url: "https://testnet-blockexplorer.helachain.com",
    },
  },
});

const defaultAddresses = {
  identityRegistry: (process.env.AGENT_REGISTRY_ADDRESS ??
    process.env.ERC8004_IDENTITY_REGISTRY_ADDRESS ??
    process.env.ERC8004_REGISTRY_ADDRESS ??
    "0x8004A818BFB912233c491871b3d84c89A494BD9e") as Address,
  reputationRegistry: (process.env.AGENT_REGISTRY_ADDRESS ??
    process.env.ERC8004_REPUTATION_REGISTRY_ADDRESS ??
    process.env.ERC8004_REGISTRY_ADDRESS ??
    "0x8004A818BFB912233c491871b3d84c89A494BD9e") as Address,
  vaultFactory: (process.env.VAULT_FACTORY_ADDRESS ??
    "0x560cf9F6201B0b764344e7B2Ef9c96DD45A5c7c7") as Address,
  multicallExecutor: (process.env.MULTICALL_EXECUTOR_ADDRESS ??
    "0x1d0E5eddBD971d042752C8f231370aac46c71936") as Address,
  strategyExecutor: (process.env.STRATEGY_EXECUTOR_ADDRESS ??
    "0xE832e1EA746ab162dEDc62d06137363bDe9E567A") as Address,
};

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(defaultRpcUrl),
});

const registryPublicClient = createPublicClient({
  chain: helaTestnet,
  transport: http(helaRpcUrl),
});

function getWalletClient() {
  const privateKey = process.env.RELAYER_PRIVATE_KEY as `0x${string}` | undefined;
  if (!privateKey) {
    return null;
  }

  return createWalletClient({
    account: privateKeyToAccount(privateKey),
    chain: baseSepolia,
    transport: http(defaultRpcUrl),
  });
}

function getRegistryWalletClient() {
  const privateKey = process.env.RELAYER_PRIVATE_KEY as `0x${string}` | undefined;
  if (!privateKey) {
    return null;
  }

  return createWalletClient({
    account: privateKeyToAccount(privateKey),
    chain: helaTestnet,
    transport: http(helaRpcUrl),
  });
}

async function getFreshRegistryNonce(address: Address) {
  return registryPublicClient.getTransactionCount({
    address,
    blockTag: "pending",
  });
}

function isInvalidNonceError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.toLowerCase().includes("invalid nonce");
}

async function writeRegistryContractWithFreshNonce(input: {
  walletClient: NonNullable<ReturnType<typeof getRegistryWalletClient>>;
  abi: readonly unknown[];
  functionName: string;
  args?: readonly unknown[];
  value?: bigint;
}) {
  const nonce = await getFreshRegistryNonce(input.walletClient.account.address);
  const requestConfig = {
    address: defaultAddresses.identityRegistry,
    abi: input.abi,
    functionName: input.functionName,
    args: input.args,
    account: input.walletClient.account,
    value: input.value ?? 0n,
    nonce,
  } as const;

  try {
    const { request } = await registryPublicClient.simulateContract(requestConfig as never);
    return await input.walletClient.writeContract(request as never);
  } catch (error) {
    if (!isInvalidNonceError(error)) {
      throw error;
    }

    const retryNonce = await getFreshRegistryNonce(input.walletClient.account.address);
    return input.walletClient.writeContract({
      address: defaultAddresses.identityRegistry,
      abi: input.abi,
      functionName: input.functionName,
      args: input.args,
      account: input.walletClient.account,
      value: input.value ?? 0n,
      nonce: retryNonce,
    } as never);
  }
}

function toTier(score: bigint): ReputationRecord["tier"] {
  if (score >= 8_000n) return "elite";
  if (score >= 5_000n) return "trusted";
  return "rookie";
}

export function getContractAddresses() {
  return defaultAddresses;
}

export function hasRelayerSigner() {
  return Boolean(getWalletClient());
}

export function getRelayerAddress() {
  return getWalletClient()?.account.address;
}

export async function registerIdentity(
  agentAddress: Address,
  agentUri?: string,
  metadata?: Record<string, unknown>,
) {
  const walletClient = getRegistryWalletClient();
  const simulatedRegistryAgentId = syntheticAgentId(agentAddress);

  if (!walletClient) {
    return {
      status: "simulated" as const,
      txHash: syntheticHash(`register:${agentAddress}`),
      registryAgentId: simulatedRegistryAgentId,
      notes: ["RELAYER_PRIVATE_KEY missing, identity registration simulated locally."],
    };
  }

  const hash = await writeRegistryContractWithFreshNonce({
    walletClient,
    abi: agentRegistryAbi,
    functionName: "register",
    value: 0n,
  });

  const registryAgentId = await deriveAgentIdFromReceipt(hash, simulatedRegistryAgentId);
  return {
    status: "relayed" as const,
    txHash: hash,
    registryAgentId,
    notes: [
      "Identity registration submitted to the AgentRegistry contract.",
      "Because this registry mints an NFT on register(), the transaction signer becomes the onchain token owner.",
      "After registration, call transfer_agent_token on HeLa Testnet to transfer the minted token from the relayer wallet to the target agent address.",
      ...(agentUri ? ["Call setAgentURI next to publish the offchain profile URI."] : []),
      ...(metadata && Object.keys(metadata).length > 0
        ? ["Structured metadata is stored in the offchain identity document rather than onchain key-value slots."]
        : []),
    ],
  };
}

export async function resolveAgentId(agentAddress: Address, fallback?: string) {
  return fallback ?? syntheticAgentId(agentAddress);
}

export async function setAgentURI(registryAgentId: string, agentUri: string) {
  const walletClient = getRegistryWalletClient();
  if (!walletClient) {
    return {
      status: "simulated" as const,
      txHash: syntheticHash(`set-uri:${registryAgentId}:${agentUri}`),
      notes: ["RELAYER_PRIVATE_KEY missing, agent URI write simulated locally."],
    };
  }

  const hash = await writeRegistryContractWithFreshNonce({
    walletClient,
    abi: agentRegistryAbi,
    functionName: "setAgentURI",
    args: [BigInt(registryAgentId), agentUri],
  });

  return {
    status: "relayed" as const,
    txHash: hash,
    notes: [`Agent URI written to the AgentRegistry for ${registryAgentId}.`],
  };
}

export async function transferAgentTokenOwnership(registryAgentId: string, to: Address) {
  const walletClient = getRegistryWalletClient();
  if (!walletClient) {
    return {
      status: "simulated" as const,
      txHash: syntheticHash(`transfer-agent-token:${registryAgentId}:${to}`),
      notes: ["RELAYER_PRIVATE_KEY missing, ownership transfer simulated locally."],
    };
  }

  const tokenId = BigInt(registryAgentId);
  const currentOwner = (await registryPublicClient.readContract({
    address: defaultAddresses.identityRegistry,
    abi: agentRegistryAbi,
    functionName: "ownerOf",
    args: [tokenId],
  })) as Address;

  if (currentOwner.toLowerCase() === to.toLowerCase()) {
    return {
      status: "already-set" as const,
      txHash: syntheticHash(`already-owned:${registryAgentId}:${to}`),
      notes: ["Agent token already owned by target agent address."],
    };
  }

  if (currentOwner.toLowerCase() !== walletClient.account.address.toLowerCase()) {
    return {
      status: "skipped" as const,
      txHash: syntheticHash(`owner-mismatch:${registryAgentId}:${to}`),
      notes: [
        `Relayer cannot transfer token ${registryAgentId} because current owner is ${currentOwner}.`,
      ],
    };
  }

  const hash = await writeRegistryContractWithFreshNonce({
    walletClient,
    abi: erc721TransferAbi,
    functionName: "transferFrom",
    args: [currentOwner, to, tokenId],
  });

  return {
    status: "relayed" as const,
    txHash: hash,
    notes: [`Transferred agent token ${registryAgentId} to ${to}.`],
  };
}

export async function setAgentWallet(registryAgentId: string, proof: AgentWalletProof) {
  return {
    status: "skipped" as const,
    txHash: syntheticHash(`set-wallet-unsupported:${registryAgentId}:${proof.wallet}`),
    notes: ["AgentRegistry does not expose onchain wallet verification. This field remains offchain only."],
  };
}

export async function setAgentMetadata(registryAgentId: string, key: string, value: string) {
  return {
    status: "skipped" as const,
    txHash: syntheticHash(`metadata-unsupported:${registryAgentId}:${key}:${value}`),
    notes: [
      `AgentRegistry does not support onchain metadata key '${key}'. Use the offchain identity document and setAgentURI(tokenId, string).`,
    ],
  };
}

export async function getAgentMetadata(registryAgentId: string, key: string) {
  try {
    const tokenId = BigInt(registryAgentId);
    const agent = (await registryPublicClient.readContract({
      address: defaultAddresses.identityRegistry,
      abi: agentRegistryAbi,
      functionName: "getAgent",
      args: [tokenId],
    })) as AgentRegistryRecord;
    const successRate = (await registryPublicClient.readContract({
      address: defaultAddresses.identityRegistry,
      abi: agentRegistryAbi,
      functionName: "getSuccessRate",
      args: [tokenId],
    })) as bigint;

    const value =
      key === "uri" || key === "metadataURI" || key === "agentUri"
        ? agent.metadataURI
        : key === "active"
          ? String(agent.active)
          : key === "stake"
            ? agent.stake.toString()
          : key === "creditScore"
            ? agent.creditScore.toString()
            : key === "successRate"
              ? successRate.toString()
            : key === "successfulTasks"
                ? agent.successfulTasks.toString()
                : key === "totalTasks"
                  ? agent.totalTasks.toString()
                  : "";

    return {
      registryAgentId,
      key,
      value,
      source: "onchain" as const,
    };
  } catch {
    return {
      registryAgentId,
      key,
      value: "0x",
      source: "mock" as const,
    };
  }
}

export async function getIdentityRecord(
  agentAddress: Address,
  registryAgentId = syntheticAgentId(agentAddress),
): Promise<AgentIdentityRecord> {
  try {
    const tokenId = BigInt(registryAgentId);
    const agent = (await registryPublicClient.readContract({
      address: defaultAddresses.identityRegistry,
      abi: agentRegistryAbi,
      functionName: "getAgent",
      args: [tokenId],
    })) as AgentRegistryRecord;
    const owner = (await registryPublicClient.readContract({
      address: defaultAddresses.identityRegistry,
      abi: agentRegistryAbi,
      functionName: "ownerOf",
      args: [tokenId],
    })) as Address;

    return {
      agentAddress: owner,
      registryAgentId,
      agentUri: agent.metadataURI || undefined,
      metadata: {
        active: agent.active,
        stake: agent.stake.toString(),
        creditScore: agent.creditScore.toString(),
        totalTasks: agent.totalTasks.toString(),
        successfulTasks: agent.successfulTasks.toString(),
      },
      source: "onchain",
    };
  } catch {
    return {
      agentAddress,
      registryAgentId,
      source: "mock",
    };
  }
}

async function deriveAgentIdFromReceipt(hash: `0x${string}`, fallback: string) {
  try {
    const receipt = await registryPublicClient.waitForTransactionReceipt({ hash });
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== defaultAddresses.identityRegistry.toLowerCase()) {
        continue;
      }

      if (log.topics[0]?.toLowerCase() !== agentRegisteredEventTopic.toLowerCase()) {
        continue;
      }

      const encodedTokenId = log.topics[1];
      if (encodedTokenId) {
        return BigInt(encodedTokenId).toString();
      }
    }
  } catch {
    return fallback;
  }

  return fallback;
}

export async function getScore(agentAddress: Address, registryAgentId?: string): Promise<ReputationRecord> {
  if (!registryAgentId) {
    const score = 5_000n;
    return {
      agentAddress,
      registryAgentId,
      score,
      tier: toTier(score),
      source: "mock",
    };
  }

  try {
    const score = (await registryPublicClient.readContract({
      address: defaultAddresses.identityRegistry,
      abi: agentRegistryAbi,
      functionName: "getScore",
      args: [BigInt(registryAgentId)],
    })) as bigint;

    return {
      agentAddress,
      registryAgentId,
      score,
      tier: toTier(score),
      source: "onchain",
    };
  } catch {
    const score = 5_000n;
    return {
      agentAddress,
      registryAgentId,
      score,
      tier: toTier(score),
      source: "mock",
    };
  }
}

export async function giveFeedback(input: {
  registryAgentId: string;
  score: number;
  category: string;
  comment?: string;
}) {
  return {
    status: "simulated" as const,
    txHash: syntheticHash(
      `feedback-offchain:${input.registryAgentId}:${input.score}:${input.category}:${input.comment ?? ""}`,
    ),
    notes: ["AgentRegistry has no onchain feedback methods. Feedback remains backend-managed."],
  };
}

export async function getFeedbackSummary(registryAgentId: string): Promise<FeedbackSummary> {
  return {
    registryAgentId,
    averageScore: 0,
    totalFeedback: 0,
    positiveFeedback: 0,
    negativeFeedback: 0,
    source: "mock",
  };
}

export async function readAllFeedback(registryAgentId: string): Promise<FeedbackRecord[]> {
  return [];
}

export async function recordSuccess(agentAddress: Address) {
  const walletClient = getRegistryWalletClient();
  const registryAgentId = await resolveAgentId(agentAddress);
  if (!walletClient) {
    return {
      status: "simulated" as const,
      txHash: syntheticHash(`success:${registryAgentId}`),
      notes: ["RELAYER_PRIVATE_KEY missing, reputation update simulated locally."],
    };
  }

  const hash = await writeRegistryContractWithFreshNonce({
    walletClient,
    abi: agentRegistryAbi,
    functionName: "updateScore",
    args: [BigInt(registryAgentId), true],
  });

  return {
    status: "relayed" as const,
    txHash: hash,
    notes: ["Agent score updated on AgentRegistry with a successful execution."],
  };
}

export async function getVault(userAddress: Address): Promise<Address> {
  return publicClient.readContract({
    address: defaultAddresses.vaultFactory,
    abi: vaultFactoryAbi,
    functionName: "getVault",
    args: [userAddress],
  });
}

export async function getVaultBalance(userAddress: Address): Promise<bigint> {
  try {
    return await publicClient.readContract({
      address: defaultAddresses.vaultFactory,
      abi: vaultFactoryAbi,
      functionName: "getVaultBalance",
      args: [userAddress],
    });
  } catch {
    return 0n;
  }
}

export async function getVaultExecuter(vaultAddress: Address): Promise<Address> {
  return publicClient.readContract({
    address: vaultAddress,
    abi: userVaultAbi,
    functionName: "executer",
  });
}

export async function getErc20Balance(tokenAddress: Address, ownerAddress: Address): Promise<bigint> {
  try {
    return await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [ownerAddress],
    });
  } catch {
    return 0n;
  }
}

export async function getErc20Decimals(tokenAddress: Address): Promise<number> {
  try {
    return await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "decimals",
    }) as number;
  } catch {
    // USDC default on Base Sepolia
    return 6;
  }
}

export async function deposit(vaultAddress: Address, token: Address, amount: bigint) {
  const walletClient = getWalletClient();
  if (!walletClient) {
    return {
      status: "simulated" as const,
      txHash: syntheticHash(`deposit:${vaultAddress}:${token}:${amount}`),
      notes: ["RELAYER_PRIVATE_KEY missing, deposit simulated locally."],
    };
  }

  const hash = await walletClient.writeContract({
    address: vaultAddress,
    abi: userVaultAbi,
    functionName: "deposit",
    args: [token, amount],
    account: walletClient.account,
  });

  return {
    status: "relayed" as const,
    txHash: hash,
    notes: ["Deposit submitted to UserVault."],
  };
}

export async function signExecutionApproval(input: {
  vault: string;
  proposalId: string;
  signer: Address;
  nonce?: bigint;
  deadline?: bigint;
}): Promise<ExecutionApproval> {
  const nonce = input.nonce ?? BigInt(Date.now());
  const deadline = input.deadline ?? BigInt(Math.floor(Date.now() / 1000) + 3600);
  const walletClient = getWalletClient();

  if (!walletClient) {
    return {
      vault: input.vault,
      proposalId: input.proposalId,
      signer: input.signer,
      nonce,
      deadline,
      signature: syntheticHash(
        `approval:${input.vault}:${input.proposalId}:${input.signer}:${nonce}:${deadline}`,
      ),
    };
  }

  const signature = await walletClient.signTypedData({
    account: walletClient.account,
    domain: {
      name: "DelegentApproval",
      version: "1",
      chainId: baseSepolia.id,
      verifyingContract: isAddress(input.vault) ? input.vault : defaultAddresses.strategyExecutor,
    },
    primaryType: "StrategyApproval",
    types: {
      StrategyApproval: [
        { name: "vault", type: "string" },
        { name: "proposalId", type: "string" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    message: {
      vault: input.vault,
      proposalId: input.proposalId,
      nonce,
      deadline,
    },
  });

  return {
    vault: input.vault,
    proposalId: input.proposalId,
    signer: walletClient.account.address,
    nonce,
    deadline,
    signature,
  };
}

export async function executeStrategy(
  proposal: StrategyProposal
): Promise<ExecutionResult> {
  const walletClient = getWalletClient();

  // 👉 If no relayer key → simulate
  if (!walletClient) {
    return {
      proposalId: proposal.id,
      vault: proposal.vault,
      status: "simulated",
      txHash: syntheticHash(`execute:${proposal.id}`),
      executionMode: "mock",
      notes: ["RELAYER_PRIVATE_KEY missing, execution simulated locally."],
    };
  }

  try {
    console.log("Trying to Execute")
    const hash = await walletClient.writeContract({
      address: defaultAddresses.strategyExecutor,
      abi: strategyExecutorAbi,
      functionName: "executeStrategy",
      args: [
        {
          vault: proposal.vault as Address,
          agent: proposal.proposerAddress,
          calls: proposal.calls.map((call) => ({
            target: call.target,
            data: call.data,
            value: BigInt(call.value),
          })),
        },
      ],
      account: walletClient.account,
    });
    console.log(`Execute Strategy hash :`, hash)
    return {
      proposalId: proposal.id,
      vault: proposal.vault,
      status: "relayed",
      txHash: hash,
      executionMode: "strategy-executor",
      amountDeployed:
        proposal.protocolPlan.amountMode === "all" ? "all" : undefined,
      notes: ["StrategyExecutor relay submitted on-chain."],
    };
  } catch (error) {
  

    return {
      proposalId: proposal.id,
      vault: proposal.vault,
      status: "failed",
      txHash: `0x00`,
      executionMode: "strategy-executor",
      notes: [`Execution failed: ${formatError(error)}`],
    };
  }
}
export async function setVaultExecuter(vaultAddress: Address, executerAddress: Address) {
  const ownerPrivateKey = process.env.VAULT_OWNER_PRIVATE_KEY as `0x${string}` | undefined;
  if (!ownerPrivateKey) {
    return {
      status: "simulated" as const,
      txHash: syntheticHash(`setExecuter:${vaultAddress}:${executerAddress}`),
      notes: ["VAULT_OWNER_PRIVATE_KEY missing, vault authorization simulated locally."],
    };
  }

  const ownerClient = createWalletClient({
    account: privateKeyToAccount(ownerPrivateKey),
    chain: baseSepolia,
    transport: http(defaultRpcUrl),
  });

  const hash = await ownerClient.writeContract({
    address: vaultAddress,
    abi: userVaultAbi,
    functionName: "setExecuter",
    args: [executerAddress],
    account: ownerClient.account,
  });

  return {
    status: "relayed" as const,
    txHash: hash,
    notes: ["UserVault executer updated on-chain."],
  };
}

export function buildAaveSupplyCalls(input: {
  vault: Address;
  poolAddress: Address;
  assetAddress: Address;
  amount: bigint;
  referralCode: number;
}) {
  const approveData = encodeFunctionData({
    abi: erc20Abi,
    functionName: "approve",
    args: [input.poolAddress, input.amount],
  });

  const supplyData = encodeFunctionData({
    abi: aavePoolAbi,
    functionName: "supply",
    args: [input.assetAddress, input.amount, input.vault, input.referralCode],
  });

  return [
    {
      target: input.assetAddress,
      data: approveData,
      value: "0",
      note: "Approve the Aave pool to pull the vault asset balance.",
    },
    {
      target: input.poolAddress,
      data: supplyData,
      value: "0",
      note: "Supply the vault asset balance into Aave V3.",
    },
  ] satisfies StrategyProposal["calls"];
}

export function buildAaveWithdrawCalls(input: {
  vault: Address;
  poolAddress: Address;
  assetAddress: Address;
}) {
  const withdrawData = encodeFunctionData({
    abi: aavePoolAbi,
    functionName: "withdraw",
    args: [input.assetAddress, 2n ** 256n - 1n, input.vault],
  });

  return [
    {
      target: input.poolAddress,
      data: withdrawData,
      value: "0",
      note: "Withdraw the full available WETH position from Aave V3 back to the vault.",
    },
  ] satisfies StrategyProposal["calls"];
}

export function isAddress(value: string): value is Address {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function syntheticHash(seed: string): `0x${string}` {
  return keccak256(toBytes(seed));
}

function syntheticAgentId(agentAddress: Address) {
  return BigInt(keccak256(toBytes(agentAddress.toLowerCase()))).toString();
}

function formatError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
