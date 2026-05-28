const hre = require("hardhat");
const { ethers, network } = hre;

async function main() {
  console.log("Deploying contracts with account:", (await ethers.getSigners())[0].address);
  
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "HLUSD");

  if (balance === 0n) {
    console.log("⚠️  Warning: Account has 0 balance. Get testnet HLUSD from: https://testnet-faucet.helachain.com");
  }

  // Deploy MusicNFT
  const MusicNFT = await ethers.getContractFactory("MusicNFT");
  const musicNFT = await MusicNFT.deploy("Music NFT", "MNFT");
  await musicNFT.waitForDeployment();
  const musicNFTAddress = await musicNFT.getAddress();
  console.log("✅ MusicNFT deployed to:", musicNFTAddress);

  // Deploy RoyaltySplitter
  const RoyaltySplitter = await ethers.getContractFactory("RoyaltySplitter");
  const royaltySplitter = await RoyaltySplitter.deploy();
  await royaltySplitter.waitForDeployment();
  const royaltySplitterAddress = await royaltySplitter.getAddress();
  console.log("✅ RoyaltySplitter deployed to:", royaltySplitterAddress);

  // Deploy PlaylistNFT (needs MusicNFT address)
  const PlaylistNFT = await ethers.getContractFactory("PlaylistNFT");
  const playlistNFT = await PlaylistNFT.deploy(musicNFTAddress);
  await playlistNFT.waitForDeployment();
  const playlistNFTAddress = await playlistNFT.getAddress();
  console.log("✅ PlaylistNFT deployed to:", playlistNFTAddress);

  // Deploy GuildRegistry
  const GuildRegistry = await ethers.getContractFactory("GuildRegistry");
  const guildRegistry = await GuildRegistry.deploy();
  await guildRegistry.waitForDeployment();
  const guildRegistryAddress = await guildRegistry.getAddress();
  console.log("✅ GuildRegistry deployed to:", guildRegistryAddress);

  // Deploy Treasury (needs guildRegistry address and guildId = 0)
  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy(
    guildRegistryAddress,
    0, // guildId
    [deployer.address], // signers
    1 // required confirmations
  );
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("✅ Treasury deployed to:", treasuryAddress);

  console.log("\n🎉 Deployment complete!\n");
  console.log("Copy these addresses to frontend/app.js (CONTRACT_ADDRESSES object):");
  console.log(JSON.stringify({
    musicNFT: musicNFTAddress,
    playlistNFT: playlistNFTAddress,
    guildRegistry: guildRegistryAddress,
    treasury: treasuryAddress
  }, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
