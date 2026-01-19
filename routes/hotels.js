const express = require('express');
const router = express.Router();
const {
  getHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel,
  toggleStatus
} = require('../controllers/hotelController');

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getHotels);
router.get('/:id', getHotel);

// Admin routes
router.post('/', protect, authorize('super-admin', 'admin'), createHotel);
router.put('/:id', protect, authorize('super-admin', 'admin'), updateHotel);
router.delete('/:id', protect, authorize('super-admin', 'admin'), deleteHotel);
router.patch('/:id/status', protect, authorize('super-admin', 'admin'), toggleStatus);

module.exports = router;