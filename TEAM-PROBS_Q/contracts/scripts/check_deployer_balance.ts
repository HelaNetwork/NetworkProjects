import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`Deployer: ${deployer.address}`);

    // Check HLUSD token balance (ERC20)
    const HLUSD_ADDRESS = "0xBE75FDe9DeDe700635E3dDBe7e29b5db1A76C125";
    const hlusd = await ethers.getContractAt("IERC20", HLUSD_ADDRESS);
    const balance = await hlusd.balanceOf(deployer.address);
    console.log(`HLUSD Balance: ${ethers.formatEther(balance)}`);

    // Check Native Balance (for gas)
    const native = await ethers.provider.getBalance(deployer.address);
    console.log(`Native Gas: ${ethers.formatEther(native)}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
