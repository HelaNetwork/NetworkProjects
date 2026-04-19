import 'dotenv/config';
import { ethers } from 'ethers';
import { logConsole } from '../../../utils';
import { getWallet } from "../utils/getWallet";

export async function transferETH(inputData: { senderWalletAddress: string, destinationWalletAddress: string, amountInWei: string, createdBy: string, characterId: string }) {
    try {
        const wallet = await getWallet(inputData.createdBy, inputData.characterId);
        const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
        const signer = new ethers.Wallet(wallet.privateKey, provider);

        // Get current balance
        const balance = await provider.getBalance(signer.address);
        const amountInWei = BigInt(inputData.amountInWei);

        logConsole.info(`The balance of the wallet is ${ethers.formatEther(balance)} ETH for character ${inputData.characterId}`);
        if (balance < amountInWei) {
            return { message: "Insufficient funds, cannot transfer." };
        }

        // Get gas estimate
        const gasPrice = await provider.getFeeData();
        const gasLimit = BigInt(21000); // Standard ETH transfer gas limit
        const totalCost = amountInWei + (gasLimit * gasPrice.gasPrice!);

        if (balance < totalCost) {
            return { message: "Insufficient funds to cover gas costs." };
        }

        // Create and send transaction
        const tx = await signer.sendTransaction({
            to: inputData.destinationWalletAddress,
            value: amountInWei,
            gasLimit: gasLimit,
            gasPrice: gasPrice.gasPrice
        });

        logConsole.info(`Transaction sent: ${tx.hash}`);
        const receipt = await tx.wait();

        if (receipt && receipt.status === 1) {
            logConsole.info(`Transfer successful: ${tx.hash}`);
            return {
                message: "Transfer successful.",
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString(),
            };
        } else {
            throw new Error('Transaction failed');
        }
    } catch (error: any) {
        console.error('Transfer failed:', error);
        return {
            error: error.name || 'TransferError',
            message: `Failed to transfer ETH: ${error.message}`
        };
    }
}

