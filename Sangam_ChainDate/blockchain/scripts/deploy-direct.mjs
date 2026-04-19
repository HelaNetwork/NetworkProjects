/**
 * deploy-direct.mjs
 * Deploys contracts to Hela Testnet using ethers.js directly (bypasses Hardhat's undici HTTP client).
 * Run with: node --experimental-vm-modules scripts/deploy-direct.mjs
 */

import { ethers } from "ethers";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env
const envFile = readFileSync(join(__dirname, "../.env"), "utf8");
const env = Object.fromEntries(
  envFile.split("\n").filter(l => l && !l.startsWith("#") && l.includes("=")).map(l => {
    const [k, ...v] = l.split("="); return [k.trim(), v.join("=").trim()];
  })
);

const RPC_URL = env.HELA_RPC_URL || "https://testnet-rpc.helachain.com";
const PRIVATE_KEY = env.PRIVATE_KEY;

if (!PRIVATE_KEY || PRIVATE_KEY === "PASTE_YOUR_PRIVATE_KEY_HERE") {
  console.error("❌  Set PRIVATE_KEY in blockchain/.env");
  process.exit(1);
}

// Read compiled artifacts
function getArtifact(name) {
  const paths = [
    join(__dirname, `../artifacts/contracts/${name}.sol/${name}.json`),
  ];
  for (const p of paths) {
    try { return JSON.parse(readFileSync(p, "utf8")); } catch {}
  }
  throw new Error(`Artifact not found for ${name}`);
}

async function main() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  ChainDate — Direct Deploy to Hela Testnet");
  console.log("  RPC:", RPC_URL);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const provider = new ethers.JsonRpcProvider(RPC_URL, {
    chainId: 666888,
    name: "helaTestnet",
  });

  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const balance = await provider.getBalance(wallet.address);
  console.log(`  Deployer : ${wallet.address}`);
  console.log(`  Balance  : ${ethers.formatEther(balance)} HLUSD`);

  if (balance === 0n) {
    console.error("❌  Wallet has 0 HLUSD — top up then retry");
    process.exit(1);
  }

  const gasOverride = { gasLimit: 5_000_000 };

  // 1. MockZKVerifier
  console.log("\n[1/3] Deploying MockZKVerifier...");
  const zkArt = getArtifact("MockZKVerifier");
  const ZKFactory = new ethers.ContractFactory(zkArt.abi, zkArt.bytecode, wallet);
  const zkVerifier = await ZKFactory.deploy(gasOverride);
  await zkVerifier.waitForDeployment();
  const zkAddress = await zkVerifier.getAddress();
  console.log(`      ✓ MockZKVerifier: ${zkAddress}`);

  // 2. DatingCore
  console.log("\n[2/3] Deploying DatingCore...");
  const coreArt = getArtifact("DatingCore");
  const CoreFactory = new ethers.ContractFactory(coreArt.abi, coreArt.bytecode, wallet);
  const datingCore = await CoreFactory.deploy(zkAddress, gasOverride);
  await datingCore.waitForDeployment();
  const coreAddress = await datingCore.getAddress();
  console.log(`      ✓ DatingCore:     ${coreAddress}`);

  // 3. EscrowContent
  console.log("\n[3/3] Deploying EscrowContent...");
  const escrowArt = getArtifact("EscrowContent");
  const EscrowFactory = new ethers.ContractFactory(escrowArt.abi, escrowArt.bytecode, wallet);
  const escrow = await EscrowFactory.deploy(gasOverride);
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log(`      ✓ EscrowContent:  ${escrowAddress}`);

  // Write addresses to frontend
  const addresses = {
    MockZKVerifier: zkAddress,
    DatingCore: coreAddress,
    EscrowContent: escrowAddress,
    deployedAt: new Date().toISOString(),
    network: "helaTestnet",
    chainId: "666888",
  };

  const outPath = join(__dirname, "../../frontend/lib/deployedAddresses.json");
  writeFileSync(outPath, JSON.stringify(addresses, null, 2));

  // Write frontend .env.local
  const envLocal = `NEXT_PUBLIC_DATING_CORE=${coreAddress}\nNEXT_PUBLIC_ESCROW_CONTENT=${escrowAddress}\nNEXT_PUBLIC_ZK_VERIFIER=${zkAddress}\n`;
  const envLocalPath = join(__dirname, "../../frontend/.env.local");
  writeFileSync(envLocalPath, envLocal);

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  ✅  All contracts deployed to Hela Testnet!");
  console.log(`  DatingCore    : ${coreAddress}`);
  console.log(`  EscrowContent : ${escrowAddress}`);
  console.log(`  ZKVerifier    : ${zkAddress}`);
  console.log("  ✅  frontend/.env.local written automatically!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n  Next: restart `npm run dev` in the frontend folder.");
}

main().catch(e => { console.error("Deploy failed:", e.message); process.exit(1); });
