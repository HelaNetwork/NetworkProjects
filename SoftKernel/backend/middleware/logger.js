import { v4 as uuidv4 } from 'uuid';
import LoggerService from '../services/loggerService.js';

/**
 * Middleware to log all HTTP requests and responses
 */
export const requestLogger = (req, res, next) => {
  // Assign unique request ID
  req.id = uuidv4();
  
  // Capture start time
  const startTime = Date.now();
  
  // Store original res.json to intercept response
  const originalJson = res.json.bind(res);
  
  res.json = function (data) {
    res.locals.responseData = data;
    return originalJson(data);
  };
  
  // Log after response is sent
  res.on('finish', async () => {
    const duration = Date.now() - startTime;
    
    // Determine log level based on status code
    let level = 'info';
    if (res.statusCode >= 500) level = 'error';
    else if (res.statusCode >= 400) level = 'warn';
    else if (res.statusCode >= 200 && res.statusCode < 300) level = 'success';
    
    try {
      await LoggerService.logHttp({
        req,
        res,
        level,
        duration,
        responseData: res.locals.responseData,
      });
    } catch (err) {
      console.error('Request logging failed:', err);
    }
  });
  
  next();
};

/**
 * Middleware to verify admin access
 */
export const verifyAdmin = (req, res, next) => {
  const adminAddress = process.env.ADMIN_ADDRESS?.toLowerCase();
  
  if (!adminAddress) {
    LoggerService.logSecurity({
      level: 'error',
      message: 'Admin access attempted but ADMIN_ADDRESS not configured',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    return res.status(500).json({
      success: false,
      error: 'Admin address not configured',
    });
  }
  
  const requestAddress = (
    req.body?.walletAddress ||
    req.query?.walletAddress ||
    req.headers['x-wallet-address']
  )?.toLowerCase();
  
  if (!requestAddress) {
    LoggerService.logSecurity({
      level: 'warn',
      message: 'Admin endpoint accessed without wallet address',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    return res.status(401).json({
      success: false,
      error: 'Wallet address required',
    });
  }
  
  if (requestAddress !== adminAddress) {
    LoggerService.logSecurity({
      level: 'warn',
      message: 'Unauthorized admin access attempt',
      userAddress: requestAddress,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      details: {
        attemptedAddress: requestAddress,
        expectedAddress: adminAddress,
      },
      tags: ['unauthorized', 'admin'],
    });
    
    return res.status(403).json({
      success: false,
      error: 'Unauthorized: Admin access only',
    });
  }
  
  // Log successful admin access
  LoggerService.logSecurity({
    level: 'info',
    message: 'Admin access granted',
    userAddress: requestAddress,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    tags: ['admin', 'authorized'],
  });
  
  next();
};

/**
 * Wrap route handlers to catch and log errors
 */
export const asyncHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      // Log the error
      await LoggerService.logHttp({
        req,
        res,
        level: 'error',
        message: `Error in ${req.method} ${req.path}`,
        error,
      });
      
      // Pass to error handler
      next(error);
    }
  };
};

export default {
  requestLogger,
  verifyAdmin,
  asyncHandler,
};
