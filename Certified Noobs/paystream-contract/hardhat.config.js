require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    hela: {
      url: process.env.HELA_RPC_URL || "https://testnet-rpc.helachain.com",
      chainId: parseInt(process.env.HELA_CHAIN_ID || "666888", 10),
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  etherscan: {
    apiKey: {
      hela: process.env.HELA_EXPLORER_API_KEY || "abc", // set HELA_EXPLORER_API_KEY in .env if explorer requires it
    },
    customChains: [
      {
        network: "hela",
        chainId: 666888,
        urls: {
          apiURL: "https://testnet-blockexplorer.helachain.com/api",
          browserURL: "https://testnet-blockexplorer.helachain.com",
        },
      },
    ],
  },
};
