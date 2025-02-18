const express= require("express");

const {approveUser,createAdmin} = require("../controllers/adminController")

const router = express.Router();

router.post('/create-admin', createAdmin);
router.post("/approve/:userId",approveUser);

module.exports=router;