const mongoose = require('mongoose');

const SystemSettingsSchema = new mongoose.Schema({
    taxAddress: {
        type: String,
        default: ''
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SystemSettings', SystemSettingsSchema);
