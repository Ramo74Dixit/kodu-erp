const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  createdAt: { type: Date, default: Date.now },
  // This can be 'student' or 'trainer', but we won't filter by it when fetching.
  type: { type: String, required: true, enum: ['student', 'trainer'] },
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
