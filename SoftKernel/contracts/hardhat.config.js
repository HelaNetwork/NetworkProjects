require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "homestead"
    }
  },
  networks: {
    hela: {
      url: "https://testnet-rpc.helachain.com",
      chainId: 666888,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    },
    hardhat: {
      accounts: {
        accountsBalance: "1000000000000000000000000" // 1,000,000 ETH
      }
    }
  },
  evmVersion: "homestead"
};
