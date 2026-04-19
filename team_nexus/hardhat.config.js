require("@nomicfoundation/hardhat-toolbox");
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
    // Force JS/WASM compiler — fixes HH505 on macOS Apple Silicon
    solcjs: true,
    paths: {
        tests: "./contracts/test",
    },
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545",
        },
        hela: {
            url: process.env.HELA_RPC_URL || "https://testnet-rpc.helachain.com",
            chainId: 666888,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
        },
        hela_mainnet: {
            url: "https://mainnet-rpc.helachain.com",
            chainId: 8668,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
        },
    },
};
