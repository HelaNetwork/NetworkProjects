import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import * as dotenv from "dotenv";

dotenv.config();

const HELA_RPC = process.env.HELA_RPC || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const HELA_EXPLORER_API = process.env.HELA_EXPLORER_API || "";

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.9",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        helaTestnet: {
            url: HELA_RPC,
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
            chainId: 666888,
        },
    },
    etherscan: {
        apiKey: {
            helaTestnet: HELA_EXPLORER_API,
        },
        customChains: [
            {
                network: "helaTestnet",
                chainId: 666888,
                urls: {
                    apiURL: "https://testnet-blockexplorer.helachain.com/api",
                    browserURL: "https://testnet-blockexplorer.helachain.com",
                },
            },
        ],
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
};

export default config;
