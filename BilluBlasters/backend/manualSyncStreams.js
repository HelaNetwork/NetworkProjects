const mongoose = require('mongoose');
const { ethers } = require('ethers');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/payroll-system')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const Stream = require('./models/Stream');
const TaxSettings = require('./models/TaxSettings');
const contractABI = require('./logic/contractABI.json');
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';

const StreamTypeMap = ['Continuous', 'OneTime'];
const StreamStateMap = ['Active', 'Completed', 'Cancelled', 'Paused'];

async function manualSync() {
    try {
        console.log('\n=== MANUAL SYNC STARTING ===\n');

        // Get tax settings
        const taxSettings = await TaxSettings.findOne({ isActive: true });
        console.log('Tax Address:', taxSettings ? taxSettings.taxAddress : 'Not set');

        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

        // Get all streams count
        let streamCount = 0;
        try {
            streamCount = Number(await contract.streamCount());
        } catch (e) {
            console.log('Could not get stream count, trying alternative method...');
        }

        console.log(`Total streams on blockchain: ${streamCount}\n`);

        // Fetch all streams from blockchain
        for (let i = 0; i < streamCount; i++) {
            try {
                const info = await contract.getStreamInfo(i);
                const fullStream = await contract.streams(i);
                const workerAddress = info.worker.toLowerCase();

                // Check if already in DB
                const exists = await Stream.findOne({ streamId: i });
                if (exists) {
                    console.log(`Stream ${i}: Already in DB`);
                    continue;
                }

                // Check if this is a tax stream
                const isTaxStream = taxSettings && workerAddress === taxSettings.taxAddress.toLowerCase();

                const newStream = new Stream({
                    streamId: i,
                    workerAddress: workerAddress,
                    deposit: info.deposit.toString(),
                    withdrawn: info.withdrawn.toString(),
                    ratePerSecond: info.ratePerSecond.toString(),
                    startTime: Number(info.startTime),
                    endTime: Number(info.endTime),
                    totalPausedDuration: Number(fullStream.totalPausedDuration),
                    streamType: StreamTypeMap[Number(info.streamType)],
                    state: StreamStateMap[Number(info.state)],
                    isTaxStream: isTaxStream,
                    txHash: 'manual-sync',
                    blockNumber: 0,
                    workerName: 'Unknown',
                    workerEmail: ''
                });

                await newStream.save();

                if (isTaxStream) {
                    console.log(`✓ Stream ${i}: SAVED as TAX STREAM to ${workerAddress}`);
                } else {
                    console.log(`  Stream ${i}: Saved to ${workerAddress}`);
                }
            } catch (err) {
                console.error(`Error syncing stream ${i}:`, err.message);
            }
        }

        // Final check
        const taxStreams = await Stream.find({ isTaxStream: true });
        console.log(`\n✓ Tax streams in database: ${taxStreams.length}`);

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        mongoose.connection.close();
        process.exit(1);
    }
}

manualSync();
