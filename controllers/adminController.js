const User= require("../models/User")
const bcrypt = require('bcryptjs'); 
const createAdmin = async (req, res) => {
    const { name, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
        return res.status(400).json({ message: 'Admin already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = new User({
        name,
        email,
        password: hashedPassword,
        role: 'admin',
        status: 'approved'
    });

    await admin.save();
    res.status(201).json({ message: 'Admin created successfully' });
};

const approveUser = async(req,res)=>{
    const {userId}= req.params;
    const {action} = req.body;
    if(action !== 'approve' && action !== 'reject'){
        return res.satus(400).json({message:"Invalid Action"});
    }

    const user= await User.findById(userId);
    if(!user){
        return res.status(404).json({message:"User not found"});
    }

    user.status = action === "approve" ? "approved" :"rejected";
    await user.save();
    return res.status(200).json({message:`User ${action}d successfully`});
}

module.exports={approveUser,createAdmin};