const express = require('express');
const router = express.Router();
const TaxSettings = require('../models/TaxSettings');
const Stream = require('../models/Stream');

// Get current tax settings
router.get('/', async (req, res) => {
    try {
        const settings = await TaxSettings.findOne({ isActive: true });
        res.json(settings || { taxAddress: '', isActive: false });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update/Create tax settings
router.post('/', async (req, res) => {
    try {
        const { taxAddress } = req.body;

        if (!taxAddress) {
            return res.status(400).json({ msg: 'Tax address is required' });
        }

        // Deactivate all existing settings
        await TaxSettings.updateMany({}, { isActive: false });

        // Create or update the active tax setting
        const settings = await TaxSettings.findOneAndUpdate(
            { taxAddress: taxAddress.toLowerCase() },
            {
                taxAddress: taxAddress.toLowerCase(),
                isActive: true
            },
            { upsert: true, new: true }
        );

        res.json(settings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get tax vault statistics
router.get('/vault', async (req, res) => {
    try {
        const taxStreams = await Stream.find({ label: 'tax' });

        const totalDeposit = taxStreams.reduce((acc, stream) => {
            return acc + BigInt(stream.deposit || '0');
        }, BigInt(0));

        const activeStreams = taxStreams.filter(s => s.state === 'Active').length;

        res.json({
            totalStreams: taxStreams.length,
            activeStreams: activeStreams,
            totalDeposit: totalDeposit.toString(),
            streams: taxStreams
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
