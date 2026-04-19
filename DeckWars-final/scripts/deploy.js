const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("=".repeat(60));
  console.log("  DeckWars Deployment Script");
  console.log("=".repeat(60));
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance:  ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} HLUSD`);
  console.log("");

  const overrides = {};


  // ── Step 1: Deploy Move Contracts ─────────────────────────────────────────
  console.log("Deploying move contracts...");

  const BasicAttack = await ethers.getContractFactory("BasicAttack");
  const basicAttack = await BasicAttack.deploy(overrides);
  await basicAttack.waitForDeployment();
  const basicAttackAddr = await basicAttack.getAddress();
  console.log(`  ✓ BasicAttack:  ${basicAttackAddr}`);

  const HeavyStrike = await ethers.getContractFactory("HeavyStrike");
  const heavyStrike = await HeavyStrike.deploy(overrides);
  await heavyStrike.waitForDeployment();
  const heavyStrikeAddr = await heavyStrike.getAddress();
  console.log(`  ✓ HeavyStrike:  ${heavyStrikeAddr}`);

  const Shield = await ethers.getContractFactory("Shield");
  const shield = await Shield.deploy(overrides);
  await shield.waitForDeployment();
  const shieldAddr = await shield.getAddress();
  console.log(`  ✓ Shield:       ${shieldAddr}`);

  const HealMove = await ethers.getContractFactory("HealMove");
  const healMove = await HealMove.deploy(overrides);
  await healMove.waitForDeployment();
  const healMoveAddr = await healMove.getAddress();
  console.log(`  ✓ HealMove:     ${healMoveAddr}`);

  // ── Step 2: Deploy DeckWarsCard ERC-721 ─────────────────────────────────
  console.log("\nDeploying DeckWarsCard (ERC-721)...");
  const DeckWarsCard = await ethers.getContractFactory("DeckWarsCard");
  const cardContract = await DeckWarsCard.deploy(overrides);
  await cardContract.waitForDeployment();
  const cardContractAddr = await cardContract.getAddress();
  console.log(`  ✓ DeckWarsCard: ${cardContractAddr}`);

  // ── Step 3: Configure Card Contract ──────────────────────────────────────
  console.log("\nConfiguring DeckWarsCard...");

  const moves = [basicAttackAddr, heavyStrikeAddr, shieldAddr, healMoveAddr];
  let tx = await cardContract.setDefaultMoves(moves);
  await tx.wait();
  console.log("  ✓ Default moves set");

  const templates = [
    { name: "Iron Sentinel",   class: 0, hp: 200, atk: 60,  def: 80,  spd: 40,  rarity: 1 },
    { name: "Steel Vanguard",  class: 0, hp: 220, atk: 70,  def: 90,  spd: 35,  rarity: 2 },
    { name: "Arc Weaver",      class: 1, hp: 150, atk: 110, def: 30,  spd: 70,  rarity: 1 },
    { name: "Void Sorcerer",   class: 1, hp: 140, atk: 130, def: 25,  spd: 75,  rarity: 3 },
    { name: "Shadow Blade",    class: 2, hp: 160, atk: 85,  def: 50,  spd: 100, rarity: 2 },
    { name: "Phantom Striker", class: 2, hp: 155, atk: 90,  def: 45,  spd: 110, rarity: 3 },
    { name: "Dawn Crusader",   class: 3, hp: 180, atk: 75,  def: 70,  spd: 55,  rarity: 2 },
    { name: "Holy Champion",   class: 3, hp: 190, atk: 80,  def: 75,  spd: 50,  rarity: 3 },
    { name: "Storm Archer",    class: 4, hp: 165, atk: 90,  def: 40,  spd: 90,  rarity: 1 },
    { name: "Eclipse Ranger",  class: 4, hp: 170, atk: 100, def: 45,  spd: 95,  rarity: 4 },
  ];

  for (const tmpl of templates) {
    tx = await cardContract.addTemplate(
      tmpl.name, tmpl.class, tmpl.hp, tmpl.atk, tmpl.def, tmpl.spd, tmpl.rarity
    );
    await tx.wait();
    const className = ["Warrior","Mage","Rogue","Paladin","Ranger"][tmpl.class];
    console.log(`  ✓ Template: ${tmpl.name} (${className}, Rarity ${tmpl.rarity})`);
  }

  // ── Step 4: Deploy DeckWarsGame ──────────────────────────────────────────
  console.log("\nDeploying DeckWarsGame...");
  const DeckWarsGame = await ethers.getContractFactory("DeckWarsGame");
  const gameContract = await DeckWarsGame.deploy(cardContractAddr, overrides);
  await gameContract.waitForDeployment();
  const gameContractAddr = await gameContract.getAddress();
  console.log(`  ✓ DeckWarsGame: ${gameContractAddr}`);

  // ── Save Deployment Info ──────────────────────────────────────────────────
  const network = await ethers.provider.getNetwork();
  const deployment = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      BasicAttack: basicAttackAddr,
      HeavyStrike: heavyStrikeAddr,
      Shield: shieldAddr,
      HealMove: healMoveAddr,
      DeckWarsCard: cardContractAddr,
      DeckWarsGame: gameContractAddr,
    }
  };

  const deploymentJson = JSON.stringify(deployment, null, 2);
  fs.writeFileSync(path.join(__dirname, "../frontend/js/deployment.json"), deploymentJson);
  fs.writeFileSync(path.join(__dirname, "../deployment.json"), deploymentJson);
  console.log(`\n✓ Deployment info saved`);

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  console.log("  DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
  console.log(`Network:      ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`DeckWarsCard: ${cardContractAddr}`);
  console.log(`DeckWarsGame: ${gameContractAddr}`);
  console.log("");
  console.log("Block Explorer:");
  console.log(`  https://testnet-blockexplorer.helachain.com/address/${cardContractAddr}`);
  console.log(`  https://testnet-blockexplorer.helachain.com/address/${gameContractAddr}`);
  console.log("=".repeat(60));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
