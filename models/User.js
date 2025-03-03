const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'counsellor', 'trainer', 'student'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: "pending" },
  approvedBy: { type: String, enum: ['counsellor', 'trainer'], default: null },
  phoneNumber: { type: String, required: false },
  whatsappNumber: { type: String, required: false },
  parentPhoneNumber: { type: String, required: false },
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: []
  }],
  education: { type: String, required: false },
  admissionDate: { type: Date, required: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
