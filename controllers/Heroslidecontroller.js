const HeroSlide = require('../models/Heroslide');

// @desc    Get all hero slides
// @route   GET /api/hero-slides
// @access  Public
exports.getHeroSlides = async (req, res) => {
  try {
    const query = req.admin ? {} : { status: 'active' };
    
    const slides = await HeroSlide.findAll({
      where: query,
      order: [['order', 'ASC'], ['createdAt', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: slides.length,
      data: slides
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single hero slide
// @route   GET /api/hero-slides/:id
// @access  Public
exports.getHeroSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findByPk(req.params.id);

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Slide not found'
      });
    }

    res.status(200).json({
      success: true,
      data: slide
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new hero slide
// @route   POST /api/hero-slides
// @access  Private (Admin)
exports.createHeroSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Slide created successfully',
      data: slide
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update hero slide
// @route   PUT /api/hero-slides/:id
// @access  Private (Admin)
exports.updateHeroSlide = async (req, res) => {
  try {
    let slide = await HeroSlide.findByPk(req.params.id);

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Slide not found'
      });
    }

    slide = await slide.update(req.body);

    res.status(200).json({
      success: true,
      message: 'Slide updated successfully',
      data: slide
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete hero slide
// @route   DELETE /api/hero-slides/:id
// @access  Private (Admin)
exports.deleteHeroSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findByPk(req.params.id);

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Slide not found'
      });
    }

    await slide.destroy();

    res.status(200).json({
      success: true,
      message: 'Slide deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Toggle slide status
// @route   PATCH /api/hero-slides/:id/status
// @access  Private (Admin)
exports.toggleStatus = async (req, res) => {
  try {
    const slide = await HeroSlide.findByPk(req.params.id);

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Slide not found'
      });
    }

    slide.status = slide.status === 'active' ? 'inactive' : 'active';
    await slide.save();

    res.status(200).json({
      success: true,
      message: `Slide ${slide.status === 'active' ? 'activated' : 'deactivated'}`,
      data: slide
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reorder slides
// @route   PUT /api/hero-slides/reorder
// @access  Private (Admin)
exports.reorderSlides = async (req, res) => {
  try {
    const { slides } = req.body; // Array of { id, order }

    for (const slide of slides) {
      await HeroSlide.update(
        { order: slide.order },
        { where: { id: slide.id } }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Slides reordered successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};