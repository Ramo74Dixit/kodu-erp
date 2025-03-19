const mongoose = require('mongoose');
const User = require('./User'); // Import the User model

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  createdAt: { type: Date, default: Date.now },
  type: { type: String, required: true, enum: ['student', 'trainer'] },
  status: { type: String, default: 'pending' },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Reference to User model (students are users)
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
