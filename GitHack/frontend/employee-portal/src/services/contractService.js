import { ethers } from 'ethers';
import PayStreamABI from '../../../../shared/abi/PayStream.json';
import MockTokenABI from '../../../../shared/abi/MockToken.json';

let PAYSTREAM_ADDRESS = '';
let TOKEN_ADDRESS = '';

try {
    const addresses = await import('../../../../shared/abi/addresses.json');
    PAYSTREAM_ADDRESS = addresses.payStream || '';
    TOKEN_ADDRESS = addresses.token || '';
} catch (e) {
    console.warn('No deployment addresses found. Please deploy contracts first.');
}

export function getProvider() {
    if (window.ethereum) {
        return new ethers.BrowserProvider(window.ethereum);
    }
    // Fallback to HeLa Public RPC
    return new ethers.JsonRpcProvider('https://testnet-rpc.helachain.com');
}

export async function getSigner() {
    const provider = getProvider();
    return provider.getSigner();
}

export async function switchToHeLaNetwork() {
    if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
    }

    const chainId = '0xA2D08'; // 666888 in hex (HeLa Testnet)

    try {
        // Try to switch to the network
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId }],
        });
    } catch (switchError) {
        // If the network doesn't exist, add it
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId,
                        chainName: 'HeLa Testnet',
                        nativeCurrency: {
                            name: 'HLUSD',
                            symbol: 'HLUSD',
                            decimals: 18
                        },
                        rpcUrls: ['https://testnet-rpc.helachain.com'],
                        blockExplorerUrls: ['https://testnet-blockexplorer.helachain.com']
                    }],
                });
            } catch (addError) {
                console.error('Add chain error:', addError);
                throw new Error('Failed to add HeLa Testnet to MetaMask');
            }
        } else {
            throw switchError;
        }
    }
}

export async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install the browser extension from metamask.io');
    }

    // First, try to switch to HeLa network
    try {
        await switchToHeLaNetwork();
        console.log('✅ Switched to HeLa Testnet');
    } catch (err) {
        console.warn('Could not switch network:', err);
        throw new Error('Please manually switch MetaMask to HeLa Testnet (Chain ID: 666888)');
    }

    const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
    });
    return accounts[0];
}

export async function getPayStreamContract(signerOrProvider) {
    return new ethers.Contract(PAYSTREAM_ADDRESS, PayStreamABI.abi, signerOrProvider);
}

// ── Read Functions ──

export async function getStreamCount() {
    const provider = getProvider();
    const contract = await getPayStreamContract(provider);
    return Number(await contract.getStreamCount());
}

export async function getStream(streamId) {
    const provider = getProvider();
    const contract = await getPayStreamContract(provider);
    return contract.getStream(streamId);
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
            });
        }
    }
    return streams;
}

export async function calculateAccrued(streamId) {
    const provider = getProvider();
    const contract = await getPayStreamContract(provider);
    return contract.calculateAccrued(streamId);
}

// ── Write Functions ──

export async function withdraw(streamId) {
    const signer = await getSigner();
    const contract = await getPayStreamContract(signer);
    // Explicit gas limit to prevent RPC estimation errors on HeLa
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

    // Filter for this employee's requests
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
    const token = new ethers.Contract(TOKEN_ADDRESS, MockTokenABI.abi, provider);
    const balance = await token.balanceOf(address);
    return ethers.formatEther(balance);
}

export function formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatRate(rateWei) {
    return ethers.formatEther(rateWei);
}

export { ethers };
