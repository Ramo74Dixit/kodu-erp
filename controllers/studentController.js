const User = require("../models/User");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ramodixit577@gmail.com",
    pass: "insh jgrl dzlk rmcw",
  },
});
const approveStudent = async (req, res) => {
  const { userId } = req.params;
  const { action } = req.body;
  const role = req.user.role;
  if (role !== "counsellor" && role !== "trainer") {
    return res
      .status(403)
      .json({ message: "Only counsellor or trainer can approve the student" });
  }
  if (action !== "approve" && action !== "reject") {
    return res.status(400).json({ message: "Invalid action" });
  }
  const student = await User.findById(userId);
  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }
  if (student.status !== "pending") {
    return res
      .status(400)
      .json({ message: "Student is already approved or rejected" });
  }
  student.status = action === "approve" ? "approved" : "rejected";
  student.approvedBy = role;

  await student.save();
  if (student.status === "approved") {
    const mailOptions = {
      from: process.env.EMAILUSER,
      to: student.email,
      subject: "Welcome to Kodu Institute",
      html: `
                <h1 style="text-align:center; color: #4CAF50; font-family: Arial, sans-serif;">Welcome to Kodu Institute!</h1>

<p style="font-size: 18px; color: #555; font-family: Arial, sans-serif;">
    Dear <strong>${student.name}</strong>,
</p>

<p style="font-size: 16px; color: #333; font-family: Arial, sans-serif;">
    Thank you for joining <strong>Kodu Institute</strong>. We are excited to have you on board. Your registration has been successfully approved by the <strong>${role}</strong>.
</p>

<p style="font-size: 16px; color: #FF5733; font-family: Arial, sans-serif; font-weight: bold;">
    We wish you all the best in your learning journey!
</p>

<p style="font-size: 16px; color: #0066cc; font-family: Arial, sans-serif;">
    If you have any questions, feel free to reach out to us at any time. We are here to assist you!
</p>

<p style="font-size: 16px; color: #28a745; font-family: Arial, sans-serif; font-weight: bold;">
    Best regards,
</p>

<p style="font-size: 16px; color: #FFD700; font-family: Arial, sans-serif;">
    Diksha, <br>
    Vice President - Kodu Powered By Dhurina
</p>

<p style="font-size: 14px; color: #999; font-family: Arial, sans-serif; text-align: center;">
    <em>You're receiving this email because you joined Kodu Institute! We are happy to have you as part of our learning community.</em>
</p>

<div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-family: Arial, sans-serif;">
    <p style="font-size: 14px; color: #666;">
        <a href="https://koduapp.com/" style="color: #4CAF50; text-decoration: none; font-weight: bold;">Visit Kodu Institute</a>
    </p>
</div>

            `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("Approval Email Sent Successfully");
    } catch (error) {
      console.error("Error sending Email:", error);
    }
  }

  res.status(200).json({
    message: `Student has been ${action}d successfully by ${role}`,
  });
};


const getPendingStudents = async (req,res)=>{
    const role = req.user.role;
    if(role !== "counsellor"){
        return res.status(403).json({message:"Only Counsellor can view pending students"});
    }
    try{
       const pendingStudents = await User.find({status:'pending',role:'student'});
       if(pendingStudents.length === 0){
        return res.status(200).json({message:"No Pending Students found"});
       }
       res.status(200).json(pendingStudents)
    }catch(error){
        console.error('Error fetching pending students:',error);
        return res.status(500).json({message:"An Error Occured Please Recheck it "})
    }
}

const approveAllPendingStudents = async (req, res) => {
    const role = req.user.role;
    if (role !== 'counsellor') {
        return res.status(403).json({ message: 'Only counsellor can approve students' });
    }
    try {
        const pendingStudents = await User.find({ status: 'pending', role: 'student' });
        if (pendingStudents.length === 0) {
            return res.status(200).json({ message: 'No pending students to approve' });
        }
        await User.updateMany(
            { status: 'pending', role: 'student' },  
            { $set: { status: 'approved', approvedBy: 'counsellor' } }  
        );
        for (let student of pendingStudents) {
            const mailOptions = {
                from: process.env.EMAILUSER,
                to: student.email,
                subject: "Welcome to Kodu Institute",
                html: `
                    <h1>Welcome to Kodu Institute</h1>
                    <p>Dear ${student.name},</p>
                    <p>Thank you for joining Kodu Institute. We are excited to have you on board. Your registration has been successfully approved by the Counsellor.</p>
                    <p style="color:red;">We wish you all the best in your learning journey!</p>
                    <p style="color:blue;">If you have any questions, feel free to reach out to us.</p>
                    <p style="color:green;">Best regards,</p>
                    <p style="color:yellow;">Diksha, Vice President - Kodu Powered By Dhurina</p>
                `
            };
            try {
                await transporter.sendMail(mailOptions);
                console.log(`Approval email sent to ${student.name}`);
            } catch (error) {
                console.error(`Error sending email to ${student.name}:`, error);
            }
        }
        res.status(200).json({
            message: `All pending students have been approved successfully by the counsellor`
        });

    } catch (error) {
        console.error('Error approving students:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateProfile = async (req, res) => {
    const { userId } = req.user;  
    const { phoneNumber, whatsappNumber, parentPhoneNumber, enrolledCourses, education } = req.body;
    try {  
        const student = await User.findById(userId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        if (student.status !== 'approved') {
            return res.status(403).json({ message: 'You can only update your profile after your registration is approved' });
        }
        const updatedProfile = {
            phoneNumber: phoneNumber || student.phoneNumber,
            whatsappNumber: whatsappNumber || student.whatsappNumber,
            parentPhoneNumber: parentPhoneNumber || student.parentPhoneNumber,
            enrolledCourses: enrolledCourses || student.enrolledCourses,
            education: education || student.education
        };
        student.set(updatedProfile);
        await student.save();
        res.status(200).json({
            message: 'Profile updated successfully',
            updatedProfile: student
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getAllStudents = async (req, res) => {
    const role = req.user.role;

    // Check if the logged-in user is a counsellor
    if (role !== 'counsellor' && role !== 'admin' && role !== 'trainer') {
        return res.status(403).json({ message: "Only counsellor or admin can view all students" });
    }

    try {
        const allStudents = await User.find({ role: 'student' });
        if (allStudents.length === 0) {
            return res.status(200).json({ message: "No students found" });
        }
        res.status(200).json(allStudents);
    } catch (error) {
        console.error('Error fetching students:', error);
        return res.status(500).json({ message: "An error occurred while fetching students" });
    }
};
module.exports = { approveStudent ,getPendingStudents,getAllStudents, approveAllPendingStudents,updateProfile};
