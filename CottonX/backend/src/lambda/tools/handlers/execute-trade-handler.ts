import 'dotenv/config';
import { ethers } from 'ethers';
import { logConsole, sendCharacterMessage, sendGodMessage } from '../../../utils';
import { getWallet } from '../utils/getWallet';
import { storeUserEvent } from '../../dynamo_v3';

const CORE_TABLE_NAME = process.env.CORE_TABLE_NAME as string;
// Firestore-backed — docClient is a no-op shim for API compat
const docClient: any = null;

// Uniswap V2 Router ABI (for swapping functions)
const UniswapV2RouterABI = [
    {
        "inputs": [
            { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
            { "internalType": "address[]", "name": "path", "type": "address[]" }
        ],
        "name": "getAmountsOut",
        "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
            { "internalType": "address[]", "name": "path", "type": "address[]" },
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "uint256", "name": "deadline", "type": "uint256" }
        ],
        "name": "swapExactETHForTokens",
        "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
            { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
            { "internalType": "address[]", "name": "path", "type": "address[]" },
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "uint256", "name": "deadline", "type": "uint256" }
        ],
        "name": "swapExactTokensForETH",
        "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

export async function executeTrade({
    createdBy,
    characterId,
    sessionId,
    tokenAddress,
    amountInWei,
    operation,
    slippagePercentage = 0.5
}: {
    createdBy: string,
    characterId: string,
    sessionId: string,
    tokenAddress: string,
    amountInWei: string,
    operation: 'buy' | 'sell',
    slippagePercentage?: number
}) {
    try {
        logConsole.info('Starting trade execution with input:', JSON.stringify({ createdBy, characterId, tokenAddress, amountInWei, operation, slippagePercentage }));

        logConsole.info('Getting wallet...');
        const wallet = await getWallet(createdBy, characterId);

        logConsole.info('Setting up provider and signer...');
        const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
        const signer = new ethers.Wallet(wallet.privateKey, provider);
        logConsole.info('Connected to provider with signer address:', signer.address);

        const WETH_ADDRESS = process.env.WETH_ADDRESS as string;
        const UNISWAP_V2_ROUTER_ADDRESS = process.env.UNISWAP_V2_ROUTER_ADDRESS as string;

        if (!UNISWAP_V2_ROUTER_ADDRESS || UNISWAP_V2_ROUTER_ADDRESS === ethers.ZeroAddress || UNISWAP_V2_ROUTER_ADDRESS === '0x0000000000000000000000000000000000000000') {
            return {
                status: 'error',
                message: 'Uniswap V2 Router address is not configured for the HeLa Testnet in .env. Rishi needs to deploy the DEX infrastructure first.'
            };
        }

        logConsole.info('Using slippage:', slippagePercentage, '%');

        logConsole.info('Fetching gas price...');
        const feeData = await provider.getFeeData();
        const gasPrice = feeData.gasPrice ?? ethers.parseUnits('5', 'gwei');
        const estimatedGasLimit = BigInt(300000);
        logConsole.info('Current gas price:', gasPrice.toString());

        logConsole.info('Initializing Uniswap router contract...');
        const router = new ethers.Contract(
            UNISWAP_V2_ROUTER_ADDRESS,
            UniswapV2RouterABI,
            signer
        );

        const deadline = Math.floor(Date.now() / 1000) + 600;
        let transaction;

        if (operation === 'buy') {
            logConsole.info('Executing buy operation...');
            const ethAmountInWei = BigInt(amountInWei);

            // Check balance here
            const balance = await provider.getBalance(signer.address);
            if (balance < ethAmountInWei) {
                return {
                    status: 'error',
                    message: 'Not enough HELA to execute trade.'
                };
            }

            logConsole.info('Calculating expected output amounts...');
            const amounts = await router.getAmountsOut(ethAmountInWei, [WETH_ADDRESS, tokenAddress]);
            const amountOut = amounts[1];

            // Calculate minAmountOut based on slippage
            const slippageBps = Math.floor(slippagePercentage * 100); // Convert percentage to basis points
            const minAmountOut = amountOut * BigInt(10000 - slippageBps) / BigInt(10000);

            logConsole.info(`Buying tokens. HELA to spend: ${ethers.formatEther(ethAmountInWei)} HELA`);
            logConsole.info(`Minimum tokens to receive: ${minAmountOut.toString()}`);

            logConsole.info('Submitting buy transaction...');
            transaction = await router.swapExactETHForTokens(
                minAmountOut,
                [WETH_ADDRESS, tokenAddress],
                signer.address,
                deadline,
                {
                    value: ethAmountInWei,
                    gasPrice: gasPrice,
                    gasLimit: estimatedGasLimit
                }
            );
        } else {
            logConsole.info('Executing sell operation...');
            const tokenAmountInWei = BigInt(amountInWei);

            logConsole.info('Initializing token contract...');
            const token = new ethers.Contract(
                tokenAddress,
                ERC20_CONTRACT_ABI,
                signer
            );

            logConsole.info('Checking token allowance...');
            const allowance = await token.allowance(signer.address, UNISWAP_V2_ROUTER_ADDRESS);
            if (allowance < tokenAmountInWei) {
                await sendCharacterMessage(characterId, sessionId, docClient, "Approving tokens for swap...");
                logConsole.info('Approving tokens for swap...');
                const tx = await token.approve(UNISWAP_V2_ROUTER_ADDRESS, tokenAmountInWei);
                await tx.wait();
                logConsole.info('Token approval confirmed');
            } else {
                logConsole.info('Token allowance sufficient, skipping approval...');
            }

            logConsole.info('Calculating expected output amounts...');
            const amounts = await router.getAmountsOut(tokenAmountInWei, [tokenAddress, WETH_ADDRESS]);
            const amountOut = amounts[1];

            // Calculate minAmountOut based on slippage
            const slippageBps = Math.floor(slippagePercentage * 100); // Convert percentage to basis points
            const minAmountOut = amountOut * BigInt(10000 - slippageBps) / BigInt(10000);

            logConsole.info(`Selling tokens. Tokens to sell: ${tokenAmountInWei.toString()}`);
            logConsole.info(`Minimum HELA to receive: ${ethers.formatEther(minAmountOut)} HELA`);

            logConsole.info('Submitting sell transaction...');
            transaction = await router.swapExactTokensForETH(
                tokenAmountInWei,
                minAmountOut,
                [tokenAddress, WETH_ADDRESS],
                signer.address,
                deadline,
                {
                    gasPrice: gasPrice,
                    gasLimit: estimatedGasLimit
                }
            );
        }
        await sendCharacterMessage(characterId, sessionId, docClient, "Waiting for transaction confirmation...");

        logConsole.info(`Transaction submitted. Hash: ${transaction.hash}`);
        logConsole.info('Waiting for transaction confirmation...');
        const receipt = await transaction.wait(2);

        logConsole.info('Transaction confirmed:', receipt.transactionHash);
        logConsole.info('Sending god message about trade execution...');
        await sendGodMessage(
            sessionId,
            docClient,
            {
                createdBy: createdBy,
                characterId: characterId,
                createdAt: new Date().toISOString(),
                eventName: "trade_executed",
                metadata: {
                    tokenAddress: tokenAddress,
                    amount: amountInWei,
                    operation: operation
                }
            }
        );
        logConsole.info('God message sent successfully');

        // Store event in Firestore for persistent user history
        const randomUUID = crypto.randomUUID();
        await storeUserEvent(createdBy, randomUUID, {
            characterId,
            eventName: "Trade Executed",
            operation,
            tokenAddress,
            amount: amountInWei,
            transactionHash: receipt.transactionHash
        });

        return {
            status: 'success',
            operation: operation,
            transactionHash: receipt.transactionHash,
            amount: amountInWei,
            tokenAddress: tokenAddress
        };

    } catch (error: any) {
        console.error('Error in executeTrade:', error);
        return {
            error: error.name || 'TradeError',
            message: error.message,
            code: error.code,
            details: error.shortMessage || error.info?.error?.message
        };
    }
}
