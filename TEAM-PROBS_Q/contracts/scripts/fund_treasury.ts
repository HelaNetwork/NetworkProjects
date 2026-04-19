import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    // 1. Get Amount
    const amountStr = (process.env.AMOUNT || "1000").trim(); // Default 1000 HLUSD
    const amount = ethers.parseEther(amountStr);

    console.log(`Funding Treasury with ${amountStr} HLUSD...`);

    // 2. Load addresses
    const deploymentPath = path.join(__dirname, "..", "deployed-addresses.json");
    if (!fs.existsSync(deploymentPath)) {
        console.error("Error: deployed-addresses.json not found.");
        process.exit(1);
    }
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
    const treasuryAddress = deployment.treasury;
    const hlusdAddress = deployment.hlusd;

    // 3. Connect
    const [deployer] = await ethers.getSigners();
    console.log(`Using deployer: ${deployer.address}`);

    const HLUSD = await ethers.getContractAt("IERC20", hlusdAddress);
    const Treasury = await ethers.getContractAt("PayrollTreasury", treasuryAddress);

    // 4. Check Balance
    const balance = await HLUSD.balanceOf(deployer.address);
    if (balance < amount) {
        console.error(`Insufficient HLUSD. Have: ${ethers.formatEther(balance)}, Need: ${amountStr}`);
        process.exit(1);
    }

    // 5. Approve
    console.log("Approving Treasury...");
    const txApprove = await HLUSD.approve(treasuryAddress, amount);
    await txApprove.wait();
    console.log("Approved.");

    // 6. Deposit
    console.log("Depositing...");
    const txDeposit = await Treasury.deposit(amount);
    await txDeposit.wait();
    console.log(`✅ Success! Deposited ${amountStr} HLUSD to Treasury.`);

    // 7. Show new balance
    const newTreasuryBal = await Treasury.getBalance();
    console.log(`New Treasury Balance: ${ethers.formatEther(newTreasuryBal)} HLUSD`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
