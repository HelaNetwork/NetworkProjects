import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import employeeRoutes from './routes/employees.js';
import streamRoutes from './routes/streams.js';
import logsRoutes from './routes/logs.js';
import oracleRoutes from './routes/oracle.js';
import pricesRoutes from './routes/prices.js';
import { requestLogger } from './middleware/logger.js';
import { requireWallet } from './middleware/auth.js';
import { rateLimiter } from './middleware/rateLimit.js';
import LoggerService from './services/loggerService.js';

import { setServers } from "node:dns/promises";

setServers(["1.1.1.1", "8.8.8.8"]);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    process.env.CORS_ORIGIN || 'http://localhost:5173'
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use(requestLogger);

// Rate limiting
app.use('/api/', rateLimiter);

// Routes - employees & streams require wallet auth
app.use('/api/employees', requireWallet, employeeRoutes);
app.use('/api/streams', requireWallet, streamRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/oracle', rateLimiter, oracleRoutes);
app.use('/api/prices', pricesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'PayStream Backend API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  // Log the error
  LoggerService.logSystem({
    level: 'error',
    message: 'Unhandled server error',
    error: err,
    details: {
      url: req.url,
      method: req.method,
    },
  });
  
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Log system startup
    await LoggerService.logSystem({
      level: 'info',
      message: 'PayStream Backend server started',
      details: {
        port: PORT,
        nodeVersion: process.version,
        env: process.env.NODE_ENV || 'development',
      },
      tags: ['startup'],
    });

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n🚀 PayStream Backend running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`👥 Employees API: http://localhost:${PORT}/api/employees`);
      console.log(`⏳ Streams API: http://localhost:${PORT}/api/streams`);
      console.log(`📊 Logs API: http://localhost:${PORT}/api/logs (Admin only)\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    await LoggerService.logSystem({
      level: 'error',
      message: 'Server startup failed',
      error,
      tags: ['startup', 'critical'],
    });
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⚠️ Shutting down gracefully...');
  await LoggerService.logSystem({
    level: 'info',
    message: 'Server shutdown initiated',
    tags: ['shutdown'],
  });
  process.exit(0);
});
