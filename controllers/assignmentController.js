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
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <title>New Assignment Notification</title>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 20px;
                  }
                  .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: #ffffff;
                    padding: 30px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                  }
                  .header {
                    text-align: center;
                    margin-bottom: 20px;
                  }
                  .content {
                    line-height: 1.6;
                    font-size: 16px;
                    color: #333;
                  }
                  .button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #007bff;
                    color:white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin-top: 20px;
                  }
                  .footer {
                    margin-top: 30px;
                    font-size: 12px;
                    color: #777;
                    text-align: center;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="content">
                    <p>Dear ${student.name},</p>
                    <p>We hope you are doing well.</p>
                    <p>This is to inform you that a new assignment titled <strong>${title}</strong> has been uploaded by your trainer.</p>
                    <p><strong>Deadline:</strong> ${deadline}</p>
                    <p>You may access the assignment by clicking the button below:</p>
                    <p>
                      <a class="button" href="${cloudinaryRes.secure_url}" target="_blank">
                        View Assignment
                      </a>
                    </p>
                    <p>Please ensure that you complete and submit your assignment before the deadline. If you have any questions, feel free to reach out to your trainer.</p>
                    <br>
                    <p>Best regards,</p>
                    <p>
                      <strong>Ram Mohan Dixit</strong><br>
                      MERN STACK TRAINER
                    </p>
                  </div>
                  <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} Kodu-Powered By Dhurina . All rights reserved.</p>
                  </div>
                </div>
              </body>
            </html>
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
  const { assignmentId, submissionLink } = req.body;  // Removed title from request body
  const batchId = req.params.batchId;

  console.log("Received batchId:", batchId); // Debugging line to log the batchId

  // Validate submissionLink for GitHub or PDF URL
  const isValidLink = /^(https?:\/\/)?(github\.com\/.+|.+\.pdf)$/.test(submissionLink);
  if (!isValidLink) {
    return res.status(400).json({ message: 'Invalid link. Please submit a GitHub repository or a PDF file URL.' });
  }

  try {
    // Ensure batchId is treated as ObjectId correctly
    const batch = await Batch.findById(new mongoose.Types.ObjectId(batchId));
    console.log("Batch found:", batch); // Debugging line to check batch

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found.' });
    }

    // Ensure the assignmentId exists in the batch's assignments before submission
    const assignment = await Assignment.findById(assignmentId); // Find the specific assignment by ID
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    // Proceed with assignment submission, use the fetched title
    const studentAssignment = new Assignment({
      assignmentId,  // Store assignmentId directly
      title: assignment.title,  // Fetch the title directly from the assignment
      fileUrl: submissionLink,
      batchId,
      student: req.user.id,
      type: 'student',  // Ensure type is 'student' for student submissions
      status: 'submitted'
    });

    await studentAssignment.save();
    res.status(201).json({
      message: 'Assignment submitted successfully',
      studentAssignment,
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
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

const getSubmissionsForAssignment = async (req, res) => {
  const { assignmentId } = req.params;

  try {
    // Fetch all student submissions with the assignmentId and populate the 'student' field
    const submissions = await Assignment.find({
      assignmentId: new mongoose.Types.ObjectId(assignmentId), // Ensure ObjectId format
      type: 'student'  // Only student submissions
    })
    .populate('student', 'name email') // Populate student details (name and email)
    .select('title fileUrl student status');  // Select relevant fields like title, student, status

    // If no submissions, return message
    if (submissions.length === 0) {
      return res.status(404).json({ message: 'No submissions found for this assignment.' });
    }

    // Return the submissions along with student data
    res.status(200).json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
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
  getAssignmentTitlesForBatch,
  getSubmissionsForAssignment
};
