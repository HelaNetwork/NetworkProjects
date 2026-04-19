import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    const addr = deployer.address;
    console.log("Wallet:", addr);

    // Native HLUSD balance (gas token)
    const nativeBal = await ethers.provider.getBalance(addr);
    console.log("Native HLUSD (gas):", ethers.formatEther(nativeBal));

    // ERC20 HLUSD balance
    const hlusd = await ethers.getContractAt(
        ["function balanceOf(address) view returns (uint256)", "function name() view returns (string)", "function symbol() view returns (string)"],
        "0xBE75FDe9DeDe700635E3dDBe7e29b5db1A76C125"
    );

    try {
        const name = await hlusd.name();
        const symbol = await hlusd.symbol();
        console.log("Token:", name, "(" + symbol + ")");
    } catch (e) {
        console.log("Could not read token name/symbol — might not be a standard ERC20");
    }

    try {
        const erc20Bal = await hlusd.balanceOf(addr);
        console.log("ERC20 HLUSD Balance:", ethers.formatEther(erc20Bal));
    } catch (e) {
        console.log("Could not read ERC20 balance — token may not exist at this address");
    }

    // Treasury balance
    const path = require("path");
    const fs = require("fs");
    const deploymentPath = path.join(__dirname, "..", "deployed-addresses.json");
    if (!fs.existsSync(deploymentPath)) {
        console.error("Error: deployed-addresses.json not found.");
        return;
    }
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
    const treasuryAddr = deployment.treasury;

    console.log("Treasury Address:", treasuryAddr);

    const treasury = await ethers.getContractAt(
        ["function getBalance() view returns (uint256)"],
        treasuryAddr
    );
    const treasuryBal = await treasury.getBalance();
    console.log("Treasury Balance:", ethers.formatEther(treasuryBal));
}

main().catch(console.error);
