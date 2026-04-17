import { http } from "wagmi";
import { defineChain } from "viem";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

export const helaTestnet = defineChain({
  id: 666888,
  name: "Hela Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "HLUSD",
    symbol: "HLUSD",
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.helachain.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Hela Explorer",
      url: "https://testnet-blockexplorer.helachain.com",
    },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: "HelaMatch",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID || "demo-project-id",
  chains: [helaTestnet],
  transports: {
    [helaTestnet.id]: http(),
  },
  ssr: true,
});

export const CONTRACT_ADDRESSES = {
  likeRegistry: (process.env.NEXT_PUBLIC_LIKE_REGISTRY ||
    "0x0000000000000000000000000000000000000001") as `0x${string}`,
  matchRegistry: (process.env.NEXT_PUBLIC_MATCH_REGISTRY ||
    "0x0000000000000000000000000000000000000002") as `0x${string}`,
  paymentManager: (process.env.NEXT_PUBLIC_PAYMENT_MANAGER ||
    "0x0000000000000000000000000000000000000003") as `0x${string}`,
} as const;
