import { BrowserProvider, Contract, JsonRpcProvider, formatEther, formatUnits, parseUnits } from "ethers";
import { ChainIntegrationError, normalizeChainError } from "./chainErrors";

export type AgentType =
  | "trading"
  | "farming"
  | "scheduling"
  | "rebalancing"
  | "content"
  | "business";

export type AgentStruct = {
  id: bigint;
  name: string;
  description: string;
  agentType: string;
  priceHLUSD: bigint;
  developer: string;
  isActive: boolean;
  configSchema: string;
};

export type TxResult = {
  hash: string;
  blockNumber: number | null;
  status: "success" | "reverted" | "unknown";
};

export type ActivationEventRecord = {
  activationId: number;
  agentId: number;
  buyer: string;
  config: string;
  paidAmount: bigint;
  timestamp: number;
  txHash: string;
};

export type ExecutionEventRecord = {
  agentId: number;
  user: string;
  action: string;
  result: string;
  timestamp: number;
  txHash: string;
};

const AGENT_REGISTRY_ABI = [
  "function publishAgent(string name,string description,string agentType,uint256 priceHLUSD,string configSchema) returns (uint256)",
  "function getAgent(uint256 id) view returns ((uint256 id,string name,string description,string agentType,uint256 priceHLUSD,address developer,bool isActive,string configSchema))",
  "function getAllAgents() view returns ((uint256 id,string name,string description,string agentType,uint256 priceHLUSD,address developer,bool isActive,string configSchema)[])",
  "function setAgentActive(uint256 id, bool active)"
];

const AGENT_ESCROW_ABI = [
  "function activateAgent(uint256 agentId, string userConfig)",
  "function getActivationCountForAgent(uint256 agentId) view returns (uint256)",
  "function getUserActiveAgents(address user) view returns (uint256[] memory)",
  "function getUserActiveAgentCount(address user) view returns (uint256)",
  "function isAgentActivatedByUser(address user, uint256 agentId) view returns (bool)",
  "event AgentActivated(uint256 indexed activationId, uint256 indexed agentId, address indexed buyer, string config, uint256 paidAmount, uint256 timestamp)"
];

const AGENT_EXECUTOR_ABI = [
  "function logExecution(uint256 agentId, address user, string action, string result)",
  "event ExecutionLogged(uint256 indexed agentId, address indexed user, string action, string result, uint256 timestamp)"
];

const ERC20_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const getRpcUrl = () =>
  process.env.NEXT_PUBLIC_HELA_RPC ||
  process.env.NEXT_PUBLIC_HELA_RPC_URL ||
  "https://testnet-rpc.helachain.com";

const getAddresses = () => {
  const registry = process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS;
  const escrow = process.env.NEXT_PUBLIC_AGENT_ESCROW_ADDRESS;
  const executor = process.env.NEXT_PUBLIC_AGENT_EXECUTOR_ADDRESS;

  if (!registry || !escrow || !executor) {
    throw new ChainIntegrationError("missing_env", "Missing NEXT_PUBLIC contract addresses in env");
  }

  return { registry, escrow, executor };
};

export function getPublicContractAddresses() {
  return getAddresses();
}

export const getReadProvider = () => new JsonRpcProvider(getRpcUrl());

function normalizeAgent(agent: {
  id: bigint;
  name: string;
  description: string;
  agentType: string;
  priceHLUSD: bigint;
  developer: string;
  isActive: boolean;
  configSchema: string;
}): AgentStruct {
  return {
    id: BigInt(agent.id),
    name: String(agent.name),
    description: String(agent.description),
    agentType: String(agent.agentType),
    priceHLUSD: BigInt(agent.priceHLUSD),
    developer: String(agent.developer),
    isActive: Boolean(agent.isActive),
    configSchema: String(agent.configSchema)
  };
}

function toTxResult(receipt: {
  hash: string;
  blockNumber: number | null;
  status?: number | null;
}): TxResult {
  const status =
    receipt.status === 1 ? "success" : receipt.status === 0 ? "reverted" : "unknown";

  return {
    hash: receipt.hash,
    blockNumber: receipt.blockNumber,
    status
  };
}

export async function getSignerProvider() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new ChainIntegrationError("wallet_not_found", "Wallet provider not found");
  }
  const provider = new BrowserProvider(window.ethereum as never);
  await provider.send("eth_requestAccounts", []);
  return provider;
}

export async function getRegistryContract(write = false) {
  const { registry } = getAddresses();
  if (!write) {
    return new Contract(registry, AGENT_REGISTRY_ABI, getReadProvider());
  }
  const provider = await getSignerProvider();
  return new Contract(registry, AGENT_REGISTRY_ABI, await provider.getSigner());
}

export async function getEscrowContract(write = false) {
  const { escrow } = getAddresses();
  if (!write) {
    return new Contract(escrow, AGENT_ESCROW_ABI, getReadProvider());
  }
  const provider = await getSignerProvider();
  return new Contract(escrow, AGENT_ESCROW_ABI, await provider.getSigner());
}

export async function getExecutorContract(write = false) {
  const { executor } = getAddresses();
  if (!write) {
    return new Contract(executor, AGENT_EXECUTOR_ABI, getReadProvider());
  }
  const provider = await getSignerProvider();
  return new Contract(executor, AGENT_EXECUTOR_ABI, await provider.getSigner());
}

export async function publishAgent(input: {
  name: string;
  description: string;
  agentType: AgentType;
  price: string;
  configSchema: string;
}): Promise<TxResult> {
  try {
    const registry = await getRegistryContract(true);
    const tx = await registry.publishAgent(
      input.name,
      input.description,
      input.agentType,
      parseUnits(input.price, 18),
      input.configSchema
    );
    const receipt = await tx.wait();
    return toTxResult(receipt);
  } catch (error) {
    throw normalizeChainError(error, "Failed to publish agent");
  }
}

export async function activateAgent(agentId: number, userConfig: string): Promise<TxResult> {
  try {
    const escrow = await getEscrowContract(true);
    const tx = await escrow.activateAgent(agentId, userConfig);
    const receipt = await tx.wait();
    return toTxResult(receipt);
  } catch (error) {
    throw normalizeChainError(error, "Failed to activate agent");
  }
}

export async function fetchAllAgents(): Promise<AgentStruct[]> {
  try {
    const registry = await getRegistryContract(false);
    const agents = (await registry.getAllAgents()) as AgentStruct[];
    return agents.map((agent) => normalizeAgent(agent));
  } catch (error) {
    throw normalizeChainError(error, "Failed to fetch agents");
  }
}

export async function fetchAgentById(id: number): Promise<AgentStruct> {
  try {
    const registry = await getRegistryContract(false);
    const agent = (await registry.getAgent(id)) as AgentStruct;
    return normalizeAgent(agent);
  } catch (error) {
    throw normalizeChainError(error, "Failed to fetch agent details");
  }
}

export async function fetchAgentActivationCount(agentId: number): Promise<number> {
  try {
    const escrow = await getEscrowContract(false);
    const count = (await escrow.getActivationCountForAgent(agentId)) as bigint;
    return Number(count);
  } catch (error) {
    throw normalizeChainError(error, "Failed to fetch activation count");
  }
}

export async function fetchUserActiveAgentIds(userAddress: string): Promise<number[]> {
  try {
    const escrow = await getEscrowContract(false);
    const ids = (await escrow.getUserActiveAgents(userAddress)) as bigint[];
    return ids.map((id) => Number(id));
  } catch (error) {
    throw normalizeChainError(error, "Failed to fetch active agents for user");
  }
}

export async function isAgentActivatedByUser(userAddress: string, agentId: number): Promise<boolean> {
  try {
    const escrow = await getEscrowContract(false);
    return (await escrow.isAgentActivatedByUser(userAddress, agentId)) as boolean;
  } catch (error) {
    throw normalizeChainError(error, "Failed to check user activation status");
  }
}

export async function setAgentActive(id: number, active: boolean): Promise<TxResult> {
  try {
    const registry = await getRegistryContract(true);
    const tx = await registry.setAgentActive(id, active);
    const receipt = await tx.wait();
    return toTxResult(receipt);
  } catch (error) {
    throw normalizeChainError(error, "Failed to update agent status");
  }
}

export async function logExecution(
  agentId: number,
  user: string,
  action: string,
  result: string
): Promise<TxResult> {
  try {
    const executor = await getExecutorContract(true);
    const tx = await executor.logExecution(agentId, user, action, result);
    const receipt = await tx.wait();
    return toTxResult(receipt);
  } catch (error) {
    throw normalizeChainError(error, "Failed to log execution");
  }
}

export async function fetchHLUSDBalanceForAddress(address: string): Promise<string> {
  try {
    const tokenAddress = process.env.NEXT_PUBLIC_HLUSD_ADDRESS;
    if (!tokenAddress) {
      throw new ChainIntegrationError("missing_env", "Missing NEXT_PUBLIC_HLUSD_ADDRESS");
    }

    const token = new Contract(tokenAddress, ERC20_ABI, getReadProvider());
    const [balance, decimals] = await Promise.all([token.balanceOf(address), token.decimals()]);
    return formatUnits(balance, Number(decimals));
  } catch (error) {
    throw normalizeChainError(error, "Failed to fetch HLUSD balance for address");
  }
}

export async function fetchNativeBalanceForAddress(address: string): Promise<string> {
  try {
    const provider = getReadProvider();
    const balance = await provider.getBalance(address);
    return formatEther(balance);
  } catch (error) {
    throw normalizeChainError(error, "Failed to fetch native balance for address");
  }
}

export async function fetchActivationEventsForUser(
  userAddress: string
): Promise<ActivationEventRecord[]> {
  try {
    const escrow = await getEscrowContract(false);
    const filter = escrow.filters.AgentActivated(null, null, userAddress);
    const events = await escrow.queryFilter(filter, 0, "latest");

    return events
      .map((event) => {
        if (!("args" in event)) {
          return null;
        }

        const args = event.args as unknown as {
          activationId: bigint;
          agentId: bigint;
          buyer: string;
          config: string;
          paidAmount: bigint;
          timestamp: bigint;
        };

        return {
          activationId: Number(args.activationId),
          agentId: Number(args.agentId),
          buyer: String(args.buyer),
          config: String(args.config),
          paidAmount: BigInt(args.paidAmount),
          timestamp: Number(args.timestamp),
          txHash: event.transactionHash
        };
      })
      .filter((event): event is ActivationEventRecord => event !== null)
      .sort((left, right) => right.timestamp - left.timestamp);
  } catch (error) {
    throw normalizeChainError(error, "Failed to fetch activation events");
  }
}

export async function fetchExecutionEventsForUser(
  userAddress: string
): Promise<ExecutionEventRecord[]> {
  try {
    const executor = await getExecutorContract(false);
    const filter = executor.filters.ExecutionLogged(null, userAddress);
    const events = await executor.queryFilter(filter, 0, "latest");

    return events
      .map((event) => {
        if (!("args" in event)) {
          return null;
        }

        const args = event.args as unknown as {
          agentId: bigint;
          user: string;
          action: string;
          result: string;
          timestamp: bigint;
        };

        return {
          agentId: Number(args.agentId),
          user: String(args.user),
          action: String(args.action),
          result: String(args.result),
          timestamp: Number(args.timestamp),
          txHash: event.transactionHash
        };
      })
      .filter((event): event is ExecutionEventRecord => event !== null)
      .sort((left, right) => right.timestamp - left.timestamp);
  } catch (error) {
    throw normalizeChainError(error, "Failed to fetch execution events");
  }
}
