import 'dotenv/config';
import { ethers } from 'ethers';
import { logConsole } from '../../../utils';
import { getWallet } from "../utils/getWallet";
// ERC20 ABI for balance and decimals functions
const ERC20_ABI = [
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
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
        "stateMutability": "view",
        "type": "function"
    }
];

interface TokenBalanceInput {
    createdBy: string;
    characterId: string;
    tokenAddress: string;
}

export async function getTokenBalance(inputData: TokenBalanceInput) {
    try {
        logConsole.info('Fetching token balance with input:', JSON.stringify(inputData));

        // Get wallet and connect to provider
        const wallet = await getWallet(inputData.createdBy, inputData.characterId);
        const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
        const signer = new ethers.Wallet(wallet.privateKey, provider);

        logConsole.info('Connected to provider with address:', signer.address);

        // 1. Check if the address is actually a contract
        const code = await provider.getCode(inputData.tokenAddress);
        if (code === "0x" || code === "0x0") {
            return {
                status: "error",
                message: `The address ${inputData.tokenAddress} is a wallet/EOA, not a token contract. You can only get token balances for contract addresses.`,
                code: "NOT_A_CONTRACT"
            };
        }

        // Initialize token contract
        const tokenContract = new ethers.Contract(
            inputData.tokenAddress,
            ERC20_ABI,
            provider
        );

        // 2. Defensive Data Fetching
        // We fetch one by one to avoid crashing the whole request if one field (like symbol) is missing
        let balance = BigInt(0);
        let decimals = 18;
        let symbol = "TOKEN";

        try {
            balance = await tokenContract.balanceOf(signer.address);
        } catch (e) {
            logConsole.warn(`Failed to fetch balanceOf for ${inputData.tokenAddress}, assuming 0.`);
        }

        try {
            decimals = await tokenContract.decimals();
        } catch (e) {
            logConsole.warn(`Failed to fetch decimals for ${inputData.tokenAddress}, defaulting to 18.`);
        }

        try {
            symbol = await tokenContract.symbol();
        } catch (e) {
            logConsole.warn(`Failed to fetch symbol for ${inputData.tokenAddress}, defaulting to "TOKEN".`);
        }

        const balanceFormatted = ethers.formatUnits(balance, decimals);
        logConsole.info(`Balance: ${balanceFormatted.toString()} ${symbol}`);

        return {
            status: "success",
            message: `Current balance is ${balanceFormatted.toString()} ${symbol}`,
            balance_data: {
                raw: balance.toString(),
                formatted: balanceFormatted.toString(),
                symbol: symbol,
                decimals: decimals,
                walletAddress: signer.address,
                tokenAddress: inputData.tokenAddress
            }
        };

    } catch (error: any) {
        logConsole.error("Critical error in getTokenBalance:", error);
        return {
            error: error.name || 'TokenBalanceError',
            message: `Failed to fetch token balance: ${error.message}`,
            code: error.code || "INTERNAL_ERROR"
        };
    }
}

// Test function - Comment out before deployment
async function testTokenBalance() {
    const testInput: TokenBalanceInput = {
        createdBy: "test_user",
        characterId: "test_character",
        tokenAddress: "0xb4885bc63399bf5518b994c1d0c153334ee579d0" // TOSHI token address on Base
    };

    try {
        logConsole.info('🚀 Starting token balance check...\n');
        const result = await getTokenBalance(testInput);
        logConsole.info('Balance result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Uncomment to run the test
// testTokenBalance();
