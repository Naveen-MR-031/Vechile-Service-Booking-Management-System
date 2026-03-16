const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Customer is required'],
        index: true
    },
    vehicleType: {
        type: String,
        enum: ['Car', 'Bike', 'Truck', 'Van'],
        required: [true, 'Vehicle type is required']
    },
    make: {
        type: String,
        trim: true,
        required: [true, 'Make is required']
    },
    model: {
        type: String,
        trim: true,
        required: [true, 'Model is required']
    },
    year: {
        type: Number,
        min: 1900,
        max: new Date().getFullYear() + 1,
        required: [true, 'Year is required']
    },
    registrationNumber: {
        type: String,
        trim: true,
        uppercase: true,
        required: [true, 'Registration number is required']
    },
    vin: {
        type: String,
        trim: true,
        uppercase: true
    },
    color: {
        type: String,
        trim: true
    },
    transmission: {
        type: String,
        enum: ['Automatic', 'Manual', 'CVT']
    },
    fuelType: {
        type: String,
        enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG']
    },
    engineCapacity: { type: String },
    odometerKm: { type: Number, min: 0, default: 0 },
    insuranceExpiry: { type: Date },
    isPrimary: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true
});

// --- Indexes ---
vehicleSchema.index({ customerId: 1, isPrimary: 1 });
vehicleSchema.index({ registrationNumber: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
