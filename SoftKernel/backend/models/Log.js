import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  // Log Classification
  level: {
    type: String,
    enum: ['info', 'warn', 'error', 'debug', 'success', 'security'],
    required: true,
    index: true,
  },
  category: {
    type: String,
    enum: ['http', 'database', 'blockchain', 'auth', 'system', 'business'],
    required: true,
    index: true,
  },
  
  // Request Information
  method: String,
  url: String,
  endpoint: String,
  statusCode: Number,
  
  // User/Address Information
  userAddress: {
    type: String,
    index: true,
  },
  employerAddress: String,
  employeeAddress: String,
  
  // Message & Details
  message: {
    type: String,
    required: true,
  },
  details: mongoose.Schema.Types.Mixed, // Flexible field for any additional data
  
  // Error Information
  error: {
    message: String,
    stack: String,
    code: String,
  },
  
  // Request/Response Data
  requestBody: mongoose.Schema.Types.Mixed,
  requestQuery: mongoose.Schema.Types.Mixed,
  requestParams: mongoose.Schema.Types.Mixed,
  requestHeaders: mongoose.Schema.Types.Mixed,
  responseData: mongoose.Schema.Types.Mixed,
  
  // Performance Metrics
  duration: Number, // milliseconds
  
  // Network Information
  ip: String,
  userAgent: String,
  
  // Blockchain specific
  transactionHash: String,
  blockNumber: Number,
  contractAddress: String,
  gasUsed: String,
  
  // Database specific
  collection: String,
  operation: String,
  documentId: String,
  
  // Timing
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  
  // Tags for custom filtering
  tags: [String],
  
  // Session tracking
  sessionId: String,
  requestId: String,
}, {
  timestamps: true,
  // TTL index - automatically delete logs older than 90 days (optional)
  // expireAfterSeconds: 7776000 // 90 days
});

// Indexes for efficient querying
logSchema.index({ timestamp: -1 });
logSchema.index({ level: 1, timestamp: -1 });
logSchema.index({ category: 1, timestamp: -1 });
logSchema.index({ userAddress: 1, timestamp: -1 });
logSchema.index({ endpoint: 1, timestamp: -1 });
logSchema.index({ tags: 1 });

// Text index for searching
logSchema.index({ message: 'text', 'details': 'text' });

const Log = mongoose.model('Log', logSchema);

export default Log;
