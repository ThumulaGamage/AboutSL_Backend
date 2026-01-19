const express = require('express');
const router = express.Router();
const {
  uploadSingle,
  uploadMultiple,
  uploadImage,
  uploadImages,
  deleteImage
} = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

// All upload routes are protected (Admin only)
router.post('/image', protect, uploadSingle, uploadImage);
router.post('/images', protect, uploadMultiple, uploadImages);
router.delete('/:publicId', protect, deleteImage);

module.exports = router;
