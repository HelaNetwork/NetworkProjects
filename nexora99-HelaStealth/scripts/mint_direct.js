const { ethers } = require("ethers");
require("dotenv").config({ path: "./backend/.env" });

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.HELA_RPC_URL);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const husdAddress = "0xEf3cA15C04e82b90B01AF9EccE1A0C620E74E0b3";
  const recipient = "0x7BB5c0f2cCC1Ac4E3a27BA4fd1c62d0CB6E660ea";
  const amount = ethers.parseEther("1000");

  const husdAbi = [
    "function mint(address to, uint256 amount) external",
    "function owner() view returns (address)"
  ];

  const husd = new ethers.Contract(husdAddress, husdAbi, signer);

  console.log(`Checking owner...`);
  const owner = await husd.owner();
  console.log(`Contract Owner: ${owner}`);
  console.log(`Signer Address: ${signer.address}`);

  if (owner.toLowerCase() !== signer.address.toLowerCase()) {
    console.error("Error: Signer is not the owner!");
    process.exit(1);
  }

  console.log(`Minting 1000 HUSD to ${recipient}...`);
  const tx = await husd.mint(recipient, amount);
  console.log(`TX Hash: ${tx.hash}`);
  await tx.wait();
  console.log("Success! 1000 HUSD minted.");
}

main().catch(console.error);
