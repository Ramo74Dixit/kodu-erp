const express = require('express');
const {getAttendanceSummary } = require('../controllers/AttendanceController');  // Import markStudentsAttendance
const {markStudentsAttendance}=require('../controllers/studentAttendanceController')
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/mark-students', authMiddleware, markStudentsAttendance);   

router.get('/summary/:type/:userId/:batchId', authMiddleware, getAttendanceSummary);

module.exports = router;
