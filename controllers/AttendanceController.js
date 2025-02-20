const StudentAttendance = require('../models/StudentAttendance');
const TrainerAttendance = require('../models/TrainerAttendance'); // Import trainer attendance model

const getAttendanceSummary = async (req, res) => {
    try {
        const { userId, batchId, type } = req.params;  // 'type' will determine if it's a student or trainer

        let attendanceRecords;

        if (type === 'student') {
            // Fetch student attendance records
            attendanceRecords = await StudentAttendance.find({
                student: userId,
                batch: batchId
            });
        } else if (type === 'trainer') {
            // Fetch trainer attendance records
            attendanceRecords = await TrainerAttendance.find({
                trainer: userId,  // Assuming 'trainer' field in TrainerAttendance model
                batch: batchId
            });
        } else {
            return res.status(400).json({ message: 'Invalid attendance type. Use "student" or "trainer".' });
        }

        if (!attendanceRecords || attendanceRecords.length === 0) {
            return res.status(404).json({ message: 'No attendance records found' });
        }

        const totalDays = attendanceRecords.length;
        const presentDays = attendanceRecords.filter(record => record.status === 'present').length;
        const absentDays = attendanceRecords.filter(record => record.status === 'absent').length;
        const lateDays = attendanceRecords.filter(record => record.status === 'late').length;

        return res.status(200).json({
            totalDays,
            presentDays,
            absentDays,
            lateDays
        });
    } catch (error) {
        console.error('Error fetching attendance summary:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { getAttendanceSummary };
