/**
 * ABI Registry - Common ABI fragments for known contract interfaces
 * Used to decode transaction data without needing the full contract ABI
 */

// ERC-20 Token Standard
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

// ERC-721 NFT Standard
const ERC721_ABI = [
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function approve(address to, uint256 tokenId)",
  "function setApprovalForAll(address operator, bool approved)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)"
];

// ERC-1155 Multi-Token Standard
const ERC1155_ABI = [
  "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)",
  "function safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes data)",
  "function setApprovalForAll(address operator, bool approved)",
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function isApprovedForAll(address account, address operator) view returns (bool)"
];

// Common DeFi - Uniswap V2 Router
const UNISWAP_V2_ROUTER_ABI = [
  "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) returns (uint256[] amounts)",
  "function swapTokensForExactTokens(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline) returns (uint256[] amounts)",
  "function swapExactETHForTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline) payable returns (uint256[] amounts)",
  "function swapTokensForExactETH(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline) returns (uint256[] amounts)",
  "function swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) returns (uint256[] amounts)",
  "function swapETHForExactTokens(uint256 amountOut, address[] path, address to, uint256 deadline) payable returns (uint256[] amounts)",
  "function addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) returns (uint256 amountA, uint256 amountB, uint256 liquidity)",
  "function removeLiquidity(address tokenA, address tokenB, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) returns (uint256 amountA, uint256 amountB)"
];

// Uniswap V3 Router
const UNISWAP_V3_ROUTER_ABI = [
  "function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) payable returns (uint256 amountOut)",
  "function exactInput((bytes path, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum)) payable returns (uint256 amountOut)",
  "function multicall(uint256 deadline, bytes[] data) payable returns (bytes[] results)",
  "function multicall(bytes[] data) payable returns (bytes[] results)"
];

// Common Staking
const STAKING_ABI = [
  "function stake(uint256 amount)",
  "function unstake(uint256 amount)",
  "function withdraw(uint256 amount)",
  "function deposit(uint256 amount)",
  "function claim()",
  "function claimRewards()",
  "function getReward()",
  "function exit()"
];

// WETH
const WETH_ABI = [
  "function deposit() payable",
  "function withdraw(uint256 amount)"
];

// Multicall
const MULTICALL_ABI = [
  "function multicall(bytes[] calldata data) external payable returns (bytes[] memory results)",
  "function aggregate((address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes[] returnData)"
];

/**
 * Get all ABI fragments combined for maximum decoding coverage
 */
function getAllAbis() {
  return [
    ...ERC20_ABI,
    ...ERC721_ABI,
    ...ERC1155_ABI,
    ...UNISWAP_V2_ROUTER_ABI,
    ...UNISWAP_V3_ROUTER_ABI,
    ...STAKING_ABI,
    ...WETH_ABI,
    ...MULTICALL_ABI
  ];
}

/**
 * Identify what type of interaction based on function name
 */
function categorizeFunction(functionName) {
  const categories = {
    transfer: ['transfer', 'transferFrom', 'safeTransferFrom', 'safeBatchTransferFrom'],
    approval: ['approve', 'setApprovalForAll'],
    swap: ['swapExactTokensForTokens', 'swapTokensForExactTokens', 'swapExactETHForTokens', 'swapTokensForExactETH', 'swapExactTokensForETH', 'swapETHForExactTokens', 'exactInputSingle', 'exactInput'],
    liquidity: ['addLiquidity', 'removeLiquidity', 'addLiquidityETH', 'removeLiquidityETH'],
    staking: ['stake', 'unstake', 'deposit', 'withdraw', 'claim', 'claimRewards', 'getReward', 'exit'],
    wrapping: ['deposit', 'withdraw'],
    multicall: ['multicall', 'aggregate']
  };

  for (const [category, functions] of Object.entries(categories)) {
    if (functions.includes(functionName)) return category;
  }
  return 'unknown';
}

module.exports = {
  ERC20_ABI,
  ERC721_ABI,
  ERC1155_ABI,
  UNISWAP_V2_ROUTER_ABI,
  UNISWAP_V3_ROUTER_ABI,
  STAKING_ABI,
  WETH_ABI,
  MULTICALL_ABI,
  getAllAbis,
  categorizeFunction
};
