import { getItem } from "../../../lambda/dynamo_v3";
import { logConsole } from "../../../utils";

// Firestore-backed — docClient is a no-op shim for API compat
const docClient: any = null;
const TABLE_NAME = process.env.CORE_TABLE_NAME as string;

export interface WalletData {
    walletId: string;
    walletAddress: string;
    privateKey: string;
    baseName?: string;
}

import { ethers } from 'ethers';

const fetchWalletData = async (owner: string): Promise<WalletData> => {
    // Override with User's MetaMask Private Key if provided
    if (process.env.AGENT_MASTER_PRIVATE_KEY) {
        logConsole.info('Using AGENT_MASTER_PRIVATE_KEY for:', owner);
        try {
            const masterWallet = new ethers.Wallet(process.env.AGENT_MASTER_PRIVATE_KEY);
            return {
                walletId: 'master_wallet',
                walletAddress: masterWallet.address,
                privateKey: process.env.AGENT_MASTER_PRIVATE_KEY,
                baseName: 'MasterAgent'
            }
        } catch (error) {
            logConsole.error('Invalid AGENT_MASTER_PRIVATE_KEY provided.', error);
        }
    }

    logConsole.info('Fetching wallet data for:', owner)
    const walletData = await getItem<WalletData>('wallet', owner, TABLE_NAME, docClient);
    if (!walletData) {
        logConsole.info(`Warning: No wallet data found for ${owner}`)
        return {
            walletId: '',
            walletAddress: '',
            privateKey: '',
            baseName: ''
        }
    }
    return {
        walletId: walletData.walletId,
        walletAddress: walletData.walletAddress,
        privateKey: walletData.privateKey,
        baseName: walletData.baseName
    }
}

export async function getWallet(createdBy: string, characterId: string): Promise<WalletData> {
    const owner = `${createdBy}#${characterId}`;
    const walletData = await fetchWalletData(owner);

    logConsole.info(`Found wallet data for ${owner}`, JSON.stringify({
        walletId: walletData.walletId,
        walletAddress: walletData.walletAddress,
        privateKey: '***redacted***'
    }, null, 2))

    return {
        walletId: walletData.walletId,
        walletAddress: walletData.walletAddress,
        privateKey: walletData.privateKey
    };
}


