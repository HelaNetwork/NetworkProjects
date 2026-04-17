import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    console.error("No deployer account found.");
    process.exit(1);
  }
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy LikeRegistry
  const LikeRegistry = await ethers.getContractFactory("LikeRegistry");
  const likeRegistry = await LikeRegistry.deploy();
  await likeRegistry.waitForDeployment();
  const likeRegistryAddress = await likeRegistry.getAddress();
  console.log("LikeRegistry deployed to:", likeRegistryAddress);

  // Deploy MatchRegistry
  const MatchRegistry = await ethers.getContractFactory("MatchRegistry");
  const matchRegistry = await MatchRegistry.deploy();
  await matchRegistry.waitForDeployment();
  const matchRegistryAddress = await matchRegistry.getAddress();
  console.log("MatchRegistry deployed to:", matchRegistryAddress);

  // Deploy PaymentManager
  const PaymentManager = await ethers.getContractFactory("PaymentManager");
  const paymentManager = await PaymentManager.deploy();
  await paymentManager.waitForDeployment();
  const paymentManagerAddress = await paymentManager.getAddress();
  console.log("PaymentManager deployed to:", paymentManagerAddress);

  const out = {
    network: "helaTestnet",
    chainId: 666888,
    deployer: deployer.address,
    LikeRegistry: likeRegistryAddress,
    MatchRegistry: matchRegistryAddress,
    PaymentManager: paymentManagerAddress,
  };

  const root = path.join(__dirname, "..", "..");
  const addressesPath = path.join(root, "deployed-addresses.json");
  fs.writeFileSync(addressesPath, JSON.stringify(out, null, 2));
  console.log("Wrote deployed addresses to", addressesPath);

  const envLines = [
    `# HelaMatch contracts - paste into .env.local`,
    `NEXT_PUBLIC_LIKE_REGISTRY=${likeRegistryAddress}`,
    `NEXT_PUBLIC_MATCH_REGISTRY=${matchRegistryAddress}`,
    `NEXT_PUBLIC_PAYMENT_MANAGER=${paymentManagerAddress}`,
    ``,
    `# Hela Testnet Config`,
    `NEXT_PUBLIC_HELA_RPC_URL=https://testnet-rpc.helachain.com`,
  ];
  const envPath = path.join(root, "hela-contracts.env");
  fs.writeFileSync(envPath, envLines.join("\n"));
  console.log("Wrote environment snippet to", envPath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
