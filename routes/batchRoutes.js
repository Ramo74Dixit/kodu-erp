const express = require('express');
const { createBatch, addStudentsToBatch, getBatchesByTrainer} = require('../controllers/batchController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Route to create a new batch
router.post('/create', authMiddleware, createBatch);

// Route to add students to an existing batch
router.post('/add-students', authMiddleware, addStudentsToBatch);
router.get('/allbatches', authMiddleware, getBatchesByTrainer);

module.exports = router;
