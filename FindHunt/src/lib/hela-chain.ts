import { defineChain } from "viem";

const rpc =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_HELA_RPC_URL
    ? process.env.NEXT_PUBLIC_HELA_RPC_URL
    : "https://testnet-rpc.helachain.com";

export const helaTestnet = defineChain({
  id: 666888,
  name: "Hela Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "HLUSD",
    symbol: "HLUSD",
  },
  rpcUrls: {
    default: { http: [rpc] },
  },
  blockExplorers: {
    default: {
      name: "Hela Explorer",
      url: "https://testnet-blockexplorer.helachain.com",
    },
  },
});
