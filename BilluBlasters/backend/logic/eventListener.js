const { ethers } = require('ethers');
const Stream = require('../models/Stream');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const ContractStats = require('../models/ContractStats');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

const contractABI = require('./contractABI.json');
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';

const StreamTypeMap = ['Continuous', 'OneTime'];
const StreamStateMap = ['Active', 'Completed', 'Cancelled', 'Paused'];

let provider;
let contract;

function setupProvider() {
    console.log('Connecting to Blockchain (Hela Testnet)...');
    provider = new ethers.JsonRpcProvider(RPC_URL);

    contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

    // Re-attach listeners
    contract.on('StreamCreated', handleStreamCreated);
    contract.on('Withdrawn', handleWithdrawn);
    contract.on('StreamStateChanged', handleStreamStateChanged);
    contract.on('Funded', handleFunded);
    contract.on('EmergencyWithdraw', handleEmergencyWithdrawEvent);

    syncStats();
}

async function syncStats() {
    try {
        const balance = await contract.availableBalance();
        const allocated = await contract.totalAllocated();

        await ContractStats.findOneAndUpdate(
            { contractAddress: CONTRACT_ADDRESS.toLowerCase() },
            {
                availableBalance: balance.toString(),
                totalAllocated: allocated.toString()
            },
            { upsert: true, new: true }
        );
        console.log('Contract Stats synced with blockchain');
    } catch (err) {
        console.error('Error syncing stats:', err);
    }
}

let reconnectTimeout;
function reconnect() {
    if (reconnectTimeout) return;
    reconnectTimeout = setTimeout(() => {
        reconnectTimeout = null;
        setupProvider();
        syncPastEvents();
    }, 5000);
}

// Helper to get user metadata
async function getWorkerMetadata(address) {
    if (!address) return { name: 'Unknown', email: '' };
    try {
        // Use case-insensitive regex for the wallet address
        const user = await User.findOne({
            walletAddress: { $regex: new RegExp(`^${address}$`, 'i') }
        });

        if (user) {
            return {
                name: user.name,
                email: user.email
            };
        }
        return { name: 'Unknown', email: '' };
    } catch (err) {
        console.error('Error fetching user metadata:', err);
        return { name: 'Unknown', email: '' };
    }
}

async function handleStreamCreated(id, worker, amount, event) {
    const streamId = Number(id);
    // Check if already exists to avoid duplicates from sync
    const exists = await Stream.findOne({ streamId });
    if (exists) return;

    console.log(`Processing Stream ID ${streamId}...`);

    try {
        console.log('Fetching stream info...');
        const info = await contract.getStreamInfo(id);
        console.log('Fetching full stream data...');
        const fullStream = await contract.streams(id);
        console.log('Fetching worker metadata...');
        const metadata = await getWorkerMetadata(worker);
        console.log('Metadata found:', metadata.name);

        const streamData = {
            workerAddress: worker.toLowerCase(),
            deposit: info.deposit.toString(),
            withdrawn: info.withdrawn.toString(),
            ratePerSecond: info.ratePerSecond.toString(),
            startTime: Number(info.startTime),
            endTime: Number(info.endTime),
            totalPausedDuration: Number(fullStream.totalPausedDuration),
            streamType: StreamTypeMap[Number(info.streamType)],
            state: StreamStateMap[Number(info.state)],
            txHash: event.transactionHash || event.log?.transactionHash || 'synced',
            blockNumber: Number(event.blockNumber || event.log?.blockNumber || 0),
            workerName: metadata.name,
            workerEmail: metadata.email
        };

        const savedStream = await Stream.findOneAndUpdate(
            { streamId },
            {
                $set: streamData,
                $setOnInsert: { label: 'employee' }
            },
            { upsert: true, new: true }
        );

        // Save Transaction
        const txData = {
            type: 'StreamCreated',
            streamId: streamId,
            sender: CONTRACT_ADDRESS,
            receiver: worker,
            amount: info.deposit.toString(),
            status: 'Confirmed',
            timestamp: new Date()
        };

        await Transaction.findOneAndUpdate(
            { txHash: event.transactionHash || event.log?.transactionHash || `stream-${streamId}` },
            {
                $set: txData,
                $setOnInsert: { label: savedStream.label || 'employee' }
            },
            { upsert: true, new: true }
        );

        console.log(`Stream ${streamId} saved/updated in DB (Label: ${savedStream.label})`);
        syncStats();
    } catch (err) {
        console.error(`Error handling StreamCreated for ${streamId}:`, err);
    }
}

async function handleWithdrawn(streamIdRaw, amount, event) {
    const streamId = Number(streamIdRaw);
    console.log(`Stream ${streamId} withdrawn: ${ethers.formatEther(amount)} ETH`);

    try {
        const info = await contract.getStreamInfo(streamId);

        // Find existing stream to get label
        const existingStream = await Stream.findOne({ streamId });
        const label = existingStream ? existingStream.label : 'employee';

        await Stream.findOneAndUpdate(
            { streamId: streamId },
            {
                withdrawn: info.withdrawn.toString(),
                state: StreamStateMap[Number(info.state)]
            }
        );

        // Save Transaction
        const txData = {
            type: 'Withdrawal',
            streamId: streamId,
            sender: CONTRACT_ADDRESS,
            receiver: existingStream ? existingStream.workerAddress : 'unknown',
            amount: amount.toString(),
            status: 'Confirmed',
            timestamp: new Date()
        };

        await Transaction.findOneAndUpdate(
            { txHash: event.transactionHash || event.log?.transactionHash },
            {
                $set: txData,
                $setOnInsert: { label: label }
            },
            { upsert: true, new: true }
        );

        syncStats();
    } catch (err) {
        console.error(`Error handling Withdrawn for ${streamId}:`, err);
    }
}

async function handleStreamStateChanged(id, newState, event) {
    const streamId = Number(id);
    const stateStr = StreamStateMap[Number(newState)];
    console.log(`Stream ${streamId} State Changed to ${stateStr}`);

    try {
        const info = await contract.getStreamInfo(id);
        const fullStream = await contract.streams(id);

        await Stream.updateOne(
            { streamId: streamId },
            {
                state: stateStr,
                endTime: Number(info.endTime),
                totalPausedDuration: Number(fullStream.totalPausedDuration)
            }
        );

        // Save Transaction
        await new Transaction({
            type: 'StateChange',
            streamId: streamId,
            txHash: event.transactionHash || event.log?.transactionHash || `state-${Date.now()}`,
            timestamp: new Date()
        }).save().catch(e => console.log('Duplicate Tx ignored'));

        syncStats();
    } catch (err) {
        console.error(`Error handling StateChange for ${streamId}:`, err);
    }
}

async function handleFunded(sender, amount, event) {
    console.log(`Contract Funded: ${ethers.formatEther(amount)} ETH from ${sender}`);
    try {
        await new Transaction({
            type: 'Funding',
            sender: sender,
            amount: amount.toString(),
            txHash: event.transactionHash || event.log?.transactionHash || `fund-${Date.now()}`,
            timestamp: new Date()
        }).save().catch(e => console.log('Duplicate Tx ignored'));

        syncStats();
    } catch (err) {
        console.error('Error handling Funded event:', err);
    }
}

async function handleEmergencyWithdrawEvent(owner, amount, event) {
    console.log(`Emergency Withdrawal: ${ethers.formatEther(amount)} ETH by ${owner}`);
    try {
        await new Transaction({
            type: 'Emergency',
            receiver: owner,
            amount: amount.toString(),
            txHash: event.transactionHash || event.log?.transactionHash || `emergency-${Date.now()}`,
            timestamp: new Date()
        }).save().catch(e => console.log('Duplicate Tx ignored'));

        syncStats();
    } catch (err) {
        console.error('Error handling Emergency event:', err);
    }
}

let isSyncing = false;
// Sync past events to find missing streams
async function syncPastEvents() {
    if (isSyncing) return;
    isSyncing = true;
    console.log('Syncing past events in chunks...');
    try {
        const currentBlock = await provider.getBlockNumber();
        const lookback = 100000; // Total blocks to look back (approx 3 days on Hela)
        const chunkSize = 100; // Hela RPC limit
        const startBlock = Math.max(0, currentBlock - lookback);

        let allEvents = [];
        const filter = contract.filters.StreamCreated();

        const totalChunks = Math.ceil((currentBlock - startBlock) / chunkSize);
        let chunksDone = 0;

        for (let i = startBlock; i < currentBlock; i += chunkSize) {
            const end = Math.min(i + chunkSize, currentBlock);
            try {
                const events = await contract.queryFilter(filter, i, end);
                allEvents = allEvents.concat(events);
                chunksDone++;
                if (chunksDone % 50 === 0) {
                    console.log(`Sync Progress: ${((chunksDone / totalChunks) * 100).toFixed(1)}%`);
                }
                // Be nice to the RPC
                await new Promise(r => setTimeout(r, 50));
            } catch (chunkErr) {
                console.error(`Error syncing chunk ${i} to ${end}:`, chunkErr.message);
            }
        }

        console.log(`Found ${allEvents.length} StreamCreated events in history`);
        for (const event of allEvents) {
            console.log('Event Args:', event.args);
            await handleStreamCreated(event.args[0], event.args[1], event.args[2], event);
        }
    } catch (err) {
        console.error('Error in syncPastEvents:', err);
    } finally {
        isSyncing = false;
    }
}

// Verification Sync (Every 10 mins)
async function verifyStreams() {
    console.log('Running periodic stream verification...');
    try {
        // 1. Check existing streams for state/withdraw changes
        const dbStreams = await Stream.find({ state: { $ne: 'Completed' } });

        for (const dbStream of dbStreams) {
            try {
                const info = await contract.getStreamInfo(dbStream.streamId);
                const onChainState = StreamStateMap[Number(info.state)];
                const onChainWithdrawn = info.withdrawn.toString();

                let needsSave = false;
                if (dbStream.state !== onChainState) {
                    dbStream.state = onChainState;
                    needsSave = true;
                }
                if (dbStream.withdrawn !== onChainWithdrawn) {
                    dbStream.withdrawn = onChainWithdrawn;
                    needsSave = true;
                }

                // Metadata sync: If workerName is Unknown, try fetching it again
                if (dbStream.workerName === 'Unknown' || !dbStream.workerName) {
                    const metadata = await getWorkerMetadata(dbStream.workerAddress);
                    if (metadata.name !== 'Unknown') {
                        dbStream.workerName = metadata.name;
                        dbStream.workerEmail = metadata.email;
                        needsSave = true;
                        console.log(`Synced metadata for Stream ${dbStream.streamId}: ${metadata.name}`);
                    }
                }

                if (needsSave) {
                    console.warn(`Discrepancy found or metadata missing for Stream ${dbStream.streamId}. Syncing...`);
                    await dbStream.save();
                }
            } catch (err) {
                console.error(`Error verifying stream ${dbStream.streamId}:`, err.message);
            }
        }

        // 2. Also try to sync past events again just in case
        await syncPastEvents();
    } catch (err) {
        console.error('Verification error:', err);
    }
}

async function startEventListener() {
    setupProvider();

    // Initial Sync
    await syncPastEvents();
    await verifyStreams();

    // Periodic Sync (10 minutes)
    setInterval(verifyStreams, 10 * 60 * 1000);
}

module.exports = { startEventListener };
