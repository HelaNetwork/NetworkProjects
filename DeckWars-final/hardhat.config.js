require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "paris",
      optimizer: {
        enabled: false,
        runs: 200,
      },
    },
  },
  networks: {
    hela: {
      url: "https://testnet-rpc.helachain.com",
      chainId: 666888,
      accounts: [PRIVATE_KEY],
      gasPrice: 1000000000,
    },
    helaMainnet: {
      url: "https://mainnet-rpc.helachain.com",
      chainId: 8668,
      accounts: [PRIVATE_KEY],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
