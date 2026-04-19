/**
 * Web3Auth + Ethers.js bridge for Employee portal.
 * Steps 3 & 4 from integration guide.
 */

import { Web3Auth } from "@web3auth/modal";
import { ethers } from "ethers";
import { HELA_CHAIN_CONFIG, CORE_PAYROLL_ABI } from "./config";

const WEB3AUTH_CLIENT_ID = import.meta.env.VITE_WEB3AUTH_CLIENT_ID || "YOUR_WEB3AUTH_CLIENT_ID";

let web3auth: Web3Auth | null = null;
let payrollContract: ethers.Contract | null = null;
let signer: ethers.Signer | null = null;

export async function initWeb3Auth(): Promise<Web3Auth> {
  if (web3auth) return web3auth;

  web3auth = new Web3Auth({
    clientId: WEB3AUTH_CLIENT_ID,
    // Using default network; chain will be selected by adapter
  } as any);

  await (web3auth as any).init();
  return web3auth;
}

export async function loginAndConnectContract(contractAddress: string): Promise<{
  address: string;
  contract: ethers.Contract;
  signer: ethers.Signer;
}> {
  let s: ethers.Signer | null = null;

  if (WEB3AUTH_CLIENT_ID && WEB3AUTH_CLIENT_ID !== "YOUR_WEB3AUTH_CLIENT_ID") {
    const auth = await initWeb3Auth();
    const web3authProvider = await (auth as any).connect();
    if (!web3authProvider) throw new Error("Failed to connect Web3Auth");
    const provider = new ethers.BrowserProvider(web3authProvider);
    s = await provider.getSigner();
  } else if (typeof (window as any).ethereum !== "undefined") {
    const injected = (window as any).ethereum;
    const provider = new ethers.BrowserProvider(injected);
    await injected.request?.({ method: "eth_requestAccounts" });
    await ensureHeLaNetwork(injected);
    s = await provider.getSigner();
  } else {
    throw new Error("Wallet is not ready yet. Set VITE_WEB3AUTH_CLIENT_ID or install MetaMask.");
    // No fallback available without a wallet
  }

  payrollContract = new ethers.Contract(contractAddress, CORE_PAYROLL_ABI, s!);
  signer = s!;

  const address = await s!.getAddress();
  console.log("Logged in with invisible wallet:", address);

  return { address, contract: payrollContract, signer: s! };
}

export async function logoutWeb3Auth(): Promise<void> {
  if (web3auth) {
    await web3auth.logout();
    web3auth = null;
  }
  payrollContract = null;
  signer = null;
}

export function isConnected(): boolean {
  return !!signer && !!payrollContract;
}

export function getPayrollContract(): ethers.Contract | null {
  return payrollContract;
}

export function getSigner(): ethers.Signer | null {
  return signer;
}

export async function getConnectedAddress(): Promise<string | null> {
  if (!signer) return null;
  try {
    return await signer.getAddress();
  } catch {
    return null;
  }
}

export async function ensureHeLaNetwork(ethereum: any) {
  try {
    const chainId = await ethereum.request?.({ method: "eth_chainId" });
    if (chainId?.toLowerCase() !== HELA_CHAIN_CONFIG.chainId.toLowerCase()) {
      await ethereum.request?.({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: HELA_CHAIN_CONFIG.chainId,
          chainName: HELA_CHAIN_CONFIG.displayName,
          rpcUrls: [HELA_CHAIN_CONFIG.rpcTarget],
          nativeCurrency: { name: HELA_CHAIN_CONFIG.tickerName, symbol: HELA_CHAIN_CONFIG.ticker, decimals: 18 },
        }],
      });
    }
  } catch {
    // ignore
  }
}
