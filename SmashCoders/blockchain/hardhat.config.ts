import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const HELA_RPC_URL = process.env.HELA_RPC_URL || "https://testnet-rpc.helachain.com";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    helaTestnet: {
      url: HELA_RPC_URL,
      chainId: 666888,
      accounts: [PRIVATE_KEY],
      gasPrice: "auto",
      timeout: 60000,
    },
    helaMainnet: {
      url: process.env.HELA_MAINNET_RPC || "https://mainnet-rpc.helachain.com",
      chainId: 8668,
      accounts: [PRIVATE_KEY],
      gasPrice: "auto",
    },
  },
};

export default config;
