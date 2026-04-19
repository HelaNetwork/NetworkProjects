import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  walletAddress: {
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
  // Optional metadata (not stored on-chain)
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  department: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  addedAt: {
    type: Date,
    default: Date.now,
  },
  lastSyncedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Compound index for employer-employee combination
employeeSchema.index({ employerAddress: 1, walletAddress: 1 }, { unique: true });

export default mongoose.model('Employee', employeeSchema);
