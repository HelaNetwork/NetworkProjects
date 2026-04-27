import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const HELA_RPC_URL = process.env.HELA_RPC_URL || "https://testnet-rpc.helachain.com";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Hardhat default

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: false,
    },
  },
  networks: {
    // Local Hardhat node
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    // Hela Testnet (EVM-compatible)
    helaTestnet: {
      url: HELA_RPC_URL,
      chainId: 666888, // Hela testnet chain ID — update if changed
      accounts: [PRIVATE_KEY],
      gasPrice: "auto",
      timeout: 60000,
    },
    // Hela Mainnet (when deploying for production)
    helaMainnet: {
      url: process.env.HELA_MAINNET_RPC || "https://mainnet-rpc.helachain.com",
      chainId: 8668,
      accounts: [PRIVATE_KEY],
      gasPrice: "auto",
    },
  },
  etherscan: {
    apiKey: {
      helaTestnet: process.env.HELA_EXPLORER_API_KEY || "placeholder",
    },
    customChains: [
      {
        network: "helaTestnet",
        chainId: 666888,
        urls: {
          apiURL: "https://testnet-blockscout.helachain.com/api",
          browserURL: "https://testnet-blockscout.helachain.com",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};

export default config;
