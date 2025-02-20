const mongoose = require('mongoose');

const trainerAttendanceSchema = new mongoose.Schema({
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },   
    batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },   
    date: { type: Date, required: true },  
    status: { type: String, enum: ['present', 'absent'], required: true },   
}, { timestamps: true });

const TrainerAttendance = mongoose.model('TrainerAttendance', trainerAttendanceSchema);
module.exports = TrainerAttendance;
