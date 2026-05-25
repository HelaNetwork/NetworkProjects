import 'dotenv/config';
import { ethers } from "ethers";
import solc from 'solc';
import { logConsole, sendCharacterMessage, sendGodMessage } from "../../../utils";
import { createItem, getItem } from "../../dynamo_v3";
import { getWallet } from "../utils/getWallet";
import { UserContextManager } from '../../../context';

const CORE_TABLE_NAME = process.env.CORE_TABLE_NAME as string;
const docClient: any = null;

export interface ContractFile {
    fileId: string;
    userId: string;
    fileName: string;
    sourceCode: string;
    contractName: string;
    uploadedAt: string;
    compiled: boolean;
    abi?: any[];
    bytecode?: string;
    compilerVersion?: string;
}

export interface DeploymentResult {
    success: boolean;
    contractAddress?: string;
    transactionHash?: string;
    error?: string;
    message?: string;
}

/**
 * Store uploaded contract file
 */
export async function storeContractFile(
    userId: string,
    fileName: string,
    sourceCode: string,
    contractName: string
): Promise<ContractFile> {
    const fileId = crypto.randomUUID();
    const contractFile: ContractFile = {
        fileId,
        userId,
        fileName,
        sourceCode,
        contractName,
        uploadedAt: new Date().toISOString(),
        compiled: false
    };

    await createItem(
        `contract_files#${userId}`,
        `file#${fileId}`,
        contractFile,
        CORE_TABLE_NAME,
        docClient
    );

    logConsole.info(`Stored contract file ${fileName} for user ${userId}`);
    return contractFile;
}

/**
 * Get contract file by ID
 */
export async function getContractFile(userId: string, fileId: string): Promise<ContractFile | null> {
    try {
        const file = await getItem<ContractFile>(
            `contract_files#${userId}`,
            `file#${fileId}`,
            CORE_TABLE_NAME,
            docClient
        );
        return file;
    } catch (error) {
        logConsole.error('Error getting contract file:', error);
        return null;
    }
}

/**
 * Compile Solidity contract
 */
export function compileContract(sourceCode: string, contractName: string): {
    success: boolean;
    abi?: any[];
    bytecode?: string;
    error?: string;
} {
    try {
        logConsole.info(`Compiling contract: ${contractName}`);

        // Prepare input for solc compiler
        const input = {
            language: 'Solidity',
            sources: {
                'contract.sol': {
                    content: sourceCode
                }
            },
            settings: {
                outputSelection: {
                    '*': {
                        '*': ['abi', 'evm.bytecode']
                    }
                },
                optimizer: {
                    enabled: true,
                    runs: 200
                }
            }
        };

        // Compile the contract
        const output = JSON.parse(solc.compile(JSON.stringify(input)));

        // Check for errors
        if (output.errors) {
            const errors = output.errors.filter((e: any) => e.severity === 'error');
            if (errors.length > 0) {
                const errorMessages = errors.map((e: any) => e.formattedMessage).join('\n');
                logConsole.error('Compilation errors:', errorMessages);
                return {
                    success: false,
                    error: errorMessages
                };
            }
        }

        // Extract compiled contract
        const contract = output.contracts['contract.sol'][contractName];
        
        if (!contract) {
            return {
                success: false,
                error: `Contract "${contractName}" not found in source code. Available contracts: ${Object.keys(output.contracts['contract.sol']).join(', ')}`
            };
        }

        const abi = contract.abi;
        const bytecode = '0x' + contract.evm.bytecode.object;

        logConsole.info(`Contract compiled successfully. Bytecode length: ${bytecode.length}`);

        return {
            success: true,
            abi,
            bytecode
        };

    } catch (error: any) {
        logConsole.error('Error compiling contract:', error);
        return {
            success: false,
            error: error.message || 'Unknown compilation error'
        };
    }
}

/**
 * Deploy custom contract to HeLa network
 */
export async function deployCustomContract({
    sessionId,
    createdBy,
    characterId,
    fileId,
    constructorArgs = []
}: {
    sessionId: string;
    createdBy: string;
    characterId: string;
    fileId: string;
    constructorArgs?: any[];
}): Promise<DeploymentResult> {
    try {
        // Get contract file
        const contractFile = await getContractFile(createdBy, fileId);
        if (!contractFile) {
            return {
                success: false,
                error: 'Contract file not found'
            };
        }

        await sendCharacterMessage(
            characterId,
            sessionId,
            docClient,
            `Found your contract "${contractFile.contractName}". Compiling it now...`
        );

        // Compile if not already compiled
        let abi = contractFile.abi;
        let bytecode = contractFile.bytecode;

        if (!contractFile.compiled || !abi || !bytecode) {
            const compiled = compileContract(contractFile.sourceCode, contractFile.contractName);
            
            if (!compiled.success) {
                await sendCharacterMessage(
                    characterId,
                    sessionId,
                    docClient,
                    `Compilation failed: ${compiled.error}`
                );
                return {
                    success: false,
                    error: compiled.error
                };
            }

            abi = compiled.abi;
            bytecode = compiled.bytecode;

            // Update contract file with compiled data
            contractFile.compiled = true;
            contractFile.abi = abi;
            contractFile.bytecode = bytecode;
            contractFile.compilerVersion = solc.version();
        }

        await sendCharacterMessage(
            characterId,
            sessionId,
            docClient,
            `Compilation successful! Now deploying to HeLa testnet...`
        );

        // Get deployer wallet — use master private key
        const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
        const signer = new ethers.Wallet(process.env.AGENT_MASTER_PRIVATE_KEY as string, provider);

        // Check balance
        const balance = await provider.getBalance(signer.address);
        logConsole.info(`Deployer balance: ${ethers.formatEther(balance)} HELA`);

        if (balance < ethers.parseEther("0.0001")) {
            return {
                success: false,
                error: "Insufficient HELA balance. Need at least 0.0001 HELA for deployment."
            };
        }

        // Create contract factory
        const factory = new ethers.ContractFactory(abi!, bytecode!, signer);

        // Deploy contract
        logConsole.info(`Deploying contract with ${constructorArgs.length} constructor arguments`);
        const contract = await factory.deploy(...constructorArgs);

        await sendCharacterMessage(
            characterId,
            sessionId,
            docClient,
            `Deployment transaction sent! Waiting for confirmation...`
        );

        // Wait for deployment
        await contract.waitForDeployment();
        const contractAddress = await contract.getAddress();
        const deploymentTx = contract.deploymentTransaction();

        logConsole.info(`Contract deployed at: ${contractAddress}`);

        // Record action
        await UserContextManager.recordAction({
            userId: createdBy,
            sessionId,
            agentName: characterId,
            actionType: 'contract_deploy',
            outcome: 'success',
            details: {
                contractName: contractFile.contractName,
                contractAddress,
                transactionHash: deploymentTx?.hash,
                constructorArgs
            }
        });

        // Store deployment info
        const deploymentId = crypto.randomUUID();
        await createItem(
            `deployments#${createdBy}`,
            `deployment#${deploymentId}`,
            {
                deploymentId,
                userId: createdBy,
                fileId,
                contractName: contractFile.contractName,
                contractAddress,
                transactionHash: deploymentTx?.hash,
                network: 'hela-testnet',
                deployedAt: new Date().toISOString(),
                deployedBy: characterId
            },
            CORE_TABLE_NAME,
            docClient
        );

        // Send god message
        await sendGodMessage(
            sessionId,
            docClient,
            {
                createdBy,
                characterId,
                createdAt: new Date().toISOString(),
                eventName: 'custom_contract_deployed',
                metadata: {
                    contractName: contractFile.contractName,
                    contractAddress,
                    transactionHash: deploymentTx?.hash
                }
            }
        );

        await sendCharacterMessage(
            characterId,
            sessionId,
            docClient,
            `✅ Contract deployed successfully!\n\nContract: ${contractFile.contractName}\nAddress: ${contractAddress}\nNetwork: HeLa Testnet\n\nYour contract is now live on the blockchain!`
        );

        return {
            success: true,
            contractAddress,
            transactionHash: deploymentTx?.hash,
            message: `Contract ${contractFile.contractName} deployed at ${contractAddress}`
        };

    } catch (error: any) {
        logConsole.error('Error deploying custom contract:', error);

        // Record failed action
        await UserContextManager.recordAction({
            userId: createdBy,
            sessionId,
            agentName: characterId,
            actionType: 'contract_deploy',
            outcome: 'failed',
            details: {
                error: error.message
            }
        });

        return {
            success: false,
            error: error.message || 'Unknown deployment error'
        };
    }
}
