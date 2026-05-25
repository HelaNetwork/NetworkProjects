const { ethers } = require("ethers");
require("dotenv").config({ path: "./backend/.env" });

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.HELA_RPC_URL);
  const registryAddress = "0x71741409c2F568735748D40F232Be35d43a48661";
  
  const registryAbi = [
    "event MerchantRegistered(address indexed merchant, bytes metaPublicKey)"
  ];

  const registry = new ethers.Contract(registryAddress, registryAbi, provider);
  
  console.log("Fetching MerchantRegistered events...");
  const filter = registry.filters.MerchantRegistered();
  const events = await registry.queryFilter(filter, -1000, "latest");

  if (events.length > 0) {
    events.forEach(e => {
      console.log(`Registered Merchant: ${e.args.merchant}`);
    });
  } else {
    console.log("No recent MerchantRegistered events found.");
  }
}

main().catch(console.error);
