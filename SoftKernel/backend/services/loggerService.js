import Log from '../models/Log.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Centralized logging service for the PayStream backend
 * Provides comprehensive logging to MongoDB with detailed context
 */
class LoggerService {
  
  /**
   * Log an HTTP request/response
   */
  static async logHttp({
    req,
    res,
    level = 'info',
    message,
    error,
    duration,
    responseData,
  }) {
    try {
      const logEntry = {
        level,
        category: 'http',
        method: req.method,
        url: req.originalUrl || req.url,
        endpoint: req.route?.path || req.path,
        statusCode: res.statusCode,
        message: message || `${req.method} ${req.path}`,
        
        userAddress: req.body?.walletAddress || 
                     req.body?.employerAddress || 
                     req.params?.employerAddress || 
                     req.params?.walletAddress,
        employerAddress: req.body?.employerAddress || req.params?.employerAddress,
        employeeAddress: req.body?.employeeAddress || req.params?.employeeAddress,
        
        requestBody: this._sanitize(req.body),
        requestQuery: req.query,
        requestParams: req.params,
        requestHeaders: {
          'content-type': req.headers['content-type'],
          'user-agent': req.headers['user-agent'],
          'origin': req.headers['origin'],
        },
        
        responseData: responseData ? this._sanitize(responseData) : undefined,
        
        duration,
        ip: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'],
        
        requestId: req.id,
        timestamp: new Date(),
      };

      if (error) {
        logEntry.error = {
          message: error.message,
          stack: error.stack,
          code: error.code,
        };
      }

      await Log.create(logEntry);
    } catch (err) {
      // Fallback to console if logging fails
      console.error('Failed to log HTTP request:', err);
    }
  }

  /**
   * Log database operations
   */
  static async logDatabase({
    level = 'info',
    operation,
    collection,
    documentId,
    message,
    details,
    error,
    userAddress,
  }) {
    try {
      const logEntry = {
        level,
        category: 'database',
        operation,
        collection,
        documentId,
        message,
        details: this._sanitize(details),
        userAddress,
        timestamp: new Date(),
      };

      if (error) {
        logEntry.error = {
          message: error.message,
          stack: error.stack,
          code: error.code,
        };
      }

      await Log.create(logEntry);
    } catch (err) {
      console.error('Failed to log database operation:', err);
    }
  }

  /**
   * Log blockchain interactions
   */
  static async logBlockchain({
    level = 'info',
    message,
    transactionHash,
    blockNumber,
    contractAddress,
    gasUsed,
    userAddress,
    employerAddress,
    employeeAddress,
    details,
    error,
  }) {
    try {
      const logEntry = {
        level,
        category: 'blockchain',
        message,
        transactionHash,
        blockNumber,
        contractAddress,
        gasUsed,
        userAddress,
        employerAddress,
        employeeAddress,
        details: this._sanitize(details),
        timestamp: new Date(),
      };

      if (error) {
        logEntry.error = {
          message: error.message,
          stack: error.stack,
          code: error.code,
        };
      }

      await Log.create(logEntry);
    } catch (err) {
      console.error('Failed to log blockchain interaction:', err);
    }
  }

  /**
   * Log security events
   */
  static async logSecurity({
    level = 'warn',
    message,
    userAddress,
    ip,
    userAgent,
    details,
    tags = ['security'],
  }) {
    try {
      await Log.create({
        level: level === 'info' ? 'security' : level,
        category: 'auth',
        message,
        userAddress,
        ip,
        userAgent,
        details: this._sanitize(details),
        tags,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('Failed to log security event:', err);
    }
  }

  /**
   * Log system events
   */
  static async logSystem({
    level = 'info',
    message,
    details,
    error,
    tags = [],
  }) {
    try {
      const logEntry = {
        level,
        category: 'system',
        message,
        details: this._sanitize(details),
        tags,
        timestamp: new Date(),
      };

      if (error) {
        logEntry.error = {
          message: error.message,
          stack: error.stack,
          code: error.code,
        };
      }

      await Log.create(logEntry);
    } catch (err) {
      console.error('Failed to log system event:', err);
    }
  }

  /**
   * Log business logic events
   */
  static async logBusiness({
    level = 'info',
    message,
    userAddress,
    employerAddress,
    employeeAddress,
    details,
    tags = [],
    error,
  }) {
    try {
      const logEntry = {
        level,
        category: 'business',
        message,
        userAddress,
        employerAddress,
        employeeAddress,
        details: this._sanitize(details),
        tags,
        timestamp: new Date(),
      };

      if (error) {
        logEntry.error = {
          message: error.message,
          stack: error.stack,
          code: error.code,
        };
      }

      await Log.create(logEntry);
    } catch (err) {
      console.error('Failed to log business event:', err);
    }
  }

  /**
   * Sanitize sensitive data before logging
   */
  static _sanitize(data) {
    if (!data) return data;
    
    const sanitized = JSON.parse(JSON.stringify(data));
    const sensitiveFields = ['password', 'secret', 'privateKey', 'apiKey', 'token'];
    
    const redact = (obj) => {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      for (const key in obj) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          redact(obj[key]);
        }
      }
      return obj;
    };
    
    return redact(sanitized);
  }

  /**
   * Query logs with advanced filtering
   */
  static async queryLogs({
    level,
    category,
    startDate,
    endDate,
    userAddress,
    endpoint,
    search,
    tags,
    page = 1,
    limit = 50,
    sortBy = 'timestamp',
    sortOrder = 'desc',
  }) {
    try {
      const query = {};
      
      if (level) query.level = Array.isArray(level) ? { $in: level } : level;
      if (category) query.category = Array.isArray(category) ? { $in: category } : category;
      if (userAddress) query.userAddress = new RegExp(userAddress, 'i');
      if (endpoint) query.endpoint = new RegExp(endpoint, 'i');
      if (tags && tags.length > 0) query.tags = { $in: tags };
      
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }
      
      if (search) {
        query.$text = { $search: search };
      }
      
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
      
      const skip = (page - 1) * limit;
      
      const [logs, total] = await Promise.all([
        Log.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Log.countDocuments(query),
      ]);
      
      return {
        logs,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (err) {
      console.error('Failed to query logs:', err);
      throw err;
    }
  }

  /**
   * Get log statistics
   */
  static async getStats({ startDate, endDate }) {
    try {
      const match = {};
      if (startDate || endDate) {
        match.timestamp = {};
        if (startDate) match.timestamp.$gte = new Date(startDate);
        if (endDate) match.timestamp.$lte = new Date(endDate);
      }

      const stats = await Log.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            byLevel: {
              $push: '$level',
            },
            byCategory: {
              $push: '$category',
            },
            avgDuration: { $avg: '$duration' },
            errors: {
              $sum: { $cond: [{ $eq: ['$level', 'error'] }, 1, 0] },
            },
          },
        },
      ]);

      if (!stats.length) {
        return {
          total: 0,
          byLevel: {},
          byCategory: {},
          avgDuration: 0,
          errors: 0,
        };
      }

      const result = stats[0];
      
      // Count occurrences
      const levelCounts = {};
      result.byLevel.forEach(level => {
        levelCounts[level] = (levelCounts[level] || 0) + 1;
      });
      
      const categoryCounts = {};
      result.byCategory.forEach(cat => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });

      return {
        total: result.total,
        byLevel: levelCounts,
        byCategory: categoryCounts,
        avgDuration: result.avgDuration || 0,
        errors: result.errors,
      };
    } catch (err) {
      console.error('Failed to get log stats:', err);
      throw err;
    }
  }

  /**
   * Delete old logs
   */
  static async deleteOldLogs(daysToKeep = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const result = await Log.deleteMany({
        timestamp: { $lt: cutoffDate },
      });
      
      return result.deletedCount;
    } catch (err) {
      console.error('Failed to delete old logs:', err);
      throw err;
    }
  }
}

export default LoggerService;
