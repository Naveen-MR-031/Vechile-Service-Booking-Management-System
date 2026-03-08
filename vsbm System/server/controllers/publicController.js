const Service = require('../models/Service');
const User = require('../models/User');
const Review = require('../models/Review');

// @desc    Get all active services (public)
// @route   GET /api/public/services
exports.getServices = async (req, res) => {
    try {
        const { category, search, page = 1, limit = 25 } = req.query;
        const query = { isActive: true };

        if (category) query.category = category;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [services, total] = await Promise.all([
            Service.find(query)
                .populate('serviceProviderId', 'name businessName rating totalReviews address businessLogo')
                .sort('-createdAt')
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

// @desc    Get all service providers (public)
// @route   GET /api/public/providers
exports.getProviders = async (req, res) => {
    try {
        const { city, search, sort, page = 1, limit = 20 } = req.query;
        const query = { userType: 'serviceProvider', isActive: true, accountStatus: 'active' };

        if (city) query['address.city'] = { $regex: city, $options: 'i' };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { businessName: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOption = sort === 'rating' ? '-rating' : '-createdAt';

        const [providers, total] = await Promise.all([
            User.find(query)
                .select('name businessName businessLogo description address rating totalReviews amenities servicesOffered')
                .sort(sortOption)
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(query)
        ]);

        res.json({
            success: true,
            count: providers.length,
            total,
            data: providers
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get single provider details (public)
// @route   GET /api/public/providers/:id
exports.getProviderById = async (req, res) => {
    try {
        const provider = await User.findOne({
            _id: req.params.id,
            userType: 'serviceProvider',
            isActive: true
        }).select('-password -resetPasswordToken -resetPasswordExpire');

        if (!provider) {
            return res.status(404).json({ success: false, message: 'Provider not found' });
        }

        const [services, reviews] = await Promise.all([
            Service.find({ serviceProviderId: provider._id, isActive: true }),
            Review.find({ providerId: provider._id, isHidden: false })
                .populate('customerId', 'name profileImage')
                .sort('-createdAt')
                .limit(10)
        ]);

        res.json({
            success: true,
            data: {
                provider,
                services,
                reviews
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get service categories (public)
// @route   GET /api/public/categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Service.distinct('category', { isActive: true });
        const categoriesWithCount = await Promise.all(
            categories.map(async (cat) => ({
                name: cat,
                count: await Service.countDocuments({ category: cat, isActive: true })
            }))
        );

        res.json({ success: true, data: categoriesWithCount });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
