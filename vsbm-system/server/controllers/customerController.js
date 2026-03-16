const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Review = require('../models/Review');
const Issue = require('../models/Issue');
const Communication = require('../models/Communication');
const Discount = require('../models/Discount');

// ==================== PROFILE ====================

// @desc    Get customer profile
// @route   GET /api/customer/profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update customer profile
// @route   PUT /api/customer/profile
exports.updateProfile = async (req, res) => {
    try {
        const allowedFields = ['name', 'phone', 'address', 'profileImage', 'theme'];
        const updates = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const user = await User.findByIdAndUpdate(req.user._id, updates, {
            new: true,
            runValidators: true
        });

        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ==================== VEHICLES ====================

// @desc    Get customer vehicles
// @route   GET /api/customer/vehicles
exports.getVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ customerId: req.user._id, isActive: true })
            .sort({ isPrimary: -1, createdAt: -1 });
        res.json({ success: true, count: vehicles.length, data: vehicles });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Add a vehicle
// @route   POST /api/customer/vehicles
exports.addVehicle = async (req, res) => {
    try {
        const vehicleData = { ...req.body, customerId: req.user._id };

        // If this is the first vehicle or marked as primary, unset other primaries
        if (vehicleData.isPrimary) {
            await Vehicle.updateMany(
                { customerId: req.user._id },
                { isPrimary: false }
            );
        }

        const vehicle = await Vehicle.create(vehicleData);
        res.status(201).json({ success: true, data: vehicle });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update a vehicle
// @route   PUT /api/customer/vehicles/:id
exports.updateVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findOne({ _id: req.params.id, customerId: req.user._id });
        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        if (req.body.isPrimary) {
            await Vehicle.updateMany(
                { customerId: req.user._id, _id: { $ne: req.params.id } },
                { isPrimary: false }
            );
        }

        const updated = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Delete a vehicle (soft delete)
// @route   DELETE /api/customer/vehicles/:id
exports.deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findOne({ _id: req.params.id, customerId: req.user._id });
        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        vehicle.isActive = false;
        await vehicle.save();

        res.json({ success: true, message: 'Vehicle removed' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ==================== SERVICES ====================

// @desc    Browse available services
// @route   GET /api/customer/services
exports.getServices = async (req, res) => {
    try {
        const { category, search, sort, page = 1, limit = 25 } = req.query;
        const query = { isActive: true };

        if (category) query.category = category;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOption = sort ? sort.replace(',', ' ') : '-createdAt';

        const [services, total] = await Promise.all([
            Service.find(query)
                .populate('serviceProviderId', 'name businessName rating totalReviews address')
                .sort(sortOption)
                .skip(skip)
                .limit(parseInt(limit)),
            Service.countDocuments(query)
        ]);

        res.json({
            success: true,
            count: services.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: services
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ==================== BOOKINGS ====================

// @desc    Create a booking
// @route   POST /api/customer/bookings
exports.createBooking = async (req, res) => {
    try {
        const {
            serviceProviderId, vehicleId, serviceType, services,
            preferredDate, preferredTimeSlot, description, estimatedCost,
            vehicleDetails, isEmergency, customerLocation
        } = req.body;

        const bookingData = {
            customerId: req.user._id,
            serviceProviderId,
            vehicleId,
            serviceType: serviceType || (services && services[0]?.serviceName) || 'General Service',
            services,
            preferredDate: isEmergency ? new Date() : preferredDate,
            preferredTimeSlot,
            description,
            estimatedCost,
            vehicleDetails,
            isEmergency: !!isEmergency,
            customerLocation: customerLocation || undefined,
            status: 'pending',
            statusHistory: [{
                status: 'pending',
                notes: isEmergency ? '🚨 EMERGENCY booking created by customer' : 'Booking created by customer'
            }]
        };

        const booking = await Booking.create(bookingData);

        // Real-time notification to provider (emergency gets priority flag)
        const io = req.app.get('io');
        io.to(serviceProviderId.toString()).emit('newBooking', { booking, isEmergency: !!isEmergency });

        res.status(201).json({ success: true, data: booking });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get customer bookings
// @route   GET /api/customer/bookings
exports.getBookings = async (req, res) => {
    try {
        const { status } = req.query;
        const query = { customerId: req.user._id };
        if (status) query.status = status;

        const bookings = await Booking.find(query)
            .populate('serviceProviderId', 'name businessName phone address rating')
            .populate('vehicleId', 'make model registrationNumber vehicleType')
            .sort('-createdAt');

        res.json({ success: true, count: bookings.length, data: bookings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get single booking details
// @route   GET /api/customer/bookings/:id
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, customerId: req.user._id })
            .populate('serviceProviderId', 'name businessName phone address rating')
            .populate('vehicleId');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Also fetch related issues and communications
        const [issues, communications] = await Promise.all([
            Issue.find({ bookingId: booking._id }).sort('-createdAt'),
            Communication.find({ bookingId: booking._id, isDeleted: false }).sort('timestamp')
        ]);

        res.json({
            success: true,
            data: { ...booking.toObject(), issues, communications }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Cancel a booking
// @route   PUT /api/customer/bookings/:id/cancel
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, customerId: req.user._id });
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (['completed', 'cancelled'].includes(booking.status)) {
            return res.status(400).json({ success: false, message: 'Cannot cancel this booking' });
        }

        booking.status = 'cancelled';
        booking.statusHistory.push({
            status: 'cancelled',
            notes: req.body.reason || 'Cancelled by customer'
        });
        await booking.save();

        const io = req.app.get('io');
        io.to(booking.serviceProviderId.toString()).emit('bookingStatusUpdate', {
            bookingId: booking._id,
            status: 'cancelled',
            booking
        });

        res.json({ success: true, data: booking });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ==================== ISSUES (Customer Response) ====================

// @desc    Get issues for a booking
// @route   GET /api/customer/bookings/:bookingId/issues
exports.getIssues = async (req, res) => {
    try {
        const issues = await Issue.find({ bookingId: req.params.bookingId })
            .populate('reportedBy', 'name')
            .sort('-createdAt');
        res.json({ success: true, data: issues });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Approve an issue
// @route   PUT /api/customer/issues/:id/approve
exports.approveIssue = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) {
            return res.status(404).json({ success: false, message: 'Issue not found' });
        }

        issue.issueStatus = 'approved';
        issue.customerResponseAt = new Date();
        await issue.save();

        // Update booking estimated cost
        const booking = await Booking.findById(issue.bookingId);
        if (booking) {
            booking.estimatedCost = (booking.estimatedCost || 0) + issue.estimatedAdditionalCost;
            await booking.save();
        }

        res.json({ success: true, data: issue });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Decline an issue
// @route   PUT /api/customer/issues/:id/decline
exports.declineIssue = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) {
            return res.status(404).json({ success: false, message: 'Issue not found' });
        }

        issue.issueStatus = 'declined';
        issue.declineReason = req.body.reason || '';
        issue.customerResponseAt = new Date();
        await issue.save();

        res.json({ success: true, data: issue });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ==================== COMMUNICATIONS ====================

// @desc    Get messages for a booking
// @route   GET /api/customer/bookings/:bookingId/messages
exports.getMessages = async (req, res) => {
    try {
        const messages = await Communication.find({
            bookingId: req.params.bookingId,
            isDeleted: false
        }).sort('timestamp');

        // Mark unread messages as read
        await Communication.updateMany(
            { bookingId: req.params.bookingId, senderRole: { $ne: 'customer' }, isRead: false },
            { isRead: true, readAt: new Date() }
        );

        res.json({ success: true, data: messages });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Send a message
// @route   POST /api/customer/bookings/:bookingId/messages
exports.sendMessage = async (req, res) => {
    try {
        const msg = await Communication.create({
            bookingId: req.params.bookingId,
            senderId: req.user._id,
            senderRole: 'customer',
            message: req.body.message,
            messageType: req.body.messageType || 'text',
            mediaUrl: req.body.mediaUrl
        });

        // Real-time
        const io = req.app.get('io');
        io.to(`booking:${req.params.bookingId}`).emit('newMessage', msg);

        res.status(201).json({ success: true, data: msg });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ==================== REVIEWS ====================

// @desc    Create a review
// @route   POST /api/customer/reviews
exports.createReview = async (req, res) => {
    try {
        const { bookingId, rating, title, comment } = req.body;

        // Verify booking belongs to customer and is completed
        const booking = await Booking.findOne({
            _id: bookingId,
            customerId: req.user._id,
            status: 'completed'
        });

        if (!booking) {
            return res.status(400).json({ success: false, message: 'Can only review completed bookings' });
        }

        // Check if already reviewed
        const existing = await Review.findOne({ bookingId });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Booking already reviewed' });
        }

        const review = await Review.create({
            bookingId,
            customerId: req.user._id,
            providerId: booking.serviceProviderId,
            rating,
            title,
            comment
        });

        res.status(201).json({ success: true, data: review });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get customer's reviews
// @route   GET /api/customer/reviews
exports.getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ customerId: req.user._id })
            .populate('providerId', 'name businessName')
            .populate('bookingId', 'bookingId serviceType')
            .sort('-createdAt');
        res.json({ success: true, data: reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ==================== DISCOUNTS ====================

// @desc    Get all active, non-expired discounts visible to customers
// @route   GET /api/customer/discounts
exports.getDiscounts = async (req, res) => {
    try {
        const now = new Date();
        const discounts = await Discount.find({
            isActive: true,
            validFrom: { $lte: now },
            validUntil: { $gte: now },
            $or: [
                { maxUsageCount: null },
                { maxUsageCount: 0 },
                { $expr: { $lt: ['$currentUsageCount', '$maxUsageCount'] } }
            ]
        })
            .populate('serviceProviderId', 'name businessName businessLogo address')
            .populate('applicableServices', 'name category basePrice')
            .sort('-createdAt');

        res.json({ success: true, count: discounts.length, data: discounts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get nearby service providers for emergency booking
// @route   GET /api/customer/nearby-providers?lat=&lng=&radius=20
exports.getNearbyProviders = async (req, res) => {
    try {
        const { lat, lng, radius = 20 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ success: false, message: 'Location (lat, lng) is required' });
        }

        const radiusInKm = parseFloat(radius);
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);

        // Use address.coordinates for providers (lat/lng based distance calculation)
        const providers = await User.find({
            userType: 'serviceProvider',
            isActive: true,
            accountStatus: 'active',
            'address.coordinates.lat': { $exists: true },
            'address.coordinates.lng': { $exists: true }
        }).select('name businessName businessLogo description address rating totalReviews servicesOffered');

        // Calculate distance for each provider using Haversine formula
        const toRad = (v) => (v * Math.PI) / 180;
        const haversine = (lat1, lon1, lat2, lon2) => {
            const R = 6371; // Earth's radius in km
            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);
            const a = Math.sin(dLat / 2) ** 2 +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
            return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        };

        const nearby = providers
            .map(p => {
                const dist = haversine(
                    latNum, lngNum,
                    p.address.coordinates.lat,
                    p.address.coordinates.lng
                );
                return { ...p.toObject(), distanceKm: Math.round(dist * 10) / 10 };
            })
            .filter(p => p.distanceKm <= radiusInKm)
            .sort((a, b) => a.distanceKm - b.distanceKm);

        res.json({ success: true, count: nearby.length, data: nearby });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Validate a discount code
// @route   POST /api/customer/discounts/validate
exports.validateDiscount = async (req, res) => {
    try {
        const { code, providerId } = req.body;
        const now = new Date();

        const discount = await Discount.findOne({
            discountCode: code.toUpperCase(),
            serviceProviderId: providerId,
            isActive: true,
            validFrom: { $lte: now },
            validUntil: { $gte: now }
        });

        if (!discount) {
            return res.status(404).json({ success: false, message: 'Invalid or expired discount code' });
        }

        if (discount.maxUsageCount && discount.currentUsageCount >= discount.maxUsageCount) {
            return res.status(400).json({ success: false, message: 'Discount code usage limit reached' });
        }

        res.json({ success: true, data: discount });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
