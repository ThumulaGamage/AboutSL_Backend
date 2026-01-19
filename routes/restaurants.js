const express = require('express');
const router = express.Router();
const {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  toggleStatus
} = require('../controllers/restaurantController');

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getRestaurants);
router.get('/:id', getRestaurant);

// Admin routes
router.post('/', protect, authorize('super-admin', 'admin'), createRestaurant);
router.put('/:id', protect, authorize('super-admin', 'admin'), updateRestaurant);
router.delete('/:id', protect, authorize('super-admin', 'admin'), deleteRestaurant);
router.patch('/:id/status', protect, authorize('super-admin', 'admin'), toggleStatus);

module.exports = router;