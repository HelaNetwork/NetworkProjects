import { Contract, JsonRpcProvider, Wallet, formatUnits, parseUnits } from "ethers";

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const UNISWAP_V2_ROUTER_ABI = [
  "function getAmountsOut(uint256 amountIn, address[] memory path) view returns (uint256[] memory amounts)",
  "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) returns (uint256[] memory amounts)"
];

type SupportedRouterKind = "uniswap-v2";
type TradingDirection = "above" | "below";

export type TradingSwapResult = {
  routerAddress: string;
  routerKind: SupportedRouterKind;
  strategy: "sell-base-into-quote" | "buy-base-using-quote";
  inputTokenSymbol: string;
  outputTokenSymbol: string;
  inputAmount: string;
  quotedOutputAmount: string;
  minimumOutputAmount: string;
  txHash: string;
};

export type TokenSwapResult = {
  routerAddress: string;
  routerKind: SupportedRouterKind;
  inputTokenSymbol: string;
  outputTokenSymbol: string;
  inputAmount: string;
  quotedOutputAmount: string;
  minimumOutputAmount: string;
  txHash: string;
};

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

function parseTokenAddressMap() {
  const raw = requireEnv("TRADING_TOKEN_ADDRESS_MAP_JSON");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("TRADING_TOKEN_ADDRESS_MAP_JSON must be valid JSON");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("TRADING_TOKEN_ADDRESS_MAP_JSON must be a JSON object");
  }

  const map = Object.entries(parsed as Record<string, unknown>).reduce<Record<string, string>>((acc, [symbol, value]) => {
    if (typeof value === "string" && value.trim()) {
      acc[symbol.trim().toUpperCase()] = value.trim();
    }
    return acc;
  }, {});

  const hlusd = process.env.NEXT_PUBLIC_HLUSD_ADDRESS?.trim();
  if (hlusd && !map.HLUSD) {
    map.HLUSD = hlusd;
  }

  return map;
}

function normalizeRouterKind(raw: string | undefined): SupportedRouterKind {
  const normalized = (raw || "uniswap-v2").trim().toLowerCase();
  if (normalized === "uniswap-v2") {
    return normalized;
  }
  throw new Error(`Unsupported TRADING_ROUTER_KIND: ${raw}`);
}

function splitTokenPair(tokenPair: string) {
  const symbols = tokenPair
    .split(/[/:_\-\s]+/)
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean);

  if (symbols.length !== 2) {
    throw new Error(`Unsupported token pair format: ${tokenPair}`);
  }

  return {
    base: symbols[0],
    quote: symbols[1]
  };
}

function getPathSymbols(tokenPair: string, direction: TradingDirection) {
  const { base, quote } = splitTokenPair(tokenPair);

  if (direction === "above") {
    return {
      inputTokenSymbol: base,
      outputTokenSymbol: quote,
      strategy: "sell-base-into-quote" as const
    };
  }

  return {
    inputTokenSymbol: quote,
    outputTokenSymbol: base,
    strategy: "buy-base-using-quote" as const
  };
}

export function isRealTradingExecutionEnabled() {
  return (process.env.TRADING_REAL_EXECUTION_ENABLED || "").trim().toLowerCase() === "true";
}

async function executeConfiguredSwap(input: {
  agentWalletPrivateKey: string;
  inputTokenSymbol: string;
  outputTokenSymbol: string;
  amount: number;
  slippageBps: number;
}): Promise<TokenSwapResult> {
  if (!isRealTradingExecutionEnabled()) {
    throw new Error("Real trading execution is disabled");
  }

  const rpcUrl = requireEnv("NEXT_PUBLIC_HELA_RPC");
  const routerAddress = requireEnv("TRADING_ROUTER_ADDRESS");
  const routerKind = normalizeRouterKind(process.env.TRADING_ROUTER_KIND);
  const tokenAddressMap = parseTokenAddressMap();
  const deadlineSeconds = Number(process.env.TRADING_SWAP_DEADLINE_SECONDS || "600");

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Trading swap amount must be greater than zero");
  }

  const inputTokenSymbol = input.inputTokenSymbol.trim().toUpperCase();
  const outputTokenSymbol = input.outputTokenSymbol.trim().toUpperCase();
  const inputTokenAddress = tokenAddressMap[inputTokenSymbol];
  const outputTokenAddress = tokenAddressMap[outputTokenSymbol];

  if (!inputTokenAddress || !outputTokenAddress) {
    throw new Error(`Unsupported trading pair for real execution: ${inputTokenSymbol}/${outputTokenSymbol}`);
  }

  const provider = new JsonRpcProvider(rpcUrl);
  const signer = new Wallet(input.agentWalletPrivateKey, provider);

  const inputToken = new Contract(inputTokenAddress, ERC20_ABI, signer);
  const outputToken = new Contract(outputTokenAddress, ERC20_ABI, signer);
  const router = new Contract(routerAddress, UNISWAP_V2_ROUTER_ABI, signer);

  const [inputDecimals, outputDecimals, inputBalance] = await Promise.all([
    inputToken.decimals(),
    outputToken.decimals(),
    inputToken.balanceOf(signer.address)
  ]);

  const amountIn = parseUnits(input.amount.toString(), Number(inputDecimals));
  if (inputBalance < amountIn) {
    throw new Error(`Insufficient ${inputTokenSymbol} balance in agent wallet`);
  }

  const path = [inputTokenAddress, outputTokenAddress];
  const amountsOut = (await router.getAmountsOut(amountIn, path)) as bigint[];
  const quotedOutput = amountsOut[amountsOut.length - 1];
  const minimumOutput = (quotedOutput * BigInt(10_000 - input.slippageBps)) / 10_000n;

  const allowance = (await inputToken.allowance(signer.address, routerAddress)) as bigint;
  if (allowance < amountIn) {
    const approveTx = await inputToken.approve(routerAddress, amountIn);
    await approveTx.wait();
  }

  const deadline = Math.floor(Date.now() / 1000) + (Number.isFinite(deadlineSeconds) ? deadlineSeconds : 600);
  const swapTx = await router.swapExactTokensForTokens(
    amountIn,
    minimumOutput,
    path,
    signer.address,
    deadline
  );
  const receipt = await swapTx.wait();

  return {
    routerAddress,
    routerKind,
    inputTokenSymbol,
    outputTokenSymbol,
    inputAmount: formatUnits(amountIn, Number(inputDecimals)),
    quotedOutputAmount: formatUnits(quotedOutput, Number(outputDecimals)),
    minimumOutputAmount: formatUnits(minimumOutput, Number(outputDecimals)),
    txHash: receipt?.hash || swapTx.hash
  };
}

export async function executeTokenSwap(input: {
  agentWalletPrivateKey: string;
  inputTokenSymbol: string;
  outputTokenSymbol: string;
  amount: number;
  slippageBps: number;
}): Promise<TokenSwapResult> {
  return executeConfiguredSwap(input);
}

export async function executeTradingSwap(input: {
  agentWalletPrivateKey: string;
  tokenPair: string;
  direction: TradingDirection;
  amount: number;
  slippageBps: number;
}): Promise<TradingSwapResult> {
  const { inputTokenSymbol, outputTokenSymbol, strategy } = getPathSymbols(input.tokenPair, input.direction);
  const swap = await executeConfiguredSwap({
    agentWalletPrivateKey: input.agentWalletPrivateKey,
    inputTokenSymbol,
    outputTokenSymbol,
    amount: input.amount,
    slippageBps: input.slippageBps
  });

  return {
    ...swap,
    strategy
  };
}
