import { Contract, JsonRpcProvider, formatEther, formatUnits, id, isAddress } from "ethers";
import { getMultiplePrices } from "./priceService";

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

type TokenDescriptor = {
  address: string;
  symbol: string;
  coingeckoId?: string;
};

const COINGECKO_BY_SYMBOL: Record<string, string> = {
  ETH: "ethereum",
  WETH: "ethereum",
  BTC: "bitcoin",
  WBTC: "bitcoin",
  USDC: "usd-coin",
  USDT: "tether",
  DAI: "dai",
  LINK: "chainlink"
};

let providerInstance: JsonRpcProvider | null = null;

function getProvider(): JsonRpcProvider {
  if (providerInstance) {
    return providerInstance;
  }

  const rpcUrl = process.env.NEXT_PUBLIC_HELA_RPC;
  if (!rpcUrl || !rpcUrl.trim()) {
    throw new Error("[WALLET] NEXT_PUBLIC_HELA_RPC is missing");
  }

  providerInstance = new JsonRpcProvider(rpcUrl.trim());
  return providerInstance;
}

function toSafeNumber(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return parsed;
}

function hashToFraction(input: string): number {
  const digest = id(input);
  const hashBigInt = BigInt(digest);
  const mod = Number(hashBigInt % 10_000n);
  return mod / 10_000;
}

export async function getWalletTokenBalances(
  walletAddress: string,
  tokenAddresses: string[]
): Promise<Record<string, number>> {
  console.log(`[WALLET] Fetching token balances for ${walletAddress}`);

  if (!isAddress(walletAddress)) {
    throw new Error("[WALLET] Invalid wallet address");
  }

  const provider = getProvider();
  const balances: Record<string, number> = {};

  for (const tokenAddress of tokenAddresses) {
    if (!isAddress(tokenAddress)) {
      throw new Error(`[WALLET] Invalid token address: ${tokenAddress}`);
    }

    const contract = new Contract(tokenAddress, ERC20_ABI, provider);
    const [rawBalance, decimals] = await Promise.all([
      contract.balanceOf(walletAddress) as Promise<bigint>,
      contract.decimals() as Promise<number | bigint>
    ]);

    const normalizedDecimals = Number(decimals);
    const humanReadable = toSafeNumber(formatUnits(rawBalance, normalizedDecimals));
    balances[tokenAddress] = humanReadable;

    console.log(`[WALLET] Token ${tokenAddress} balance: ${humanReadable}`);
  }

  return balances;
}

export async function getWalletNativeBalance(walletAddress: string): Promise<number> {
  console.log(`[WALLET] Fetching native balance for ${walletAddress}`);

  if (!isAddress(walletAddress)) {
    throw new Error("[WALLET] Invalid wallet address");
  }

  const provider = getProvider();
  const balance = await provider.getBalance(walletAddress);
  const humanReadable = toSafeNumber(formatEther(balance));
  console.log(`[WALLET] Native balance: ${humanReadable}`);
  return humanReadable;
}

export async function calculatePortfolioAllocations(
  walletAddress: string,
  tokens: TokenDescriptor[]
): Promise<{
  allocations: Record<string, number>;
  totalValueUSD: number;
  valuesBySymbol: Record<string, number>;
}> {
  console.log(`[WALLET] Calculating portfolio allocations for ${walletAddress}`);

  if (!isAddress(walletAddress)) {
    throw new Error("[WALLET] Invalid wallet address");
  }

  if (!Array.isArray(tokens) || tokens.length === 0) {
    throw new Error("[WALLET] Tokens list is required");
  }

  const normalizedTokens = tokens.map((token) => {
    const symbol = token.symbol.trim().toUpperCase();
    const resolvedCoinGeckoId =
      token.coingeckoId?.trim().toLowerCase() || COINGECKO_BY_SYMBOL[symbol] || symbol.toLowerCase();

    return {
      ...token,
      symbol,
      coingeckoId: resolvedCoinGeckoId
    };
  });

  const tokenAddresses = normalizedTokens.map((token) => token.address);
  const coingeckoIds = Array.from(new Set(normalizedTokens.map((token) => token.coingeckoId)));

  const [balances, prices] = await Promise.all([
    getWalletTokenBalances(walletAddress, tokenAddresses),
    getMultiplePrices(coingeckoIds)
  ]);

  const valuesBySymbol: Record<string, number> = {};
  let totalValue = 0;

  for (const token of normalizedTokens) {
    const balance = balances[token.address] ?? 0;
    const price = prices[token.coingeckoId] ?? 0;
    const usdValue = balance * price;
    totalValue += usdValue;
    valuesBySymbol[token.symbol] = usdValue;
  }

  const allocations: Record<string, number> = {};

  if (totalValue <= 0) {
    for (const token of normalizedTokens) {
      allocations[token.symbol] = 0;
    }
    return {
      allocations,
      totalValueUSD: 0,
      valuesBySymbol
    };
  }

  let runningTotal = 0;
  for (let index = 0; index < normalizedTokens.length; index += 1) {
    const token = normalizedTokens[index];
    if (index === normalizedTokens.length - 1) {
      allocations[token.symbol] = Number((100 - runningTotal).toFixed(2));
      continue;
    }

    const percentage = Number(((valuesBySymbol[token.symbol] / totalValue) * 100).toFixed(2));
    allocations[token.symbol] = percentage;
    runningTotal += percentage;
  }

  console.log(`[WALLET] Allocations: ${JSON.stringify(allocations)}`);
  return {
    allocations,
    totalValueUSD: Number(totalValue.toFixed(2)),
    valuesBySymbol
  };
}

export async function simulateLPPosition(lpAddress: string): Promise<{
  totalValueLocked: number;
  apy: number;
  fees24h: number;
  volume24h: number;
  totalValueUSD: number;
  pendingRewards: number;
  token0: string;
  token1: string;
}> {
  console.log(`[WALLET] Simulating LP position for ${lpAddress}`);

  const poolUniverse = [
    { symbol: "ETH", coingeckoId: "ethereum" },
    { symbol: "BTC", coingeckoId: "bitcoin" },
    { symbol: "USDC", coingeckoId: "usd-coin" },
    { symbol: "USDT", coingeckoId: "tether" },
    { symbol: "LINK", coingeckoId: "chainlink" }
  ];

  const baseSeed = hashToFraction(lpAddress);
  const secondSeed = hashToFraction(`${lpAddress}:secondary`);
  const thirdSeed = hashToFraction(`${lpAddress}:rewards`);

  const token0Index = Math.floor(baseSeed * poolUniverse.length) % poolUniverse.length;
  const token1Index = (token0Index + 1 + Math.floor(secondSeed * (poolUniverse.length - 1))) % poolUniverse.length;

  const token0 = poolUniverse[token0Index];
  const token1 = poolUniverse[token1Index];

  const prices = await getMultiplePrices([token0.coingeckoId, token1.coingeckoId]);

  const token0Units = 0.25 + baseSeed * 3.75;
  const token1Units = 25 + secondSeed * 500;

  const totalValueUSD = Number(
    (
      token0Units * (prices[token0.coingeckoId] ?? 0) +
      token1Units * (prices[token1.coingeckoId] ?? 0)
    ).toFixed(2)
  );

  const apy = Number((8 + thirdSeed * 17).toFixed(2));
  const volume24h = Number((totalValueUSD * (0.8 + baseSeed)).toFixed(2));
  const fees24h = Number((volume24h * (0.001 + secondSeed * 0.002)).toFixed(2));
  const pendingRewards = Number(((totalValueUSD * (apy / 100)) / 52).toFixed(2));

  const result = {
    totalValueLocked: totalValueUSD,
    totalValueUSD,
    apy,
    fees24h,
    volume24h,
    pendingRewards,
    token0: token0.symbol,
    token1: token1.symbol
  };

  console.log(`[WALLET] LP simulation: ${JSON.stringify(result)}`);
  return result;
}
