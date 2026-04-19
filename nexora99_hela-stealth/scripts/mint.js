require("dotenv").config({ path: "../backend/.env" });
const hre = require("hardhat");
const addresses = require("../addresses.json");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log(`Using account: ${deployer.address}`);

    const HUSD = await hre.ethers.getContractFactory("HUSD");
    const husd = await HUSD.attach(addresses.HUSD);

    const accounts = [
        "0x7bb5c0f2ccc1ac4e3a27ba4fd1c62d0cb6e660ea", // Account 2 (Customer)
        "0x73f48a8f04955D3266402f562caFB5127bfbEC37"  // Account 1 (Merchant)
    ];
    
    const amount = hre.ethers.parseEther("1000");

    for (const acc of accounts) {
        console.log(`Minting ${hre.ethers.formatEther(amount)} HUSD to ${acc}...`);
        const tx = await husd.mint(acc, amount);
        await tx.wait();
        console.log("Mint successful for", acc);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
