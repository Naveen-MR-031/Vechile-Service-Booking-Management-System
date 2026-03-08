const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        unique: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Rating is required']
    },
    title: {
        type: String,
        trim: true,
        maxlength: 100
    },
    comment: {
        type: String,
        trim: true,
        maxlength: 2000
    },
    isVerified: { type: Boolean, default: true },
    isHidden: { type: Boolean, default: false },
    providerReply: { type: String, maxlength: 1000 },
    providerReplyAt: { type: Date },
    helpfulCount: { type: Number, default: 0 },
}, {
    timestamps: true
});

// After save, recalculate provider's average rating
reviewSchema.post('save', async function () {
    try {
        const result = await this.constructor.aggregate([
            { $match: { providerId: this.providerId, isHidden: false } },
            { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);
        if (result.length) {
            await mongoose.model('User').findByIdAndUpdate(this.providerId, {
                rating: Math.round(result[0].avg * 10) / 10,
                totalReviews: result[0].count,
            });
        }
    } catch (err) {
        console.error('Error updating provider rating:', err.message);
    }
});

// --- Indexes ---
reviewSchema.index({ providerId: 1, rating: 1 });
reviewSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
