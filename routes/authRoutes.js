const express = require('express');
const { loginUser } = require('../controllers/authController');
const router = express.Router();

// Login route for Counsellor and Trainer
router.post('/login', loginUser);

module.exports = router;
