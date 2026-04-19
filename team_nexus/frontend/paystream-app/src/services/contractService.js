import { ethers } from 'ethers';
import PayStreamABI from '../../../../shared/abi/PayStream.json';
import TaxVaultABI from '../../../../shared/abi/TaxVault.json';

// Addresses will be loaded dynamically based on Chain ID
let ALL_ADDRESSES = {};

// Try to load addresses from deployment
try {
    // Note: This relies on the new structure { "666888": {...}, "8668": {...} }
    const loaded = await import('../../../../shared/abi/addresses.json');
    // Handle ES module default export if necessary
    ALL_ADDRESSES = loaded.default || loaded;
    console.log('Loaded deployment addresses:', ALL_ADDRESSES);
} catch (e) {
    console.warn('No deployment addresses found.');
}

export function getProvider() {
    if (window.ethereum) {
        return new ethers.BrowserProvider(window.ethereum);
    }
    // Default to Testnet as it's safer for dev/demos if no wallet
    return new ethers.JsonRpcProvider('https://testnet-rpc.helachain.com');
}

export async function getSigner() {
    const provider = getProvider();
    return provider.getSigner();
}

/**
 * Helper to get addresses for the current connected network
 */
async function getAddresses() {
    const provider = getProvider();
    let chainId;
    try {
        const network = await provider.getNetwork();
        chainId = network.chainId.toString();
    } catch (e) {
        console.warn("Could not determine chain ID, defaulting to Testnet (666888)");
        chainId = "666888";
    }

    // fallback for old structure compatibility (if user hasn't redeployed yet)
    // If the JSON is flat (no chainID keys but has "payStream"), wrap it effectively
    if (ALL_ADDRESSES.payStream && !ALL_ADDRESSES[chainId]) {
        return ALL_ADDRESSES;
    }

    const deployment = ALL_ADDRESSES[chainId];
    if (!deployment) {
        console.warn(`No deployment found for Chain ID ${chainId}.`);
        return { payStream: '', taxVault: '' };
    }
    return deployment;
}

export async function switchToHeLaNetwork(isTestnet = true) {
    if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
    }

    const config = isTestnet ? {
        chainId: '0xA2D08', // 666888
        chainName: 'HeLa Testnet',
        rpcUrl: 'https://testnet-rpc.helachain.com',
        blockExplorer: 'https://testnet-blockexplorer.helachain.com'
    } : {
        chainId: '0x21DC', // 8668
        chainName: 'HeLa Mainnet',
        rpcUrl: 'https://mainnet-rpc.helachain.com',
        blockExplorer: 'https://mainnet-blockexplorer.helachain.com'
    };

    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: config.chainId }],
        });
    } catch (switchError) {
        // If the network doesn't exist, add it
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: config.chainId,
                        chainName: config.chainName,
                        nativeCurrency: {
                            name: 'HLUSD',
                            symbol: 'HLUSD',
                            decimals: 18
                        },
                        rpcUrls: [config.rpcUrl],
                        blockExplorerUrls: [config.blockExplorer]
                    }],
                });
            } catch (addError) {
                console.error('Add chain error:', addError);
                throw new Error(`Failed to add ${config.chainName} to MetaMask`);
            }
        } else {
            throw switchError;
        }
    }
}

export async function connectWallet() {
    console.log('Attempting to connect wallet...');

    if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed.');
    }

    // Request accounts
    const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
    });

    // Check network and log
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    console.log(`Connected to chain: ${network.chainId}`);

    return accounts[0];
}

export async function getPayStreamContract(signerOrProvider) {
    const addresses = await getAddresses();
    if (!addresses.payStream) throw new Error("PayStream address not found for this network");
    return new ethers.Contract(addresses.payStream, PayStreamABI.abi, signerOrProvider);
}

export async function getTaxVaultContract(signerOrProvider) {
    const addresses = await getAddresses();
    if (!addresses.taxVault) throw new Error("TaxVault address not found for this network");
    return new ethers.Contract(addresses.taxVault, TaxVaultABI.abi, signerOrProvider);
}

// ── Write Functions ──

export async function createStream(employeeAddress, ratePerSecond) {
    const signer = await getSigner();
    const contract = await getPayStreamContract(signer);
    const rateWei = ethers.parseEther(ratePerSecond.toString());
    const tx = await contract.createStream(employeeAddress, rateWei);
    await tx.wait();
    return tx;
}

export async function pauseStream(streamId) {
    const signer = await getSigner();
    const contract = await getPayStreamContract(signer);
    const tx = await contract.pauseStream(streamId);
    await tx.wait();
    return tx;
}

export async function resumeStream(streamId) {
    const signer = await getSigner();
    const contract = await getPayStreamContract(signer);
    const tx = await contract.resumeStream(streamId);
    await tx.wait();
    return tx;
}

export async function cancelStream(streamId) {
    const signer = await getSigner();
    const contract = await getPayStreamContract(signer);
    const tx = await contract.cancelStream(streamId);
    await tx.wait();
    return tx;
}

export async function fundContract(amount) {
    const signer = await getSigner();
    const contract = await getPayStreamContract(signer);
    const amountWei = ethers.parseEther(amount.toString());

    // 1. Check Native Balance
    const userAddress = await signer.getAddress();
    const provider = signer.provider;
    const balance = await provider.getBalance(userAddress);

    console.log(`Current Native Balance: ${ethers.formatEther(balance)} HLUSD`);

    if (balance < amountWei) {
        alert(`❌ Insufficient Funds! You have ${ethers.formatEther(balance)} HLUSD but need ${amount}.`);
        throw new Error('Insufficient funds');
    }

    // 2. Fund Contract (Native Transfer)
    console.log(`Funding contract with ${amount} HLUSD...`);
    const fundTx = await contract.fundContract({ value: amountWei, gasLimit: 500000 });
    await fundTx.wait();
    return fundTx;
}

export async function setTaxRate(basisPoints) {
    const signer = await getSigner();
    const contract = await getPayStreamContract(signer);
    const tx = await contract.setTaxRate(basisPoints);
    await tx.wait();
    return tx;
}

export async function approveStreamRequest(requestId) {
    const signer = await getSigner();
    const contract = await getPayStreamContract(signer);
    const tx = await contract.approveStreamRequest(requestId);
    await tx.wait();
    return tx;
}

export async function rejectStreamRequest(requestId) {
    const signer = await getSigner();
    const contract = await getPayStreamContract(signer);
    const tx = await contract.rejectStreamRequest(requestId);
    await tx.wait();
    return tx;
}

export async function awardBonus(employeeAddress, amount) {
    const signer = await getSigner();
    const contract = await getPayStreamContract(signer);
    const amountWei = ethers.parseEther(amount.toString());
    const tx = await contract.awardBonus(employeeAddress, amountWei);
    await tx.wait();
    return tx;
}

// ── Read Functions ──

export async function getStreamCount() {
    const provider = getProvider();
    const contract = await getPayStreamContract(provider);
    const count = await contract.getStreamCount();
    return Number(count);
}

export async function getStream(streamId) {
    const provider = getProvider();
    const contract = await getPayStreamContract(provider);
    return contract.getStream(streamId);
}

export async function getAllStreams() {
    const count = await getStreamCount();
    const streams = [];
    for (let i = 0; i < count; i++) {
        const s = await getStream(i);
        streams.push({
            id: i,
            employer: s.employer,
            employee: s.employee,
            ratePerSecond: s.ratePerSecond,
            lastClaimTime: Number(s.lastClaimTime),
            active: s.active,
            isPaused: s.isPaused, // New field
        });
    }
    return streams;
}

export async function calculateAccrued(streamId) {
    const provider = getProvider();
    const contract = await getPayStreamContract(provider);
    return contract.calculateAccrued(streamId);
}

export async function getEmployeeStreams(employeeAddress) {
    const count = await getStreamCount();
    const streams = [];
    for (let i = 0; i < count; i++) {
        const s = await getStream(i);
        if (s.employee.toLowerCase() === employeeAddress.toLowerCase()) {
            streams.push({
                id: i,
                employer: s.employer,
                employee: s.employee,
                ratePerSecond: s.ratePerSecond,
                lastClaimTime: Number(s.lastClaimTime),
                active: s.active,
                isPaused: s.isPaused, // New field
            });
        }
    }
    return streams;
}

export async function withdraw(streamId) {
    const signer = await getSigner();
    const contract = await getPayStreamContract(signer);
    // Explicit gas limit for safety
    const tx = await contract.withdraw(streamId, { gasLimit: 500000 });
    await tx.wait();
    return tx;
}

export async function requestStreamStart(ratePerSecond) {
    const signer = await getSigner();
    const contract = await getPayStreamContract(signer);
    const rateWei = ethers.parseEther(ratePerSecond.toString());
    const tx = await contract.requestStreamStart(rateWei);
    await tx.wait();
    return tx;
}

export async function getMyPendingRequests(employeeAddress) {
    const provider = getProvider();
    const contract = await getPayStreamContract(provider);
    const { requestIds, requests } = await contract.getPendingRequests();

    // Filter
    const myRequests = [];
    for (let i = 0; i < requests.length; i++) {
        if (requests[i].employee.toLowerCase() === employeeAddress.toLowerCase()) {
            myRequests.push({
                id: Number(requestIds[i]),
                employee: requests[i].employee,
                ratePerSecond: requests[i].ratePerSecond,
                timestamp: Number(requests[i].timestamp),
                processed: requests[i].processed,
            });
        }
    }
    return myRequests;
}

export async function getTokenBalance(address) {
    const provider = getProvider();
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
}

export async function getTreasuryBalance() {
    const provider = getProvider();
    const contract = await getPayStreamContract(provider);
    const balance = await contract.getTreasuryBalance();
    return ethers.formatEther(balance);
}

export async function getTaxRate() {
    const provider = getProvider();
    const contract = await getPayStreamContract(provider);
    const rate = await contract.taxBasisPoints();
    return Number(rate);
}

export async function getTaxVaultBalance() {
    const provider = getProvider();
    const vault = await getTaxVaultContract(provider);
    const balance = await vault.getBalance();
    return ethers.formatEther(balance);
}

export async function getPendingRequests() {
    const provider = getProvider();
    const contract = await getPayStreamContract(provider);
    const { requestIds, requests } = await contract.getPendingRequests();

    const pendingRequests = [];
    for (let i = 0; i < requests.length; i++) {
        pendingRequests.push({
            id: Number(requestIds[i]),
            employee: requests[i].employee,
            ratePerSecond: requests[i].ratePerSecond,
            timestamp: Number(requests[i].timestamp),
            processed: requests[i].processed,
        });
    }
    return pendingRequests;
}

export function formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatRate(rateWei) {
    return ethers.formatEther(rateWei);
}

export { ethers };
