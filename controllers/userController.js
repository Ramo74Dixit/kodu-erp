const bcrypt = require('bcrypt');

const User= require("../models/User");

const registerUser= async(req,res)=>{
    const {name,email,password,role}= req.body;
    const existingUser= await User.findOne({email});
    if(existingUser){
        return res.status(400).json({message:"User Already Exists"});
    }
    const hashedPassword= await bcrypt.hash(password,10);

    const user= new User({
        name,
        email,
        password:hashedPassword,
        role
    })

    await user.save();
    res.status(201).json({message:"User registered , waiting for approval"});
}

module.exports= {registerUser};