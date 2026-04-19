const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const hr = require('../middleware/hrMiddleware');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

// @route   POST api/employees
// @desc    Create a new employee
// @access  Private (HR Only)
router.post(
    '/',
    [
        auth,
        hr,
        [
            check('name', 'Name is required').not().isEmpty(),
            check('email', 'Valid email is required').isEmail(),
            check('password', 'Password is required with min 6 chars').isLength({ min: 6 })
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, designation, department, salary, employeeId, walletAddress } = req.body;

        try {
            let user = await User.findOne({ email });

            if (user) {
                return res.status(400).json({ msg: 'User already exists' });
            }

            user = new User({
                name,
                email,
                password,
                role: 'employee',
                designation,
                department,
                salary,
                employeeId,
                walletAddress
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();

            res.json(user);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   GET api/employees
// @desc    Get all employees
// @access  Private (HR Only)
router.get('/', [auth, hr], async (req, res) => {
    try {
        const employees = await User.find({ role: 'employee' }).select('-password');
        res.json(employees);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/employees/:id
// @desc    Update employee
// @access  Private (HR Only)
router.put('/:id', [auth, hr], async (req, res) => {
    const { name, email, designation, department, salary, active, walletAddress } = req.body;

    const employeeFields = {};
    if (name) employeeFields.name = name;
    if (email) employeeFields.email = email;
    if (designation) employeeFields.designation = designation;
    if (department) employeeFields.department = department;
    if (salary) employeeFields.salary = salary;
    if (active !== undefined) employeeFields.active = active;
    if (walletAddress) employeeFields.walletAddress = walletAddress;

    try {
        let user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ msg: 'Employee not found' });

        // Ensure target is an employee
        if (user.role !== 'employee') {
            return res.status(400).json({ msg: 'Cannot edit non-employee users via this route' });
        }

        user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: employeeFields },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/employees/:id
// @desc    Delete employee
// @access  Private (HR Only)
router.delete('/:id', [auth, hr], async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ msg: 'Employee not found' });

        if (user.role !== 'employee') {
            return res.status(400).json({ msg: 'Cannot delete non-employee users via this route' });
        }

        await User.findByIdAndDelete(req.params.id); // <-- fixed here

        res.json({ msg: 'Employee removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;



