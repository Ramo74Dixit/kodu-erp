const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware")
const { 
    uploadAssignment, 
    getAssignmentsForBatch,
    uploadStudentAssignment,
    viewStudentAssignments,
    scoreAssignment,
    getAssignmentTitlesForBatch,
    getSubmissionsForAssignment // Ensure to include this if you're implementing the new route
} = require('../controllers/assignmentController');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
router.post('/upload', upload.single('assignmentFile'), authMiddleware, uploadAssignment);
router.get('/batch/:batchId/assignments', authMiddleware, getAssignmentsForBatch);
router.post('/batches/:batchId/assignments/upload', authMiddleware, uploadStudentAssignment);
router.get('/batches/:batchId/student-assignments', authMiddleware, viewStudentAssignments);
router.post('/assignments/:assignmentId/score', authMiddleware, scoreAssignment);
router.get('/batches/:batchId/assignment-titles', authMiddleware, getAssignmentTitlesForBatch);
router.get('/assignments/:assignmentId/submissions', authMiddleware, getSubmissionsForAssignment);

module.exports = router;
