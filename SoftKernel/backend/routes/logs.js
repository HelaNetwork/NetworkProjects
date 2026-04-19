import express from 'express';
import { query, validationResult } from 'express-validator';
import LoggerService from '../services/loggerService.js';
import { verifyAdmin } from '../middleware/logger.js';

const router = express.Router();

// Apply admin verification to all routes
router.use(verifyAdmin);

/**
 * GET /api/logs
 * Query logs with advanced filtering
 */
router.get(
  '/',
  [
    query('level').optional().isString(),
    query('category').optional().isString(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('userAddress').optional().isString(),
    query('endpoint').optional().isString(),
    query('search').optional().isString(),
    query('tags').optional().isString(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 500 }).toInt(),
    query('sortBy').optional().isString(),
    query('sortOrder').optional().isIn(['asc', 'desc']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const {
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
      } = req.query;

      // Parse arrays from query strings
      const levelArray = level ? level.split(',') : undefined;
      const categoryArray = category ? category.split(',') : undefined;
      const tagsArray = tags ? tags.split(',') : undefined;

      const result = await LoggerService.queryLogs({
        level: levelArray,
        category: categoryArray,
        startDate,
        endDate,
        userAddress,
        endpoint,
        search,
        tags: tagsArray,
        page,
        limit,
        sortBy,
        sortOrder,
      });

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('Query logs error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * GET /api/logs/stats
 * Get log statistics
 */
router.get(
  '/stats',
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { startDate, endDate } = req.query;

      const stats = await LoggerService.getStats({
        startDate,
        endDate,
      });

      res.json({
        success: true,
        stats,
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * GET /api/logs/export
 * Export logs as JSON
 */
router.get(
  '/export',
  [
    query('level').optional().isString(),
    query('category').optional().isString(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('userAddress').optional().isString(),
    query('endpoint').optional().isString(),
    query('search').optional().isString(),
    query('tags').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 10000 }).toInt(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const {
        level,
        category,
        startDate,
        endDate,
        userAddress,
        endpoint,
        search,
        tags,
        limit = 1000,
      } = req.query;

      const levelArray = level ? level.split(',') : undefined;
      const categoryArray = category ? category.split(',') : undefined;
      const tagsArray = tags ? tags.split(',') : undefined;

      const result = await LoggerService.queryLogs({
        level: levelArray,
        category: categoryArray,
        startDate,
        endDate,
        userAddress,
        endpoint,
        search,
        tags: tagsArray,
        page: 1,
        limit,
        sortBy: 'timestamp',
        sortOrder: 'desc',
      });

      // Set headers for file download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=logs-${new Date().toISOString()}.json`
      );

      res.json(result.logs);
    } catch (error) {
      console.error('Export logs error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * DELETE /api/logs/cleanup
 * Delete old logs
 */
router.delete(
  '/cleanup',
  [
    query('daysToKeep').optional().isInt({ min: 1, max: 365 }).toInt(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { daysToKeep = 90 } = req.query;

      const deletedCount = await LoggerService.deleteOldLogs(daysToKeep);

      await LoggerService.logSystem({
        level: 'info',
        message: `Log cleanup completed`,
        details: {
          deletedCount,
          daysToKeep,
        },
        tags: ['cleanup', 'maintenance'],
      });

      res.json({
        success: true,
        deletedCount,
        message: `Deleted ${deletedCount} logs older than ${daysToKeep} days`,
      });
    } catch (error) {
      console.error('Cleanup logs error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * GET /api/logs/levels
 * Get available log levels
 */
router.get('/levels', (req, res) => {
  res.json({
    success: true,
    levels: ['info', 'warn', 'error', 'debug', 'success', 'security'],
  });
});

/**
 * GET /api/logs/categories
 * Get available log categories
 */
router.get('/categories', (req, res) => {
  res.json({
    success: true,
    categories: ['http', 'database', 'blockchain', 'auth', 'system', 'business'],
  });
});

export default router;
