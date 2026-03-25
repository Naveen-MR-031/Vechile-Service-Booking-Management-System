const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [10, 'Password must be at least 10 characters'],
        validate: {
            validator: function (v) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{10,}$/.test(v);
            },
            message: 'Password must be at least 10 characters with 1 uppercase, 1 lowercase, and 1 special character'
        },
        select: false
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    phone: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    userType: {
        type: String,
        enum: ['customer', 'serviceProvider', 'admin'],
        default: 'customer'
    },

    // --- Customer-specific fields ---
    profileImage: { type: String },

    // --- Service Provider-specific fields ---
    businessName: { type: String, trim: true },
    licenseNumber: { type: String, trim: true },
    gstNumber: { type: String, trim: true },
    description: { type: String, maxlength: 2000 },
    servicesOffered: [{ type: String }],
    businessLogo: { type: String },
    amenities: [{ type: String }],
    businessHours: {
        monday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
        tuesday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
        wednesday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
        thursday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
        friday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
        saturday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
        sunday: { open: String, close: String, isClosed: { type: Boolean, default: true } },
    },

    // --- Shared ---
    address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        zipCode: { type: String, trim: true },
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    accountStatus: {
        type: String,
        enum: ['active', 'suspended', 'deactivated'],
        default: 'active'
    },
    theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
    },
    lastLogin: { type: Date },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, {
    timestamps: true
});

// --- Indexes ---
userSchema.index({ userType: 1 });
userSchema.index({ 'address.city': 1 });

// --- Pre-save: hash password ---
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// --- Instance methods ---
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins
    return resetToken;
};

// --- Remove sensitive fields from JSON output ---
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.resetPasswordToken;
    delete obj.resetPasswordExpire;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
