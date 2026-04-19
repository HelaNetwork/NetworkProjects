import * as dotenv from "dotenv";

dotenv.config();

export const HELA_TESTNET = {
    rpc: process.env.HELA_RPC || "https://testnet-rpc.helachain.com",
    chainId: 666888,
    explorer: "https://testnet-blockexplorer.helachain.com",
};

export const HLUSD_ADDRESS = process.env.HLUSD_ADDRESS || "<HLUSD_PLACEHOLDER>";
