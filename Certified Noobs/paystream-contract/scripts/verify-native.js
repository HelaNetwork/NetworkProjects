/**
 * Verify NativePayStream on HeLa block explorer.
 * Usage:
 *   npx hardhat run scripts/verify-native.js --network hela
 * Or with custom constructor args (if you deployed with different values):
 *   CONTRACT=0x5d77e... TAX_VAULT=0x0000... TAX_BPS=0 npx hardhat run scripts/verify-native.js --network hela
 */
const hre = require("hardhat");

async function main() {
  const contractAddress =
    process.env.CONTRACT || process.env.NATIVE_PAYSTREAM_ADDRESS;
  if (!contractAddress) {
    console.error("Set CONTRACT or NATIVE_PAYSTREAM_ADDRESS (the deployed contract address)");
    process.exitCode = 1;
    return;
  }

  const taxVault = process.env.TAX_VAULT || "0x0000000000000000000000000000000000000000";
  const taxBps = process.env.TAX_BPS ? parseInt(process.env.TAX_BPS, 10) : 0;

  console.log("Verifying", contractAddress, "with constructor args:", taxVault, taxBps);

  await hre.run("verify:verify", {
    address: contractAddress,
    constructorArguments: [taxVault, taxBps],
  });

  console.log("Verified successfully.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
