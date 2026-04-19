const { ethers } = require('ethers');
require('dotenv').config();

async function grantHRRole() {
  console.log('\n🔐 Granting HR_ROLE...\n');
  
  const provider = new ethers.JsonRpcProvider(process.env.HELA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const PayStream = new ethers.Contract(
    process.env.PAYSTREAM_CONTRACT,
    [
      'function HR_ROLE() view returns (bytes32)',
      'function hasRole(bytes32 role, address account) view returns (bool)',
      'function grantRole(bytes32 role, address account)',
      'function DEFAULT_ADMIN_ROLE() view returns (bytes32)'
    ],
    wallet
  );
  
  console.log('Wallet:', wallet.address);
  console.log('Contract:', process.env.PAYSTREAM_CONTRACT);
  
  const HR_ROLE = await PayStream.HR_ROLE();
  console.log('HR_ROLE hash:', HR_ROLE);
  
  // Check if already has role
  const hasRole = await PayStream.hasRole(HR_ROLE, wallet.address);
  console.log('Already has HR_ROLE:', hasRole);
  
  if (hasRole) {
    console.log('\n✅ Already has HR_ROLE!');
    return;
  }
  
  console.log('\nGranting HR_ROLE...');
  const tx = await PayStream.grantRole(HR_ROLE, wallet.address);
  console.log('Transaction sent:', tx.hash);
  
  await tx.wait();
  console.log('✅ HR_ROLE granted successfully!');
  
  // Verify
  const nowHasRole = await PayStream.hasRole(HR_ROLE, wallet.address);
  console.log('Verification - Has HR_ROLE:', nowHasRole);
}

grantHRRole().catch(console.error);