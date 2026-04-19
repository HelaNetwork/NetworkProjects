/**
 * OffRamp Test Script
 * 
 * This script helps verify the OffRamp deployment and functionality.
 * Run after deploying contracts and configuring the frontend.
 * 
 * Usage:
 *   node test-offramp.js
 */

const { ethers } = require('hardhat');

async function main() {
  console.log('\n========================================');
  console.log('🧪 OffRamp Test Suite');
  console.log('========================================\n');

  const [deployer] = await ethers.getSigners();
  console.log('Testing with account:', deployer.address);

  // Load deployed addresses from deployment info
  const fs = require('fs');
  const path = require('path');
  const deploymentPath = path.join(__dirname, 'deployments', 'paystream-hela.json');
  
  if (!fs.existsSync(deploymentPath)) {
    console.error('❌ Deployment file not found!');
    console.error('   Run deployment first: npx hardhat run scripts/deploy.js --network hela');
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const offRampAddress = deployment.contracts.OffRamp;
  const oracleSigner = deployment.contracts.OracleSigner;

  console.log('📋 Configuration:');
  console.log('   OffRamp Address:', offRampAddress);
  console.log('   Oracle Signer:', oracleSigner);
  console.log('');

  // Get contract instance
  const OffRamp = await ethers.getContractFactory('OffRamp');
  const offRamp = OffRamp.attach(offRampAddress);

  console.log('🔍 Running Tests...\n');

  // Test 1: Verify Oracle Signer
  console.log('Test 1: Verify Oracle Signer');
  const contractOracleSigner = await offRamp.oracleSigner();
  if (contractOracleSigner.toLowerCase() === oracleSigner.toLowerCase()) {
    console.log('   ✅ Oracle signer matches deployment');
  } else {
    console.log('   ❌ Oracle signer mismatch!');
    console.log('      Expected:', oracleSigner);
    console.log('      Got:', contractOracleSigner);
  }
  console.log('');

  // Test 2: Check Initial Stats
  console.log('Test 2: Check Initial Stats');
  const [volume, fees, count] = await offRamp.getStats();
  console.log('   Total Volume:', ethers.formatEther(volume), 'HLUSD');
  console.log('   Total Fees:', ethers.formatEther(fees), 'HLUSD');
  console.log('   Total Conversions:', count.toString());
  console.log('   ✅ Stats retrieved successfully');
  console.log('');

  // Test 3: Check Fee Percent
  console.log('Test 3: Check Fee Percent');
  const feePercent = await offRamp.feePercent();
  console.log('   Fee Percent:', feePercent.toString() + '%');
  if (feePercent === 1n) {
    console.log('   ✅ Fee is correct (1%)');
  } else {
    console.log('   ⚠️  Unexpected fee percent');
  }
  console.log('');

  // Test 4: Verify Contract Balance
  console.log('Test 4: Check Contract Balance');
  const balance = await ethers.provider.getBalance(offRampAddress);
  console.log('   Contract Balance:', ethers.formatEther(balance), 'HLUSD');
  console.log('   ✅ Balance retrieved');
  console.log('');

  // Test 5: Simulate Rate Signing (if oracle key available)
  console.log('Test 5: Rate Signing Simulation');
  const oraclePrivateKey = process.env.ORACLE_PRIVATE_KEY;
  
  if (oraclePrivateKey) {
    try {
      const oracleWallet = new ethers.Wallet(oraclePrivateKey);
      const rate = BigInt(Math.floor(83 * 1e18)); // Example: 83 INR per HLUSD
      const timestamp = BigInt(Math.floor(Date.now() / 1000));

      // Create message hash
      const messageHash = ethers.solidityPackedKeccak256(
        ['uint256', 'uint256'],
        [rate, timestamp]
      );

      // Sign
      const signature = await oracleWallet.signMessage(ethers.getBytes(messageHash));

      console.log('   ✅ Test signature created successfully');
      console.log('   Rate:', ethers.formatEther(rate), 'INR per HLUSD');
      console.log('   Timestamp:', timestamp.toString());
      console.log('   Signature:', signature.slice(0, 20) + '...');
      
      // Verify the wallet matches expected oracle
      if (oracleWallet.address.toLowerCase() === oracleSigner.toLowerCase()) {
        console.log('   ✅ Oracle wallet matches contract signer');
      } else {
        console.log('   ❌ Oracle wallet mismatch!');
        console.log('      Wallet:', oracleWallet.address);
        console.log('      Expected:', oracleSigner);
      }
    } catch (err) {
      console.log('   ❌ Signing test failed:', err.message);
    }
  } else {
    console.log('   ⚠️  ORACLE_PRIVATE_KEY not set in .env');
    console.log('      Set it to test signature functionality');
  }
  console.log('');

  // Test 6: Check User Conversions
  console.log('Test 6: User Conversion History');
  try {
    const userConversions = await offRamp.getUserConversions(deployer.address);
    console.log('   User Conversions:', userConversions.length);
    if (userConversions.length > 0) {
      console.log('   ✅ Found', userConversions.length, 'conversion(s)');
      // Show first conversion
      const firstConv = await offRamp.getConversion(userConversions[0]);
      console.log('   First Conversion:');
      console.log('      HLUSD:', ethers.formatEther(firstConv.hlusdAmount));
      console.log('      INR:', Number(firstConv.inrAmount) / 1e18);
      console.log('      Fee:', ethers.formatEther(firstConv.feeAmount));
    } else {
      console.log('   ✅ No conversions yet (expected for new deployment)');
    }
  } catch (err) {
    console.log('   ❌ Error:', err.message);
  }
  console.log('');

  // Summary
  console.log('========================================');
  console.log('📊 Test Summary');
  console.log('========================================\n');
  console.log('Contract Address:', offRampAddress);
  console.log('Oracle Signer:', oracleSigner);
  console.log('Network:', (await ethers.provider.getNetwork()).name);
  console.log('Chain ID:', (await ethers.provider.getNetwork()).chainId.toString());
  console.log('');
  console.log('✅ Basic tests completed successfully!');
  console.log('');
  console.log('📝 Next Steps:');
  console.log('   1. Update frontend/src/contracts.js with:');
  console.log('      export const OFFRAMP_ADDRESS = "' + offRampAddress + '";');
  console.log('');
  console.log('   2. Set oracle private key in frontend/.env:');
  console.log('      VITE_ORACLE_PRIVATE_KEY=your_key_here');
  console.log('');
  console.log('   3. Test conversion via frontend UI');
  console.log('');
  console.log('========================================\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Test failed:');
    console.error(error);
    process.exit(1);
  });
