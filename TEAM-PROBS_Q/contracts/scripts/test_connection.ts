import { ethers } from "hardhat";

async function main() {
    try {
        console.log("Testing connection to HeLa Testnet...");
        const provider = ethers.provider;
        const network = await provider.getNetwork();
        console.log(`Connected to chain ID: ${network.chainId}`);

        const blockNumber = await provider.getBlockNumber();
        console.log(`Current block number: ${blockNumber}`);

        const [deployer] = await ethers.getSigners();
        console.log(`Deployer address: ${deployer.address}`);
        const balance = await provider.getBalance(deployer.address);
        console.log(`Deployer balance: ${ethers.formatEther(balance)} HLUSD`);

    } catch (error) {
        console.error("Connection failed:", error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
