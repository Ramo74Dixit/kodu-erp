const cloudinary = require('../config/cloudinary'); // Import Cloudinary
const Assignment = require('../models/Assignment');
const Batch = require('../models/Batch');
const mongoose = require('mongoose');
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
  const resourceType = ['image/jpeg', 'image/png', 'image/gif'].includes(file.mimetype) ? 'image' : 'raw';

  try {
    const cloudinaryRes = await cloudinary.uploader.upload(file.path, {
      resource_type: resourceType,
      folder: 'assignments',
    });

    // Use user role from the authentication system
    const role = req.user.role; // Assuming 'role' is set in the user object after authentication

    const assignment = new Assignment({
      title,
      fileUrl: cloudinaryRes.secure_url,
      batchId,
      createdBy: req.user.id,  // Save the user who uploaded the file
      type: role  // Automatically set type based on the user's role
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

const scoreAssignment = async (req, res) => {
  const { assignmentId, score } = req.body;
  try {
    const assignment = await Assignment.findByIdAndUpdate(assignmentId, { score }, { new: true });
    res.status(200).json({
      message: 'Assignment scored successfully',
      assignment
    });
  } catch (error) {
    console.error('Error scoring assignment:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const viewStudentAssignments = async (req, res) => {
  const { batchId } = req.params;
  const { title } = req.body;  

  try {
    let query = { batchId, type: 'student' };
    if (title) {
      query.title = title;
    }

    const assignments = await Assignment.find(query);

    if (assignments.length === 0) {
      return res.status(404).json({ message: 'No student assignments found' });
    }

    res.status(200).json(assignments);
  } catch (error) {
    console.error('Error fetching student assignments:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};


const uploadStudentAssignment = async (req, res) => {
  const { batchId } = req.params;  // Assuming batchId is passed via URL path
  const { title } = req.body;  // Student selects the title from a dropdown, for example

  const file = req.file;
  if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
  }

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'text/markdown'];
  if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ message: 'File type not supported' });
  }

  const resourceType = ['image/jpeg', 'image/png'].includes(file.mimetype) ? 'image' : 'raw';

  try {
      const cloudinaryRes = await cloudinary.uploader.upload(file.path, {
          resource_type: resourceType,
          folder: 'assignments',
      });

      const assignment = new Assignment({
          title,
          fileUrl: cloudinaryRes.secure_url,
          batchId,
          student: req.user.id ,
          type: req.user.role // Use the authenticated user's ID
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

const getAssignmentTitlesForBatch = async (req, res) => {
  const { batchId } = req.params;

  try {
      // Correctly converting batchId from string to ObjectId
      const objectIdBatchId = new mongoose.Types.ObjectId(batchId);

      // Use MongoDB aggregation to find unique titles for a specific batch
      const titles = await Assignment.aggregate([
          { $match: { batchId: objectIdBatchId } }, // Match the batch ID using ObjectId
          { $group: { _id: "$title" } },   // Group by title to get unique titles
          { $project: { title: "$_id", _id: 0 } } // Project the titles
      ]);

      if (titles.length === 0) {
          return res.status(404).json({ message: 'No assignments found for this batch' });
      }

      res.status(200).json(titles.map(t => t.title)); // Send back just an array of titles
  } catch (error) {
      console.error('Error fetching assignment titles:', error);
      res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = { uploadAssignment, getAssignmentsForBatch,uploadStudentAssignment,viewStudentAssignments,scoreAssignment,getAssignmentTitlesForBatch };
