import hre from "hardhat";
import {
  createPublicClient,
  createWalletClient,
  http,
  defineChain,
  getContract,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

const helaTestnet = defineChain({
  id: 666888,
  name: "HeLa Testnet",
  nativeCurrency: {
    name: "HLUSD",
    symbol: "HLUSD",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.helachain.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "HeLa Explorer",
      url: "https://testnet-blockexplorer.helachain.com",
    },
  },
  testnet: true,
});

async function main() {
  console.log("Deploying PayStream to HeLa Testnet...\n");

  const privateKey = process.env.HELA_PRIVATE_KEY;
  if (!privateKey) throw new Error("HELA_PRIVATE_KEY not set in .env");

  const account = privateKeyToAccount(`0x${privateKey}`);
  console.log("Deployer:", account.address);

  const publicClient = createPublicClient({
    chain: helaTestnet,
    transport: http(),
  });

  const walletClient = createWalletClient({
    chain: helaTestnet,
    account,
    transport: http(),
  });

  const balance = await publicClient.getBalance({ address: account.address });
  console.log("Balance:", balance.toString(), "wei (HLUSD for gas)");
  if (balance === 0n) {
    console.error("Wallet has 0 HLUSD. Get testnet funds first!");
    process.exit(1);
  }

  const artifact = await hre.artifacts.readArtifact("PayStream");

  console.log("Deploying PayStream...");

  const nonce = await publicClient.getTransactionCount({
    address: account.address,
  });
  console.log("   Nonce:", nonce);

  const txHash = await walletClient.deployContract({
    abi: artifact.abi,
    bytecode: artifact.bytecode as `0x${string}`,
    args: [],
  });

  console.log("Tx sent:", txHash);
  console.log(
    "   View on explorer: https://testnet-blockexplorer.helachain.com/tx/" +
      txHash,
  );
  console.log(
    "   Waiting for confirmation (this may take 30-60s on testnet)...",
  );

  const receipt = await publicClient.waitForTransactionReceipt({
    hash: txHash,
    timeout: 120_000,
    pollingInterval: 3_000,
  });

  console.log("\nPayStream deployed successfully!");
  console.log("Contract address:", receipt.contractAddress);
  console.log(
    "Explorer:",
    `https://testnet-blockexplorer.helachain.com/address/${receipt.contractAddress}`,
  );
  console.log("Owner (HR):", account.address);
  console.log("Gas used:", receipt.gasUsed.toString());

  if (receipt.contractAddress) {
    const payStream = getContract({
      address: receipt.contractAddress,
      abi: artifact.abi,
      client: publicClient,
    });

    const owner = await payStream.read.owner();

    console.log("\n── On-chain Verification ──");
    console.log("  owner():", owner);
  }

  console.log(
    "\nDone! Give this contract address to your frontend teammate.\n",
  );
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
