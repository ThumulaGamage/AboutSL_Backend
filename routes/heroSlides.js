const express = require('express');
const router = express.Router();
const {
  getHeroSlides,
  getHeroSlide,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  toggleStatus,
  reorderSlides
} = require('../controllers/heroSlideController');

// Public routes
router.get('/', getHeroSlides);
router.get('/:id', getHeroSlide);

// Admin routes (add your auth middleware here if needed)
// Example: router.post('/', authMiddleware, createHeroSlide);
router.post('/', createHeroSlide);
router.put('/reorder', reorderSlides);  // Must be before /:id routes
router.put('/:id', updateHeroSlide);
router.delete('/:id', deleteHeroSlide);
router.patch('/:id/status', toggleStatus);

module.exports = router;