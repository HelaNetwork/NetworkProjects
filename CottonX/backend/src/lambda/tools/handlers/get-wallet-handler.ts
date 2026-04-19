import 'dotenv/config';
import { ethers } from "ethers";
import { getWallet } from "../utils/getWallet";

export async function getWalletData({ createdBy, characterId }: { createdBy: string, characterId: string }) {
    try {
        const wallet = await getWallet(createdBy, characterId);
        if (!wallet.privateKey) {
            return {
                error: 'WalletNotFound',
                message: `No wallet found for character ${characterId}`
            };
        }

        const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
        const signer = new ethers.Wallet(wallet.privateKey, provider);

        return {
            message: 'Wallet data retrieved successfully',
            wallet_data: {
                address: signer.address
            }
        };
    } catch (error: any) {
        return {
            error: error.name || 'WalletError',
            message: `Failed to retrieve wallet data: ${error.message}`
        };
    }
}

