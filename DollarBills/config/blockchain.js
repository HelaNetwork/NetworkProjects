const { ethers } = require("ethers");
require("dotenv").config();

// Move up two levels to find the shared folder outside of backend
const contractABI = require("../../shared/abi.json"); 

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// This will fail if PRIVATE_KEY in .env is missing '0x' or is invalid
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    contractABI,
    wallet
);

async function testConnection() {
    try {
        const block = await provider.getBlockNumber();
        console.log("✅ Connection Successful. HeLa Block:", block);
    } catch (err) {
        console.error("❌ Connection Failed. Check your .env values.");
    }
}

module.exports = { provider, wallet, contract, testConnection };