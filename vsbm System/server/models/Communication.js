const mongoose = require('mongoose');

const communicationSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        index: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderRole: {
        type: String,
        enum: ['customer', 'serviceProvider', 'admin', 'system'],
        required: true
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'system_event'],
        default: 'text'
    },
    message: {
        type: String,
        maxlength: 2000
    },
    mediaUrl: { type: String },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
}, {
    timestamps: true
});

// --- Indexes ---
communicationSchema.index({ bookingId: 1, timestamp: 1 });
communicationSchema.index({ bookingId: 1, isRead: 1, senderRole: 1 });

module.exports = mongoose.model('Communication', communicationSchema);
