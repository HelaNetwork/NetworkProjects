const hre = require("hardhat");

async function main() {
  const husdAddress = "0xEf3cA15C04e82b90B01AF9EccE1A0C620E74E0b3";
  const recipient = "0x73f48a8f89574af86877028bfe75775f0f7bfbec37";
  const amount = hre.ethers.parseEther("1000");

  console.log(`Minting ${hre.ethers.formatEther(amount)} HUSD to ${recipient}...`);

  const husd = await hre.ethers.getContractAt("HUSD", husdAddress);
  const tx = await husd.mint(recipient, amount);
  console.log(`Transaction hash: ${tx.hash}`);

  await tx.wait();
  console.log("Success! Tokens minted.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
