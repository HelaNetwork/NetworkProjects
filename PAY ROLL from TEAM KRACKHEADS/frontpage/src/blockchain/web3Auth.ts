/**
 * Web3Auth + Ethers.js bridge for HeLa Testnet.
 * Steps 3 & 4 from integration guide: Initialize Web3Auth, bridge to Ethers.js.
 */

import { Web3Auth } from "@web3auth/modal";
import { ethers } from "ethers";
import { HELA_CHAIN_CONFIG, CORE_PAYROLL_ABI } from "./config";

const WEB3AUTH_CLIENT_ID = import.meta.env.VITE_WEB3AUTH_CLIENT_ID || "YOUR_WEB3AUTH_CLIENT_ID";

let web3auth: Web3Auth | null = null;
let payrollContract: ethers.Contract | null = null;
let signer: ethers.Signer | null = null;

/**
 * Initialize Web3Auth modal (call once on app load or before first connect).
 */
export async function initWeb3Auth(): Promise<Web3Auth> {
  if (web3auth) return web3auth;

  web3auth = new Web3Auth({
    clientId: WEB3AUTH_CLIENT_ID,
    chainConfig: HELA_CHAIN_CONFIG,
  });

  await web3auth.initModal();
  return web3auth;
}

/**
 * Connect wallet via Web3Auth and connect to CorePayroll contract.
 * Call this when user clicks "Connect Wallet" or "Login".
 */
export async function loginAndConnectContract(contractAddress: string): Promise<{
  address: string;
  contract: ethers.Contract;
  signer: ethers.Signer;
}> {
  const auth = await initWeb3Auth();

  // 1. Web3Auth login (Email, Google, etc.) instead of MetaMask
  const web3authProvider = await auth.connect();
  if (!web3authProvider) throw new Error("Failed to connect Web3Auth");

  // 2. Pass Web3Auth provider into Ethers.js
  const provider = new ethers.BrowserProvider(web3authProvider);
  const s = await provider.getSigner();

  // 3. Connect to existing HeLa contract
  payrollContract = new ethers.Contract(contractAddress, CORE_PAYROLL_ABI, s);
  signer = s;

  // 4. Get user wallet address (from email/login)
  const address = await s.getAddress();
  console.log("Logged in with invisible wallet:", address);

  return { address, contract: payrollContract, signer: s };
}

/**
 * Disconnect Web3Auth session.
 */
export async function logoutWeb3Auth(): Promise<void> {
  if (web3auth) {
    await web3auth.logout();
    web3auth = null;
  }
  payrollContract = null;
  signer = null;
}

/**
 * Check if user is connected.
 */
export function isConnected(): boolean {
  return !!signer && !!payrollContract;
}

/**
 * Get connected contract (if already logged in).
 */
export function getPayrollContract(): ethers.Contract | null {
  return payrollContract;
}

/**
 * Get signer (if already logged in).
 */
export function getSigner(): ethers.Signer | null {
  return signer;
}

/**
 * Get connected wallet address (if logged in). Returns null otherwise.
 */
export async function getConnectedAddress(): Promise<string | null> {
  if (!signer) return null;
  try {
    return await signer.getAddress();
  } catch {
    return null;
  }
}
