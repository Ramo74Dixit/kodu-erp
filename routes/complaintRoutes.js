const express = require('express');
const router = express.Router();
const { fileComplaint, getAllComplaints } = require('../controllers/complaintController');
const authenticate = require('../middleware/authMiddleware'); // aapka authentication middleware

// Route for student to file a complaint (trainerId ab required nahi)
router.post('/file', authenticate, fileComplaint);

// Route for admin to get all complaints
router.get('/all', authenticate, getAllComplaints);

module.exports = router;
