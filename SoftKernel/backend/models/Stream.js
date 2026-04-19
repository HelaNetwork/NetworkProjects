import mongoose from 'mongoose';

const streamSchema = new mongoose.Schema({
  employeeAddress: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  employerAddress: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  // On-chain data (mirrored for quick access)
  monthlySalary: {
    type: String, // Store as string to preserve exact BigInt values
    required: true,
  },
  ratePerSecond: {
    type: String,
    required: true,
  },
  durationMonths: {
    type: Number,
    required: true,
  },
  taxPercent: {
    type: Number,
    required: true,
  },
  startTime: {
    type: Number,
    required: true,
  },
  endTime: {
    type: Number,
    required: true,
  },
  paused: {
    type: Boolean,
    default: false,
  },
  withdrawn: {
    type: String,
    default: '0',
  },
  // Transaction data
  creationTxHash: {
    type: String,
    index: true,
  },
  cancellationTxHash: {
    type: String,
  },
  // Metadata
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled', 'completed'],
    default: 'active',
  },
  lastSyncedAt: {
    type: Date,
  },
  // Off-chain notes
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

// Compound index
streamSchema.index({ employerAddress: 1, employeeAddress: 1 });
streamSchema.index({ status: 1 });

export default mongoose.model('Stream', streamSchema);
