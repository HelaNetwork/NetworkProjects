import express from 'express';
import { body, validationResult } from 'express-validator';
import Stream from '../models/Stream.js';
import LoggerService from '../services/loggerService.js';
import { requireOwnership } from '../middleware/auth.js';

const router = express.Router();

const validateAddress = (field) => 
  body(field)
    .isString()
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid Ethereum address');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get all streams for an employer
router.get('/:employerAddress', requireOwnership('employerAddress'), async (req, res) => {
  try {
    const { employerAddress } = req.params;
    const { status } = req.query;

    const query = { employerAddress: employerAddress.toLowerCase() };
    if (status) {
      query.status = status;
    }

    const streams = await Stream.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: streams.length,
      streams,
    });
  } catch (error) {
    console.error('Get streams error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get stream by employee address
router.get(
  '/:employerAddress/:employeeAddress',
  async (req, res) => {
    try {
      const { employerAddress, employeeAddress } = req.params;

      const stream = await Stream.findOne({
        employerAddress: employerAddress.toLowerCase(),
        employeeAddress: employeeAddress.toLowerCase(),
        status: { $in: ['active', 'paused'] },
      });

      if (!stream) {
        return res.status(404).json({
          success: false,
          error: 'Stream not found',
        });
      }

      res.json({
        success: true,
        stream,
      });
    } catch (error) {
      console.error('Get stream error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
);

// Create stream record
router.post(
  '/',
  [
    validateAddress('employeeAddress'),
    validateAddress('employerAddress'),
    body('monthlySalary').isString().notEmpty(),
    body('ratePerSecond').isString().notEmpty(),
    body('durationMonths').isInt({ min: 1 }),
    body('taxPercent').isInt({ min: 0, max: 100 }),
    body('startTime').isInt({ min: 0 }),
    body('endTime').isInt({ min: 0 }),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const {
        employeeAddress,
        employerAddress,
        monthlySalary,
        ratePerSecond,
        durationMonths,
        taxPercent,
        startTime,
        endTime,
        creationTxHash,
        notes,
      } = req.body;

      // Check if stream already exists
      const existing = await Stream.findOne({
        employeeAddress: employeeAddress.toLowerCase(),
        employerAddress: employerAddress.toLowerCase(),
        status: { $in: ['active', 'paused'] },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          error: 'Active stream already exists for this employee',
          stream: existing,
        });
      }

      const stream = new Stream({
        employeeAddress: employeeAddress.toLowerCase(),
        employerAddress: employerAddress.toLowerCase(),
        monthlySalary,
        ratePerSecond,
        durationMonths,
        taxPercent,
        startTime,
        endTime,
        creationTxHash,
        notes,
        status: 'active',
        lastSyncedAt: new Date(),
      });

      await stream.save();

      await LoggerService.logBusiness({
        level: 'success',
        message: 'Salary stream created',
        employerAddress,
        employeeAddress,
        details: {
          streamId: stream._id,
          monthlySalary,
          durationMonths,
          taxPercent,
          creationTxHash,
        },
        tags: ['stream', 'create', 'payroll'],
      });

      res.status(201).json({
        success: true,
        stream,
      });
    } catch (error) {
      console.error('Create stream error:', error);
      await LoggerService.logBusiness({
        level: 'error',
        message: 'Failed to create salary stream',
        error,
        tags: ['stream', 'create', 'failed'],
      });
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
);

// Update stream status (pause/resume)
router.patch(
  '/:employerAddress/:employeeAddress/status',
  [
    body('paused').isBoolean(),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { employerAddress, employeeAddress } = req.params;
      const { paused } = req.body;

      const stream = await Stream.findOneAndUpdate(
        {
          employerAddress: employerAddress.toLowerCase(),
          employeeAddress: employeeAddress.toLowerCase(),
          status: { $in: ['active', 'paused'] },
        },
        { 
          paused, 
          status: paused ? 'paused' : 'active',
          lastSyncedAt: new Date(),
        },
        { new: true }
      );

      if (!stream) {
        return res.status(404).json({
          success: false,
          error: 'Stream not found',
        });
      }

      res.json({
        success: true,
        stream,
      });
      
      await LoggerService.logBusiness({
        level: 'info',
        message: `Stream ${paused ? 'paused' : 'resumed'}`,
        employerAddress,
        employeeAddress,
        details: { streamId: stream._id, paused },
        tags: ['stream', paused ? 'pause' : 'resume'],
      });
    } catch (error) {
      console.error('Update stream status error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
);

// Cancel stream
router.patch(
  '/:employerAddress/:employeeAddress/cancel',
  [
    body('cancellationTxHash').optional().isString(),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { employerAddress, employeeAddress } = req.params;
      const { cancellationTxHash } = req.body;

      const stream = await Stream.findOneAndUpdate(
        {
          employerAddress: employerAddress.toLowerCase(),
          employeeAddress: employeeAddress.toLowerCase(),
          status: { $in: ['active', 'paused'] },
        },
        { 
          status: 'cancelled',
          cancellationTxHash,
          lastSyncedAt: new Date(),
        },
        { new: true }
      );

      if (!stream) {
        return res.status(404).json({
          success: false,
          error: 'Stream not found',
        });
      }

      res.json({
        success: true,
        stream,
      });
      
      await LoggerService.logBusiness({
        level: 'warn',
        message: 'Stream cancelled',
        employerAddress,
        employeeAddress,
        details: {
          streamId: stream._id,
          cancellationTxHash,
        },
        tags: ['stream', 'cancel'],
      });
    } catch (error) {
      console.error('Cancel stream error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
);

// Sync stream data from blockchain
router.patch(
  '/:employerAddress/:employeeAddress/sync',
  [
    body('withdrawn').optional().isString(),
    body('paused').optional().isBoolean(),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { employerAddress, employeeAddress } = req.params;
      const { withdrawn, paused } = req.body;

      const updateData = { lastSyncedAt: new Date() };
      if (withdrawn !== undefined) updateData.withdrawn = withdrawn;
      if (paused !== undefined) {
        updateData.paused = paused;
        updateData.status = paused ? 'paused' : 'active';
      }

      const stream = await Stream.findOneAndUpdate(
        {
          employerAddress: employerAddress.toLowerCase(),
          employeeAddress: employeeAddress.toLowerCase(),
          status: { $in: ['active', 'paused'] },
        },
        updateData,
        { new: true }
      );

      if (!stream) {
        return res.status(404).json({
          success: false,
          error: 'Stream not found',
        });
      }

      res.json({
        success: true,
        stream,
      });
    } catch (error) {
      console.error('Sync stream error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
);

export default router;
