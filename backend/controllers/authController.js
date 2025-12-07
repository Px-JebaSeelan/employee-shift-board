const jwt = require('jsonwebtoken');
const User = require('../models/User');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email?.trim() || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const valid = await user.comparePassword(password);
        if (!valid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ message: 'Login successful', token, user: user.toJSON() });
    } catch (err) {
        console.error('[AUTH] Login failed:', err.message);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

async function signup(req, res) {
    try {
        const { name, email, password, department } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({ message: 'Name is required' });
        }
        if (!nameRegex.test(name.trim())) {
            return res.status(400).json({ message: 'Name should only contain letters and be 2-50 characters' });
        }

        if (!email?.trim()) {
            return res.status(400).json({ message: 'Email is required' });
        }
        const normalizedEmail = email.toLowerCase().trim();
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const exists = await User.findOne({ email: normalizedEmail });
        if (exists) {
            return res.status(409).json({ message: 'An account with this email already exists' });
        }

        const count = await User.countDocuments();
        const code = `EMP${String(count + 1).padStart(4, '0')}`;

        const user = new User({
            name: name.trim(),
            email: normalizedEmail,
            password,
            role: 'employee',
            employeeCode: code,
            department: department?.trim() || 'General'
        });

        await user.save();

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ message: 'Account created', token, user: user.toJSON() });
    } catch (err) {
        console.error('[AUTH] Signup failed:', err.message);
        if (err.name === 'ValidationError') {
            const msg = Object.values(err.errors).map(e => e.message).join(', ');
            return res.status(400).json({ message: msg });
        }
        res.status(500).json({ message: 'Something went wrong' });
    }
}

async function getEmployees(req, res) {
    try {
        const employees = await User.find({ role: 'employee' })
            .select('_id name')
            .sort({ name: 1 })
            .lean();
        res.json({ employees });
    } catch (err) {
        console.error('[AUTH] Get employees failed:', err.message);
        res.status(500).json({ message: 'Could not fetch employees' });
    }
}

module.exports = { login, signup, getEmployees };
