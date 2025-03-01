const cloudinary = require('../config/cloudinary'); // Import Cloudinary
const Assignment = require('../models/Assignment');
const Batch = require('../models/Batch');
const mongoose = require('mongoose');

// ------------------ Upload Assignment (Trainer) ------------------
const uploadAssignment = async (req, res) => {
  const { batchId, title } = req.body;
  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const allowedTypes = [
    'application/pdf', 'image/jpeg', 'image/png', 'image/gif',
    'text/plain', 'text/markdown', 'application/javascript'
  ];
  if (!allowedTypes.includes(file.mimetype)) {
    return res.status(400).json({ message: 'File type not supported' });
  }
  const resourceType = ['image/jpeg', 'image/png', 'image/gif'].includes(file.mimetype)
    ? 'image'
    : 'raw';

  try {
    const cloudinaryRes = await cloudinary.uploader.upload(file.path, {
      resource_type: resourceType,
      folder: 'assignments',
    });

    let fileUrl = cloudinaryRes.secure_url;
    if (resourceType === 'raw') {
      fileUrl += '?fl_attachment=false';
    }

    // Use user role from the authentication system
    const role = req.user.role; // e.g. 'trainer' if a trainer is uploading

    const assignment = new Assignment({
      title,
      fileUrl,
      batchId,
      createdBy: req.user.id,  // Save the user who uploaded the file
      type: role               // e.g. 'trainer'
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
  const { title } = req.query; // from query params

  console.log('[viewStudentAssignments] START');
  console.log('[viewStudentAssignments] batchId (req.params):', batchId);
  console.log('[viewStudentAssignments] title (req.query):', title);

  try {
    // Convert batchId to ObjectId
    const objectIdBatchId = new mongoose.Types.ObjectId(batchId);

    // NOTE: Removed "type: 'student'" so we can see both student + trainer assignments
    let query = { batchId: objectIdBatchId };

    // Optional title filter (case-insensitive)
    if (title) {
      query.title = new RegExp(`^${title}$`, 'i');
    }

    console.log('[viewStudentAssignments] MongoDB Query:', query);

    const assignments = await Assignment.find(query);

    console.log('[viewStudentAssignments] Assignments returned:', assignments);
    console.log('[viewStudentAssignments] Number of assignments:', assignments.length);

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
    : 'raw';

  try {
    const cloudinaryRes = await cloudinary.uploader.upload(file.path, {
      resource_type: resourceType,
      folder: 'assignments',
    });

    let fileUrl = cloudinaryRes.secure_url;
    if (resourceType === 'raw') {
      fileUrl += '?fl_attachment=false';
    }

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
