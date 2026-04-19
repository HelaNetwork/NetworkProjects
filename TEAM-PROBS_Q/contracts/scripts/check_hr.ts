import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    const targetAddress = process.env.TARGET_ADDRESS;
    if (!targetAddress) {
        console.log("No address provided");
        return;
    }

    const deploymentPath = path.join(__dirname, "..", "deployed-addresses.json");
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
    const payStreamAddress = deployment.payStream;

    const PayStream = await ethers.getContractFactory("PayStream");
    const payStream = PayStream.attach(payStreamAddress) as any;

    const isHR = await payStream.isHR(targetAddress);
    console.log(`Is HR (${targetAddress}): ${isHR}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
