import { ethers } from "ethers";
import { OnChainData, Transaction, TokenTransfer } from "../types";

const HELA_RPC = "https://testnet-rpc.helascan.io";
const HELA_EXPLORER_API = "https://testnet.helascan.io/api/v2";

export const getHelaProvider = () => {
  return new ethers.JsonRpcProvider(HELA_RPC);
};

export const connectMetaMask = async (): Promise<string> => {
  if (!window.ethereum) throw new Error("MetaMask not installed");
  const accounts = (await window.ethereum.request({
    method: "eth_requestAccounts",
  })) as string[];
  return accounts[0];
};

export const getWalletAddress = async (): Promise<string | null> => {
  if (!window.ethereum) return null;
  const accounts = (await window.ethereum.request({
    method: "eth_accounts",
  })) as string[];
  return accounts[0] || null;
};

export const fetchRecentTransactions = async (
  walletAddress: string,
): Promise<Transaction[]> => {
  try {
    const txRes = await fetch(
      `${HELA_EXPLORER_API}/addresses/${walletAddress}/transactions`,
    );
    const txData = await txRes.json();
    if (txData.items) {
      return txData.items.slice(0, 8).map((tx: any) => ({
        hash: tx.hash,
        from: tx.from?.hash,
        to: tx.to?.hash,
        value: parseFloat(ethers.formatEther(tx.value || "0")).toFixed(4),
        timestamp: new Date(tx.timestamp).toLocaleDateString(),
        status: tx.status === "ok" ? "success" : "failed",
      }));
    }
    return [];
  } catch {}
  return [];
};

export const fetchOnChainData = async (
  walletAddress: string,
): Promise<OnChainData> => {
  const provider = getHelaProvider();

  let balance = "0";
  let totalTransactions = 0;
  let recentTransactions: Transaction[] = [];
  let tokenHoldings: {
    symbol: string;
    name: string;
    balance: string;
    contractAddress: string;
  }[] = [];
  let tokenTransfers: TokenTransfer[] = [];
  let contractsCreated = 0;

  try {
    const balanceRes = await fetch(
      `${HELA_EXPLORER_API}/addresses/${walletAddress}`,
    );
    const balanceData = await balanceRes.json();

    if (balanceData.coin_balance) {
      balance = parseFloat(
        ethers.formatEther(balanceData.coin_balance),
      ).toFixed(4);
    }
  } catch {
    balance = "0.0000";
  }

  try {
    const txCountBN = await provider.getTransactionCount(walletAddress);
    totalTransactions = Number(txCountBN);
  } catch {
    totalTransactions = 0;
  }

  // ✅ Transactions (FIXED)
  try {
    const txRes = await fetch(
      `${HELA_EXPLORER_API}/addresses/${walletAddress}/transactions`,
    );
    const txData = await txRes.json();

    if (txData.items) {
      recentTransactions = txData.items.slice(0, 8).map((tx: any) => ({
        hash: tx.hash,
        from: tx.from?.hash,
        to: tx.to?.hash,
        value: parseFloat(ethers.formatEther(tx.value || "0")).toFixed(4),
        timestamp: new Date(tx.timestamp).toLocaleDateString(),
        status: tx.status === "ok" ? "success" : "failed",
      }));

      contractsCreated = recentTransactions.filter((tx) => !tx.to).length;
    }
  } catch {}

  // ✅ Token holdings (FIXED)
  try {
    const tokenRes = await fetch(
      `${HELA_EXPLORER_API}/addresses/${walletAddress}/token-balances`,
    );
    const tokenData = await tokenRes.json();

    if (tokenData.items) {
      tokenHoldings = tokenData.items.slice(0, 5).map((t: any) => ({
        symbol: t.token?.symbol,
        name: t.token?.name,
        balance: (
          parseFloat(t.value) / Math.pow(10, t.token?.decimals || 18)
        ).toFixed(4),
        contractAddress: t.token?.address,
      }));
    }
  } catch {}

  // ✅ Token transfers (FIXED)
  try {
    const transferRes = await fetch(
      `${HELA_EXPLORER_API}/addresses/${walletAddress}/token-transfers`,
    );
    const transferData = await transferRes.json();

    if (transferData.items) {
      tokenTransfers = transferData.items.slice(0, 5).map((t: any) => ({
        hash: t.transaction_hash,
        from: t.from?.hash,
        to: t.to?.hash,
        value: (
          parseFloat(t.total?.value) / Math.pow(10, t.token?.decimals || 18)
        ).toFixed(4),
        token: t.token?.symbol,
        timestamp: new Date(t.timestamp).toLocaleDateString(),
      }));
    }
  } catch {}

  return {
    balance,
    totalTransactions,
    gasUsed: (totalTransactions * 21000).toLocaleString(),
    recentTransactions,
    nfts: [],
    tokenHoldings,
    tokenTransfers,
    contractsCreated,
  };
};

declare global {
  interface Window {
    ethereum?: {
      request: (args: {
        method: string;
        params?: unknown[];
      }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (
        event: string,
        handler: (...args: unknown[]) => void,
      ) => void;
    };
  }
}
