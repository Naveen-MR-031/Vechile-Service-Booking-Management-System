const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        unique: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Customer is required'],
        index: true
    },
    serviceProviderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Service provider is required'],
        index: true
    },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle'
    },
    vehicleDetails: {
        make: String,
        model: String,
        registrationNumber: String,
        year: Number
    },
    serviceType: {
        type: String,
        trim: true,
        default: 'General Service'
    },
    services: [{
        serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
        serviceName: String,
        quantity: { type: Number, default: 1 },
        unitPrice: Number,
        lineTotal: Number
    }],
    description: { type: String, maxlength: 2000 },
    preferredDate: {
        type: Date,
        required: [true, 'Preferred date is required']
    },
    preferredTimeSlot: { type: String },
    confirmedDate: Date,
    dropOffDate: Date,
    pickUpDate: Date,

    status: {
        type: String,
        enum: [
            'pending',
            'accepted',
            'vehiclePickedUp',
            'underService',
            'issuesIdentified',
            'estimateApproved',
            'qualityCheck',
            'readyForDelivery',
            'completed',
            'cancelled',
            'rejected'
        ],
        default: 'pending',
        index: true
    },
    statusHistory: [{
        status: String,
        timestamp: { type: Date, default: Date.now },
        notes: String
    }],

    estimatedCost: { type: Number, min: 0 },
    finalCost: { type: Number, min: 0 },
    discountApplied: {
        code: String,
        amount: Number
    },

    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: String,
    transactionId: String,

    customerNotes: { type: String, maxlength: 1000 },
    serviceProviderNotes: { type: String, maxlength: 1000 },

    // Emergency booking
    isEmergency: { type: Boolean, default: false },
    customerLocation: {
        lat: Number,
        lng: Number,
        address: String
    },
}, {
    timestamps: true
});

// --- Auto-generate bookingId ---
bookingSchema.pre('save', function (next) {
    if (!this.bookingId) {
        const date = new Date();
        const year = date.getFullYear().toString().substr(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(1000 + Math.random() * 9000);
        this.bookingId = `BK${year}${month}${day}-${random}`;
    }
    next();
});

// --- Indexes ---
bookingSchema.index({ customerId: 1, status: 1 });
bookingSchema.index({ serviceProviderId: 1, status: 1 });
bookingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
