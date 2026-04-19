const mongoose = require('mongoose');

const StreamSchema = new mongoose.Schema({
    streamId: {
        type: Number,
        required: true,
        unique: true
    },
    workerAddress: {
        type: String,
        required: true,
        index: true,
        lowercase: true
    },
    deposit: {
        type: String, // Stored as wei string
        required: true
    },
    withdrawn: {
        type: String, // Stored as wei string
        default: '0'
    },
    ratePerSecond: {
        type: String // Stored as wei string
    },
    startTime: {
        type: Number
    },
    endTime: {
        type: Number
    },
    totalPausedDuration: {
        type: Number,
        default: 0
    },
    streamType: {
        type: String,
        enum: ['Continuous', 'OneTime'],
        default: 'Continuous'
    },
    state: {
        type: String,
        enum: ['Active', 'Completed', 'Cancelled', 'Paused'],
        default: 'Active'
    },
    txHash: {
        type: String
    },
    blockNumber: {
        type: Number
    },
    // Stream label (employee, tax, etc.)
    label: {
        type: String,
        enum: ['employee', 'tax'],
        default: 'employee'
    },
    // Optional metadata joined from User
    workerName: {
        type: String
    },
    workerEmail: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Stream', StreamSchema);
