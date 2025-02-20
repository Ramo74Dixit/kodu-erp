const express = require('express');
const { setStudentFee, createPaymentOrder, handlePaymentSuccess ,getDailyFeesCollection, getMonthlyFeesCollection } = require('../controllers/feeController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
const isAdmin = require('../middleware/adminAuth');
// Route to set student fee (done by counselor)
router.post('/set-fee', authMiddleware, setStudentFee);

// Route to create Razorpay payment order
router.post('/create-payment-order',authMiddleware, createPaymentOrder);

// Route to handle payment success
router.post('/payment-success',authMiddleware, handlePaymentSuccess);

router.get('/daily-fees', authMiddleware, getDailyFeesCollection);
router.get('/monthly-fees', authMiddleware, getMonthlyFeesCollection);
module.exports = router;
