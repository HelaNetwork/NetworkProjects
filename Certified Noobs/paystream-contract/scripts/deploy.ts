import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  console.log("\n1. Deploying MockHLUSD...");
  const MockHLUSD = await hre.ethers.getContractFactory("MockHLUSD");
  const hlusd = await MockHLUSD.deploy();
  await hlusd.waitForDeployment();
  const hlusdAddress = await hlusd.getAddress();
  console.log("MockHLUSD deployed to:", hlusdAddress);

  console.log("\n2. Deploying TaxVault...");
  const TaxVault = await hre.ethers.getContractFactory("TaxVault");
  const taxVault = await TaxVault.deploy(deployer.address);
  await taxVault.waitForDeployment();
  const taxVaultAddress = await taxVault.getAddress();
  console.log("TaxVault deployed to:", taxVaultAddress);

  console.log("\n3. Deploying PayStream...");
  const PayStream = await hre.ethers.getContractFactory("PayStream");
  const paystream = await PayStream.deploy(hlusdAddress, taxVaultAddress);
  await paystream.waitForDeployment();
  const paystreamAddress = await paystream.getAddress();
  console.log("PayStream deployed to:", paystreamAddress);

  console.log("\n--- Summary ---");
  console.log("HLUSD_ADDRESS=" + hlusdAddress);
  console.log("TAX_VAULT_ADDRESS=" + taxVaultAddress);
  console.log("PAYSTREAM_ADDRESS=" + paystreamAddress);
  console.log("\nNext: Set NEXT_PUBLIC_PAYSTREAM_ADDRESS and NEXT_PUBLIC_HLUSD_ADDRESS in frontend .env.local");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
