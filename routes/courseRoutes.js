const express = require('express');
const { addCourse,getCourses } = require('../controllers/courseController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Route for adding a course (Only available to trainers)
router.post('/add-course', authMiddleware, addCourse);
router.get('/', getCourses);
module.exports = router;
