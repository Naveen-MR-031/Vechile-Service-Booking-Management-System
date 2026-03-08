const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    bookingId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Booking',
        required: true
    },
    customerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    serviceProviderId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    invoiceDate: {
        type: Date,
        default: Date.now
    },
    dueDate: Date,

    items: [{
        description: String,
        quantity: {
            type: Number,
            default: 1
        },
        unitPrice: Number,
        totalPrice: Number
    }],

    subtotal: Number,
    discountApplied: Number,
    taxAmount: Number, // GST
    totalAmount: Number,

    paymentStatus: {
        type: String,
        enum: ['paid', 'unpaid', 'partial'],
        default: 'unpaid'
    },
    amountPaid: {
        type: Number,
        default: 0
    },

    notes: String,
    pdfUrl: String, // Store URL if generated and saved

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
