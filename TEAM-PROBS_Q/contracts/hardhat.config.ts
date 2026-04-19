import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter";
import "dotenv/config";

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0x" + "0".repeat(64);

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.24",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
            viaIR: false,
        },
    },
    networks: {
        hela_testnet: {
            url: "https://testnet-rpc.helachain.com",
            chainId: 666888,
            accounts: [DEPLOYER_PRIVATE_KEY],
        },
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
    },
};

export default config;
