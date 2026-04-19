import { defineChain } from "viem";

// HeLa Official Runtime Testnet - Chain ID 666888
export const helaTestnet = defineChain({
  id: 666888,
  name: "HeLa Testnet",
  nativeCurrency: { name: "HL", symbol: "HL", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.helachain.com"] },
  },
  blockExplorers: {
    default: { name: "HeLa Explorer", url: "https://testnet-blockexplorer.helachain.com" },
  },
});
