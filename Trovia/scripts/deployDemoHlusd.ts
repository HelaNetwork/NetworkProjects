import fs from "fs";
import path from "path";
import { parseUnits } from "ethers";
import { ethers, network } from "hardhat";

async function main() {
  const initialSupply = parseUnits(process.env.DEMO_HLUSD_INITIAL_SUPPLY || "10000000", 18);

  const [deployer] = await ethers.getSigners();
  const chain = await ethers.provider.getNetwork();

  console.log("Deploying DemoHLUSD...");
  console.log("Network:", network.name);
  console.log("Chain ID:", chain.chainId.toString());
  console.log("Deployer:", deployer.address);
  console.log("Initial Supply:", initialSupply.toString());

  const factory = await ethers.getContractFactory("DemoHLUSD");
  const token = await factory.deploy(initialSupply);
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();

  const deployment = {
    network: network.name,
    chainId: chain.chainId.toString(),
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    demoHlusdAddress: tokenAddress,
    initialSupply: initialSupply.toString()
  };

  const deploymentsDir = path.join(process.cwd(), "deployments");
  fs.mkdirSync(deploymentsDir, { recursive: true });
  const outFile = path.join(deploymentsDir, `demo-hlusd-${network.name}.json`);
  fs.writeFileSync(outFile, JSON.stringify(deployment, null, 2));

  console.log("DemoHLUSD:", tokenAddress);
  console.log("\nSet these in .env and .env.local:");
  console.log(`HLUSD_ADDRESS=${tokenAddress}`);
  console.log(`NEXT_PUBLIC_HLUSD_ADDRESS=${tokenAddress}`);
  console.log(`\nSaved artifact: ${outFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
