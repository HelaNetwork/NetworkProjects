import 'dotenv/config';
import { ethers } from 'ethers';
import { logConsole } from '../../../utils';
import { getWallet } from "../utils/getWallet";
// ERC20 ABI for transfer function
const ERC20_ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "recipient", "type": "address" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "transfer",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
        "stateMutability": "view",
        "type": "function"
    }
];

interface TransferTokenInput {
    createdBy: string;
    characterId: string;
    tokenAddress: string;
    recipientAddress: string;
    amount: string;
}

export async function transferToken(inputData: TransferTokenInput) {
    try {
        logConsole.info('Starting token transfer with input:', JSON.stringify(inputData));

        // Get wallet and connect to provider
        const wallet = await getWallet(inputData.createdBy, inputData.characterId);
        const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
        const signer = new ethers.Wallet(wallet.privateKey, provider);

        logConsole.info('Connected to provider with signer address:', signer.address);

        // Initialize token contract
        const tokenContract = new ethers.Contract(
            inputData.tokenAddress,
            ERC20_ABI,
            signer
        );

        // Get token decimals
        const decimals = await tokenContract.decimals();
        logConsole.info(`Token decimals: ${decimals}`);

        // Get current balance
        const balance = await tokenContract.balanceOf(signer.address);
        logConsole.info(`Current balance: ${ethers.formatUnits(balance, decimals)} tokens`);

        // Convert amount to token units
        const amountInTokenUnits = ethers.parseUnits(inputData.amount, decimals);

        // Check if we have enough balance
        if (balance < amountInTokenUnits) {
            throw new Error(`Insufficient balance. Have ${ethers.formatUnits(balance, decimals)}, need ${inputData.amount}`);
        }

        // Get gas price
        const gasPrice = await provider.getFeeData();
        logConsole.info('Current gas price:', gasPrice.gasPrice?.toString());

        // Execute transfer
        logConsole.info(`Transferring ${inputData.amount} tokens to ${inputData.recipientAddress}`);
        const transaction = await tokenContract.transfer(
            inputData.recipientAddress,
            amountInTokenUnits,
            {
                gasPrice: gasPrice.gasPrice,
                gasLimit: 100000 // Conservative gas limit for ERC20 transfer
            }
        );

        logConsole.info(`Transaction hash: ${transaction.hash}`);
        const receipt = await transaction.wait();
        logConsole.info('Transaction confirmed:', receipt.transactionHash);

        // Get new balance after transfer
        const newBalance = await tokenContract.balanceOf(signer.address);
        logConsole.info(`New balance: ${ethers.formatUnits(newBalance, decimals)} tokens`);

        return {
            status: 'success',
            message: `Successfully transferred ${inputData.amount} tokens to ${inputData.recipientAddress}`,
            transaction_data: {
                transactionHash: receipt.transactionHash,
                gasUsed: receipt.gasUsed.toString(),
                effectiveGasPrice: receipt.effectiveGasPrice.toString(),
                newBalance: ethers.formatUnits(newBalance, decimals)
            }
        };

    } catch (error: any) {
        return {
            error: error.name,
            message: error.message || 'Failed to transfer tokens',
            code: error.code,
            details: error.shortMessage || error.info?.error?.message
        };
    }
}

// Test function - Comment out before deployment
async function testTransferToken() {
    const testInput: TransferTokenInput = {
        createdBy: "test_user",
        characterId: "test_character",
        tokenAddress: "0xYourTokenAddress", // Replace with actual token address
        recipientAddress: "0xRecipientAddress", // Replace with actual recipient address
        amount: "1.0" // Amount in token units (will be converted based on decimals)
    };

    try {
        logConsole.info('🚀 Starting token transfer test...\n');
        const result = await transferToken(testInput);
        logConsole.info('Transfer result:', result);
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Uncomment to run the test
// testTransferToken();

