import 'dotenv/config';
import { Wallet } from "ethers";
import { logConsole, sendGodMessage } from "../../../utils";
import { createItem } from "../../dynamo_v3";
import { getWallet } from "../utils/getWallet";

export interface CharacterWallet {
    walletId: string;
    owner: string;
    characterId: string;
    walletAddress: string;
    privateKey: string;
}

// Firestore-backed — docClient is a no-op shim for API compat
const docClient: any = null;

export async function createWallet({ createdBy, characterId, sessionId }: { createdBy: string; characterId: string; sessionId: string }) {
    try {
        // Check if the user has a wallet already
        const existingWallet = await getWallet(createdBy, characterId);
        if (existingWallet.walletAddress !== '') {
            return { wallet_data: existingWallet.walletAddress };
        }

        // Create a new random wallet
        const wallet = Wallet.createRandom();
        logConsole.info(`Wallet successfully created with address: ${wallet.address}`);

        // Generate a unique wallet ID
        const walletId = `wallet_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

        // Create the wallet identifier for DynamoDB
        const walletIdentifier = `${createdBy}#${characterId}`;

        const characterWallet: CharacterWallet = {
            walletId: walletId,
            owner: createdBy,
            characterId: characterId,
            walletAddress: wallet.address,
            privateKey: wallet.privateKey
        };

        // Store the wallet data in DynamoDB
        await createItem('wallet', walletIdentifier, characterWallet, process.env.CORE_TABLE_NAME as string, docClient);

        // Send message to god about the wallet creation
        await sendGodMessage(
            sessionId,
            docClient,
            {
                createdBy: createdBy,
                characterId: characterId,
                createdAt: new Date().toISOString(),
                eventName: 'wallet_created',
                metadata: {
                    walletAddress: wallet.address
                }
            }
        );

        return { wallet_data: wallet.address };
    } catch (error: any) {
        logConsole.error('Error in createWallet:', error);
        return {
            error: error.name || 'WalletCreationError',
            message: `Failed to create wallet: ${error.message}`
        };
    }
}

