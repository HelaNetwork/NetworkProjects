const mongoose = require('mongoose');

const ContractStatsSchema = new mongoose.Schema({
    contractAddress: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    availableBalance: {
        type: String, // wei
        default: '0'
    },
    totalAllocated: {
        type: String, // wei
        default: '0'
    },
    totalStreams: {
        type: Number,
        default: 0
    },
    lastUpdatedBlock: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('ContractStats', ContractStatsSchema);
