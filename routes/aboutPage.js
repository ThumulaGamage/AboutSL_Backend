const express = require('express');
const router = express.Router();
const { getAboutPage, updateAboutPage } = require('../controllers/aboutPageController');

// Public route
router.get('/', getAboutPage);

// Admin route (add your auth middleware here if needed)
// Example: router.put('/', authMiddleware, updateAboutPage);
router.put('/', updateAboutPage);

module.exports = router;