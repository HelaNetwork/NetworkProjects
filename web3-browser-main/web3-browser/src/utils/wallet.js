import { ethers } from 'ethers';

export const NETWORKS = {
  1: { name: 'Ethereum Mainnet', badge: 'mainnet', symbol: 'ETH', explorer: 'https://etherscan.io' },
  11155111: { name: 'Sepolia Testnet', badge: 'testnet', symbol: 'ETH', explorer: 'https://sepolia.etherscan.io' },
  80001: { name: 'Mumbai Testnet', badge: 'testnet', symbol: 'MATIC', explorer: 'https://mumbai.polygonscan.com' },
  137: { name: 'Polygon Mainnet', badge: 'mainnet', symbol: 'MATIC', explorer: 'https://polygonscan.com' },
  56: { name: 'BNB Smart Chain', badge: 'mainnet', symbol: 'BNB', explorer: 'https://bscscan.com' },
  5: { name: 'Goerli Testnet', badge: 'testnet', symbol: 'ETH', explorer: 'https://goerli.etherscan.io' },
};

export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
};

export const connectWallet = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask not installed');
  }
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  return accounts[0];
};

export const getProvider = () => {
  if (!isMetaMaskInstalled()) return null;
  return new ethers.BrowserProvider(window.ethereum);
};

export const getBalance = async (address) => {
  const provider = getProvider();
  if (!provider) return '0';
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
};

export const getChainId = async () => {
  if (!isMetaMaskInstalled()) return null;
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  return parseInt(chainId, 16);
};

export const getNetworkInfo = (chainId) => {
  return NETWORKS[chainId] || { name: `Chain ${chainId}`, badge: 'unknown', symbol: 'ETH', explorer: '' };
};

export const switchNetwork = async (chainId) => {
  await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: `0x${chainId.toString(16)}` }],
  });
};

export const truncateAddress = (address, start = 6, end = 4) => {
  if (!address) return '';
  return `${address.slice(0, start)}...${address.slice(-end)}`;
};

export const formatBalance = (balance, decimals = 4) => {
  const num = parseFloat(balance);
  if (isNaN(num)) return '0.0000';
  return num.toFixed(decimals);
};

export const getTransactionHistory = async (address) => {
  // Returns mock data - in production, use Etherscan API
  return [
    {
      hash: '0x4f2b1...a3d9',
      from: address,
      to: '0xUniswap...Router',
      value: '0.05',
      type: 'Swap',
      status: 'success',
      timestamp: Date.now() - 120000,
      gas: '0.002',
    },
    {
      hash: '0x8c3d2...f1e4',
      from: '0xOpenSea...Market',
      to: address,
      value: '0.0',
      type: 'NFT Transfer',
      status: 'success',
      timestamp: Date.now() - 3600000,
      gas: '0.003',
    },
    {
      hash: '0x1a9c5...b2f7',
      from: address,
      to: '0xAave...Pool',
      value: '100.0',
      type: 'Deposit',
      status: 'pending',
      timestamp: Date.now() - 7200000,
      gas: '0.004',
    },
  ];
};

export const BLOCKED_TRACKERS = [
  'doubleclick.net', 'google-analytics.com', 'facebook.com/tr',
  'hotjar.com', 'mixpanel.com', 'segment.io', 'amplitude.com',
];

export const isBlockedDomain = (url) => {
  return BLOCKED_TRACKERS.some(tracker => url.includes(tracker));
};
