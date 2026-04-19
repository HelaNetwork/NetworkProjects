import { ethers } from "hardhat";

async function main() {

  const Token = await ethers.getContractFactory("HLUSD");
  const token = await Token.deploy();

  await token.waitForDeployment();

  console.log("HLUSD deployed to:", await token.getAddress());
}

main();
