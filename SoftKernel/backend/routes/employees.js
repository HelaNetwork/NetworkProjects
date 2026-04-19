import express from 'express';
import { body, param, validationResult } from 'express-validator';
import Employee from '../models/Employee.js';
import LoggerService from '../services/loggerService.js';
import { requireOwnership } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
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

// Get all employees for an employer
router.get('/:employerAddress', requireOwnership('employerAddress'), async (req, res) => {
  try {
    const { employerAddress } = req.params;
    const employees = await Employee.find({ 
      employerAddress: employerAddress.toLowerCase() 
    }).sort({ addedAt: -1 });
    
    await LoggerService.logDatabase({
      level: 'info',
      operation: 'find',
      collection: 'employees',
      message: `Retrieved ${employees.length} employees`,
      userAddress: employerAddress,
      details: { count: employees.length },
    });
    
    res.json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    console.error('Get employees error:', error);
    await LoggerService.logDatabase({
      level: 'error',
      operation: 'find',
      collection: 'employees',
      message: 'Failed to retrieve employees',
      error,
    });
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Add employee
router.post(
  '/',
  [
    validateAddress('walletAddress'),
    validateAddress('employerAddress'),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { walletAddress, employerAddress, name, email, department, notes, tags } = req.body;

      // Check if already exists
      const existing = await Employee.findOne({
        walletAddress: walletAddress.toLowerCase(),
        employerAddress: employerAddress.toLowerCase(),
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          error: 'Employee already exists',
          employee: existing,
        });
      }

      const employee = new Employee({
        walletAddress: walletAddress.toLowerCase(),
        employerAddress: employerAddress.toLowerCase(),
        name,
        email,
        department,
        notes,
        tags,
      });

      await employee.save();

      await LoggerService.logBusiness({
        level: 'success',
        message: 'Employee added successfully',
        userAddress: employerAddress,
        employeeAddress: walletAddress,
        details: {
          employeeId: employee._id,
          name,
          department,
        },
        tags: ['employee', 'create'],
      });

      res.status(201).json({
        success: true,
        employee,
      });
    } catch (error) {
      console.error('Add employee error:', error);
      await LoggerService.logBusiness({
        level: 'error',
        message: 'Failed to add employee',
        userAddress: employerAddress,
        error,
        tags: ['employee', 'create', 'failed'],
      });
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
);

// Bulk add employees
router.post(
  '/bulk',
  [
    validateAddress('employerAddress'),
    body('employees').isArray().withMessage('Employees must be an array'),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { employerAddress, employees } = req.body;
      const results = {
        added: [],
        skipped: [],
        errors: [],
      };

      for (const emp of employees) {
        try {
          // Validate address format
          if (!/^0x[a-fA-F0-9]{40}$/.test(emp.walletAddress)) {
            results.errors.push({ 
              address: emp.walletAddress, 
              error: 'Invalid address format' 
            });
            continue;
          }

          const existing = await Employee.findOne({
            walletAddress: emp.walletAddress.toLowerCase(),
            employerAddress: employerAddress.toLowerCase(),
          });

          if (existing) {
            results.skipped.push(emp.walletAddress);
            continue;
          }

          const employee = new Employee({
            walletAddress: emp.walletAddress.toLowerCase(),
            employerAddress: employerAddress.toLowerCase(),
            name: emp.name,
            email: emp.email,
            department: emp.department,
            notes: emp.notes,
            tags: emp.tags,
          });

          await employee.save();
          results.added.push(employee);
        } catch (err) {
          results.errors.push({ 
            address: emp.walletAddress, 
            error: err.message 
          });
        }
      }

      res.json({
        success: true,
        results,
      });
      
      await LoggerService.logBusiness({
        level: 'info',
        message: 'Bulk employee import completed',
        userAddress: employerAddress,
        details: {
          added: results.added.length,
          skipped: results.skipped.length,
          errors: results.errors.length,
        },
        tags: ['employee', 'bulk', 'import'],
      });
    } catch (error) {
      console.error('Bulk add error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
);

// Update employee metadata
router.patch(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid employee ID'),
    handleValidationErrors,
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, department, notes, tags } = req.body;

      const employee = await Employee.findByIdAndUpdate(
        id,
        { name, email, department, notes, tags, lastSyncedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!employee) {
        return res.status(404).json({
          success: false,
          error: 'Employee not found',
        });
      }

      res.json({
        success: true,
        employee,
      });
    } catch (error) {
      console.error('Update employee error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
);

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found',
      });
    }

    res.json({
      success: true,
      message: 'Employee deleted',
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Delete by wallet address
router.delete(
  '/address/:employerAddress/:walletAddress',
  async (req, res) => {
    try {
      const { employerAddress, walletAddress } = req.params;
      
      const employee = await Employee.findOneAndDelete({
        walletAddress: walletAddress.toLowerCase(),
        employerAddress: employerAddress.toLowerCase(),
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          error: 'Employee not found',
        });
      }

      res.json({
        success: true,
        message: 'Employee deleted',
      });
    } catch (error) {
      console.error('Delete employee error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
);

export default router;
