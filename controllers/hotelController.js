const Hotel = require('../models/Hotel');
const { Op } = require('sequelize');

// @desc    Get all hotels
// @route   GET /api/hotels
// @access  Public
exports.getHotels = async (req, res) => {
  try {
    let query = {};

    // Filter by status
    if (!req.admin) {
      query.status = 'active';
    } else if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by category
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }

    // Search by name
    if (req.query.search) {
      query.name = { [Op.like]: `%${req.query.search}%` };
    }

    const hotels = await Hotel.findAll({ 
      where: query,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: hotels.length,
      data: hotels
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single hotel
// @route   GET /api/hotels/:id
// @access  Public
exports.getHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByPk(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    if (hotel.status !== 'active' && !req.admin) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    res.status(200).json({
      success: true,
      data: hotel
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new hotel
// @route   POST /api/hotels
// @access  Private (Admin)
exports.createHotel = async (req, res) => {
  try {
    const hotel = await Hotel.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      data: hotel
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update hotel
// @route   PUT /api/hotels/:id
// @access  Private (Admin)
exports.updateHotel = async (req, res) => {
  try {
    let hotel = await Hotel.findByPk(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    hotel = await hotel.update(req.body);

    res.status(200).json({
      success: true,
      message: 'Hotel updated successfully',
      data: hotel
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete hotel
// @route   DELETE /api/hotels/:id
// @access  Private (Admin)
exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByPk(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    await hotel.destroy();

    res.status(200).json({
      success: true,
      message: 'Hotel deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Toggle hotel status
// @route   PATCH /api/hotels/:id/status
// @access  Private (Admin)
exports.toggleStatus = async (req, res) => {
  try {
    const hotel = await Hotel.findByPk(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    hotel.status = hotel.status === 'active' ? 'inactive' : 'active';
    
    if (hotel.status === 'active' && !hotel.publishedDate) {
      hotel.publishedDate = new Date();
    }

    await hotel.save();

    res.status(200).json({
      success: true,
      message: `Hotel ${hotel.status === 'active' ? 'activated' : 'deactivated'}`,
      data: hotel
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};