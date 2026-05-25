import { BrowserProvider, Contract, formatUnits, parseUnits } from "ethers";
import { ChainIntegrationError, normalizeChainError } from "./chainErrors";

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (payload: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, handler: (...args: any[]) => void) => void;
      removeListener?: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

const HELA_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "666888");
const HELA_CHAIN_ID_HEX = `0x${HELA_CHAIN_ID.toString(16)}`;
const TROVIA_CONNECTED_ACCOUNT_KEY = "trovia.connectedAccount";

const ERC20_ABI = [
  "function approve(address spender, uint256 value) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function transfer(address to, uint256 value) returns (bool)"
];

function getEthereum() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new ChainIntegrationError("wallet_not_found", "MetaMask wallet not found");
  }
  return window.ethereum;
}

function canUseStorage() {
  return typeof window !== "undefined";
}

export function persistConnectedAccount(address: string) {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(TROVIA_CONNECTED_ACCOUNT_KEY, address);
}

export function clearConnectedAccount() {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.removeItem(TROVIA_CONNECTED_ACCOUNT_KEY);
}

export function getPersistedConnectedAccount(): string | null {
  if (!canUseStorage()) {
    return null;
  }
  return window.localStorage.getItem(TROVIA_CONNECTED_ACCOUNT_KEY);
}

export async function connectWallet(): Promise<string> {
  try {
    const ethereum = getEthereum();
    const accounts = (await ethereum.request({ method: "eth_requestAccounts" })) as string[];
    if (!accounts.length) {
      throw new ChainIntegrationError("invalid_input", "No account connected");
    }
    persistConnectedAccount(accounts[0]);
    return accounts[0];
  } catch (error) {
    throw normalizeChainError(error, "Failed to connect wallet");
  }
}

export async function getCurrentAccount(): Promise<string | null> {
  try {
    const ethereum = getEthereum();
    const accounts = (await ethereum.request({ method: "eth_accounts" })) as string[];
    return accounts[0] || null;
  } catch {
    return null;
  }
}

export async function getConnectedAccount(): Promise<string | null> {
  const current = await getCurrentAccount();
  if (!current) {
    clearConnectedAccount();
    return null;
  }

  const persisted = getPersistedConnectedAccount();
  if (!persisted) {
    persistConnectedAccount(current);
    return current;
  }

  if (current.toLowerCase() !== persisted.toLowerCase()) {
    persistConnectedAccount(current);
    return current;
  }

  return current;
}

export async function switchToHeLaNetwork() {
  const ethereum = getEthereum();
  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: HELA_CHAIN_ID_HEX }]
    });
  } catch (error: unknown) {
    const err = error as { code?: number };
    if (err.code === 4902) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: HELA_CHAIN_ID_HEX,
            chainName: "HeLa Testnet",
            nativeCurrency: {
              name: "HLUSD",
              symbol: "HLUSD",
              decimals: 18
            },
            rpcUrls: [process.env.NEXT_PUBLIC_HELA_RPC || "https://testnet-rpc.helachain.com"]
          }
        ]
      });
    } else {
      throw normalizeChainError(error, "Failed to switch wallet network");
    }
  }
}

export async function ensureHeLaNetwork() {
  try {
    const ethereum = getEthereum();
    const currentChainId = (await ethereum.request({ method: "eth_chainId" })) as string;
    if (currentChainId.toLowerCase() !== HELA_CHAIN_ID_HEX.toLowerCase()) {
      await switchToHeLaNetwork();
    }
  } catch (error) {
    throw normalizeChainError(error, "Failed to validate HeLa network");
  }
}

export async function getHLUSDBalance(address: string) {
  try {
    const token = process.env.NEXT_PUBLIC_HLUSD_ADDRESS;
    if (!token) {
      throw new ChainIntegrationError("missing_env", "Missing NEXT_PUBLIC_HLUSD_ADDRESS");
    }

    const provider = new BrowserProvider(getEthereum() as never);
    const contract = new Contract(token, ERC20_ABI, provider);

    const [balance, decimals] = await Promise.all([contract.balanceOf(address), contract.decimals()]);
    return formatUnits(balance, Number(decimals));
  } catch (error) {
    throw normalizeChainError(error, "Failed to fetch HLUSD balance");
  }
}

export async function approveHLUSD(spender: string, amount: bigint) {
  try {
    const token = process.env.NEXT_PUBLIC_HLUSD_ADDRESS;
    if (!token) {
      throw new ChainIntegrationError("missing_env", "Missing NEXT_PUBLIC_HLUSD_ADDRESS");
    }

    const provider = new BrowserProvider(getEthereum() as never);
    const signer = await provider.getSigner();
    const contract = new Contract(token, ERC20_ABI, signer);

    const tx = await contract.approve(spender, amount);
    return tx.wait();
  } catch (error) {
    throw normalizeChainError(error, "Failed to approve HLUSD");
  }
}

export async function transferHLUSD(recipient: string, amount: string) {
  try {
    const token = process.env.NEXT_PUBLIC_HLUSD_ADDRESS;
    if (!token) {
      throw new ChainIntegrationError("missing_env", "Missing NEXT_PUBLIC_HLUSD_ADDRESS");
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      throw new ChainIntegrationError("invalid_input", "Funding amount must be greater than zero");
    }

    const provider = new BrowserProvider(getEthereum() as never);
    const signer = await provider.getSigner();
    const contract = new Contract(token, ERC20_ABI, signer);

    const decimals = await contract.decimals();
    const tx = await contract.transfer(recipient, parseUnits(amount, Number(decimals)));
    return tx.wait();
  } catch (error) {
    throw normalizeChainError(error, "Failed to transfer HLUSD");
  }
}

export async function signMessage(message: string): Promise<string> {
  try {
    const ethereum = getEthereum();
    const account = await connectWallet();

    const signature = (await ethereum.request({
      method: "personal_sign",
      params: [message, account]
    })) as string;

    if (!signature || typeof signature !== "string") {
      throw new ChainIntegrationError("invalid_input", "Wallet signature was not returned");
    }

    return signature;
  } catch (error) {
    throw normalizeChainError(error, "Failed to sign wallet message");
  }
}
