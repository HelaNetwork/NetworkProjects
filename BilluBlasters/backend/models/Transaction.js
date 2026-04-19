const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Funding', 'Withdrawal', 'StreamCreated', 'StateChange', 'Emergency'],
        required: true
    },
    streamId: {
        type: Number,
        index: true
    },
    sender: {
        type: String,
        lowercase: true
    },
    receiver: {
        type: String,
        lowercase: true
    },
    amount: {
        type: String, // wei
    },
    txHash: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        default: 'Confirmed'
    },
    label: {
        type: String,
        enum: ['employee', 'tax', 'funding', 'other'],
        default: 'other'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
