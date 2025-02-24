const StudentFee = require('../models/StudentFees');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const generateReceipt = require('../utils/generateReceipt');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); 

const receiptsFolder = path.join(__dirname, '..', 'receipts');
if (!fs.existsSync(receiptsFolder)) {
    fs.mkdirSync(receiptsFolder);
}
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,        
    key_secret: process.env.RAZORPAY_KEY_SECRET   
});

// Set fee for the student (done by counselor)
const setStudentFee = async (req, res) => {
    try {
        const { studentId, totalFee } = req.body;

        const studentFee = new StudentFee({
            student: studentId,
            totalFee: totalFee,
            remainingFee: totalFee
        });

        await studentFee.save();
        res.status(201).json({ message: 'Student fee set successfully', studentFee });
    } catch (error) {
        console.error("Error setting student fee:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create Razorpay order for payment
const createPaymentOrder = async (req, res) => {
    try {
        const { amount, currency } = req.body;

        // Ensure the amount is an integer
        const parsedAmount = Math.round(amount * 100);  // Razorpay expects amount in paise
        if (isNaN(parsedAmount)) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const options = {
            amount: parsedAmount,  // Amount in paise
            currency: currency,
            receipt: crypto.randomBytes(10).toString('hex')
        };

        razorpay.orders.create(options, (err, order) => {
            if (err) {
                console.error("Error creating Razorpay order:", err);
                return res.status(500).json({ message: 'Internal server error' });
            }

            console.log('Razorpay Order Created:', order); // Log the order for debugging
            res.status(200).json(order); // Send the order object back to the frontend
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Handle payment success and fee deduction
const handlePaymentSuccess = async (req, res) => {
    const { paymentId, studentId, totalFee } = req.body;

    try {
        // Check if the user making the request is a counselor or student
        const role = req.user.role;

        // Ensure that only students or counselors can submit fees
        if (role !== 'student' && role !== 'counsellor') {
            return res.status(403).json({ message: 'Only student or counselor can submit fees' });
        }

        // Fetch payment details from Razorpay for verification
        const payment = await razorpay.payments.fetch(paymentId);

        if (!payment || payment.status !== 'captured') {
            return res.status(400).json({ message: 'Payment failed or not captured' });
        }

        // Find the student fee record
        const studentFee = await StudentFee.findOne({ student: studentId });

        if (!studentFee) {
            return res.status(404).json({ message: 'Student fee record not found' });
        }

        // Deduct the paid fee from the remaining fee
        studentFee.paidFee += totalFee;
        studentFee.remainingFee -= totalFee;

        // Save the updated student fee record
        await studentFee.save();

        // Fetch student details
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Generate the receipt
        const filePath = path.join(receiptsFolder, `payment_test_${paymentId}_receipt.pdf`);
        const receipt = generateReceipt(student.name, totalFee, paymentId, filePath);
        console.log(`Receipt generated at: ${filePath}`);

        res.status(200).json({
            message: 'Payment successful and fee updated',
            receipt: filePath
        });

    } catch (error) {
        console.error('Error handling payment success:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};




const getDailyFeesCollection = async (req, res) => {
    try {
        const { date } = req.query;  // Date format example: "2025-02-20"
        
        // Aggregate fees collected on that date
        const dailySummary = await StudentFee.aggregate([
            {
                $match: {
                    paymentDate: {
                        $gte: new Date(`${date}T00:00:00Z`),
                        $lt: new Date(`${date}T23:59:59Z`)
                    }
                }
            },
            {
                $group: {
                    _id: "$paymentMethod",
                    totalAmount: { $sum: "$paidFee" },
                    count: { $sum: 1 }
                }
            }
        ]);
        
        if (dailySummary.length === 0) {
            return res.status(404).json({ message: 'No fees recorded for this date' });
        }

        res.status(200).json(dailySummary);
    } catch (error) {
        console.error('Error fetching daily fees collection:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getMonthlyFeesCollection = async (req, res) => {
    try {
        const { month, year } = req.query;  // Example: month = "02", year = "2025"

        // Aggregate fees collected in that month and year
        const monthlySummary = await StudentFee.aggregate([
            {
                $match: {
                    paymentDate: {
                        $gte: new Date(`${year}-${month}-01T00:00:00Z`),
                        $lt: new Date(`${year}-${parseInt(month) + 1}-01T00:00:00Z`)
                    }
                }
            },
            {
                $group: {
                    _id: "$paymentMethod",
                    totalAmount: { $sum: "$paidFee" },
                    count: { $sum: 1 }
                }
            }
        ]);

        if (monthlySummary.length === 0) {
            return res.status(404).json({ message: 'No fees recorded for this month' });
        }

        res.status(200).json(monthlySummary);
    } catch (error) {
        console.error('Error fetching monthly fees collection:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { setStudentFee, createPaymentOrder, handlePaymentSuccess,getDailyFeesCollection,getMonthlyFeesCollection };
