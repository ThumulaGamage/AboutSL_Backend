const express = require('express');
const router = express.Router();
const {
  getReviews,
  createReview,
  approveReview,
  rejectReview,
  updateReview,
  deleteReview,
  markHelpful
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/:itemType/:itemId', getReviews);
router.post('/', createReview);
router.post('/:id/helpful', markHelpful);

// Protected routes (Admin only)
router.patch('/:id/approve', protect, approveReview);
router.patch('/:id/reject', protect, rejectReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
