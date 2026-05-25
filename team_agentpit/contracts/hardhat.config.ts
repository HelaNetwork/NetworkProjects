import { defineConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const contractsRoot = path.dirname(fileURLToPath(import.meta.url));

const networks = {
  baseSepolia: {
    type: "http" as const,
    url: process.env.BASE_SEPOLIA_RPC_URL ?? "https://sepolia.base.org",
    chainId: 84532,
    accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : ("remote" as const),
  },
  helaTestnet: {
    type: "http" as const,
    url: process.env.HELA_TESTNET_RPC_URL ?? "https://testnet-rpc.helachain.com",
    chainId: 666888,
    accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : ("remote" as const),
  },
};

export default defineConfig({
  plugins: [hardhatEthers],
  chainDescriptors: {
    84532: {
      name: "Base Sepolia",
      blockExplorers: {
        etherscan: {
          url: "https://sepolia.basescan.org",
        },
      },
    },
    666888: {
      name: "HeLa Testnet",
      blockExplorers: {
        etherscan: {
          url: "https://testnet-blockexplorer.helachain.com",
        },
      },
    },
  },
  solidity: {
    version: "0.8.28",
    settings: {
      evmVersion: "paris",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: [path.join(contractsRoot, "src")],
    tests: path.join(contractsRoot, "test"),
    cache: path.join(contractsRoot, "cache"),
    artifacts: path.join(contractsRoot, "artifacts"),
  },
  networks,
});