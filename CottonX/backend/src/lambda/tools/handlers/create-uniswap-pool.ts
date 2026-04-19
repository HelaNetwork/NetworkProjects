import 'dotenv/config';
import { ethers } from 'ethers';
import { ERC20_CONTRACT_ABI, logConsole, sendCharacterMessage, sendGodMessage } from "../../../utils";
import { createItem } from '../../dynamo_v3';
import { getWallet } from '../utils/getWallet';

const CORE_TABLE_NAME = process.env.CORE_TABLE_NAME as string;
const WETH_ADDRESS = process.env.WETH_ADDRESS as string;
const UNISWAP_V2_ROUTER_ADDRESS = process.env.UNISWAP_V2_ROUTER_ADDRESS as string;
const UNISWAP_V2_FACTORY_ADDRESS = process.env.UNISWAP_V2_FACTORY_ADDRESS as string;
const BASE_RPC_URL = process.env.BASE_RPC_URL as string;

// Firestore-backed — docClient is a no-op shim for API compat
const docClient: any = null;

const UNISWAP_V2_FACTORY_ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "tokenA", "type": "address" },
            { "internalType": "address", "name": "tokenB", "type": "address" }
        ],
        "name": "getPair",
        "outputs": [
            { "internalType": "address", "name": "pair", "type": "address" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// Uniswap V2 Router ABI (addLiquidityETH function)
const UniswapV2RouterABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "token", "type": "address" },
            { "internalType": "uint256", "name": "amountTokenDesired", "type": "uint256" },
            { "internalType": "uint256", "name": "amountTokenMin", "type": "uint256" },
            { "internalType": "uint256", "name": "amountETHMin", "type": "uint256" },
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "uint256", "name": "deadline", "type": "uint256" }
        ],
        "name": "addLiquidityETH",
        "outputs": [
            { "internalType": "uint256", "name": "amountToken", "type": "uint256" },
            { "internalType": "uint256", "name": "amountETH", "type": "uint256" },
            { "internalType": "uint256", "name": "liquidity", "type": "uint256" }
        ],
        "stateMutability": "payable",
        "type": "function"
    }
] as const;

export async function createUniswapPool({
    sessionId,
    createdBy,
    characterId,
    erc20TokenAddress,
    amountTokenDesiredInWei,
    amountEtherDesiredInWei
}: {
    sessionId: string,
    createdBy: string,
    characterId: string,
    erc20TokenAddress: string,
    amountTokenDesiredInWei: string,
    amountEtherDesiredInWei: string
}) {
    try {
        logConsole.info('Starting createUniswapPool with input:', JSON.stringify({
            sessionId,
            createdBy,
            characterId,
            erc20TokenAddress,
            amountTokenDesiredInWei,
            amountEtherDesiredInWei
        }));
        logConsole.info('Fetching Wallet for Uniswap Pool creation for characterId:', characterId);
        const wallet = await getWallet(createdBy, characterId);
        logConsole.info('Retrieved wallet:', JSON.stringify(wallet));

        // Connect to Provider
        logConsole.info("Connecting to RPC provider with URL: ", BASE_RPC_URL);
        const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
        const signer = new ethers.Wallet(wallet.privateKey, provider);
        logConsole.info('Connected to provider and created signer with address:', signer.address);
        logConsole.info('Using Uniswap V2 Router address:', UNISWAP_V2_ROUTER_ADDRESS);

        // Get current wallet ETH balance
        const balance = await provider.getBalance(signer.address);
        const balanceInEth = ethers.formatEther(balance);
        logConsole.info(`Wallet balance: ${balanceInEth} ETH for characterId: ${characterId}`);

        logConsole.info("Input Values: ", amountTokenDesiredInWei, amountEtherDesiredInWei);
        logConsole.info("Token Address: ", erc20TokenAddress);
        logConsole.info("Wallet Address: ", signer.address);

        // Parse amounts to BigInt
        const amountTokenDesiredWei = BigInt(amountTokenDesiredInWei);
        const amountEtherDesiredWei = BigInt(amountEtherDesiredInWei);

        // Get gas price
        const feeData = await provider.getFeeData();
        const gasPriceValue = feeData.gasPrice ?? ethers.parseUnits('5', 'gwei'); // Default to 5 gwei if gasPrice is null
        logConsole.info('Current gas price:', gasPriceValue.toString());

        // Create ERC20 contract instance
        const token = new ethers.Contract(
            erc20TokenAddress,
            ERC20_CONTRACT_ABI,
            signer
        );

        // Get token decimals and balance
        const tokenDecimals = await token.decimals();
        logConsole.info('Token decimals:', tokenDecimals);

        // Get token balance for the signer's address
        const tokenBalance = await token.balanceOf(signer.address);
        logConsole.info('Checking balance for address:', signer.address);
        logConsole.info('Token balance:', tokenBalance.toString());

        logConsole.info('Amount token desired:', amountTokenDesiredWei.toString());

        // Check if wallet has enough tokens
        if (tokenBalance < amountTokenDesiredWei) {
            logConsole.info('Insufficient token balance check failed');
            throw new Error(`Insufficient token balance. Have ${tokenBalance.toString()} wei, need ${amountTokenDesiredWei.toString()} wei`);
        }

        // Approve tokens
        logConsole.info(`Approving Amount Token desired for Uniswap Router`);
        const approveTx = await token.approve(
            UNISWAP_V2_ROUTER_ADDRESS,
            ethers.MaxUint256
        );
        await sendCharacterMessage(characterId, sessionId, docClient,
            `I've initiated the approval for the tokens. Waiting for the transaction to be confirmed...`);
        const approveReceipt = await approveTx.wait();
        await sendCharacterMessage(characterId, sessionId, docClient,
            `Great! The tokens are approved. Now creating the Uniswap pool and adding liquidity...`);
        logConsole.info('Approve transaction confirmed with receipt:', JSON.stringify(approveReceipt));

        // Get the UniswapV2Router contract
        const router = new ethers.Contract(
            UNISWAP_V2_ROUTER_ADDRESS,
            UniswapV2RouterABI,
            signer
        );

        // Prepare transaction parameters
        const deadline = Math.floor(Date.now() / 1000) + (60 * 10); // 10 minutes
        logConsole.info('Setting deadline to:', new Date(deadline * 1000).toISOString());

        // Add liquidity
        logConsole.info(`Adding liquidity: ${ethers.formatUnits(amountTokenDesiredWei, tokenDecimals)} tokens and ${ethers.formatEther(amountEtherDesiredWei)} ETH`);
        const liquidityTx = await router.addLiquidityETH(
            erc20TokenAddress,
            amountTokenDesiredWei,
            amountTokenDesiredWei * BigInt(99) / BigInt(100), // amountTokenMin
            amountEtherDesiredWei * BigInt(99) / BigInt(100), // amountETHMin
            signer.address,
            deadline,
            {
                value: amountEtherDesiredWei
            }
        );

        logConsole.info(`AddLiquidityETH transaction hash: ${liquidityTx.hash}`);
        await sendCharacterMessage(characterId, sessionId, docClient,
            `Liquidity provision transaction submitted! Waiting for confirmation...`);
        const receipt = await liquidityTx.wait();
        logConsole.info('AddLiquidityETH transaction confirmed with receipt:', JSON.stringify(receipt));

        const randomUUID = crypto.randomUUID();
        const factory = new ethers.Contract(
            UNISWAP_V2_FACTORY_ADDRESS,
            UNISWAP_V2_FACTORY_ABI,
            provider
        );
        const poolAddress = await factory.getPair(erc20TokenAddress, WETH_ADDRESS);
        logConsole.info('Pool address:', poolAddress);

        const eventData = {
            "createdBy": createdBy,
            "characterId": characterId,
            "eventName": "Uniswap Pool Created",
            "transactionHash": receipt.transactionHash,
            "poolAddress": poolAddress
        }
        logConsole.info('Creating event data in DynamoDB:', JSON.stringify(eventData));
        await createItem(
            "session#" + sessionId,
            "event#" + randomUUID,
            eventData,
            CORE_TABLE_NAME,
            docClient
        )
        logConsole.info('Event data created in DynamoDB');

        await sendGodMessage(
            sessionId,
            docClient,
            {
                createdBy: createdBy,
                characterId: characterId,
                createdAt: new Date().toISOString(),
                eventName: 'uniswap_pool_created',
                metadata: {
                    tokenAddress: erc20TokenAddress,
                    poolAddress: poolAddress.toLowerCase(),
                    transactionHash: receipt.transactionHash
                }
            }
        );

        return {
            status: 'success',
            transactionHash: receipt.transactionHash,
            uniswapPoolAddress: poolAddress,
            erc20TokenAddress: erc20TokenAddress
        };
    } catch (error: any) {
        console.error('Error in createUniswapPool:', error);
        return {
            error: error.name || 'UniswapPoolError',
            message: error.message,
            code: error.code,
            details: error.shortMessage || error.info?.error?.message
        };
    }
}
