import 'dotenv/config';
import { ethers } from 'ethers';
import { encodeFunctionData, namehash } from "viem";
import { normalize } from "viem/ens";
import { logConsole, sendCharacterMessage, sendGodMessage } from "../../../utils";
import { getWallet } from '../utils/getWallet';

// Firestore-backed — docClient is a no-op shim for API compat
const docClient: any = null;

// Base Mainnet Registrar Controller Contract Address.
const BaseNamesRegistrarControllerAddress = "0x4cCb0BB02FCABA27e82a56646E81d8c5bC4119a5";

// Base Mainnet L2 Resolver Contract Address.
const L2ResolverAddress = "0xC6d566A56A1aFf6508b41f6c90ff131615583BCD";

// The regular expression to validate a Basename on Base Mainnet.
const baseNameRegex = /\.base\.eth$/;

// Relevant ABI for L2 Resolver Contract.
const l2ResolverABI = [
    {
        inputs: [
            { internalType: "bytes32", name: "node", type: "bytes32" },
            { internalType: "address", name: "a", type: "address" },
        ],
        name: "setAddr",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { internalType: "bytes32", name: "node", type: "bytes32" },
            { internalType: "string", name: "newName", type: "string" },
        ],
        name: "setName",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
];

// Relevant ABI for Basenames Registrar Controller Contract.
const registrarABI = [
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "string",
                        name: "name",
                        type: "string",
                    },
                    {
                        internalType: "address",
                        name: "owner",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "duration",
                        type: "uint256",
                    },
                    {
                        internalType: "address",
                        name: "resolver",
                        type: "address",
                    },
                    {
                        internalType: "bytes[]",
                        name: "data",
                        type: "bytes[]",
                    },
                    {
                        internalType: "bool",
                        name: "reverseRecord",
                        type: "bool",
                    },
                ],
                internalType: "struct RegistrarController.RegisterRequest",
                name: "request",
                type: "tuple",
            },
        ],
        name: "register",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
];

// Create register contract method arguments.
function createRegisterContractMethodArgs(baseName: string, addressId: string) {
    const addressData = encodeFunctionData({
        abi: l2ResolverABI,
        functionName: "setAddr",
        args: [namehash(normalize(baseName)), addressId],
    });
    const nameData = encodeFunctionData({
        abi: l2ResolverABI,
        functionName: "setName",
        args: [namehash(normalize(baseName)), baseName],
    });

    return {
        request: [
            baseName.replace(baseNameRegex, ""),
            addressId,
            "31557600", // 1 year in seconds
            L2ResolverAddress,
            [addressData, nameData],
            true,
        ],
    };
}

export async function manageBasename({
    sessionId,
    createdBy,
    characterId,
    baseNamePrefix,
    imageUrl,
}: {
    sessionId: string;
    createdBy: string;
    characterId: string;
    baseNamePrefix: string;
    imageUrl: string;
}) {
    try {
        logConsole.info('Starting manageBasename with input:', JSON.stringify({
            sessionId,
            createdBy,
            characterId,
            baseNamePrefix,
            imageUrl,
        }));

        // Step 1: Get wallet
        const wallet = await getWallet(createdBy, characterId);

        logConsole.info('Default wallet address:', wallet.walletAddress);

        if (wallet.baseName) {
            logConsole.info(`Wallet already has Basename: ${wallet.baseName}`);
            await sendCharacterMessage(characterId, sessionId, docClient, `Your Basename is already set to: ${wallet.baseName}`);
            return { status: 'success', basename: wallet.baseName };
        }

        // Step 3: Register new Basename
        const newBasename = `${characterId}-${baseNamePrefix}.base.eth`;
        logConsole.info(`Registering new Basename: ${newBasename}`);

        const registerArgs = createRegisterContractMethodArgs(newBasename, wallet.walletAddress);

        const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
        const contract = new ethers.Contract(
            BaseNamesRegistrarControllerAddress,
            registrarABI,
            new ethers.Wallet(wallet.privateKey, provider)
        );

        const contractInvocation = await contract.register(
            registerArgs.request,
            { value: ethers.parseEther("0.002") }
        );

        await contractInvocation.wait();
        logConsole.info(`Successfully registered Basename: ${newBasename}`);

        // Notify user
        await sendCharacterMessage(characterId, sessionId, docClient, `Successfully registered and configured Basename: ${newBasename}`);
        await sendGodMessage(sessionId, docClient, {
            createdBy,
            characterId,
            createdAt: new Date().toISOString(),
            eventName: "basename_managed",
            metadata: { basename: newBasename, avatar: imageUrl },
        });

        return { status: 'success', basename: newBasename, avatar: imageUrl };
    } catch (error: any) {
        console.error('Error in manageBasename:', error);
        return {
            error: error.name || 'BasenameError',
            message: error.message,
            code: error.code,
            details: error.shortMessage || error.info?.error?.message,
        };
    }
}
