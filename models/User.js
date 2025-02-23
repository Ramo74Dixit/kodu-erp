const mongoose = require('mongoose');
const Course = require('./Course');  // Ensure that you have access to the Course model

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'counsellor', 'trainer', 'student'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedBy: { type: String, enum: ['counsellor', 'trainer'], default: null },
  phoneNumber: { type: String, required: false },
  whatsappNumber: { type: String, required: false },
  parentPhoneNumber: { type: String, required: false },
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    validate: {
      validator: async function (value) {
        // Allowed course IDs (replace these with actual course IDs)
        const allowedCourses = ['67b4b2741f826bd77bae006f'];  // Replace with actual course IDs
        
        // Validate if all courses in the enrolledCourses array are part of the allowed courses
        const validCourses = await Course.find({ '_id': { $in: allowedCourses } }).select('_id');
        const validCourseIds = validCourses.map(course => course._id.toString());

        return value.every(courseId => validCourseIds.includes(courseId.toString()));
      },
      message: 'Invalid course selected. Only specific courses are allowed.'
    }
  }],
  education: { type: String, required: false },
  admissionDate: { type: Date, required: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
