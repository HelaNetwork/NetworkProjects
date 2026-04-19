require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: { 
      optimizer: { 
        enabled: true, 
        runs: 200 
      } 
    },
  },
  networks: {
    helaTestnet: {
      url: process.env.HELA_RPC_URL || "https://testnet-rpc.helachain.com",
      chainId: 666888,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      timeout: 120000, // 2 minutes timeout
      gas: "auto",
      gasPrice: "auto",
      // Add these for better connection handling
      httpHeaders: {},
      allowUnlimitedContractSize: false,
    },
  },
  // Increase timeout globally
  mocha: {
    timeout: 120000
  }
};