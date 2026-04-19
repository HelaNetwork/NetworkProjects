const hre = require("hardhat");

async function main() {
    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (!contractAddress) {
        console.error("Please set CONTRACT_ADDRESS env var");
        process.exit(1);
    }

    console.log("Checking owner for contract at:", contractAddress);

    // Use getContractAt which is generally more robust for existing deployments
    const contract = await hre.ethers.getContractAt("NativePayStream", contractAddress);

    try {
        const owner = await contract.owner();
        console.log("Contract Owner is:", owner);

        const [deployer] = await hre.ethers.getSigners();
        console.log("Your configured private key account:", deployer.address);

        if (owner.toLowerCase() === deployer.address.toLowerCase()) {
            console.log("SUCCESS: Your private key IS the owner.");
        } else {
            console.log("WARNING: Your private key is NOT the owner.");
        }

    } catch (error) {
        console.error("Error fetching owner:", error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
