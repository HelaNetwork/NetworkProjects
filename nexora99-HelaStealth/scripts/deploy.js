const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const signers = await hre.ethers.getSigners();
  if (!signers.length) {
    console.error("\n❌ No signer available. Set your private key first:");
    console.error("   PowerShell:  $env:PRIVATE_KEY = \"your_private_key_here\"");
    console.error("   Bash/Linux:  export PRIVATE_KEY=your_private_key_here\n");
    process.exit(1);
  }
  const deployer = signers[0];
  console.log("Deploying contracts with:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "HLU");

  // 1. Deploy HUSD
  const HUSD = await hre.ethers.getContractFactory("HUSD");
  const husd = await HUSD.deploy();
  await husd.waitForDeployment();
  const husdAddr = await husd.getAddress();
  console.log("HUSD deployed to:", husdAddr);

  // 2. Deploy StealthRegistry
  const Registry = await hre.ethers.getContractFactory("StealthRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();
  console.log("StealthRegistry deployed to:", registryAddr);

  // 3. Deploy FeeManager
  //    Default fee: 0.00402 HUSD = 4020000000000000 wei (18 decimals)
  const protocolFee = hre.ethers.parseEther("0.00402");
  const FeeManager = await hre.ethers.getContractFactory("FeeManager");
  const feeManager = await FeeManager.deploy(deployer.address, protocolFee);
  await feeManager.waitForDeployment();
  const feeManagerAddr = await feeManager.getAddress();
  console.log("FeeManager deployed to:", feeManagerAddr);

  // 4. Deploy PrivacyPool
  const Pool = await hre.ethers.getContractFactory("PrivacyPool");
  const pool = await Pool.deploy(husdAddr);
  await pool.waitForDeployment();
  const poolAddr = await pool.getAddress();
  console.log("PrivacyPool deployed to:", poolAddr);

  // 5. Deploy PaymentRouter
  const Router = await hre.ethers.getContractFactory("PaymentRouter");
  const router = await Router.deploy(husdAddr, registryAddr, feeManagerAddr, poolAddr);
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log("PaymentRouter deployed to:", routerAddr);

  // 6. Connect Pool to Router (resolve circular dependency)
  const setRouterTx = await pool.setRouter(routerAddr);
  await setRouterTx.wait();
  console.log("PrivacyPool linked to PaymentRouter");

  // 5. Mint some HUSD to deployer for testing
  const mintAmount = hre.ethers.parseEther("100000");
  await husd.mint(deployer.address, mintAmount);
  console.log("Minted 100,000 HUSD to deployer");

  // ── Auto-save addresses ──────────────────────────────────
  const rootDir = path.resolve(__dirname, "..");

  // addresses.json
  const addrJson = { HUSD: husdAddr, REGISTRY: registryAddr, FEE_MANAGER: feeManagerAddr, POOL: poolAddr, ROUTER: routerAddr };
  fs.writeFileSync(path.join(rootDir, "addresses.json"), JSON.stringify(addrJson, null, 2));
  console.log("✅ Saved addresses.json");

  // frontend/.env
  const frontendEnv = [
    `VITE_HUSD_ADDRESS=${husdAddr}`,
    `VITE_REGISTRY_ADDRESS=${registryAddr}`,
    `VITE_FEE_MANAGER_ADDRESS=${feeManagerAddr}`,
    `VITE_POOL_ADDRESS=${poolAddr}`,
    `VITE_ROUTER_ADDRESS=${routerAddr}`,
    `VITE_API_BASE=http://localhost:4000`,
    "",
  ].join("\n");
  fs.writeFileSync(path.join(rootDir, "frontend", ".env"), frontendEnv);
  console.log("✅ Saved frontend/.env");

  // backend/.env  (preserve PRIVATE_KEY and other settings)
  const backendEnvPath = path.join(rootDir, "backend", ".env");
  let backendEnv = "";
  if (fs.existsSync(backendEnvPath)) {
    backendEnv = fs.readFileSync(backendEnvPath, "utf8");
    // Replace or add contract addresses
    const replacements = {
      HUSD_ADDRESS: husdAddr,
      REGISTRY_ADDRESS: registryAddr,
      FEE_MANAGER_ADDRESS: feeManagerAddr,
      POOL_ADDRESS: poolAddr,
      ROUTER_ADDRESS: routerAddr,
    };
    for (const [key, val] of Object.entries(replacements)) {
      const regex = new RegExp(`^${key}=.*$`, "m");
      if (regex.test(backendEnv)) {
        backendEnv = backendEnv.replace(regex, `${key}=${val}`);
      } else {
        backendEnv += `\n${key}=${val}`;
      }
    }
    fs.writeFileSync(backendEnvPath, backendEnv);
    console.log("✅ Updated backend/.env");
  }

  console.log("\n══════════════════════════════════════════");
  console.log("  StealthCheckout Deployment Complete");
  console.log("══════════════════════════════════════════");
  console.log("  HUSD:            ", husdAddr);
  console.log("  StealthRegistry: ", registryAddr);
  console.log("  FeeManager:      ", feeManagerAddr);
  console.log("  PrivacyPool:     ", poolAddr);
  console.log("  PaymentRouter:   ", routerAddr);
  console.log("══════════════════════════════════════════");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

