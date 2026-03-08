const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    serviceProviderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Service provider is required'],
        index: true
    },
    name: {
        type: String,
        required: [true, 'Service name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: [
            'General Service',
            'Oil Change',
            'Tire Service',
            'Water Service',
            'Battery Service',
            'Engine Repair',
            'AC Service',
            'Denting & Painting',
            'Brake Service',
            'Transmission',
            'Electrical',
            'Body Work',
            'Inspection',
            'Other'
        ]
    },
    basePrice: {
        type: Number,
        required: [true, 'Base price is required'],
        min: [0, 'Price cannot be negative']
    },
    estimatedDuration: {
        type: String,
        trim: true
    },
    vehicleTypes: [{
        type: String,
        enum: ['Car', 'Bike', 'Truck', 'Van']
    }],
    isActive: {
        type: Boolean,
        default: true
    },
}, {
    timestamps: true
});

// --- Indexes ---
serviceSchema.index({ category: 1 });
serviceSchema.index({ isActive: 1, category: 1 });

module.exports = mongoose.model('Service', serviceSchema);
