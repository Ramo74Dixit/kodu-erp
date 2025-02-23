const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/config');

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Find user and index the email field for optimization
    const user = await User.findOne({ email }).lean();
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // JWT Generation - Async
    const token = await jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
        message: 'Login successful',
        token
    });
};

module.exports = { loginUser };
