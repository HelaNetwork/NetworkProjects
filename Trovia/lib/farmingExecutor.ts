import { Contract, JsonRpcProvider, Wallet, formatUnits, parseUnits } from "ethers";

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const DEMO_YIELD_FARM_ABI = [
  "function deposit(string poolKey, uint256 amount)",
  "function stakeOf(address user, string poolKey) view returns (uint256)"
];

export type FarmingDepositResult = {
  vaultAddress: string;
  poolKey: string;
  inputTokenSymbol: "HLUSD";
  depositAmount: string;
  stakedBalance: string;
  txHash: string;
};

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

export function isRealFarmingExecutionEnabled() {
  return (process.env.FARMING_REAL_EXECUTION_ENABLED || "").trim().toLowerCase() === "true";
}

export async function executeFarmingDeposit(input: {
  agentWalletPrivateKey: string;
  poolKey: string;
  amount: number;
}): Promise<FarmingDepositResult> {
  if (!isRealFarmingExecutionEnabled()) {
    throw new Error("Real farming execution is disabled");
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Farming deposit amount must be greater than zero");
  }

  const rpcUrl = requireEnv("NEXT_PUBLIC_HELA_RPC");
  const hlusdAddress = requireEnv("NEXT_PUBLIC_HLUSD_ADDRESS");
  const vaultAddress = requireEnv("FARMING_VAULT_ADDRESS");

  const provider = new JsonRpcProvider(rpcUrl);
  const signer = new Wallet(input.agentWalletPrivateKey, provider);
  const token = new Contract(hlusdAddress, ERC20_ABI, signer);
  const farm = new Contract(vaultAddress, DEMO_YIELD_FARM_ABI, signer);

  const [decimals, tokenBalance] = await Promise.all([
    token.decimals(),
    token.balanceOf(signer.address)
  ]);

  const amountIn = parseUnits(input.amount.toString(), Number(decimals));
  if (tokenBalance < amountIn) {
    throw new Error("Insufficient HLUSD balance in agent wallet");
  }

  const allowance = (await token.allowance(signer.address, vaultAddress)) as bigint;
  if (allowance < amountIn) {
    const approveTx = await token.approve(vaultAddress, amountIn);
    await approveTx.wait();
  }

  const depositTx = await farm.deposit(input.poolKey, amountIn);
  const receipt = await depositTx.wait();
  const stakedBalance = (await farm.stakeOf(signer.address, input.poolKey)) as bigint;

  return {
    vaultAddress,
    poolKey: input.poolKey,
    inputTokenSymbol: "HLUSD",
    depositAmount: formatUnits(amountIn, Number(decimals)),
    stakedBalance: formatUnits(stakedBalance, Number(decimals)),
    txHash: receipt?.hash || depositTx.hash
  };
}
