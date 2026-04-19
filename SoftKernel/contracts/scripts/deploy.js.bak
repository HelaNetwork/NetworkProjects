const hre = require("hardhat");

/**
 * PayStream Deployment Script for HeLa Testnet
 * 
 * Deployment order:
 * 1. Deploy Treasury (native HLUSD custody)
 * 2. Deploy SalaryStream (with Treasury and taxVault addresses)
 * 3. Set SalaryStream address in Treasury
 * 4. Admin can now deposit native HLUSD and create streams
 * 
 * Prerequisites:
 * - Set PRIVATE_KEY in .env file  
 * - Ensure wallet has native HLUSD for gas and deposits on HeLa
 * - HLUSD is native asset (like ETH) - no token contract needed
 */

async function main() {
  console.log("========================================");
  console.log("PayStream Deployment on HeLa Testnet");
  console.log("========================================\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Check deployer balance (native HLUSD)
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "HLUSD\n");

  // Require minimum balance for deployment
  const minBalance = hre.ethers.parseEther("0.1");
  if (balance < minBalance) {
    console.error("❌ Insufficient HLUSD balance for deployment!");
    console.error("   Need at least 0.1 HLUSD for gas fees");
    process.exit(1);
  }

  // ========== CONFIGURATION ==========
  // Tax vault can be set to a separate address or deployer initially
  const TAX_VAULT = process.env.TAX_VAULT || deployer.address;
  
  // Oracle signer for OffRamp - defaults to deployer but should be separate in production
  const ORACLE_SIGNER = process.env.ORACLE_SIGNER || deployer.address;

  console.log("Configuration:");
  console.log("- Network: HeLa Testnet");
  console.log("- Chain ID: 666888");
  console.log("- Tax Vault:", TAX_VAULT);
  console.log("- Oracle Signer:", ORACLE_SIGNER);
  console.log("- Native Asset: HLUSD (like ETH)");
  console.log("");

  // ========== STEP 1: Deploy Treasury ==========
  console.log("📦 Step 1: Deploying Treasury contract...");
  const Treasury = await hre.ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy();
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("✅ Treasury deployed to:", treasuryAddress);
  console.log("");

  // ========== STEP 2: Deploy SalaryStream ==========
  console.log("📦 Step 2: Deploying SalaryStream contract...");
  const SalaryStream = await hre.ethers.getContractFactory("SalaryStream");
  const salaryStream = await SalaryStream.deploy(treasuryAddress, TAX_VAULT);
  await salaryStream.waitForDeployment();
  const salaryStreamAddress = await salaryStream.getAddress();
  console.log("✅ SalaryStream deployed to:", salaryStreamAddress);
  console.log("");

  // ========== STEP 3: Link SalaryStream to Treasury ==========
  console.log("🔗 Step 3: Linking SalaryStream to Treasury...");
  const tx = await treasury.setSalaryStream(salaryStreamAddress);
  await tx.wait();
  console.log("✅ SalaryStream linked to Treasury");
  console.log("");

  // ========== STEP 4: Deploy OffRamp ==========
  console.log("📦 Step 4: Deploying OffRamp contract...");
  const OffRamp = await hre.ethers.getContractFactory("OffRamp");
  const offRamp = await OffRamp.deploy(ORACLE_SIGNER);
  await offRamp.waitForDeployment();
  const offRampAddress = await offRamp.getAddress();
  console.log("✅ OffRamp deployed to:", offRampAddress);
  console.log("   Oracle Signer:", ORACLE_SIGNER);
  console.log("");

  // ========== STEP 5: Verify Setup ==========
  console.log("🔐 Step 5: Verifying deployment...");
  const treasuryStreamAddr = await treasury.salaryStream();
  const streamAdmin = await salaryStream.admin();
  const offRampOracleSigner = await offRamp.oracleSigner();
  console.log("✅ Treasury.salaryStream:", treasuryStreamAddr);
  console.log("✅ SalaryStream.admin:", streamAdmin);
  console.log("✅ OffRamp.oracleSigner:", offRampOracleSigner);
  console.log("");

  // ========== DEPLOYMENT SUMMARY ==========
  console.log("========================================");
  console.log("🎉 PayStream Deployment Complete!");
  console.log("========================================");
  console.log("");
  console.log("📋 Contract Addresses:");
  console.log("┌──────────────────────────────────────────────┐");
  console.log("│ Treasury:      ", treasuryAddress);
  console.log("│ SalaryStream:  ", salaryStreamAddress);
  console.log("│ OffRamp:       ", offRampAddress);
  console.log("│ Tax Vault:     ", TAX_VAULT);
  console.log("│ Oracle Signer: ", ORACLE_SIGNER);
  console.log("│ Admin:         ", deployer.address);
  console.log("└──────────────────────────────────────────────┘");
  console.log("");
  console.log("📝 Next Steps:");
  console.log("1. Deposit native HLUSD to Treasury:");
  console.log(`   treasury.deposit({ value: ethers.parseEther("10000") })`);
  console.log("");
  console.log("2. Create a salary stream:");
  console.log(`   salaryStream.createStream(`);
  console.log(`     employeeAddress,`);
  console.log(`     ethers.parseEther("3000"), // 3000 HLUSD/month`);
  console.log(`     12,                        // 12 months`);
  console.log(`     10                         // 10% tax`);
  console.log(`   )`);
  console.log("");
  console.log("3. Employee withdraws earned salary:");
  console.log(`   salaryStream.withdraw()`);
  console.log("");
  console.log("4. Schedule a performance bonus:");
  console.log(`   salaryStream.scheduleBonus(employeeAddr, amount, unlockTime)`);
  console.log("");
  console.log("5. Claim yield on reserved capital:");
  console.log(`   treasury.claimYield()`);
  console.log("");
  console.log("6. Convert HLUSD to INR via OffRamp:");
  console.log(`   offRamp.convertToFiat(rate, timestamp, signature)`);
  console.log("");

  // Save deployment info to file
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
      OracleSigner: ORACLE_SIGNER
    },
    config: {
      solidityVersion: "0.8.9",
      nativeAsset: "HLUSD"
    }
  };

  const fs = require('fs');
  const path = require('path');
  const deploymentsDir = path.join(__dirname, '../deployments');
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, 'paystream-hela.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("📄 Deployment info saved to: deployments/paystream-hela.json");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
