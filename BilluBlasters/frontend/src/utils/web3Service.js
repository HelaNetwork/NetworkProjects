import { ethers } from 'ethers';
import PayStreamABI from '../abi/PayStream.json';

// REPLACE WITH YOUR DEPLOYED CONTRACT ADDRESS
// Hela Testnet Chain ID
const HELA_CHAIN_ID = '0xa2d08'; // 666888 in hex

export const CONTRACT_ADDRESS = '0xa9aE42d8D3583de0677e41Cee8FBeb16Bde5D870';

const switchNetwork = async () => {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: HELA_CHAIN_ID }],
        });
    } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: HELA_CHAIN_ID,
                            chainName: 'Hela Testnet',
                            rpcUrls: ['https://testnet-rpc.helachain.com'],
                            nativeCurrency: {
                                name: 'HLUSD',
                                symbol: 'HLUSD', // or whatever the symbol is
                                decimals: 18,
                            },
                        },
                    ],
                });
            } catch (addError) {
                console.error("Failed to add Hela network:", addError);
            }
        } else {
            console.error("Failed to switch network:", switchError);
        }
    }
};

export const connectWallet = async () => {
    if (!window.ethereum) {
        throw new Error("MetaMask is not installed!");
    }

    try {
        await switchNetwork();
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        return {
            address: accounts[0],
            signer: signer,
            provider: provider
        };
    } catch (error) {
        console.error("Connection error:", error);
        throw new Error("Failed to connect wallet: " + error.message);
    }
};

export const getContract = async (signerOrProvider) => {
    if (!signerOrProvider) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        signerOrProvider = await provider.getSigner();
    }
    return new ethers.Contract(CONTRACT_ADDRESS, PayStreamABI, signerOrProvider);
};

export const createStream = async (workerAddress, amountInEth, streamType, durationOrEndTime) => {
    try {
        // Validate and checksum the address to prevent ENS resolution errors on non-Ethereum networks
        const validatedAddress = ethers.getAddress(workerAddress.trim());

        const { signer } = await connectWallet();
        const contract = await getContract(signer);

        // Convert ETH to Wei (18 decimals)
        const amountWei = ethers.parseEther(amountInEth.toString());

        // streamType: 0 = Continuous, 1 = OneTime
        const type = streamType === 'OneTime' ? 1 : 0;

        // durationOrEndTime: seconds (Continuous) or timestamp (OneTime)
        // Ensure accurate BigInt handling
        const duration = BigInt(durationOrEndTime);

        const tx = await contract.createStream(type, validatedAddress, amountWei, duration, { gasLimit: 3000000 });
        const receipt = await tx.wait(); // Wait for confirmation and get receipt
        return receipt;
    } catch (error) {
        console.error("Create Stream Error:", error);
        // Provide a friendlier message for invalid addresses
        if (error.code === 'INVALID_ARGUMENT' || error.message.includes('getAddress')) {
            throw new Error("Invalid wallet address format. Please check and try again.");
        }
        throw error;
    }
};

export const fundSystem = async (amountInEth) => {
    try {
        const { signer } = await connectWallet();
        const contract = await getContract(signer);

        const amountWei = ethers.parseEther(amountInEth.toString());

        const tx = await contract.fundSystem({ value: amountWei, gasLimit: 500000 });
        await tx.wait();
        return tx;
    } catch (error) {
        console.error("Fund System Error:", error);
        throw error;
    }
};

export const withdraw = async (streamId) => {
    try {
        const { signer } = await connectWallet();
        const contract = await getContract(signer);

        const tx = await contract.withdraw(streamId, { gasLimit: 500000 });
        await tx.wait();
        return tx;
    } catch (error) {
        console.error("Withdraw Error:", error);
        throw error;
    }
};

export const setStreamState = async (streamId, newState) => {
    try {
        const { signer } = await connectWallet();
        const contract = await getContract(signer);

        // newState enum: 0=Active, 1=Completed, 2=Cancelled, 3=Paused
        // Exposed actions usually: Pause (3), Cancel (2), Resume (Active=0)
        let stateEnum;
        switch (newState) {
            case 'Active': stateEnum = 0; break;
            case 'Completed': stateEnum = 1; break;
            case 'Cancelled': stateEnum = 2; break;
            case 'Paused': stateEnum = 3; break;
            default: throw new Error("Invalid state");
        }

        const tx = await contract.setState(streamId, stateEnum, { gasLimit: 1000000 });
        await tx.wait();
        return tx;
    } catch (error) {
        console.error("Set State Error:", error);
        throw error;
    }
};

export const emergencyWithdraw = async () => {
    try {
        const { signer } = await connectWallet();
        const contract = await getContract(signer);

        const tx = await contract.emergency({ gasLimit: 500000 });
        await tx.wait();
        return tx;
    } catch (error) {
        console.error("Emergency Withdraw Error:", error);
        throw error;
    }
};

// Listen to events (Optional frontend listener if needed, but backend handles indexing)
// Frontend primarily relies on API for list, but can listen for toaster notifications
export const listenToContractEvents = (callback) => {
    // Basic setup, user can extend
};

export const getAvailableBalance = async () => {
    try {
        const validatedContractAddress = ethers.getAddress(CONTRACT_ADDRESS);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(validatedContractAddress, PayStreamABI, provider);
        const balance = await contract.availableBalance();
        return ethers.formatEther(balance);
    } catch (error) {
        console.error("Get Balance Error:", error);
        return "0";
    }
};
