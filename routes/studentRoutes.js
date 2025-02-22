const express= require('express');
const {approveStudent,getPendingStudents,approveAllPendingStudents,updateProfile,getAllStudents,getStudentDetails}=require("../controllers/studentController")
const authMiddleware= require("../middleware/authMiddleware")
const router = express.Router();

router.post('/approve/:userId',authMiddleware,approveStudent);
router.get('/pending',authMiddleware,getPendingStudents)
router.post('/approve-all',authMiddleware,approveAllPendingStudents)
router.put('/update-profile', authMiddleware, updateProfile);
router.get('/all',authMiddleware, getAllStudents);
router.get('/student/:userId',authMiddleware, getStudentDetails);
module.exports=router;