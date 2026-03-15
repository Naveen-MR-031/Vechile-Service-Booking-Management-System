const express = require('express');
const router = express.Router();
const { register, login, getMe, sendOTP, verifyOTP, loginWithOTP, sendOTPAfterLogin, forgotPassword, resetPassword, verifyResetOTP } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOTP);
router.post('/send-otp-after-login', sendOTPAfterLogin);
router.post('/verify-otp', verifyOTP);
router.post('/login-with-otp', loginWithOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-reset-otp', verifyResetOTP);

router.get('/me', protect, getMe);

module.exports = router;
