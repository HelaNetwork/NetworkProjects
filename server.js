const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/careerlens');

// Job Schema
const jobSchema = new mongoose.Schema({
  company: String,
  role: String,
  status: String,
  appliedDate: Date,
  blockchainTxHash: String,
  verified: Boolean,
  matchScore: Number
});

const Job = mongoose.model('Job', jobSchema);

// Routes
app.get('/api/jobs', async (req, res) => {
  const jobs = await Job.find();
  res.json(jobs);
});

app.post('/api/jobs', async (req, res) => {
  const job = new Job(req.body);
  await job.save();
  res.json(job);
});

app.get('/api/verify/:txHash', async (req, res) => {
  res.json({ verified: true, txHash: req.params.txHash, network: 'Polygon Amoy' });
});

app.listen(3000, () => console.log('CareerLens server running on port 3000'));
