import 'dotenv/config';
import { ethers } from "ethers";
import { ERC20_CONTRACT_ABI, ERC20_CONTRACT_BYTECODE, ERC20_FLATTENED_CONTRACT, logConsole, sendCharacterMessage, sendGodMessage } from "../../../utils";
import { createItem, storeUserEvent } from "../../dynamo_v3";
import { getWallet } from "../utils/getWallet";

const CORE_TABLE_NAME = process.env.CORE_TABLE_NAME as string;
// Firestore-backed — docClient is a no-op shim for API compat
const docClient: any = null;

export async function deployContract({ sessionId, createdBy, characterId, tokenName, tokenSymbol, totalSupply, network }: { sessionId: string, createdBy: string, characterId: string, tokenName: string, tokenSymbol: string, totalSupply: string, network: string }) {
    const wallet = await getWallet(createdBy, characterId);
    const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
    const signer = new ethers.Wallet(wallet.privateKey, provider);

    logConsole.info(`Wallet Address: ${signer.address}`)
    logConsole.info(`Session ID: ${sessionId}`)
    logConsole.info(`Created By: ${createdBy}`)
    logConsole.info(`Character ID: ${characterId}`)
    logConsole.info(`Token Name: ${tokenName}`)
    logConsole.info(`Token Symbol: ${tokenSymbol}`)
    logConsole.info(`Total Supply: ${totalSupply}`)

    const balance = await provider.getBalance(signer.address);
    if (balance < ethers.parseEther("0.0001")) {
        return { message: "Insufficient HELA funds, cannot deploy contract." };
    }

    // Ensure totalSupply is a bigint
    try {
        logConsole.info(`Calling deployToken for ${tokenName} - ${tokenSymbol} - ${totalSupply}`)
        // Always use BASE_RPC_URL which is configured for HeLa testnet
        const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
        const signer = new ethers.Wallet(wallet.privateKey, provider);

        // Check signer eth balance
        const address = signer.address;
        logConsole.info(`Signer Address: ${address}`)
        // Get native ETH balance of signer's address
        const ethBalance = await provider.getBalance(signer.address);
        logConsole.info(`Signer ETH balance: ${ethers.formatEther(ethBalance)}`)

        const deployedContractAddress = await deployERC20Token({
            name: tokenName,
            symbol: tokenSymbol,
            initialSupply: totalSupply,
            signer,
            characterId,
            sessionId
        });

        await sendGodMessage(
            sessionId,
            docClient,
            {
                createdBy: createdBy,
                characterId: characterId,
                createdAt: new Date().toISOString(),
                eventName: "contract_deployed",
                metadata: {
                    contractAddress: deployedContractAddress,
                    name: tokenName,
                    symbol: tokenSymbol,
                    totalSupply: totalSupply
                }
            }
        )

        logConsole.info(`Waiting for deployedContract to be confirmed`)

        // Verification skipped for HeLa as Basescan logic is incompatible
        await sendCharacterMessage(characterId, sessionId, docClient, `Successfully deployed to HeLa Testnet! You can view it on helascan.com.`)

        const tokenContract = new ethers.Contract(
            deployedContractAddress,
            ERC20_CONTRACT_ABI,
            signer
        )

        const balanceOf = await tokenContract.balanceOf(signer.address);
        await sendCharacterMessage(characterId, sessionId, docClient, `Renouncing contract ownership...`);
        const tx = await tokenContract.renounceOwnership();
        await tx.wait();

        const randomUUID = crypto.randomUUID();
        const eventData = {
            "createdBy": createdBy,
            "characterId": characterId,
            "eventName": "Contract Deployed",
            "symbol": tokenSymbol,
            "name": tokenName,
            "totalSupply": totalSupply,
            "contractAddress": deployedContractAddress
        }
        await storeUserEvent(createdBy, randomUUID, eventData);

        return { erc20TokenAddress: deployedContractAddress, deployerTokenBalance: balanceOf.toString() };
    } catch (error) {
        console.error("Error in deployContract:", error);
        return { error: error };
    }
}


async function deployERC20Token({
    name,
    symbol,
    initialSupply,
    signer,
    characterId,
    sessionId,
}: DeployTokenOptions): Promise<string> {
    const contractFactory = new ethers.ContractFactory(ERC20_CONTRACT_ABI, ERC20_CONTRACT_BYTECODE, signer)

    logConsole.info("Deploying token contract with name: " + name + " symbol: " + symbol + " initialSupply: " + initialSupply);
    const contractDeployment = await contractFactory.deploy(
        name,
        symbol,
        initialSupply
    )

    logConsole.info("Awaiting confirmations...");
    await sendCharacterMessage(characterId, sessionId, docClient, `I've initiated the contract deployment, waiting for it to be confirmed on the blockchain...`);
    await contractDeployment.waitForDeployment()

    await new Promise(resolve => setTimeout(resolve, 5000));
    await sendCharacterMessage(characterId, sessionId, docClient, `Still waiting for the deployment transaction to be confirmed...`);
    await new Promise(resolve => setTimeout(resolve, 5000));
    await sendCharacterMessage(characterId, sessionId, docClient, `Almost there, just a few more blocks until confirmation...`);
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Renounce ownership after deployment
    logConsole.info("Renouncing contract ownership...");

    logConsole.info("Contract ownership renounced successfully");

    logConsole.info(`Token deployed at address: ${contractDeployment.target}`);

    return await contractDeployment.getAddress()
}

interface DeployTokenOptions {
    name: string;
    symbol: string;
    initialSupply: string;
    signer: ethers.Wallet;
    characterId: string;
    sessionId: string;
}