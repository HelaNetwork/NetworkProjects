const hre = require("hardhat");

/**
 * PayStream v2 Deployment Script for HeLa Testnet
 *
 * Deployment order:
 * 1. Deploy Treasury (native HLUSD custody)
 * 2. Deploy SalaryStream (multi-company governance + streaming)
 * 3. Link SalaryStream → Treasury
 * 4. Deploy OffRamp
 * 5. Verify setup
 */

async function main() {
  console.log("========================================");
  console.log("PayStream v2 – Multi-Company Governance");
  console.log("========================================\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "HLUSD\n");

  const minBalance = hre.ethers.parseEther("0.1");
  if (balance < minBalance) {
    console.error("❌ Insufficient HLUSD balance for deployment!");
    process.exit(1);
  }

  const TAX_VAULT = process.env.TAX_VAULT || deployer.address;
  const ORACLE_SIGNER = process.env.ORACLE_SIGNER || deployer.address;

  console.log("Configuration:");
  console.log("- Network: HeLa Testnet (666888)");
  console.log("- Tax Vault:", TAX_VAULT);
  console.log("- Oracle Signer:", ORACLE_SIGNER);
  console.log("");

  // Step 1: Treasury
  console.log("📦 Step 1: Deploying Treasury...");
  const Treasury = await hre.ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy();
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("✅ Treasury:", treasuryAddress, "\n");

  // Step 2: SalaryStream
  console.log("📦 Step 2: Deploying SalaryStream (multi-company)...");
  const SalaryStream = await hre.ethers.getContractFactory("SalaryStream");
  const salaryStream = await SalaryStream.deploy(treasuryAddress, TAX_VAULT);
  await salaryStream.waitForDeployment();
  const salaryStreamAddress = await salaryStream.getAddress();
  console.log("✅ SalaryStream:", salaryStreamAddress, "\n");

  // Step 3: Link
  console.log("🔗 Step 3: Linking SalaryStream → Treasury...");
  const tx = await treasury.setSalaryStream(salaryStreamAddress);
  await tx.wait();
  console.log("✅ Linked\n");

  // Step 4: OffRamp
  console.log("📦 Step 4: Deploying OffRamp...");
  const OffRamp = await hre.ethers.getContractFactory("OffRamp");
  const offRamp = await OffRamp.deploy(ORACLE_SIGNER);
  await offRamp.waitForDeployment();
  const offRampAddress = await offRamp.getAddress();
  console.log("✅ OffRamp:", offRampAddress, "\n");

  // Step 5: Verify
  console.log("🔐 Step 5: Verifying...");
  console.log("  Treasury.salaryStream:", await treasury.salaryStream());
  console.log("  SalaryStream.companyCounter:", await salaryStream.companyCounter());
  console.log("  OffRamp.oracleSigner:", await offRamp.oracleSigner());
  console.log("");

  // Summary
  console.log("========================================");
  console.log("🎉 PayStream v2 Deployment Complete!");
  console.log("========================================\n");
  console.log("📋 Contract Addresses:");
  console.log("┌──────────────────────────────────────────────┐");
  console.log("│ Treasury:      ", treasuryAddress);
  console.log("│ SalaryStream:  ", salaryStreamAddress);
  console.log("│ OffRamp:       ", offRampAddress);
  console.log("│ Tax Vault:     ", TAX_VAULT);
  console.log("│ Oracle Signer: ", ORACLE_SIGNER);
  console.log("│ Deployer:      ", deployer.address);
  console.log("└──────────────────────────────────────────────┘\n");

  console.log("📝 Quick Start:");
  console.log("1. Deposit HLUSD to Treasury:");
  console.log(`   treasury.deposit({ value: ethers.parseEther("10000") })`);
  console.log("2. Create a company:");
  console.log(`   salaryStream.createCompany("Acme Corp")`);
  console.log("3. Add an employee:");
  console.log(`   salaryStream.addEmployee(1, employeeAddress)`);
  console.log("4. Create a stream:");
  console.log(`   salaryStream.createStream(1, employee, parseEther("3000"), 12, 10)`);
  console.log("");

  // Save deployment info
  const deploymentInfo = {
    network: "HeLa Testnet",
    chainId: 666888,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      Treasury: treasuryAddress,
      SalaryStream: salaryStreamAddress,
      OffRamp: offRampAddress,
      TaxVault: TAX_VAULT,
      OracleSigner: ORACLE_SIGNER,
    },
    config: {
      solidityVersion: "0.8.20",
      nativeAsset: "HLUSD",
      version: "v2-multi-company",
    },
  };

  const fs = require("fs");
  const path = require("path");
  const dir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  fs.writeFileSync(
    path.join(dir, "paystream-hela.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("📄 Deployment info saved to deployments/paystream-hela.json\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
