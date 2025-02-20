const TrainerAttendance = require('../models/TrainerAttendance');
const markTrainerAttendance = async (req, res) => {
    const { batchId, status } = req.body;   

    try {
        if (req.user.role !== 'trainer' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only trainers or admins can mark attendance' });
        }
        const attendance = new TrainerAttendance({
            trainer: req.user.userId,  
            batch: batchId,
            date: new Date(),
            status: status
        });

        await attendance.save();
        res.status(201).json({
            message: 'Trainer attendance marked successfully',
            attendance: attendance
        });
    } catch (error) {
        console.error('Error marking trainer attendance:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { markTrainerAttendance };
