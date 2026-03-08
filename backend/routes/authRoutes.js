const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, regNo, email, password, department } = req.body;

        if (!name || !regNo || !email || !password) {
            return res.status(400).json({ message: 'Please fill all required fields' });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) return res.status(400).json({ message: 'Email already registered' });

        const existingReg = await User.findOne({ regNo });
        if (existingReg) return res.status(400).json({ message: 'Register number already exists' });

        const user = await User.create({ name, regNo, email, password, department });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            regNo: user.regNo,
            email: user.email,
            phone: user.phone,
            department: user.department,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter email and password' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        res.json({
            _id: user._id,
            name: user.name,
            regNo: user.regNo,
            email: user.email,
            phone: user.phone,
            department: user.department,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route GET /api/auth/me
router.get('/me', require('../middleware/authMiddleware').protect, async (req, res) => {
    res.json(req.user);
});

// @route PUT /api/auth/profile
router.put('/profile', require('../middleware/authMiddleware').protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Update fields if provided
        if (req.body.name) user.name = req.body.name;
        if (req.body.department) user.department = req.body.department;
        if (req.body.phone !== undefined) user.phone = req.body.phone;

        // Check if email is being changed and if it already exists
        if (req.body.email && req.body.email !== user.email) {
            const existingEmail = await User.findOne({ email: req.body.email });
            if (existingEmail) return res.status(400).json({ message: 'Email already in use' });
            user.email = req.body.email;
        }

        // Check if regNo is being changed and if it already exists
        if (req.body.regNo && req.body.regNo !== user.regNo) {
            const existingReg = await User.findOne({ regNo: req.body.regNo });
            if (existingReg) return res.status(400).json({ message: 'Register number already in use' });
            user.regNo = req.body.regNo;
        }

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            regNo: updatedUser.regNo,
            email: updatedUser.email,
            phone: updatedUser.phone,
            department: updatedUser.department,
            role: updatedUser.role,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
});

module.exports = router;
