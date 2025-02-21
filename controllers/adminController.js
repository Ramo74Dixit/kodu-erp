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
const getPendingUsers = async (req, res) => {
    try {
        // Fetch users who are pending approval (trainer or counsellor)
        const users = await User.find({ status: 'pending', role: { $in: ['trainer', 'counsellor'] } });
        res.status(200).json(users); // Return the list of users
    } catch (error) {
        console.error('Error fetching pending users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
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

module.exports={approveUser,createAdmin,getPendingUsers};