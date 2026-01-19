const express = require('express');
const router = express.Router();
const {
  getDestinations,
  getDestination,
  createDestination,
  updateDestination,
  deleteDestination,
  toggleStatus,
} = require('../controllers/destinationController');

const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getDestinations);
router.get('/:id', getDestination);

// Admin routes
router.post('/', protect, authorize('super-admin', 'admin'), createDestination);
router.put(
  '/:id',
  protect,
  authorize('super-admin', 'admin'),
  updateDestination
);
router.delete(
  '/:id',
  protect,
  authorize('super-admin', 'admin'),
  deleteDestination
);
router.patch(
  '/:id/status',
  protect,
  authorize('super-admin', 'admin'),
  toggleStatus
);

module.exports = router;
