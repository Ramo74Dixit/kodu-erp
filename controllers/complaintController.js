// controllers/complaintController.js
const Complaint = require('../models/complaint');
const User = require('../models/User');  // User model to get student name

// Route to submit a complaint
const submitComplaint = async (req, res) => {
    try {
        const { studentId, issueCategory, issueDescription } = req.body;

        // Find the student by ID
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Create a new complaint
        const complaint = new Complaint({
            studentId,
            studentName: student.name,
            issueCategory,
            issueDescription,
        });

        // Save the complaint
        await complaint.save();
        res.status(201).json({ message: 'Complaint submitted successfully' });
    } catch (error) {
        console.error('Error submitting complaint:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Route to get complaints by category (admin only)
const getComplaintsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        if (!['trainer', 'course', 'projects/internship'].includes(category)) {
            return res.status(400).json({ message: 'Invalid category' });
        }

        const complaints = await Complaint.find({ issueCategory: category });

        if (complaints.length === 0) {
            return res.status(404).json({ message: 'No complaints in this category' });
        }

        res.status(200).json(complaints);
    } catch (error) {
        console.error('Error fetching complaints by category:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Route to get complaints by student (admin only)
const getComplaintsByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const complaints = await Complaint.find({ studentId });

        if (complaints.length === 0) {
            return res.status(404).json({ message: 'No complaints from this student' });
        }

        res.status(200).json(complaints);
    } catch (error) {
        console.error('Error fetching complaints by student:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Route to get all complaints (admin only)
const getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find();

        if (complaints.length === 0) {
            return res.status(404).json({ message: 'No complaints found' });
        }

        res.status(200).json(complaints);
    } catch (error) {
        console.error('Error fetching all complaints:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { submitComplaint, getComplaintsByCategory, getComplaintsByStudent, getAllComplaints };
