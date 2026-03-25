const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../services/emailService');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
};

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, password, userType, phone, businessName, licenseNumber, gstNumber, address, description, otp, businessLogo } = req.body;

        if (!otp) {
            return res.status(400).json({ success: false, message: 'OTP is required' });
        }

        const otpRecord = await OTP.findOne({ email: email.toLowerCase(), otp });
        if (!otpRecord) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // Clean up OTP after verification
        await OTP.deleteOne({ _id: otpRecord._id });

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Email already registered' });
        }

        if (phone) {
            const phoneExists = await User.findOne({ phone });
            if (phoneExists) {
                return res.status(409).json({ success: false, message: 'Phone number already registered' });
            }
        }

        // Normalize address: if string, convert to object
        let normalizedAddress = address;
        if (typeof address === 'string' && address.trim()) {
            const parts = address.split(',').map(s => s.trim());
            normalizedAddress = {
                street: parts[0] || '',
                city: parts[1] || '',
                state: parts[2] || '',
                zipCode: parts[3] || ''
            };
        }

        const user = await User.create({
            name, email, password, userType, phone,
            businessName, licenseNumber, gstNumber,
            address: normalizedAddress || undefined,
            description, businessLogo
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType,
                phone: user.phone,
                businessName: user.businessName
            }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Login user (password-only, kept for backward compat)
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { phone: email }]
        }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (user.accountStatus === 'suspended') {
            return res.status(403).json({ success: false, message: 'Account suspended' });
        }

        user.lastLogin = new Date();
        await user.save({ validateModifiedOnly: true });

        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType,
                phone: user.phone,
                profileImage: user.profileImage,
                businessName: user.businessName,
                theme: user.theme
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Verify password FIRST, then send OTP email
// @route   POST /api/auth/send-otp-after-login
exports.sendOTPAfterLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { phone: email }]
        }).select('+password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'Account not found. Please create an account.' });
        }

        // Verify password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        if (user.accountStatus === 'suspended') {
            return res.status(403).json({ success: false, message: 'Account suspended. Contact support.' });
        }

        // Rate limit: max 1 OTP per 60 seconds
        const recentOTP = await OTP.findOne({
            email: user.email.toLowerCase(),
            createdAt: { $gt: new Date(Date.now() - 60000) }
        });
        if (recentOTP) {
            return res.status(429).json({ success: false, message: 'OTP already sent. Please wait 60 seconds before requesting again.' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Remove existing OTPs and save new one
        await OTP.deleteMany({ email: user.email.toLowerCase() });
        await OTP.create({ email: user.email.toLowerCase(), otp, purpose: 'verification' });

        // Send OTP via Resend email
        try {
            await sendOTPEmail(user.email, otp, user.name);
            console.log(`📧 OTP sent to ${user.email} (password verified)`);
        } catch (emailErr) {
            console.error(`❌ Email send failed for ${user.email}:`, emailErr.message);
            return res.status(500).json({ success: false, message: 'Failed to send OTP email. Please try again.' });
        }

        res.json({
            success: true,
            message: 'Password verified. OTP sent to your email.',
            userType: user.userType,
            userName: user.name
        });
    } catch (err) {
        console.error('Send OTP after login error:', err);
        res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
    }
};

// @desc    Send OTP (email-only, checks existence based on forSignup flag)
// @route   POST /api/auth/send-otp
exports.sendOTP = async (req, res) => {
    try {
        const { email, forSignup, name } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (forSignup) {
            if (user) {
                return res.status(409).json({ success: false, message: 'Email already registered. Please sign in.' });
            }
        } else {
            if (!user) {
                return res.status(404).json({ success: false, message: 'No account found with this email.' });
            }
            if (user.accountStatus === 'suspended') {
                return res.status(403).json({ success: false, message: 'Account suspended' });
            }
        }

        const recentOTP = await OTP.findOne({
            email: email.toLowerCase(),
            createdAt: { $gt: new Date(Date.now() - 60000) }
        });
        if (recentOTP) {
            return res.status(429).json({ success: false, message: 'Please wait 60 seconds before requesting a new OTP' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await OTP.deleteMany({ email: email.toLowerCase() });
        await OTP.create({ email: email.toLowerCase(), otp, purpose: 'verification' });

        try {
            await sendOTPEmail(email, otp, forSignup ? name : (user ? user.name : 'User'));
            console.log(`📧 OTP sent to ${email}`);
        } catch (emailErr) {
            console.error(`❌ Email send failed for ${email}:`, emailErr.message);
            return res.status(500).json({ success: false, message: 'Failed to send OTP email. Please try again.' });
        }

        res.json({
            success: true,
            message: 'OTP sent to your email.',
            userType: user ? user.userType : (forSignup ? 'new_user' : null),
        });
    } catch (err) {
        console.error('Send OTP error:', err);
        res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
    }
};

// @desc    Verify OTP (standalone, no login)
// @route   POST /api/auth/verify-otp
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const otpRecord = await OTP.findOne({ email: email.toLowerCase(), otp });
        if (!otpRecord) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        otpRecord.attempts += 1;
        if (otpRecord.attempts > 5) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(429).json({ success: false, message: 'Too many attempts. Please request a new OTP.' });
        }
        await otpRecord.save();

        await OTP.deleteOne({ _id: otpRecord._id });

        res.json({ success: true, message: 'OTP verified successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Login with OTP (verifies OTP → returns JWT)
// @route   POST /api/auth/login-with-otp
exports.loginWithOTP = async (req, res) => {
    try {
        const { email, otp, location } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        }

        // Verify OTP
        const otpRecord = await OTP.findOne({ email: email.toLowerCase(), otp });
        if (!otpRecord) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please try again.' });
        }

        otpRecord.attempts += 1;
        if (otpRecord.attempts > 5) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(429).json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' });
        }
        await otpRecord.save();

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.accountStatus === 'suspended') {
            return res.status(403).json({ success: false, message: 'Account suspended' });
        }

        // OTP verified — clean up and generate token
        await OTP.deleteOne({ _id: otpRecord._id });

        user.lastLogin = new Date();
        // Update location if provided
        if (location && location.lat && location.lng) {
            if (!user.address) user.address = {};
            user.address.coordinates = { lat: location.lat, lng: location.lng };
            if (location.city) user.address.city = location.city;
            if (location.state) user.address.state = location.state;
            if (location.street) user.address.street = location.street;
        }
        await user.save({ validateModifiedOnly: true });

        const token = generateToken(user._id);

        console.log(`✅ OTP login successful for ${email} (${user.userType})`);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType,
                phone: user.phone,
                profileImage: user.profileImage,
                businessName: user.businessName,
                theme: user.theme
            }
        });
    } catch (err) {
        console.error('Login with OTP error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Verify OTP without deleting (for forgot password flow)
// @route   POST /api/auth/verify-reset-otp
exports.verifyResetOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        }

        const otpRecord = await OTP.findOne({ email: email.toLowerCase(), otp });
        if (!otpRecord) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please try again.' });
        }

        otpRecord.attempts += 1;
        if (otpRecord.attempts > 5) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(429).json({ success: false, message: 'Too many failed attempts. Please request a new code.' });
        }
        await otpRecord.save();

        // Don't delete — keep for the reset-password step
        res.json({ success: true, message: 'OTP verified' });
    } catch (err) {
        console.error('Verify reset OTP error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Forgot password — send reset OTP to email
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ success: false, message: 'No account found with this email' });
        }

        // Rate limit
        const recentOTP = await OTP.findOne({
            email: user.email.toLowerCase(),
            createdAt: { $gt: new Date(Date.now() - 60000) }
        });
        if (recentOTP) {
            return res.status(429).json({ success: false, message: 'Please wait 60 seconds before requesting again.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await OTP.deleteMany({ email: user.email.toLowerCase() });
        await OTP.create({ email: user.email.toLowerCase(), otp, purpose: 'password_reset' });

        try {
            await sendOTPEmail(user.email, otp, user.name);
            console.log(`📧 Password reset OTP sent to ${user.email}`);
        } catch (emailErr) {
            console.error(`❌ Email send failed:`, emailErr.message);
            return res.status(500).json({ success: false, message: 'Failed to send email. Please try again.' });
        }

        res.json({ success: true, message: 'Password reset code sent to your email.' });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
        }

        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{10,}$/;
        if (!strongPasswordRegex.test(newPassword)) {
            return res.status(400).json({ success: false, message: 'Password must be at least 10 characters with 1 uppercase, 1 lowercase, and 1 special character' });
        }

        const otpRecord = await OTP.findOne({ email: email.toLowerCase(), otp });
        if (!otpRecord) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        await OTP.deleteOne({ _id: otpRecord._id });

        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.password = newPassword;
        await user.save();

        console.log(`✅ Password reset successful for ${email}`);
        res.json({ success: true, message: 'Password reset successful. You can now log in.' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
};
