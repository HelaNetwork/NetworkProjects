const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n🚀 Redeploying PayStream with HR Role Setup...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "HELA");

  // Tax vault (can be the deployer for now)
  const taxVault = deployer.address;

  // 1. Deploy MockHLUSD
  console.log("\n1️⃣  Deploying MockHLUSD...");
  const MockHLUSD = await hre.ethers.getContractFactory("MockHLUSD");
  const hlusd = await MockHLUSD.deploy();
  await hlusd.waitForDeployment();
  const hlusdAddress = await hlusd.getAddress();
  console.log("✅ MockHLUSD deployed to:", hlusdAddress);

  // 2. Deploy PayStream
  console.log("\n2️⃣  Deploying PayStream...");
  const PayStream = await hre.ethers.getContractFactory("PayStream");
  const paystream = await PayStream.deploy(taxVault);
  await paystream.waitForDeployment();
  const paystreamAddress = await paystream.getAddress();
  console.log("✅ PayStream deployed to:", paystreamAddress);

  // 3. Mint HLUSD to deployer
  console.log("\n3️⃣  Minting HLUSD...");
  const mintAmount = hre.ethers.parseEther("1000000"); // 1M HLUSD
  const mintTx = await hlusd.mint(deployer.address, mintAmount);
  await mintTx.wait();
  console.log("✅ Minted 1,000,000 HLUSD to:", deployer.address);

  // 4. Grant HR_ROLE to deployer
  console.log("\n4️⃣  Granting HR_ROLE...");
  const HR_ROLE = await paystream.HR_ROLE();
  const grantTx = await paystream.grantRole(HR_ROLE, deployer.address);
  await grantTx.wait();
  console.log("✅ HR_ROLE granted to:", deployer.address);

  // 5. Verify HR_ROLE
  const hasRole = await paystream.hasRole(HR_ROLE, deployer.address);
  console.log("✅ Verified HR_ROLE:", hasRole);

  // 6. Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    hlusdToken: hlusdAddress,
    paystreamContract: paystreamAddress,
    taxVault: taxVault,
    timestamp: new Date().toISOString()
  };

  const outputPath = path.join(__dirname, "../deployed-addresses.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n✅ Deployment info saved to:", outputPath);

  // 7. Update .env instructions
  console.log("\n" + "=".repeat(60));
  console.log("📝 UPDATE YOUR .env FILE:");
  console.log("=".repeat(60));
  console.log(`PAYSTREAM_CONTRACT=${paystreamAddress}`);
  console.log(`HLUSD_TOKEN=${hlusdAddress}`);
  console.log("=".repeat(60));
  console.log("\n✨ Deployment complete! Your wallet now has HR_ROLE.\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
