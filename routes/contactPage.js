const express = require('express');
const router = express.Router();
const { getContactPage, updateContactPage } = require('../controllers/contactPageController');

// Public route
router.get('/', getContactPage);

// Admin route (add your auth middleware here if needed)
// Example: router.put('/', authMiddleware, updateContactPage);
router.put('/', updateContactPage);

module.exports = router;