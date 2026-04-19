const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/payroll-system')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const Stream = require('./models/Stream');
const Transaction = require('./models/Transaction');
const ContractStats = require('./models/ContractStats');
const TaxSettings = require('./models/TaxSettings');

async function clearData() {
    try {
        console.log('\n=== CLEARING DATA (keeping users) ===\n');

        const streams = await Stream.deleteMany({});
        console.log(`✓ Deleted ${streams.deletedCount} streams`);

        const transactions = await Transaction.deleteMany({});
        console.log(`✓ Deleted ${transactions.deletedCount} transactions`);

        const stats = await ContractStats.deleteMany({});
        console.log(`✓ Deleted ${stats.deletedCount} contract stats`);

        const tax = await TaxSettings.deleteMany({});
        console.log(`✓ Deleted ${tax.deletedCount} tax settings`);

        console.log('\n✓ All data cleared (users preserved)\n');

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        mongoose.connection.close();
        process.exit(1);
    }
}

clearData();
