const cloudinary = require('../config/cloudinary'); // Import Cloudinary
const Assignment = require('../models/Assignment');
const Batch = require('../models/Batch');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

// Create a transporter for sending emails.
// It is recommended to use environment variables for credentials.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user:"ramodixit577@gmail.com", // your email user in .env
    pass:"insh jgrl dzlk rmcw",  // your email password in .env
  },
});

const uploadAssignment = async (req, res) => {
  const { batchId, title, deadline } = req.body; // added deadline field
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Allowed MIME types
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'text/markdown',
    'application/javascript'
  ];
  if (!allowedTypes.includes(file.mimetype)) {
    return res.status(400).json({ message: 'File type not supported' });
  }

  // Decide resourceType properly
  let resourceType;
  if (file.mimetype === 'application/pdf') {
    resourceType = 'raw';
  } else if (['image/jpeg', 'image/png', 'image/gif'].includes(file.mimetype)) {
    resourceType = 'image';
  } else {
    resourceType = 'auto';
  }

  try {
    // Upload file to Cloudinary
    const cloudinaryRes = await cloudinary.uploader.upload(file.path, {
      resource_type: resourceType,
      folder: 'assignments',
      format: 'pdf',
    });

    // Create a new assignment with deadline field
    const assignment = new Assignment({
      title,
      fileUrl: cloudinaryRes.secure_url,
      batchId,
      createdBy: req.user.id,
      type: req.user.role,
      deadline // save the deadline provided by trainer
    });

    await assignment.save();
    await Batch.findByIdAndUpdate(batchId, { $push: { assignments: assignment._id } });

    // Fetch the batch along with its associated students
    const batch = await Batch.findById(batchId).populate("students");
    if (batch && batch.students && batch.students.length > 0) {
      // Iterate over each student and send a professional email
      for (const student of batch.students) {
        const mailOptions = {
          from: process.env.EMAILUSER,
          to: student.email,
          subject: `New Assignment Notification: ${title}`,
          html: `
            <p>Dear ${student.name},</p>
            <p>We hope you are doing well.</p>
            <p>This is to inform you that a new assignment titled <strong>${title}</strong> has been uploaded by your trainer.</p>
            <p><strong>Deadline:</strong> ${deadline}</p>
            <p>You may access the assignment <a href="${cloudinaryRes.secure_url}">here</a>.</p>
            <p>Please ensure that you complete and submit your assignment before the deadline. Should you have any questions, feel free to reach out to your trainer.</p>
            <br>
            <p>Best regards,</p>
            <p>Your Trainer at [Institute Name]</p>
          `
        };
        // Send the email
        await transporter.sendMail(mailOptions);
      }
    }

    res.status(201).json({
      message: 'Assignment uploaded and notifications sent successfully',
      assignment,
    });
  } catch (error) {
    console.error('Error uploading assignment:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};



// ------------------ Get All Assignments for a Batch (No Type Filter) ------------------
const getAssignmentsForBatch = async (req, res) => {
  const { batchId } = req.params;

  try {
    const assignments = await Assignment.find({ batchId }).populate('batchId');
    res.status(200).json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// ------------------ Score an Assignment ------------------
const scoreAssignment = async (req, res) => {
  const { assignmentId, score } = req.body;
  try {
    const assignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      { score },
      { new: true }
    );
    res.status(200).json({
      message: 'Assignment scored successfully',
      assignment
    });
  } catch (error) {
    console.error('Error scoring assignment:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// ------------------ View Assignments (Used by Student, Now Shows Trainer + Student) ------------------
const viewStudentAssignments = async (req, res) => {
  const { batchId } = req.params;
  const { title } = req.query; // from query param

  try {
    // Convert batchId to ObjectId
    const objectIdBatchId = new mongoose.Types.ObjectId(batchId);

    // NOTE: Removed "type: 'student'" so we can see both student + trainer assignments
    let query = { batchId: objectIdBatchId };

    // Optional title filter (case-insensitive)
    if (title) {
      query.title = new RegExp(`^${title}$`, 'i');
    }

    // console.log('[viewStudentAssignments] MongoDB Query:', query);

    const assignments = await Assignment.find(query);

    // console.log('[viewStudentAssignments] Assignments returned:', assignments);
    // console.log('[viewStudentAssignments] Number of assignments:', assignments.length);

    if (assignments.length === 0) {
      console.log('[viewStudentAssignments] No assignments found for the given query.');
      return res.status(404).json({ message: 'No assignments found' });
    }

    res.status(200).json(assignments);
    console.log('[viewStudentAssignments] SUCCESS - Assignments sent in response.');
  } catch (error) {
    console.error('[viewStudentAssignments] ERROR:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// ------------------ Upload Assignment (Student) ------------------
const uploadStudentAssignment = async (req, res) => {
  const { batchId } = req.params;
  const { title } = req.body;

  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'text/markdown'];
  if (!allowedTypes.includes(file.mimetype)) {
    return res.status(400).json({ message: 'File type not supported' });
  }

  const resourceType = ['image/jpeg', 'image/png'].includes(file.mimetype)
    ? 'image'
    : 'auto';

  try {
    const cloudinaryRes = await cloudinary.uploader.upload(file.path, {
      resource_type: resourceType,
      folder: 'assignments',
    });

    let fileUrl = cloudinaryRes.secure_url;

    // The student's role is typically 'student', but we won't filter by it in retrieval
    const assignment = new Assignment({
      title,
      fileUrl,
      batchId,
      student: req.user.id, // If you have a separate field for the student
      type: req.user.role   // e.g. 'student'
    });

    await assignment.save();
    await Batch.findByIdAndUpdate(batchId, { $push: { assignments: assignment._id } });

    res.status(201).json({
      message: 'Assignment uploaded successfully',
      assignment,
    });
  } catch (error) {
    console.error('Error uploading assignment:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// ------------------ Get Unique Assignment Titles for a Batch ------------------
const getAssignmentTitlesForBatch = async (req, res) => {
  const { batchId } = req.params;

  try {
    const objectIdBatchId = new mongoose.Types.ObjectId(batchId);

    const titles = await Assignment.aggregate([
      { $match: { batchId: objectIdBatchId } },
      { $group: { _id: '$title' } },
      { $project: { title: '$_id', _id: 0 } },
    ]);

    if (titles.length === 0) {
      return res.status(404).json({ message: 'No assignments found for this batch' });
    }

    res.status(200).json(titles.map(t => t.title));
  } catch (error) {
    console.error('Error fetching assignment titles:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// ------------------ Export All ------------------
module.exports = {
  uploadAssignment,
  getAssignmentsForBatch,
  uploadStudentAssignment,
  viewStudentAssignments,
  scoreAssignment,
  getAssignmentTitlesForBatch
};
