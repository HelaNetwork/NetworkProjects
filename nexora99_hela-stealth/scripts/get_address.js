const { ethers } = require("ethers");
require("dotenv").config({ path: "./backend/.env" });

async function main() {
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
  console.log(`Address: ${wallet.address}`);
}

main().catch(console.error);
