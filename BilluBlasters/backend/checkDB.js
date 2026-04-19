const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Stream = require('./models/Stream');
const ContractStats = require('./models/ContractStats');
const Transaction = require('./models/Transaction');

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        console.log('--- Contract Stats ---');
        const stats = await ContractStats.find();
        console.log(JSON.stringify(stats, null, 2));

        console.log('\n--- Recent Streams ---');
        const streams = await Stream.find().limit(5);
        console.log(JSON.stringify(streams.map(s => ({ id: s.streamId, worker: s.workerAddress })), null, 2));

        console.log('\n--- Recent Transactions ---');
        const txs = await Transaction.find().sort({ timestamp: -1 }).limit(5);
        console.log(JSON.stringify(txs.map(t => ({ type: t.type, amount: t.amount })), null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

checkDB();
