const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
    serviceProviderId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    discountCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    discountValue: {
        type: Number,
        required: true
    },
    applicableServices: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Service'
    }],
    validFrom: {
        type: Date,
        default: Date.now
    },
    validUntil: {
        type: Date,
        required: true
    },
    maxUsageCount: Number,
    currentUsageCount: {
        type: Number,
        default: 0
    },
    minBookingAmount: Number,
    maxDiscountAmount: Number, // For percentage based discounts
    isActive: {
        type: Boolean,
        default: true
    },
    termsAndConditions: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Discount', discountSchema);
