import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, CHAIN_ID } from "../config/contract";

export { CONTRACT_ADDRESS, CONTRACT_ABI, CHAIN_ID };

export const HELA_TESTNET = {
  chainId: "0x" + CHAIN_ID.toString(16), // 666888 → "0xA30F8"
  chainName: "HeLa Testnet",
  rpcUrls: ["https://testnet-rpc.helachain.com"],
  blockExplorerUrls: ["https://testnet-blockexplorer.helachain.com"],
  nativeCurrency: {
    name: "HLUSD",
    symbol: "HLUSD",
    decimals: 18,
  },
};

export const connectWallet = async () => {
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask is not installed. Please install MetaMask!");
  }
  await ensureHelaNetwork();
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  return { provider, signer, address };
};

export const getProvider = () => {
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask is not installed. Please install MetaMask!");
  }
  return new ethers.BrowserProvider(window.ethereum);
};

export const getSigner = async () => {
  const provider = getProvider();
  return await provider.getSigner();
};

export const getContract = async (signerOrProvider) => {
  const runner = signerOrProvider || (await getSigner());
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, runner);
};

export const addHelaNetwork = async () => {
  if (!window.ethereum) throw new Error("No wallet detected");
  try {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [HELA_TESTNET],
    });
    return true;
  } catch (err) {
    console.error("Failed to add HeLa network:", err);
    return false;
  }
};

export const switchToHela = async () => {
  if (!window.ethereum) throw new Error("No wallet detected");
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: HELA_TESTNET.chainId }],
    });
    return true;
  } catch (err) {
    if (err.code === 4902) {
      return await addHelaNetwork();
    }
    console.error("Failed to switch to HeLa:", err);
    return false;
  }
};

export const ensureHelaNetwork = async () => {
  if (!window.ethereum) return false;
  const currentChainId = await window.ethereum.request({
    method: "eth_chainId",
  });
  if (currentChainId.toLowerCase() === HELA_TESTNET.chainId.toLowerCase()) {
    return true;
  }
  return await switchToHela();
};

export const isOnHelaNetwork = async () => {
  if (!window.ethereum) return false;
  const chainId = await window.ethereum.request({ method: "eth_chainId" });
  return chainId.toLowerCase() === HELA_TESTNET.chainId.toLowerCase();
};

export const disconnectWallet = () => {
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (e) {}
  if (typeof window !== "undefined" && window.ethereum) {
    window.ethereum.removeAllListeners();
  }
};

export const formatHLUSD = (amount) => {
  return parseFloat(ethers.formatUnits(amount, 18)).toFixed(4);
};

export const parseHLUSD = (amount) => {
  return ethers.parseUnits(amount.toString(), 18);
};
