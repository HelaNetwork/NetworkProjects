/**
 * Oracle Wallet Generator
 * 
 * This script generates a new Ethereum wallet to be used as the oracle signer
 * for the OffRamp contract. Run this before deploying contracts.
 * 
 * Usage:
 *   node generate-oracle.js
 */

const { ethers } = require('ethers');

console.log('\n========================================');
console.log('🔐 Oracle Wallet Generator');
console.log('========================================\n');

// Generate random wallet
const wallet = ethers.Wallet.createRandom();

console.log('✅ New oracle wallet generated!\n');
console.log('📋 Save these values securely:\n');
console.log('┌─────────────────────────────────────────────────────────┐');
console.log('│ Oracle Address (Public):                                │');
console.log('│', wallet.address.padEnd(54), '│');
console.log('├─────────────────────────────────────────────────────────┤');
console.log('│ Oracle Private Key:                                     │');
console.log('│', wallet.privateKey.padEnd(54), '│');
console.log('└─────────────────────────────────────────────────────────┘\n');

console.log('📝 Configuration Steps:\n');
console.log('1. Backend Configuration (contracts/.env):');
console.log('   Add this line:');
console.log('   ORACLE_SIGNER=' + wallet.address);
console.log('');
console.log('2. Frontend Configuration (frontend/.env):');
console.log('   Add this line:');
console.log('   VITE_ORACLE_PRIVATE_KEY=' + wallet.privateKey);
console.log('');

console.log('⚠️  IMPORTANT SECURITY NOTES:');
console.log('   • Keep the private key SECRET');
console.log('   • Never commit .env files to Git');
console.log('   • The address is public (use in contract)');
console.log('   • The private key is private (use in frontend only)');
console.log('   • For production, use a backend oracle service\n');

console.log('🚀 Next Steps:');
console.log('   1. Save both values to a secure location');
console.log('   2. Add ORACLE_SIGNER to contracts/.env');
console.log('   3. Deploy contracts: npx hardhat run scripts/deploy.js --network hela');
console.log('   4. Add VITE_ORACLE_PRIVATE_KEY to frontend/.env');
console.log('   5. Update OFFRAMP_ADDRESS in frontend/src/contracts.js');
console.log('   6. Test the OffRamp feature\n');

console.log('========================================\n');
