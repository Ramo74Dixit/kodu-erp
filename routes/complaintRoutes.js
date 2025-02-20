// routes/complaintRoutes.js
const express = require('express');
const { submitComplaint, getComplaintsByCategory, getComplaintsByStudent, getAllComplaints } = require('../controllers/complaintController');
const isAdmin = require('../middleware/authMiddleware');  // Admin auth middleware
const router = express.Router();

// Route for students to submit complaints
router.post('/submit', submitComplaint);

// Admin routes to fetch complaints by category, by student, or all complaints
router.get('/admin/complaints/category/:category', isAdmin, getComplaintsByCategory);  // For admin only
router.get('/admin/complaints/student/:studentId', isAdmin, getComplaintsByStudent);  // For admin only
router.get('/admin/complaints', isAdmin, getAllComplaints);  // For admin only

module.exports = router;
