import 'dotenv/config';
import { ethers } from "ethers";
import { logConsole, sendCharacterMessage, sendGodMessage } from "../../../utils";
import { storeUserEvent } from "../../dynamo_v3";
import { getWallet } from "../utils/getWallet";

// Dynamic imports for the artifacts
import factoryArtifact from "@uniswap/v2-core/build/UniswapV2Factory.json";
import routerArtifact from "@uniswap/v2-periphery/build/UniswapV2Router02.json";
import wethArtifact from "@uniswap/v2-periphery/build/WETH9.json";

export async function establishDexInfrastructure({ sessionId, createdBy, characterId }: { sessionId: string, createdBy: string, characterId: string }) {
    const wallet = await getWallet(createdBy, characterId);
    const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
    const signer = new ethers.Wallet(wallet.privateKey, provider);

    logConsole.info(`Establishing DEX Infrastructure on HeLa Testnet...`);
    logConsole.info(`Signer: ${signer.address}`);

    try {
        await sendCharacterMessage(characterId, sessionId, null, "I'm starting the deployment of the DEX infrastructure (Factory, Router, and WETH) on the HeLa Testnet. This will take a few blocks...");

        // 1. Deploy WETH
        logConsole.info("Deploying WETH9...");
        const wethFactory = new ethers.ContractFactory(wethArtifact.abi, wethArtifact.bytecode, signer);
        const wethContract = await wethFactory.deploy();
        await wethContract.waitForDeployment();
        const wethAddress = await wethContract.getAddress();
        logConsole.info(`WETH9 deployed at: ${wethAddress}`);
        await sendCharacterMessage(characterId, sessionId, null, `WETH deployed at: ${wethAddress}`);

        // 2. Deploy Factory
        logConsole.info("Deploying UniswapV2Factory...");
        const factoryFactory = new ethers.ContractFactory(factoryArtifact.abi, factoryArtifact.bytecode, signer);
        // Constructor: UniswapV2Factory(address _feeToSetter)
        const factoryContract = await factoryFactory.deploy(signer.address); 
        await factoryContract.waitForDeployment();
        const factoryAddress = await factoryContract.getAddress();
        logConsole.info(`UniswapV2Factory deployed at: ${factoryAddress}`);
        await sendCharacterMessage(characterId, sessionId, null, `UniswapV2Factory deployed at: ${factoryAddress}`);

        // 3. Deploy Router
        logConsole.info("Deploying UniswapV2Router02...");
        const routerFactory = new ethers.ContractFactory(routerArtifact.abi, routerArtifact.bytecode, signer);
        // Constructor: UniswapV2Router02(address _factory, address _WETH)
        const routerContract = await routerFactory.deploy(factoryAddress, wethAddress);
        await routerContract.waitForDeployment();
        const routerAddress = await routerContract.getAddress();
        logConsole.info(`UniswapV2Router02 deployed at: ${routerAddress}`);
        await sendCharacterMessage(characterId, sessionId, null, `UniswapV2Router02 deployed at: ${routerAddress}. Infrastructure Complete!`);

        // Store Event
        const randomUUID = crypto.randomUUID();
        const eventData = {
            createdBy,
            characterId,
            eventName: "DEX Infrastructure Established",
            factoryAddress,
            routerAddress,
            wethAddress,
            network: "HeLa Testnet"
        };
        await storeUserEvent(createdBy, randomUUID, eventData);

        // Also send to god message for UI update if needed
        await sendGodMessage(sessionId, null, {
            ...eventData,
            createdAt: new Date().toISOString()
        });

        return {
            status: "success",
            factoryAddress,
            routerAddress,
            wethAddress,
            message: "DEX Infrastructure successfully established on HeLa Testnet."
        };

    } catch (error: any) {
        logConsole.error("Error establishing DEX infrastructure:", error);
        return {
            status: "error",
            message: `Failed to establish DEX: ${error.message}`
        };
    }
}
