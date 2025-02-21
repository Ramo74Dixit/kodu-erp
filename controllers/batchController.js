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
            trainer: req.user.userId  // The trainer is now saved as the user's ID
        });

        await newBatch.save();

        // Adding the new batch to each subject associated with the course
        course.subjects.forEach(subject => {
            subject.batches.push(newBatch._id);
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

// Add students to a batch
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

// New route to get all batches by trainer
const getBatchesByTrainer = async (req, res) => {
    try {
        // Assuming `trainerId` is passed in as a URL parameter
        const trainerId = req.user.userId;  // This is from the authenticated user's token

        const batches = await Batch.find({ trainer: trainerId })
            .populate('course')  // Optionally populate course details
            .populate('students')  // Optionally populate students' details
            .exec();

        if (!batches || batches.length === 0) {
            return res.status(404).json({ message: 'No batches found for this trainer' });
        }

        res.status(200).json({
            message: 'Trainer batches fetched successfully',
            batches: batches
        });
    } catch (error) {
        console.error('Error fetching batches for trainer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getStudentsByBatch = async (req, res) => {
    const { batchId } = req.params; // Get batchId from URL parameters

    try {
        const batch = await Batch.findById(batchId).populate('students'); // Populate the students field

        if (!batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }

        res.status(200).json({
            message: 'Students fetched successfully',
            students: batch.students // Return the students associated with the batch
        });
    } catch (error) {
        console.error('Error fetching students by batch:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { createBatch, addStudentsToBatch, getBatchesByTrainer,getStudentsByBatch };
