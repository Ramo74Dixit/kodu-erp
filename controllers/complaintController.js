const Complaint = require('../models/complaint');
const User = require('../models/User');
const Batch = require('../models/Batch');

// Student ke dwara complaint file karne ka function (trainerId ab request se nahi liya ja raha)
const fileComplaint = async (req, res) => {
  const { message } = req.body;
  const studentId = req.user.userId; // Token se prapt student ID

  // Sirf student hi complaint file kar sakta hai
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: "Only students can file complaints" });
  }

  try {
    // Student ke batch se trainer nikaalein
    const batch = await Batch.findOne({ students: studentId }).sort({ startDate: -1 });
    if (!batch) {
      return res.status(404).json({ message: "No batch found for student, cannot determine trainer" });
    }

    const trainerId = batch.trainer;
    if (!trainerId) {
      return res.status(404).json({ message: "Trainer not assigned in student's batch" });
    }

    const newComplaint = new Complaint({
      student: studentId,
      trainer: trainerId,
      message
    });

    await newComplaint.save();
    res.status(201).json({ message: "Complaint filed successfully" });
  } catch (error) {
    console.error("Error filing complaint:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Admin ke liye complaint dekhne ka function
const getAllComplaints = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Only admin can view complaints" });
  }
  try {
    const complaints = await Complaint.find()
      .populate("student", "name email")
      .populate("trainer", "name email");
    res.status(200).json(complaints);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { fileComplaint, getAllComplaints };
