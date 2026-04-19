const { ethers } = require('ethers');
require('dotenv').config();

async function diagnoseSetup() {
  console.log('\n🔍 Diagnosing PayStream Setup...\n');

  // Check environment variables
  console.log('1️⃣  Environment Variables:');
  console.log('   HELA_RPC_URL:', process.env.HELA_RPC_URL || '❌ NOT SET');
  console.log('   PRIVATE_KEY:', process.env.PRIVATE_KEY ? '✅ SET' : '❌ NOT SET');
  console.log('   PAYSTREAM_CONTRACT:', process.env.PAYSTREAM_CONTRACT || '❌ NOT SET');
  console.log('   HLUSD_TOKEN:', process.env.HLUSD_TOKEN || '❌ NOT SET');

  if (!process.env.PRIVATE_KEY || !process.env.PAYSTREAM_CONTRACT || !process.env.HLUSD_TOKEN) {
    console.log('\n❌ Missing required environment variables!');
    return;
  }

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(process.env.HELA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log('\n2️⃣  Wallet Info:');
  console.log('   Address:', wallet.address);

  try {
    const balance = await provider.getBalance(wallet.address);
    console.log('   HELA Balance:', ethers.formatEther(balance), 'HELA');
  } catch (error) {
    console.log('   ❌ Could not fetch balance:', error.message);
  }

  // Check HLUSD balance
  console.log('\n3️⃣  HLUSD Token:');
  try {
    const HLUSD = new ethers.Contract(
      process.env.HLUSD_TOKEN,
      ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'],
      provider
    );

    const hlusdBalance = await HLUSD.balanceOf(wallet.address);
    console.log('   HLUSD Balance:', ethers.formatEther(hlusdBalance), 'HLUSD');
  } catch (error) {
    console.log('   ❌ Could not fetch HLUSD balance:', error.message);
  }

  // Check PayStream contract
  console.log('\n4️⃣  PayStream Contract:');
  try {
    const PayStream = new ethers.Contract(
      process.env.PAYSTREAM_CONTRACT,
      [
        'function nextStreamId() view returns (uint256)',
        'function createStream(address employee, address token, uint256 totalAmount, uint256 duration) returns (uint256)',
        'function HR_ROLE() view returns (bytes32)'
      ],
      wallet
    );

    const nextId = await PayStream.nextStreamId();
    console.log('   Next Stream ID:', nextId.toString());

    const hrRole = await PayStream.HR_ROLE();
    console.log('   HR_ROLE hash:', hrRole);

    // Check if wallet has HR role
    const hasRole = await PayStream.hasRole ? await PayStream.hasRole(hrRole, wallet.address) : 'Unknown';
    console.log('   Wallet has HR_ROLE:', hasRole);

  } catch (error) {
    console.log('   ❌ Error accessing contract:', error.message);
  }

  // Test creating a stream (simulation)
  console.log('\n5️⃣  Testing createStream call:');
  try {
    const testEmployee = '0x0000000000000000000000000000000000000001';
    const testAmount = ethers.parseEther('1');
    const testDuration = 604800; // 7 days

    console.log('   Employee:', testEmployee);
    console.log('   Token:', process.env.HLUSD_TOKEN);
    console.log('   Amount:', ethers.formatEther(testAmount), 'HLUSD');
    console.log('   Duration:', testDuration, 'seconds');

    // Just estimate gas, don't actually send
    const PayStream = new ethers.Contract(
      process.env.PAYSTREAM_CONTRACT,
      ['function createStream(address employee, address token, uint256 totalAmount, uint256 duration) returns (uint256)'],
      wallet
    );

    const gasEstimate = await PayStream.createStream.estimateGas(
      testEmployee,
      process.env.HLUSD_TOKEN,
      testAmount,
      testDuration
    );

    console.log('   ✅ Gas estimate:', gasEstimate.toString());
    console.log('   ✅ Contract call signature is CORRECT!');

  } catch (error) {
    console.log('   ❌ Error:', error.message);
    if (error.reason) {
      console.log('   Reason:', error.reason);
    }
  }

  console.log('\n✨ Diagnosis complete!\n');
}

diagnoseSetup().catch(console.error);
