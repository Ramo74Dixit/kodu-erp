const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, required: true },
  issueCategory: {
    type: String,
    enum: ['trainer', 'course', 'projects/internship'],
    required: true,
  },
  issueDescription: { type: String, required: true },
  dateSubmitted: { type: Date, default: Date.now },
});

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
