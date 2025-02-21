const express= require("express");

const {approveUser,createAdmin,getPendingUsers} = require("../controllers/adminController")

const router = express.Router();

router.post('/create-admin', createAdmin);
router.post("/approve/:userId",approveUser);
router.get('/pending-users', getPendingUsers);
module.exports=router;