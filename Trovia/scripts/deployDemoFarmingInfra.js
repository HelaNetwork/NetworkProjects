const fs = require("node:fs");
const path = require("node:path");
const hre = require("hardhat");
const { isAddress, parseUnits } = require("ethers");

function requireAddress(name, value) {
  if (!value) {
    throw new Error(`${name} is required in .env`);
  }
  if (!isAddress(value)) {
    throw new Error(`${name} must be a valid EVM address`);
  }
  return value;
}

async function main() {
  const hlusdAddress = requireAddress("HLUSD_ADDRESS", process.env.HLUSD_ADDRESS || process.env.NEXT_PUBLIC_HLUSD_ADDRESS);
  const supportedPoolKey = process.env.DEMO_FARM_POOL_KEY || "hlusd-usdc";
  const [deployer] = await hre.ethers.getSigners();
  const chain = await hre.ethers.provider.getNetwork();

  console.log("Deploying demo farming infra...");
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", chain.chainId.toString());
  console.log("Deployer:", deployer.address);
  console.log("HLUSD:", hlusdAddress);

  const farmFactory = await hre.ethers.getContractFactory("DemoYieldFarm");
  const farm = await farmFactory.deploy(hlusdAddress);
  await farm.waitForDeployment();

  const farmAddress = await farm.getAddress();
  const setPoolTx = await farm.setSupportedPool(supportedPoolKey, true);
  await setPoolTx.wait();

  const deployment = {
    network: hre.network.name,
    chainId: chain.chainId.toString(),
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    hlusdAddress,
    demoYieldFarmAddress: farmAddress,
    supportedPoolKey
  };

  const deploymentsDir = path.join(process.cwd(), "deployments");
  fs.mkdirSync(deploymentsDir, { recursive: true });
  const outFile = path.join(deploymentsDir, `demo-farming-${hre.network.name}.json`);
  fs.writeFileSync(outFile, JSON.stringify(deployment, null, 2));

  console.log("Demo yield farm:", farmAddress);
  console.log("\nSet these for backend real farming execution:");
  console.log("FARMING_REAL_EXECUTION_ENABLED=true");
  console.log(`FARMING_VAULT_ADDRESS=${farmAddress}`);
  console.log(`FARMING_DEFAULT_POOL_KEY=${supportedPoolKey}`);
  console.log("\nSaved artifact:", outFile);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
