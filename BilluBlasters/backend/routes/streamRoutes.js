const express = require('express');
const router = express.Router();
const Stream = require('../models/Stream');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const ContractStats = require('../models/ContractStats');

// Get all streams (Admin view)
router.get('/', async (req, res) => {
    try {
        const streams = await Stream.find().sort({ streamId: -1 });
        res.json(streams);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get streams for a specific user
router.get('/user/:address', async (req, res) => {
    try {
        const streams = await Stream.find({ workerAddress: req.params.address.toLowerCase() }).sort({ streamId: -1 });
        res.json(streams);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get all transactions
router.get('/history/transactions', async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ timestamp: -1 }).limit(50);
        res.json(transactions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get transactions for a user (wallet address)
router.get('/history/transactions/:address', async (req, res) => {
    try {
        const address = req.params.address.toLowerCase();
        const transactions = await Transaction.find({
            $or: [
                { sender: address },
                { receiver: address }
            ]
        }).sort({ timestamp: -1 }).limit(50);
        res.json(transactions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get contract stats (balance, etc.)
router.get('/contract-stats/info', async (req, res) => {
    try {
        const stats = await ContractStats.findOne();
        res.json(stats || { availableBalance: '0', totalAllocated: '0' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get single stream details
router.get('/:streamId', async (req, res) => {
    try {
        const stream = await Stream.findOne({ streamId: req.params.streamId });
        if (!stream) {
            return res.status(404).json({ msg: 'Stream not found' });
        }
        res.json(stream);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create or update stream with label (called from frontend after blockchain tx)
router.post('/label', async (req, res) => {
    try {
        const { streamId, label } = req.body;

        if (streamId === undefined || !label) {
            return res.status(400).json({ msg: 'streamId and label are required' });
        }

        const stream = await Stream.findOneAndUpdate(
            { streamId },
            { $set: { label } },
            { upsert: true, new: true }
        );

        res.json(stream);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create or update transaction with label
router.post('/transaction/label', async (req, res) => {
    try {
        const { txHash, label } = req.body;

        if (!txHash || !label) {
            return res.status(400).json({ msg: 'txHash and label are required' });
        }

        const transaction = await Transaction.findOneAndUpdate(
            { txHash },
            { $set: { label } },
            { upsert: true, new: true }
        );

        res.json(transaction);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
