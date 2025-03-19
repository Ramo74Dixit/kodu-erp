const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  createdAt: { type: Date, default: Date.now },
  type: { type: String, required: true, enum: ['student', 'trainer'] },
  status: { type: String, default: 'pending' },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model (students are users)
  submissions: [{ 
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // The student who submitted
    submissionLink: { type: String, required: true },  // The link submitted by the student
    status: { type: String, enum: ['submitted', 'pending'], default: 'submitted' },
    submittedAt: { type: Date, default: Date.now },  // Timestamp of the submission
  }],
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
