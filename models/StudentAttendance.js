const mongoose = require('mongoose');

const studentAttendanceSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },   
    date: { type: Date, required: true },  
    // status: { type: String, enum: ['present', 'absent'], required: true },   
    status: {  // Status for the day
        type: String,
        enum: ['present', 'absent', 'late'],
        required: true
    }
}, { timestamps: true });

const StudentAttendance = mongoose.model('StudentAttendance', studentAttendanceSchema);
module.exports = StudentAttendance;
