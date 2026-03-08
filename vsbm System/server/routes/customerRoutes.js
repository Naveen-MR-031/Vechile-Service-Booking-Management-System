const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getProfile,
    updateProfile,
    getVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    getServices,
    createBooking,
    getBookings,
    getBookingById,
    cancelBooking,
    getIssues,
    approveIssue,
    declineIssue,
    getMessages,
    sendMessage,
    createReview,
    getMyReviews,
    getDiscounts,
    validateDiscount,
    getNearbyProviders
} = require('../controllers/customerController');

// All routes require auth + customer role
router.use(protect);
router.use(authorize('customer'));

// Profile
router.route('/profile').get(getProfile).put(updateProfile);

// Vehicles
router.route('/vehicles').get(getVehicles).post(addVehicle);
router.route('/vehicles/:id').put(updateVehicle).delete(deleteVehicle);

// Services
router.route('/services').get(getServices);

// Bookings
router.route('/bookings').get(getBookings).post(createBooking);
router.route('/bookings/:id').get(getBookingById);
router.route('/bookings/:id/cancel').put(cancelBooking);

// Issues
router.route('/bookings/:bookingId/issues').get(getIssues);
router.route('/issues/:id/approve').put(approveIssue);
router.route('/issues/:id/decline').put(declineIssue);

// Communications
router.route('/bookings/:bookingId/messages').get(getMessages).post(sendMessage);

// Reviews
router.route('/reviews').get(getMyReviews).post(createReview);

// Discounts
router.route('/discounts').get(getDiscounts);
router.route('/discounts/validate').post(validateDiscount);

// Emergency
router.route('/nearby-providers').get(getNearbyProviders);

module.exports = router;
