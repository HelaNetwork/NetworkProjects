// save as inspect-tx.js and run: node inspect-tx.js <txHash>
const { ethers } = require("ethers");
require("dotenv").config(); // make sure HELA_RPC_URL in .env

if (!process.argv[2]) {
  console.error("Usage: node inspect-tx.js <txHash>");
  process.exit(1);
}

const txHash = process.argv[2];
const provider = new ethers.JsonRpcProvider(process.env.HELA_RPC_URL || "https://testnet-rpc.helachain.com");

async function main() {
  const receipt = await provider.getTransactionReceipt(txHash);
  if (!receipt) {
    console.error("No receipt found for", txHash);
    return;
  }
  console.log("status:", receipt.status, "logs:", receipt.logs.length, "gasUsed:", receipt.gasUsed?.toString());
  const iface = new ethers.Interface([
    "event Transfer(address indexed from, address indexed to, uint256 value)"
  ]);
  const TRANSFER_TOPIC = ethers.id("Transfer(address,address,uint256)");

  for (let i = 0; i < receipt.logs.length; i++) {
    const l = receipt.logs[i];
    console.log(`\nLOG[${i}] address: ${l.address}`);
    console.log(" topics:", l.topics);
    console.log(" data:", l.data);
    if (l.topics[0] === TRANSFER_TOPIC) {
      try {
        const parsed = iface.parseLog(l);
        console.log(" → ERC20 Transfer event detected!");
        console.log("    tokenContract:", l.address);
        console.log("    from:", parsed.args.from);
        console.log("    to:  ", parsed.args.to);
        console.log("    value:", ethers.formatUnits(parsed.args.value, 18));
      } catch (e) {
        console.log("    failed to parse Transfer:", e.message);
      }
    }
  }

  if (receipt.logs.length === 0) {
    console.log("\nNo logs in receipt. This tx emitted no events (explorer may show token value from another source).");
  }
}

main().catch((e) => { console.error(e); process.exit(1); });