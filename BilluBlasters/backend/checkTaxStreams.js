const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/payroll-system')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const Stream = require('./models/Stream');

async function checkTaxStreams() {
    try {
        console.log('\n=== CHECKING TAX STREAMS ===\n');

        // Get all streams
        const allStreams = await Stream.find({});
        console.log(`Total streams in database: ${allStreams.length}`);

        // Check for isTaxStream field
        const taxStreams = await Stream.find({ isTaxStream: true });
        console.log(`Streams with isTaxStream=true: ${taxStreams.length}`);

        // Check specific address
        const taxAddress = '0x667Ef45aC2806dF40fE0Bdce4fE01468Ff35Bb65';
        const streamsToAddress = await Stream.find({
            workerAddress: taxAddress.toLowerCase()
        });
        console.log(`\nStreams to tax address (${taxAddress}):`);
        console.log(`Count: ${streamsToAddress.length}`);

        if (streamsToAddress.length > 0) {
            streamsToAddress.forEach(s => {
                console.log(`\n  Stream ID: ${s.streamId}`);
                console.log(`  Worker: ${s.workerAddress}`);
                console.log(`  Deposit: ${s.deposit}`);
                console.log(`  isTaxStream: ${s.isTaxStream || 'undefined'}`);
                console.log(`  State: ${s.state}`);
            });
        }

        // Show all streams summary
        console.log('\n=== ALL STREAMS SUMMARY ===');
        allStreams.forEach(s => {
            console.log(`Stream ${s.streamId}: ${s.workerAddress} - isTaxStream: ${s.isTaxStream || 'false'}`);
        });

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        mongoose.connection.close();
        process.exit(1);
    }
}

checkTaxStreams();
