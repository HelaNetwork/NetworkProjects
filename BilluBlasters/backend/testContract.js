const { ethers } = require('ethers');
const dotenv = require('dotenv');
dotenv.config();

const contractABI = require('./logic/contractABI.json');
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const RPC_URL = process.env.RPC_URL;

async function testContract() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

    try {
        const owner = await contract.owner();
        console.log('Contract Owner:', owner);

        const balance = await contract.availableBalance();
        console.log('Available Balance:', ethers.formatEther(balance));

        const allocated = await contract.totalAllocated();
        console.log('Total Allocated:', ethers.formatEther(allocated));

        // Try getting stream 0
        try {
            const stream = await contract.getStreamInfo(0);
            console.log('Stream 0 Worker:', stream.worker);
        } catch (e) {
            console.log('Stream 0 not found');
        }

    } catch (err) {
        console.error('Contract connection failed:', err.message);
    }
}

testContract();
