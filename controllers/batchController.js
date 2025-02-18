const Batch = require('../models/Batch');
const Course = require('../models/Course');
const User = require('../models/User');

// Create a new batch
const createBatch = async (req, res) => {
    const { batchName, courseId, startDate, endDate, startTime, endTime, students } = req.body;

    try {
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(400).json({ message: 'Course not found' });
        }
        const newBatch = new Batch({
            batchName,
            course: courseId,
            startDate,
            endDate,
            timings: { startTime, endTime },
            students,
            trainer: req.user.userId  
        });
        await newBatch.save();
        course.subjects.forEach(subject => {
            subject.batches.push(newBatch._id);  // Add this batch to all subjects
        });
        await course.save();

        res.status(201).json({
            message: 'Batch created successfully',
            batch: newBatch
        });
    } catch (error) {
        console.error('Error creating batch:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { createBatch };


const addStudentsToBatch = async (req, res) => {
    const { batchId, studentIds } = req.body;
    try {
        const batch = await Batch.findById(batchId);
        if (!batch) {
            return res.status(400).json({ message: 'Batch not found' });
        }
        const students = await User.find({ '_id': { $in: studentIds } });
        if (students.length !== studentIds.length) {
            return res.status(400).json({ message: 'Some students not found' });
        }
        batch.students.push(...studentIds);
        await batch.save();

        res.status(200).json({
            message: 'Students added to batch successfully',
            batch: batch
        });
    } catch (error) {
        console.error('Error adding students to batch:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { createBatch,addStudentsToBatch };
