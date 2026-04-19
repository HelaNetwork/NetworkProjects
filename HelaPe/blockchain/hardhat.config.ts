
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const HELA_RPC_URL = process.env.HELA_RPC_URL || "https://testnet-rpc.helachain.com";
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.24",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
            viaIR: true,
        },
    },
    networks: {
        hela: {
            url: HELA_RPC_URL,
            accounts: PRIVATE_KEY && PRIVATE_KEY.length >= 64 ? [PRIVATE_KEY] : [],
            chainId: 666888,
        },
        local: {
            url: "http://127.0.0.1:8545",
        },
    },
};

export default config;
