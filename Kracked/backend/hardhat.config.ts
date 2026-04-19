import "dotenv/config";
import { defineConfig } from "hardhat/config";
import hardhatViem from "@nomicfoundation/hardhat-viem";

export default defineConfig({
  plugins: [hardhatViem],

  solidity: {
    version: "0.8.20",
    settings: {
      evmVersion: "paris",
    },
  },

  networks: {
    helaTestnet: {
      type: "http",
      chainType: "generic",
      url: process.env.HELA_RPC_URL!,
      accounts: [`0x${process.env.HELA_PRIVATE_KEY!}`],
    },
  },
});
