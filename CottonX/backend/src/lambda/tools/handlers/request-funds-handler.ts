import { ethers } from "ethers";
import { logConsole, sendCharacterMessage, sendGodMessage } from "../../../utils";
import { createItem } from "../../dynamo_v3";
import { getWallet } from "../utils/getWallet";

const CORE_TABLE_NAME = process.env.CORE_TABLE_NAME as string;
// Firestore-backed — docClient is a no-op shim for API compat
const docClient: any = null;

export async function requestFunds({
    sessionId,
    createdBy,
    characterId,
    sendersWalletAddress
}: {
    sessionId: string,
    createdBy: string,
    characterId: string,
    sendersWalletAddress: string
}) {
    try {
        const agentWallet = await getWallet(createdBy, characterId);

        // Create a transaction request object
        const transactionRequest = {
            to: agentWallet.walletAddress,
            value: ethers.parseEther("0.001").toString(), // Request a small amount (0.001 ETH)
            from: sendersWalletAddress,
        };
        await sendCharacterMessage(
            characterId,
            sessionId,
            docClient,
            "Going to send you a pre-made transaction request to your wallet."
        );

        // Log the request for debugging
        logConsole.info(`Creating fund request from ${sendersWalletAddress} to ${agentWallet.walletAddress}`);

        // Create an event in DynamoDB to track this request
        const randomUUID = crypto.randomUUID();
        const eventData = {
            createdBy,
            characterId,
            eventName: "funds_requested",
            requestedAmount: "1000000000000000",
            fromAddress: sendersWalletAddress,
            toAddress: agentWallet.walletAddress
        };

        await createItem(
            "session#" + sessionId,
            "event#" + randomUUID,
            eventData,
            CORE_TABLE_NAME,
            docClient
        );

        // Send a god message to notify about the request
        await sendGodMessage(
            sessionId,
            docClient,
            {
                createdBy,
                characterId,
                createdAt: new Date().toISOString(),
                eventName: "funds_requested",
                metadata: {
                    requestedAmount: "1000000000000000",
                    fromAddress: sendersWalletAddress,
                    toAddress: agentWallet.walletAddress
                }
            }
        );
        await sleep(15000);

        // Return the transaction request that the frontend will use
        return {
            transaction: transactionRequest,
            message: "Transaction request created successfully"
        };

    } catch (error: any) {
        logConsole.error("Error in requestFunds:", error);
        return {
            error: error.name || 'FundRequestError',
            message: `Failed to create fund request: ${error.message}`
        };
    }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));