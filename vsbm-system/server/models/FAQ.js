const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
    serviceProviderId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: 'General'
    },
    displayOrder: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('FAQ', faqSchema);
