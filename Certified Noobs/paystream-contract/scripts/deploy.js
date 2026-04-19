const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  let hlusdAddress = process.env.HLUSD_ADDRESS;
  if (!hlusdAddress || hlusdAddress === "0x0000000000000000000000000000000000000000") {
    console.log("\n1. Deploying MockHLUSD...");
    const MockHLUSD = await hre.ethers.getContractFactory("MockHLUSD");
    const hlusd = await MockHLUSD.deploy();
    await hlusd.waitForDeployment();
    hlusdAddress = await hlusd.getAddress();
    console.log("MockHLUSD deployed to:", hlusdAddress);
  } else {
    console.log("\n1. Using existing HLUSD:", hlusdAddress);
  }

  let taxVaultAddress = process.env.TAX_VAULT_ADDRESS;
  if (!taxVaultAddress) {
    console.log("\n2. Deploying TaxVault...");
    const TaxVault = await hre.ethers.getContractFactory("TaxVault");
    const taxVault = await TaxVault.deploy(deployer.address);
    await taxVault.waitForDeployment();
    taxVaultAddress = await taxVault.getAddress();
    console.log("TaxVault deployed to:", taxVaultAddress);
  } else {
    console.log("\n2. Using existing TaxVault:", taxVaultAddress);
  }

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
  console.log("\nSet in frontend .env.local: NEXT_PUBLIC_PAYSTREAM_ADDRESS, NEXT_PUBLIC_HLUSD_ADDRESS");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
