const Review = require('../models/Review');

// @desc    Get reviews for an item
// @route   GET /api/reviews/:itemType/:itemId
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const { itemType, itemId } = req.params;

    // Validate itemType
    if (!['Destination', 'Hotel', 'Restaurant'].includes(itemType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item type'
      });
    }

    const query = { itemType, itemId };
    
    // Only show approved reviews to public
    if (!req.admin) {
      query.status = 'approved';
    }

    const reviews = await Review.find(query)
      .sort('-createdAt')
      .limit(parseInt(req.query.limit) || 50);

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Submit a review
// @route   POST /api/reviews
// @access  Public
exports.createReview = async (req, res) => {
  try {
    const review = await Review.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully and pending approval',
      data: review
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve review
// @route   PATCH /api/reviews/:id/approve
// @access  Private (Admin)
exports.approveReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.status = 'approved';
    review.moderatedBy = req.admin.id;
    review.moderatedAt = Date.now();

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review approved successfully',
      data: review
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject review
// @route   PATCH /api/reviews/:id/reject
// @access  Private (Admin)
exports.rejectReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.status = 'rejected';
    review.moderatedBy = req.admin.id;
    review.moderatedAt = Date.now();

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review rejected successfully',
      data: review
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (Admin)
exports.updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Admin)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Public
exports.markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.helpful += 1;
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Thank you for your feedback',
      data: review
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
