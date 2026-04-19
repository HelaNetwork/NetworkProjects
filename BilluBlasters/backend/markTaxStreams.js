const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/payroll-system')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const Stream = require('./models/Stream');

async function markTaxStreams() {
    try {
        const taxAddress = '0x667Ef45aC2806dF40fE0Bdce4fE01468Ff35Bb65'.toLowerCase();

        console.log(`\nMarking streams to ${taxAddress} as tax streams...\n`);

        const result = await Stream.updateMany(
            { workerAddress: taxAddress },
            { $set: { isTaxStream: true } }
        );

        console.log(`✓ Updated ${result.modifiedCount} streams`);
        console.log(`  Matched ${result.matchedCount} streams\n`);

        // Verify
        const taxStreams = await Stream.find({ isTaxStream: true });
        console.log(`Tax streams in database: ${taxStreams.length}`);
        taxStreams.forEach(s => {
            console.log(`  - Stream ${s.streamId}: ${s.workerAddress} (${s.state})`);
        });

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        mongoose.connection.close();
        process.exit(1);
    }
}

markTaxStreams();
