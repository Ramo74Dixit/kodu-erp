const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
    batchName: { type: String, required: true },   
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },   
    startDate: { type: Date, required: true },  
    endDate: { type: Date, required: true }, 
    timings: {   
        startTime: { type: String, required: true },  
        endTime: { type: String, required: true }      
    },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // Array of student IDs
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // The trainer teaching this batch
}, { timestamps: true });

const Batch = mongoose.model('Batch', batchSchema);
module.exports = Batch;
