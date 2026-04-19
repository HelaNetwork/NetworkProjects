const mongoose = require('mongoose');

const TaxSettingsSchema = new mongoose.Schema({
    taxAddress: {
        type: String,
        required: true,
        lowercase: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('TaxSettings', TaxSettingsSchema);
