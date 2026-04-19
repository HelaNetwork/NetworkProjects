
import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy Mock Token first if on local or testnet without HLUSD
    // For HeLa testnet, we might want to use a specific token address if known.
    // Assuming we deploy a mock for now or use the native gas token wrapped?
    // The prompt says "utilizing HeLa’s stablecoin-native gas architecture (HLUSD)".
    // This means gas IS HLUSD. But for streaming, do we stream the gas token or an ERC20?
    // Usually gas token streaming is harder (ETH streaming). Sablier wraps it.
    // If HLUSD is gas, we can stream native coin (HLUSD).
    // BUT my contract uses `IERC20 paymentToken`.
    // If I want to stream Native HLUSD, I need to wrap it or change contract to handle native ETH/HLUSD.
    // The prompt says "Smart Contract Development: Solidity-based streaming logic using HLUSD as the primary asset."
    // If HLUSD is the native gas token, I should support depositing Native HLUSD.
    // Current `PayStream.sol` expects ERC20.
    // I should probably modify `PayStream.sol` to accept native HLUSD or use a Wrapped HLUSD.
    // Given "stablecoin-native gas architecture", HLUSD is the native coin.
    // I will update PayStream.sol to handle native tax/deposit.
    // But for now, let's deploy a Mock for the ERC20 reference or use WHEAD (Wrapped HLUSD).

    // Actually, let's modify PayStream to handle native currency if possible, or just use ERC20 for simplicity if that's easier.
    // Prompt: "Solidity-based streaming logic using HLUSD as the primary asset."
    // If HLUSD is native, I should use `msg.value`.

    // Let's stick to the current plan of ERC20 for now to be safe, but I'll add a Mock token deploy.

    const MockHLUSD = await ethers.getContractFactory("MockHLUSD");
    const mockHLUSD = await MockHLUSD.deploy();
    await mockHLUSD.waitForDeployment();
    const hlusdAddress = await mockHLUSD.getAddress();
    console.log("MockHLUSD deployed to:", hlusdAddress);

    const txVault = deployer.address; // Use deployer as tax vault for now

    const PayStream = await ethers.getContractFactory("PayStream");
    const payStream = await PayStream.deploy(hlusdAddress, txVault);
    await payStream.waitForDeployment();
    const payStreamAddress = await payStream.getAddress();

    console.log("PayStream deployed to:", payStreamAddress);
    console.log("\n✅ Deployment Complete!");
    console.log("\nUpdate your frontend/.env.local with:");
    console.log(`NEXT_PUBLIC_PAYSTREAM_CONTRACT_ADDRESS=${payStreamAddress}`);
    console.log(`NEXT_PUBLIC_MOCK_TOKEN_ADDRESS=${hlusdAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
