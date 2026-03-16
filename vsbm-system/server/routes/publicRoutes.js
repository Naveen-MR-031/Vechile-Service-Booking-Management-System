const express = require('express');
const router = express.Router();
const {
    getServices,
    getProviders,
    getProviderById,
    getCategories
} = require('../controllers/publicController');

// All public — no auth required
router.get('/services', getServices);
router.get('/providers', getProviders);
router.get('/providers/:id', getProviderById);
router.get('/categories', getCategories);

module.exports = router;
