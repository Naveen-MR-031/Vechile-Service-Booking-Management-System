const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getProfile,
    updateProfile,
    createService,
    getMyServices,
    updateService,
    deleteService,
    getBookings,
    getBookingById,
    updateBookingStatus,
    addIssue,
    getIssues,
    getMessages,
    sendMessage,
    createDiscount,
    getDiscounts,
    updateDiscount,
    getReviews,
    replyToReview,
    getStats
} = require('../controllers/serviceProviderController');

// All routes require auth + serviceProvider role
router.use(protect);
router.use(authorize('serviceProvider'));

// Profile
router.route('/profile').get(getProfile).put(updateProfile);

// Services
router.route('/services').get(getMyServices).post(createService);
router.route('/services/:id').put(updateService).delete(deleteService);

// Bookings
router.route('/bookings').get(getBookings);
router.route('/bookings/:id').get(getBookingById);
router.route('/bookings/:id/status').put(updateBookingStatus);

// Issues
router.route('/bookings/:bookingId/issues').get(getIssues).post(addIssue);

// Communications
router.route('/bookings/:bookingId/messages').get(getMessages).post(sendMessage);

// Discounts
router.route('/discounts').get(getDiscounts).post(createDiscount);
router.route('/discounts/:id').put(updateDiscount);

// Reviews
router.route('/reviews').get(getReviews);
router.route('/reviews/:id/reply').put(replyToReview);

// Stats
router.route('/stats').get(getStats);

module.exports = router;
