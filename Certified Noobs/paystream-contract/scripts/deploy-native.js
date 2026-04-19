const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying NativePayStream with account:", deployer.address);

  let taxVaultAddress = process.env.TAX_VAULT_ADDRESS;
  const taxBps = process.env.TAX_BPS ? parseInt(process.env.TAX_BPS, 10) : 1000;

  if (!taxVaultAddress || taxVaultAddress === "0x0000000000000000000000000000000000000000") {
    if (taxBps > 0) {
      console.log("No TAX_VAULT_ADDRESS in env. Deploying new TaxVault...");
      const TaxVault = await hre.ethers.getContractFactory("TaxVault");
      const vault = await TaxVault.deploy(deployer.address);
      await vault.waitForDeployment();
      taxVaultAddress = await vault.getAddress();
      console.log("TaxVault deployed to:", taxVaultAddress);
    } else {
      taxVaultAddress = "0x0000000000000000000000000000000000000000";
    }
  }

  if (taxVaultAddress !== "0x0000000000000000000000000000000000000000" && taxBps > 0) {
    console.log("Tax: " + taxBps / 100 + "% to vault", taxVaultAddress);
  } else {
    console.log("Tax: disabled (no vault or 0 bps)");
  }

  const NativePayStream = await hre.ethers.getContractFactory("NativePayStream");
  const contract = await NativePayStream.deploy(taxVaultAddress, taxBps);
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log("NativePayStream deployed to:", address);

  console.log("\n--- Summary ---");
  console.log("NATIVE_PAYSTREAM_ADDRESS=" + address);
  console.log("\nSet in frontend .env.local: NEXT_PUBLIC_PAYSTREAM_ADDRESS=" + address);
  if (taxVaultAddress !== "0x0000000000000000000000000000000000000000") {
    console.log("NEXT_PUBLIC_TAX_VAULT_ADDRESS=" + taxVaultAddress);
  }
  console.log("No ERC20 / HLUSD. Use native HEA only.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
