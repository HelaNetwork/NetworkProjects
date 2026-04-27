// ===================================================
// WEB3 MODULE — ethers.js v6 + HeLa Testnet
// ===================================================
import { ethers } from "ethers";

// --- HeLa Testnet config ---
export const HELA_TESTNET = {
  chainId: "0xa2d08",        // 666888 in hex
  chainName: "HeLa Testnet",
  nativeCurrency: { name: "HLUSD", symbol: "HLUSD", decimals: 18 },
  rpcUrls: ["https://testnet-rpc.helachain.com"],
  blockExplorerUrls: ["https://testnet-blockexplorer.helachain.com"],
};

// --- Contract config (set after deploy) ---
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

export const CONTRACT_ABI = [
  {
    "inputs": [{ "internalType": "string", "name": "hash", "type": "string" }],
    "name": "addHash",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllHashes",
    "outputs": [
      {
        "components": [
          { "internalType": "string",  "name": "hash",      "type": "string"  },
          { "internalType": "address", "name": "uploader",  "type": "address" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "internalType": "struct ResearchVerify.PaperRecord[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalRecords",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true,  "internalType": "address", "name": "uploader",  "type": "address" },
      { "indexed": false, "internalType": "string",  "name": "hash",      "type": "string"  },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "HashAdded",
    "type": "event"
  }
];

// -------------------------------------------------------
// 1. Connect MetaMask + switch to HeLa Testnet
// Returns: wallet address string
// -------------------------------------------------------
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask not found. Please install it.");
  }

  // Request accounts
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  // Switch to HeLa Testnet (adds it if not present)
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: HELA_TESTNET.chainId }],
    });
  } catch (switchErr) {
    // Chain not added yet — add it automatically
    if (switchErr.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [HELA_TESTNET],
      });
    } else {
      throw switchErr;
    }
  }

  return accounts[0];
}

// -------------------------------------------------------
// 2. Get contract instance (read or write)
// -------------------------------------------------------
export function getContract(signerOrProvider) {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
}

// -------------------------------------------------------
// 3. Store hash on-chain
// Returns: { txHash, walletAddress }
// -------------------------------------------------------
export async function storeHashOnChain(hash) {
  if (!CONTRACT_ADDRESS) {
    throw new Error(
      "CONTRACT_ADDRESS not set. Add to next.config.js → NEXT_PUBLIC_CONTRACT_ADDRESS"
    );
  }

  // Force switch to HeLa before every tx
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: HELA_TESTNET.chainId }],
    });
  } catch (switchErr) {
    if (switchErr.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [HELA_TESTNET],
      });
    } else {
      throw switchErr;
    }
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer   = await provider.getSigner();
  const contract = getContract(signer);

  const tx = await contract.addHash(hash);
  await tx.wait(1);

  return {
    txHash:        tx.hash,
    walletAddress: await signer.getAddress(),
  };
}

// -------------------------------------------------------
// 4. Get current connected wallet (no popup)
// -------------------------------------------------------
export async function getConnectedWallet() {
  if (!window.ethereum) return null;
  const accounts = await window.ethereum.request({ method: "eth_accounts" });
  return accounts[0] || null;
}
