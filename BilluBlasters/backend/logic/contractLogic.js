const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Configuration
const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// Load ABI (Ensure you have the ABI file in this folder or src)
// For now, using a placeholder path or inline
const ABI_PATH = path.join(__dirname, 'contractABI.json');

let contractABI;
try {
    if (fs.existsSync(ABI_PATH)) {
        const fileContent = fs.readFileSync(ABI_PATH, 'utf8');
        contractABI = JSON.parse(fileContent);
        // If ABI is wrapped in artifact (e.g., Hardhat), access .abi
        if (contractABI.abi) contractABI = contractABI.abi;
    } else {
        console.warn('Contract ABI not found at', ABI_PATH);
        contractABI = []; // Empty fallback
    }
} catch (error) {
    console.error('Error loading ABI:', error);
    contractABI = [];
}

// Initialize Provider
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Initialize Signer (Wallet)
// Only needed if backend sends transactions
const wallet = PRIVATE_KEY ? new ethers.Wallet(PRIVATE_KEY, provider) : null;

// Initialize Contract
const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet || provider);

const PayrollLogic = {
    // Example: Read function
    getContractBalance: async () => {
        try {
            const balance = await provider.getBalance(CONTRACT_ADDRESS);
            return ethers.formatEther(balance);
        } catch (error) {
            console.error('Error fetching balance:', error);
            throw error;
        }
    },

    // Example: Write function (requires PRIVATE_KEY)
    addEmployee: async (employeeAddress, salary) => {
        if (!wallet) throw new Error('Private key not configured for write operations');
        try {
            const tx = await contract.addEmployee(employeeAddress, ethers.parseEther(salary.toString()));
            await tx.wait();
            return tx.hash;
        } catch (error) {
            console.error('Error adding employee:', error);
            throw error;
        }
    },

    // Example: Logic to fund contract
    fundContract: async (amount) => {
        if (!wallet) throw new Error('Private key not configured');
        try {
            const tx = await wallet.sendTransaction({
                to: CONTRACT_ADDRESS,
                value: ethers.parseEther(amount.toString())
            });
            await tx.wait();
            return tx.hash;
        } catch (error) {
            console.error('Error funding contract:', error);
            throw error;
        }
    },

    // Generic call helper
    callFunction: async (functionName, ...args) => {
        try {
            if (contract[functionName]) {
                // Check if it's a read or write (in ethers v6, both are async)
                // But for write, we need a signer. Current 'contract' instance has signer if 'wallet' was passed.
                const result = await contract[functionName](...args);
                if (result.wait) await result.wait(); // It's a transaction
                return result;
            } else {
                throw new Error(`Function ${functionName} not found in ABI`);
            }
        } catch (error) {
            console.error(`Error calling ${functionName}:`, error);
            throw error;
        }
    }
};

module.exports = PayrollLogic;
