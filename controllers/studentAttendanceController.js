const StudentAttendance = require('../models/StudentAttendance');
const Batch = require('../models/Batch');
const User = require("../models/User");  // User model ko import karo
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ramodixit577@gmail.com",  // Your email
    pass: "insh jgrl dzlk rmcw",   // Your password (should ideally be in .env file)
  },
});

// Function to send email to student
const sendEmail = (studentEmail, studentName, subject, text) => {
  const mailOptions = {
    from: process.env.EMAILUSER,  // Your email
    to: studentEmail,
    subject: subject,
    text: text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

// Mark attendance for multiple students in a batch
const markStudentsAttendance = async (req, res) => {
  const { batchId, studentsAttendance } = req.body;  // studentsAttendance will be an array of student IDs with their attendance status

  try {
    // Find the batch by ID
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(400).json({ message: 'Batch not found' });
    }

    // Array to store all the attendance records
    const attendanceRecords = [];

    // Loop through the students' attendance and create a new attendance record for each student
    for (let i = 0; i < studentsAttendance.length; i++) {
      const { studentId, status } = studentsAttendance[i];

      // Check if the student is enrolled in the batch
      if (!batch.students.includes(studentId)) {
        return res.status(400).json({ message: `Student ${studentId} is not enrolled in this batch` });
      }

      // Create an attendance record for the student
      const attendance = new StudentAttendance({
        student: studentId,
        batch: batchId,
        date: new Date(),
        status: status // present or absent
      });

      // Push the attendance record to the array
      attendanceRecords.push(attendance);

      // If student is absent, send an email
      if (status === 'absent') {
        const student = await User.findById(studentId);
        if (student) {
          const subject = 'Attendance Alert: You are Absent Today';
          const text = `Dear ${student.name},\n\nWe noticed that you were absent today in class. Kindly provide a valid reason for your absence at your earliest convenience.\n\nBest Regards,\nYour Course Team`;
          // Send email
          sendEmail(student.email, student.name, subject, text);
        }
      }
    }

    // Insert all the attendance records in one go
    await StudentAttendance.insertMany(attendanceRecords);

    res.status(200).json({
      message: 'Attendance for students marked successfully',
      attendance: attendanceRecords
    });
  } catch (error) {
    console.error('Error marking student attendance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { markStudentsAttendance };
