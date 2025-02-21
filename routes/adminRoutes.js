const express= require("express");
const authMiddleware= require( "../middleware/authMiddleware");
const {approveUser,createAdmin,getPendingUsers} = require("../controllers/adminController")

const router = express.Router();

router.post('/create-admin',authMiddleware,createAdmin);
router.post("/approve/:userId",authMiddleware,approveUser);
router.get('/pending-users',authMiddleware, getPendingUsers);
module.exports=router;