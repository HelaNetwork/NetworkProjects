const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

async function main() {
  const provider = new ethers.JsonRpcProvider("https://testnet-rpc.helachain.com");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("=".repeat(60));
  console.log("  DeckWars Pure Ethers Deployment");
  console.log("=".repeat(60));
  console.log(`Deployer: ${wallet.address}`);
  console.log(`Balance:  ${ethers.formatEther(await provider.getBalance(wallet.address))} HLUSD`);
  
  // Get fee data
  const feeData = await provider.getFeeData();
  console.log(`Gas Price: ${ethers.formatUnits(feeData.gasPrice, "gwei")} gwei`);

  const overrides = {
    gasPrice: feeData.gasPrice,
    gasLimit: 8000000n
  };

  function getContractData(name) {
    const p1 = path.join(__dirname, `../artifacts/contracts/moves/${name}.sol/${name}.json`);
    const p2 = path.join(__dirname, `../artifacts/contracts/${name}.sol/${name}.json`);
    if (fs.existsSync(p1)) return JSON.parse(fs.readFileSync(p1));
    if (fs.existsSync(p2)) return JSON.parse(fs.readFileSync(p2));
    throw new Error(`Cannot find artifact for ${name}`);
  }

  async function deploy(name, ...args) {
    console.log(`\nDeploying ${name}...`);
    const data = getContractData(name);
    const factory = new ethers.ContractFactory(data.abi, data.bytecode, wallet);
    const tx = await factory.deploy(...args, overrides);
    await tx.waitForDeployment();
    const addr = await tx.getAddress();
    console.log(`  ✓ ${name}: ${addr}`);
    return { contract: tx, address: addr };
  }

  // 1. Moves
  const basicAttack = await deploy("BasicAttack");
  const heavyStrike = await deploy("HeavyStrike");
  const shield = await deploy("Shield");
  const healMove = await deploy("HealMove");

  // 2. Card
  const card = await deploy("DeckWarsCard");
  
  // 3. Game
  const game = await deploy("DeckWarsGame", card.address);

  // 4. Configure Card
  console.log("\nConfiguring DeckWarsCard...");
  const moves = [basicAttack.address, heavyStrike.address, shield.address, healMove.address];
  let configTx = await card.contract.setDefaultMoves(moves, overrides);
  await configTx.wait();
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
    let ttx = await card.contract.addTemplate(
      tmpl.name, tmpl.class, tmpl.hp, tmpl.atk, tmpl.def, tmpl.spd, tmpl.rarity, overrides
    );
    await ttx.wait();
    console.log(`  ✓ Template added: ${tmpl.name}`);
  }

  // 5. Save Summary
  const deployment = {
    network: "HeLa Testnet",
    chainId: "666888",
    deployedAt: new Date().toISOString(),
    deployer: wallet.address,
    contracts: {
      BasicAttack: basicAttack.address,
      HeavyStrike: heavyStrike.address,
      Shield: shield.address,
      HealMove: healMove.address,
      DeckWarsCard: card.address,
      DeckWarsGame: game.address,
    }
  };

  const json = JSON.stringify(deployment, null, 2);
  fs.writeFileSync(path.join(__dirname, "../frontend/js/deployment.json"), json);
  fs.writeFileSync(path.join(__dirname, "../deployment.json"), json);
  
  console.log("\n=================================");
  console.log("DEPLOYMENT FINISHED SUCCESSFULLY!");
  console.log("=================================");
}

main().catch(console.error);
