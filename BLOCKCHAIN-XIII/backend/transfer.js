const { ethers } = require('ethers');

const PRIVATE_KEY = '0x54a508ca8307f0563b0c7a0ffa37270be1cf7f39feab2ba91f00d36600e63c4a';
const TO = '0x4FBc25c350a2482D3c861f0C62985db62c303ede';

async function main() {
  const provider = new ethers.JsonRpcProvider('https://testnet-rpc.helachain.com');
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log('Sending from:', wallet.address);
  const tx = await wallet.sendTransaction({
    to: TO,
    value: ethers.parseEther('14')
  });
  console.log('TX sent:', tx.hash);
  await tx.wait();
  console.log('Done!');
}

main().catch(console.error);