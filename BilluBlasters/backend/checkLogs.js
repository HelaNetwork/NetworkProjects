const { ethers } = require('ethers');
const dotenv = require('dotenv');
dotenv.config();

const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

async function checkEvents() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const balance = await provider.getBalance(CONTRACT_ADDRESS);
    console.log('Contract Native Balance:', ethers.formatEther(balance));

    const currentBlock = await provider.getBlockNumber();
    console.log('Current Block:', currentBlock);

    try {
        // Query last 100 blocks for ANY logs from this contract
        const logs = await provider.getLogs({
            address: CONTRACT_ADDRESS,
            fromBlock: currentBlock - 100,
            toBlock: currentBlock
        });
        console.log(`Found ${logs.length} logs in last 100 blocks`);
        logs.forEach(l => console.log('Log Topics:', l.topics));
    } catch (err) {
        console.error('Logs query failed:', err.message);
    }
}

checkEvents();
