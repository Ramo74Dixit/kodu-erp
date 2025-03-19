// Model: Assignment.js
const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  createdAt: { type: Date, default: Date.now },
  type: { type: String, required: true, enum: ['student', 'trainer'] },
  status: { type: String, default: 'pending' },
  // Removed top-level assignmentId and student fields from the assignment document.
  submissions: [{ 
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Student who submitted
    submissionLink: { type: String, required: true },                                 // Submitted link
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true }, // Reference to the assignment
    status: { type: String, enum: ['submitted', 'pending'], default: 'submitted' },
    submittedAt: { type: Date, default: Date.now }  // Timestamp of submission
  }],
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
