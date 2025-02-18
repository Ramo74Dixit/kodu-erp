const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    courseName: { type: String, required: true },
    description: { type: String, required: true },
    subjects: [
        {
            subjectName: { type: String, required: true },
            topics: [
                {
                    topicName: { type: String, required: true },
                    description: { type: String, required: true }
                }
            ],
            batches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }] // Store references to batches for each subject
        }
    ],
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
