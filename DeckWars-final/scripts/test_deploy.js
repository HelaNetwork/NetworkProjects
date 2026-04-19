const { ethers } = require("ethers");
require("dotenv").config();
const fs = require("fs");
const path = require("path");

async function main() {
  const provider = new ethers.JsonRpcProvider("https://testnet-rpc.helachain.com");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const feeData = await provider.getFeeData();
  const overrides = { 
    type: 0,
    gasPrice: feeData.gasPrice, 
    gasLimit: 3000000 
  };

  const p = path.join(__dirname, "../artifacts/contracts/moves/BasicAttack.sol/BasicAttack.json");
  const data = JSON.parse(fs.readFileSync(p));

  console.log("Deploying BasicAttack...");
  const factory = new ethers.ContractFactory(data.abi, data.bytecode, wallet);
  const tx = await factory.deploy(overrides);
  const deployTx = tx.deploymentTransaction ? tx.deploymentTransaction() : tx;
  console.log("Transaction Hash:", deployTx.hash);
  await tx.waitForDeployment();
  console.log("Deployed:", await tx.getAddress());
}

main().catch(console.error);
