import { ethers } from "hardhat";

async function main(){

const TAX_VAULT="0x4593FF306CF120bB882BDbB90fBcC1ABedD85A35";

const F=await ethers.getContractFactory("PayStream");
const c=await F.deploy(TAX_VAULT);

await c.waitForDeployment();

console.log("DEPLOYED:",await c.getAddress());
}

main();
