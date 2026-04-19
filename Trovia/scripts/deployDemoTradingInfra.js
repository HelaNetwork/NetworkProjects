const fs = require("fs");
const path = require("path");
const { isAddress, parseUnits } = require("ethers");
const { ethers, network } = require("hardhat");

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
  const hlusdAddress = requireAddress("HLUSD_ADDRESS", process.env.HLUSD_ADDRESS);
  const initialQuoteSupply = parseUnits(process.env.DEMO_QUOTE_INITIAL_SUPPLY || "1000000", 18);
  const initialRouterLiquidity = parseUnits(process.env.DEMO_ROUTER_LIQUIDITY || "250000", 18);
  const forwardRateWad = parseUnits(process.env.DEMO_ROUTER_HLUSD_TO_DUSDC_RATE || "1", 18);
  const reverseRateWad = parseUnits(process.env.DEMO_ROUTER_DUSDC_TO_HLUSD_RATE || "1", 18);

  const [deployer] = await ethers.getSigners();
  const chain = await ethers.provider.getNetwork();

  console.log("Deploying demo trading infra...");
  console.log("Network:", network.name);
  console.log("Chain ID:", chain.chainId.toString());
  console.log("Deployer:", deployer.address);
  console.log("HLUSD:", hlusdAddress);

  const hlusdCode = await ethers.provider.getCode(hlusdAddress);
  if (hlusdCode === "0x") {
    throw new Error("HLUSD_ADDRESS points to a non-contract account");
  }

  const tokenFactory = await ethers.getContractFactory("DemoERC20");
  const routerFactory = await ethers.getContractFactory("DemoSwapRouter");

  const quoteToken = await tokenFactory.deploy("Demo USD Coin", "dUSDC", initialQuoteSupply);
  await quoteToken.waitForDeployment();

  const router = await routerFactory.deploy();
  await router.waitForDeployment();

  const quoteTokenAddress = await quoteToken.getAddress();
  const routerAddress = await router.getAddress();

  const quoteApproveTx = await quoteToken.approve(routerAddress, initialRouterLiquidity);
  await quoteApproveTx.wait();

  const hlusd = await ethers.getContractAt("DemoHLUSD", hlusdAddress);
  const hlusdApproveTx = await hlusd.approve(routerAddress, initialRouterLiquidity);
  await hlusdApproveTx.wait();

  const seedQuoteTx = await router.seedLiquidity(quoteTokenAddress, initialRouterLiquidity);
  await seedQuoteTx.wait();

  const seedHlusdTx = await router.seedLiquidity(hlusdAddress, initialRouterLiquidity);
  await seedHlusdTx.wait();

  const forwardRateTx = await router.setPairRate(hlusdAddress, quoteTokenAddress, forwardRateWad);
  await forwardRateTx.wait();

  const reverseRateTx = await router.setPairRate(quoteTokenAddress, hlusdAddress, reverseRateWad);
  await reverseRateTx.wait();

  const deployment = {
    network: network.name,
    chainId: chain.chainId.toString(),
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    hlusdAddress,
    demoQuoteTokenAddress: quoteTokenAddress,
    demoSwapRouterAddress: routerAddress,
    routerLiquidityPerSide: initialRouterLiquidity.toString(),
    rates: {
      hlusdToDusdc: forwardRateWad.toString(),
      dusdcToHlusd: reverseRateWad.toString()
    }
  };

  const deploymentsDir = path.join(process.cwd(), "deployments");
  fs.mkdirSync(deploymentsDir, { recursive: true });
  const outFile = path.join(deploymentsDir, `demo-trading-${network.name}.json`);
  fs.writeFileSync(outFile, JSON.stringify(deployment, null, 2));

  console.log("Demo quote token:", quoteTokenAddress);
  console.log("Demo swap router:", routerAddress);
  console.log("\nSet these for backend real trading execution:");
  console.log("TRADING_REAL_EXECUTION_ENABLED=true");
  console.log("TRADING_ROUTER_KIND=uniswap-v2");
  console.log(`TRADING_ROUTER_ADDRESS=${routerAddress}`);
  console.log(`TRADING_TOKEN_ADDRESS_MAP_JSON={\"HLUSD\":\"${hlusdAddress}\",\"DUSDC\":\"${quoteTokenAddress}\"}`);
  console.log("TRADING_SWAP_DEADLINE_SECONDS=600");
  console.log("\nSaved artifact:", outFile);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
