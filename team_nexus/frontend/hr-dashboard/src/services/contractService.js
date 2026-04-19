import { ethers } from 'ethers';
import PayStreamABI from '../../../../shared/abi/PayStream.json';
import MockTokenABI from '../../../../shared/abi/MockToken.json';
import TaxVaultABI from '../../../../shared/abi/TaxVault.json';

// Default addresses for local hardhat deployment — overwritten dynamically
let PAYSTREAM_ADDRESS = '';
let TOKEN_ADDRESS = '';
let TAX_VAULT_ADDRESS = '';

// Try to load addresses from deployment
try {
    const addresses = await import('../../../../shared/abi/addresses.json');
    PAYSTREAM_ADDRESS = addresses.payStream || '';
    TOKEN_ADDRESS = addresses.token || '';
    TAX_VAULT_ADDRESS = addresses.taxVault || '';
} catch (e) {
    console.warn('No deployment addresses found. Please deploy contracts first.');
}

export function getProvider() {
    if (window.ethereum) {
        return new ethers.BrowserProvider(window.ethereum);
    }
    // Fallback to HeLa Testnet Public RPC
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
    console.log('Attempting to connect wallet...');
    console.log('window.ethereum type:', typeof window.ethereum);

    if (typeof window.ethereum === 'undefined') {
        console.error('MetaMask not detected!');
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
    console.log('Connected account:', accounts[0]);
    return accounts[0];
}

export async function getPayStreamContract(signerOrProvider) {
    return new ethers.Contract(PAYSTREAM_ADDRESS, PayStreamABI.abi, signerOrProvider);
}

export async function getTokenContract(signerOrProvider) {
    return new ethers.Contract(TOKEN_ADDRESS, MockTokenABI.abi, signerOrProvider);
}

export async function getTaxVaultContract(signerOrProvider) {
    return new ethers.Contract(TAX_VAULT_ADDRESS, TaxVaultABI.abi, signerOrProvider);
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

    const network = await (await getProvider()).getNetwork();

    // Chain ID 666888 is HeLa Testnet where we use native HLUSD (which needs wrapping)
    if (network.chainId === 666888n) {
        // 1. Wrap Native HLUSD -> Wrapped HLUSD (WHLUSD)
        const token = new ethers.Contract(TOKEN_ADDRESS, ['function deposit() payable', 'function approve(address, uint256)', 'function balanceOf(address) view returns (uint256)'], signer);

        console.log(`Checking WHLUSD balance...`);
        const bal = await token.balanceOf(await signer.getAddress());
        console.log(`Current WHLUSD Balance: ${ethers.formatEther(bal)}`);

        // Only wrap what is needed
        if (bal < amountWei) {
            const needed = amountWei - bal;
            console.log(`Wrapping ${ethers.formatEther(needed)} HLUSD...`);
            // Explicit high gas limit to bypass estimation issues
            const depositTx = await token.deposit({ value: needed, gasLimit: 500000 });
            await depositTx.wait();
            console.log('Wrap complete');
        } else {
            console.log('Sufficient WHLUSD balance, skipping wrap.');
        }

        // 2. Approve PayStream to spend WHLUSD
        console.log(`Approving transfer...`);
        const approveTx = await token.approve(PAYSTREAM_ADDRESS, amountWei, { gasLimit: 200000 });
        await approveTx.wait();
        console.log('Approval complete');

        // 3. Fund Contract
        console.log(`Funding contract...`);
        const fundTx = await contract.fundContract(amountWei, { gasLimit: 500000 });
        await fundTx.wait();
        return fundTx;
    } else {
        // Standard ERC20 logic (Localhost)
        const token = await getTokenContract(signer);
        const approveTx = await token.approve(PAYSTREAM_ADDRESS, amountWei);
        await approveTx.wait();

        const fundTx = await contract.fundContract(amountWei);
        await fundTx.wait();
        return fundTx;
    }
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
        });
    }
    return streams;
}

export async function calculateAccrued(streamId) {
    const provider = getProvider();
    const contract = await getPayStreamContract(provider);
    return contract.calculateAccrued(streamId);
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
