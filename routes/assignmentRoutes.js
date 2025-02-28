const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware")
const { uploadAssignment, getAssignmentsForBatch,uploadStudentAssignment,viewStudentAssignments,scoreAssignment,getAssignmentTitlesForBatch } = require('../controllers/assignmentController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
router.post('/upload', upload.single('assignmentFile'),authMiddleware, uploadAssignment);
router.get('/batch/:batchId/assignments', getAssignmentsForBatch);
router.post('/batches/:batchId/assignments/upload', upload.single('assignmentFile'),authMiddleware, uploadStudentAssignment);
router.get('/batches/:batchId/student-assignments',authMiddleware, viewStudentAssignments);
router.post('/assignments/:assignmentId/score', scoreAssignment);
router.get('/batches/:batchId/assignment-titles', getAssignmentTitlesForBatch);
module.exports = router;
