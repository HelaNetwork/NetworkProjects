import { ethers } from "ethers";
import { config } from "dotenv";
config();

const pk = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(pk.startsWith("0x") ? pk : "0x" + pk);
const deployerAddr = wallet.address;
console.log("Deployer:", deployerAddr);

const RPC = process.env.HELA_RPC_URL || "https://testnet-rpc.helachain.com";
const provider = new ethers.JsonRpcProvider(RPC);
const currentNonce = await provider.getTransactionCount(deployerAddr);
console.log("Current nonce:", currentNonce);

// The 3 deployments used nonces: currentNonce-3, currentNonce-2, currentNonce-1
const deployNonces = [currentNonce - 3, currentNonce - 2, currentNonce - 1];
for (const n of deployNonces) {
  const contractAddr = ethers.getCreateAddress({ from: deployerAddr, nonce: n });
  console.log(`Nonce ${n} => contract address: ${contractAddr}`);
}

// Scan recent blocks to find our tx hashes
const blockNum = await provider.getBlockNumber();
console.log("Current block:", blockNum);
const found = [];
for (let i = blockNum; i > Math.max(0, blockNum - 1000) && found.length < 5; i--) {
  try {
    const block = await provider.getBlock(i, true);
    if (!block || !block.transactions) continue;
    for (const tx of block.transactions) {
      if (typeof tx === "object" && tx.from && tx.from.toLowerCase() === deployerAddr.toLowerCase()) {
        found.push({ hash: tx.hash, nonce: tx.nonce, to: tx.to, block: i });
      }
    }
  } catch (e) {}
}
console.log("Found txs:", JSON.stringify(found, null, 2));
