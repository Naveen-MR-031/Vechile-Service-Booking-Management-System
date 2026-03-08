const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Discount = require('../models/Discount');
const Invoice = require('../models/Invoice');
const Issue = require('../models/Issue');
const Communication = require('../models/Communication');
const Review = require('../models/Review');

// ==================== PROFILE ====================

// @desc    Get provider profile
// @route   GET /api/service-provider/profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update provider profile
// @route   PUT /api/service-provider/profile
exports.updateProfile = async (req, res) => {
    try {
        const allowedFields = [
            'name', 'phone', 'businessName', 'description', 'address',
            'businessLogo', 'amenities', 'businessHours', 'theme',
            'licenseNumber', 'gstNumber'
        ];
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

// ==================== SERVICES ====================

// @desc    Create a new service
// @route   POST /api/service-provider/services
exports.createService = async (req, res) => {
    try {
        req.body.serviceProviderId = req.user._id;
        const service = await Service.create(req.body);

        // Add to provider's servicesOffered list
        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { servicesOffered: req.body.name }
        });

        res.status(201).json({ success: true, data: service });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get provider's services
// @route   GET /api/service-provider/services
exports.getMyServices = async (req, res) => {
    try {
        const services = await Service.find({ serviceProviderId: req.user._id })
            .sort('-createdAt');
        res.json({ success: true, count: services.length, data: services });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update a service
// @route   PUT /api/service-provider/services/:id
exports.updateService = async (req, res) => {
    try {
        const service = await Service.findOne({ _id: req.params.id, serviceProviderId: req.user._id });
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        const updated = await Service.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Delete a service
// @route   DELETE /api/service-provider/services/:id
exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findOneAndDelete({
            _id: req.params.id,
            serviceProviderId: req.user._id
        });

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        res.json({ success: true, message: 'Service deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ==================== BOOKINGS ====================

// @desc    Get provider's bookings
// @route   GET /api/service-provider/bookings
exports.getBookings = async (req, res) => {
    try {
        const { status } = req.query;
        const query = { serviceProviderId: req.user._id };
        if (status) query.status = status;

        const bookings = await Booking.find(query)
            .populate('customerId', 'name phone email profileImage')
            .populate('vehicleId', 'make model registrationNumber vehicleType year color')
            .sort('-createdAt');

        res.json({ success: true, count: bookings.length, data: bookings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get single booking details
// @route   GET /api/service-provider/bookings/:id
exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, serviceProviderId: req.user._id })
            .populate('customerId', 'name phone email profileImage')
            .populate('vehicleId');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

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

// @desc    Update booking status
// @route   PUT /api/service-provider/bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status, notes, additionalData, confirmedDate, pickUpDate, dropOffDate, serviceProviderNotes } = req.body;

        let booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (booking.serviceProviderId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const updateData = {
            status,
            $push: {
                statusHistory: { status, notes, timestamp: Date.now() }
            }
        };

        // Provider explicitly sets dates via Accept modal
        if (status === 'accepted') {
            updateData.confirmedDate = confirmedDate ? new Date(confirmedDate) : Date.now();
            if (pickUpDate) updateData.pickUpDate = new Date(pickUpDate);
            if (dropOffDate) updateData.dropOffDate = new Date(dropOffDate);
            if (serviceProviderNotes) updateData.serviceProviderNotes = serviceProviderNotes;
        }
        if (status === 'vehiclePickedUp') updateData.dropOffDate = dropOffDate ? new Date(dropOffDate) : Date.now();
        if (status === 'completed') updateData.pickUpDate = pickUpDate ? new Date(pickUpDate) : Date.now();

        if (additionalData) Object.assign(updateData, additionalData);

        booking = await Booking.findByIdAndUpdate(req.params.id, updateData, { new: true })
            .populate('customerId', 'name phone email');

        // Real-time notification
        const io = req.app.get('io');
        io.to(booking.customerId._id.toString()).emit('bookingStatusUpdate', {
            bookingId: booking._id,
            status,
            booking
        });

        res.json({ success: true, data: booking });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    };
};

// ==================== ISSUES ====================

// @desc    Add an issue to a booking
// @route   POST /api/service-provider/bookings/:bookingId/issues
exports.addIssue = async (req, res) => {
    try {
        const booking = await Booking.findOne({
            _id: req.params.bookingId,
            serviceProviderId: req.user._id
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        const issue = await Issue.create({
            bookingId: req.params.bookingId,
            reportedBy: req.user._id,
            issueTitle: req.body.issueTitle,
            issueDescription: req.body.issueDescription,
            issueType: req.body.issueType,
            severity: req.body.severity,
            estimatedAdditionalCost: req.body.estimatedAdditionalCost,
            estimatedDurationAddedMin: req.body.estimatedDurationAddedMin,
            evidenceUrls: req.body.evidenceUrls
        });

        // Update booking status
        if (booking.status !== 'issuesIdentified') {
            booking.status = 'issuesIdentified';
            booking.statusHistory.push({
                status: 'issuesIdentified',
                notes: `Issue reported: ${req.body.issueTitle}`
            });
            await booking.save();
        }

        // Notify customer
        const io = req.app.get('io');
        io.to(booking.customerId.toString()).emit('issueReported', { issue, bookingId: booking._id });

        res.status(201).json({ success: true, data: issue });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get issues for a booking
// @route   GET /api/service-provider/bookings/:bookingId/issues
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

// ==================== COMMUNICATIONS ====================

// @desc    Get messages for a booking
// @route   GET /api/service-provider/bookings/:bookingId/messages
exports.getMessages = async (req, res) => {
    try {
        const messages = await Communication.find({
            bookingId: req.params.bookingId,
            isDeleted: false
        }).sort('timestamp');

        // Mark customer messages as read
        await Communication.updateMany(
            { bookingId: req.params.bookingId, senderRole: 'customer', isRead: false },
            { isRead: true, readAt: new Date() }
        );

        res.json({ success: true, data: messages });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Send a message
// @route   POST /api/service-provider/bookings/:bookingId/messages
exports.sendMessage = async (req, res) => {
    try {
        const msg = await Communication.create({
            bookingId: req.params.bookingId,
            senderId: req.user._id,
            senderRole: 'serviceProvider',
            message: req.body.message,
            messageType: req.body.messageType || 'text',
            mediaUrl: req.body.mediaUrl
        });

        const io = req.app.get('io');
        io.to(`booking:${req.params.bookingId}`).emit('newMessage', msg);

        res.status(201).json({ success: true, data: msg });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ==================== DISCOUNTS ====================

// @desc    Create a discount
// @route   POST /api/service-provider/discounts
exports.createDiscount = async (req, res) => {
    try {
        req.body.serviceProviderId = req.user._id;
        const discount = await Discount.create(req.body);
        res.status(201).json({ success: true, data: discount });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get provider discounts
// @route   GET /api/service-provider/discounts
exports.getDiscounts = async (req, res) => {
    try {
        const discounts = await Discount.find({ serviceProviderId: req.user._id })
            .sort('-createdAt');
        res.json({ success: true, count: discounts.length, data: discounts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update a discount
// @route   PUT /api/service-provider/discounts/:id
exports.updateDiscount = async (req, res) => {
    try {
        const discount = await Discount.findOne({ _id: req.params.id, serviceProviderId: req.user._id });
        if (!discount) {
            return res.status(404).json({ success: false, message: 'Discount not found' });
        }

        const updated = await Discount.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ==================== REVIEWS ====================

// @desc    Get reviews for the provider
// @route   GET /api/service-provider/reviews
exports.getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ providerId: req.user._id, isHidden: false })
            .populate('customerId', 'name profileImage')
            .populate('bookingId', 'bookingId serviceType')
            .sort('-createdAt');
        res.json({ success: true, data: reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Reply to a review
// @route   PUT /api/service-provider/reviews/:id/reply
exports.replyToReview = async (req, res) => {
    try {
        const review = await Review.findOne({ _id: req.params.id, providerId: req.user._id });
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        review.providerReply = req.body.reply;
        review.providerReplyAt = new Date();
        await review.save();

        res.json({ success: true, data: review });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ==================== DASHBOARD STATS ====================

// @desc    Get provider dashboard stats
// @route   GET /api/service-provider/stats
exports.getStats = async (req, res) => {
    try {
        const providerId = req.user._id;

        const [bookings, services, user, reviews] = await Promise.all([
            Booking.find({ serviceProviderId: providerId }),
            Service.find({ serviceProviderId: providerId }),
            User.findById(providerId),
            Review.find({ providerId, isHidden: false })
        ]);

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const activeStatuses = ['accepted', 'vehiclePickedUp', 'underService', 'issuesIdentified', 'qualityCheck', 'readyForDelivery'];
        const completedBookings = bookings.filter(b => b.status === 'completed');

        const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.finalCost || b.estimatedCost || 0), 0);
        const monthlyEarnings = completedBookings
            .filter(b => new Date(b.createdAt) >= startOfMonth)
            .reduce((sum, b) => sum + (b.finalCost || b.estimatedCost || 0), 0);

        res.json({
            success: true,
            data: {
                totalJobs: bookings.length,
                activeJobs: bookings.filter(b => activeStatuses.includes(b.status)).length,
                pendingJobs: bookings.filter(b => b.status === 'pending').length,
                completedJobs: completedBookings.length,
                cancelledJobs: bookings.filter(b => b.status === 'cancelled').length,
                totalEarnings,
                monthlyEarnings,
                totalServices: services.length,
                activeServices: services.filter(s => s.isActive).length,
                rating: user.rating || 0,
                totalReviews: user.totalReviews || 0,
                recentReviews: reviews.slice(0, 5)
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
