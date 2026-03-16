const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        index: true
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    issueTitle: {
        type: String,
        trim: true,
        maxlength: 200,
        required: [true, 'Issue title is required']
    },
    issueDescription: {
        type: String,
        maxlength: 2000,
        required: [true, 'Issue description is required']
    },
    issueType: {
        type: String,
        enum: ['Mechanical', 'Electrical', 'Cosmetic', 'Safety', 'Fluid', 'Tyre', 'Other'],
        required: [true, 'Issue type is required']
    },
    severity: {
        type: String,
        enum: ['Low', 'Minor', 'Moderate', 'High', 'Major', 'Critical'],
        required: [true, 'Severity is required']
    },
    estimatedAdditionalCost: {
        type: Number,
        min: 0,
        required: [true, 'Estimated cost is required']
    },
    estimatedDurationAddedMin: {
        type: Number,
        min: 0,
        default: 0
    },
    issueStatus: {
        type: String,
        enum: ['pending_approval', 'approved', 'declined', 'deferred'],
        default: 'pending_approval'
    },
    customerResponseAt: { type: Date },
    declineReason: { type: String, maxlength: 500 },
    evidenceUrls: [{ type: String }],
    identifiedAt: { type: Date, default: Date.now },
}, {
    timestamps: true
});

// --- Indexes ---
issueSchema.index({ bookingId: 1, issueStatus: 1 });
issueSchema.index({ reportedBy: 1 });

module.exports = mongoose.model('Issue', issueSchema);
