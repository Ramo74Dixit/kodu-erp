const mongoose = require('mongoose');

const studentFeeSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Link to the student
    totalFee: { type: Number, required: true },  // Total fee to be paid
    paidFee: { type: Number, default: 0 },  // Amount already paid
    paymentDate: { type: Date, default: Date.now },
    remainingFee: { type: Number, required: true },  // Remaining fee
}, { timestamps: true });

const StudentFee = mongoose.model('StudentFee', studentFeeSchema);
module.exports = StudentFee;
