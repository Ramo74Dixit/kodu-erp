const Course = require('../models/Course');

const addCourse = async (req, res) => {
    const { courseName, description, subjects } = req.body;
    const trainer = req.user.userId;  
    console.log("Trainer's ID from req.user._id:", req.user.userId);
    if (req.user.role !== 'trainer') {
        return res.status(403).json({ message: 'Only trainers can add courses' });
    }
    try {      
        const newCourse = new Course({
            courseName,
            description,
            subjects,
            trainer  
        });
        await newCourse.save();
        res.status(201).json({
            message: 'Course created successfully',
            course: newCourse
        });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find();  // Fetch courses from the database
        res.json(courses);  // Send back the courses data
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Error fetching courses' });
    }
};

module.exports = { addCourse,getCourses };
