import type { Address, ProtocolPlan } from "./types.js";

export const AAVE_V3_BASE_SEPOLIA = {
  poolAddress: "0x8bAB6d1b75f19e9eD9fCe8b9BD338844fF79aE27" as Address,
  usdcAddress: "0xba50Cd2A20f6DA35D788639E581bca8d0B5d4D5f" as Address,
  usdcATokenAddress: "0x10F1A9D11CDf50041f3f8cB7191CBE2f31750ACC" as Address,
  wethAddress: "0x4200000000000000000000000000000000000006" as Address,
} as const;

export function buildAaveUsdcProtocolPlan(): ProtocolPlan {
  return {
    protocol: "aave-v3-supply",
    chain: "base-sepolia",
    poolAddress: AAVE_V3_BASE_SEPOLIA.poolAddress,
    assetAddress: AAVE_V3_BASE_SEPOLIA.usdcAddress,
    assetSymbol: "USDC",
    amountMode: "all",
    referralCode: 0,
  };
}

export function buildAaveWethSupplyProtocolPlan(): ProtocolPlan {
  return {
    protocol: "aave-v3-supply",
    chain: "base-sepolia",
    poolAddress: AAVE_V3_BASE_SEPOLIA.poolAddress,
    assetAddress: AAVE_V3_BASE_SEPOLIA.wethAddress,
    assetSymbol: "WETH",
    amountMode: "all",
    referralCode: 0,
  };
}

export function buildAaveWethWithdrawProtocolPlan(): ProtocolPlan {
  return {
    protocol: "aave-v3-withdraw",
    chain: "base-sepolia",
    poolAddress: AAVE_V3_BASE_SEPOLIA.poolAddress,
    assetAddress: AAVE_V3_BASE_SEPOLIA.wethAddress,
    assetSymbol: "WETH",
    amountMode: "all",
    referralCode: 0,
  };
}
