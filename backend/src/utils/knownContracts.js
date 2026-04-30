/**
 * Known Contracts Database
 * Maps contract addresses to metadata for trust scoring and identification
 */

const KNOWN_CONTRACTS = {
  // === Ethereum Mainnet ===
  '0xdac17f958d2ee523a2206206994597c13d831ec7': {
    name: 'Tether USD (USDT)',
    type: 'token',
    verified: true,
    trust: 'high',
    chain: 'ethereum'
  },
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
    name: 'USD Coin (USDC)',
    type: 'token',
    verified: true,
    trust: 'high',
    chain: 'ethereum'
  },
  '0x6b175474e89094c44da98b954eedeac495271d0f': {
    name: 'Dai Stablecoin (DAI)',
    type: 'token',
    verified: true,
    trust: 'high',
    chain: 'ethereum'
  },
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': {
    name: 'Wrapped Ether (WETH)',
    type: 'token',
    verified: true,
    trust: 'high',
    chain: 'ethereum'
  },
  '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': {
    name: 'Uniswap V2 Router',
    type: 'dex',
    verified: true,
    trust: 'high',
    chain: 'ethereum'
  },
  '0xe592427a0aece92de3edee1f18e0157c05861564': {
    name: 'Uniswap V3 Router',
    type: 'dex',
    verified: true,
    trust: 'high',
    chain: 'ethereum'
  },
  '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45': {
    name: 'Uniswap V3 Router 02',
    type: 'dex',
    verified: true,
    trust: 'high',
    chain: 'ethereum'
  },
  '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f': {
    name: 'SushiSwap Router',
    type: 'dex',
    verified: true,
    trust: 'high',
    chain: 'ethereum'
  },
  '0x1111111254eeb25477b68fb85ed929f73a960582': {
    name: '1inch V5 Router',
    type: 'dex-aggregator',
    verified: true,
    trust: 'high',
    chain: 'ethereum'
  },
  '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9': {
    name: 'Aave V2 Lending Pool',
    type: 'lending',
    verified: true,
    trust: 'high',
    chain: 'ethereum'
  },

  // === Polygon ===
  '0xa5e0829caced8ffdd4de3c43696c57f7d7a678ff': {
    name: 'QuickSwap Router',
    type: 'dex',
    verified: true,
    trust: 'high',
    chain: 'polygon'
  },
  '0x2791bca1f2de4661ed88a30c99a7a9449aa84174': {
    name: 'USDC (Polygon)',
    type: 'token',
    verified: true,
    trust: 'high',
    chain: 'polygon'
  },

  // === Arbitrum ===
  '0x1b02da8cb0d097eb8d57a175b88c7d8b47997506': {
    name: 'SushiSwap Router (Arbitrum)',
    type: 'dex',
    verified: true,
    trust: 'high',
    chain: 'arbitrum'
  }
};

// Known scam patterns and flagged addresses
const FLAGGED_ADDRESSES = {
  // Example flagged addresses - in production, integrate with scam databases
  '0x0000000000000000000000000000000000000000': {
    reason: 'Null address - tokens sent here are burned permanently',
    severity: 'warning'
  },
  '0x000000000000000000000000000000000000dead': {
    reason: 'Dead address - tokens sent here are burned permanently',
    severity: 'warning'
  }
};

// Suspicious function selectors (first 4 bytes of keccak256)
const SUSPICIOUS_SELECTORS = {
  '0x42842e0e': { name: 'safeTransferFrom', risk: 'Check NFT transfer carefully' },
  '0x095ea7b3': { name: 'approve', risk: 'Token approval - check the spender and amount' },
  '0xa22cb465': { name: 'setApprovalForAll', risk: 'Grants FULL access to all your NFTs in this collection' }
};

/**
 * Look up a contract address in the known database
 */
function lookupContract(address) {
  const normalized = address.toLowerCase();
  return KNOWN_CONTRACTS[normalized] || null;
}

/**
 * Check if an address is flagged
 */
function checkFlagged(address) {
  const normalized = address.toLowerCase();
  return FLAGGED_ADDRESSES[normalized] || null;
}

/**
 * Check if a function selector is suspicious
 */
function checkSelector(selector) {
  return SUSPICIOUS_SELECTORS[selector.toLowerCase()] || null;
}

module.exports = {
  KNOWN_CONTRACTS,
  FLAGGED_ADDRESSES,
  SUSPICIOUS_SELECTORS,
  lookupContract,
  checkFlagged,
  checkSelector
};
