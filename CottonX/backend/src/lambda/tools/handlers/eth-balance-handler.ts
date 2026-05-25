import 'dotenv/config';
import { ethers } from "ethers";
import { logConsole } from "../../../utils";
import { getWallet } from "../utils/getWallet";


export async function getEthBalance({ createdBy, characterId }: { createdBy: string, characterId: string }) {
    const wallet = await getWallet(createdBy, characterId);
    const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
    const signer = new ethers.Wallet(wallet.privateKey, provider);

    const balance = await provider.getBalance(signer.address);
    const formattedBalance = ethers.formatEther(balance);
    logConsole.info(`ETH balance is ${formattedBalance}`);

    try {
        return {
            message: `Current ETH balance is ${formattedBalance}`,
            balance_data: {
                balance: formattedBalance,
                address: signer.address
            }
        };
    } catch (error: any) {
        return {
            error: error.name || 'BalanceError',
            message: `Failed to fetch ETH balance: ${error.message}`
        };
    }
}
