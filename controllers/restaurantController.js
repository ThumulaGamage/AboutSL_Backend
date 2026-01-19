const Restaurant = require('../models/Restaurant');
const { Op } = require('sequelize');

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
exports.getRestaurants = async (req, res) => {
  try {
    let query = {};

    // Filter by status
    if (!req.admin) {
      query.status = 'active';
    } else if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by cuisine
    if (req.query.cuisine && req.query.cuisine !== 'all') {
      query.cuisine = { [Op.like]: `%${req.query.cuisine}%` };
    }

    // Search by name
    if (req.query.search) {
      query.name = { [Op.like]: `%${req.query.search}%` };
    }

    const restaurants = await Restaurant.findAll({ 
      where: query,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single restaurant
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    if (restaurant.status !== 'active' && !req.admin) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new restaurant
// @route   POST /api/restaurants
// @access  Private (Admin)
exports.createRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Restaurant created successfully',
      data: restaurant
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private (Admin)
exports.updateRestaurant = async (req, res) => {
  try {
    let restaurant = await Restaurant.findByPk(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    restaurant = await restaurant.update(req.body);

    res.status(200).json({
      success: true,
      message: 'Restaurant updated successfully',
      data: restaurant
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private (Admin)
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    await restaurant.destroy();

    res.status(200).json({
      success: true,
      message: 'Restaurant deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Toggle restaurant status
// @route   PATCH /api/restaurants/:id/status
// @access  Private (Admin)
exports.toggleStatus = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    restaurant.status = restaurant.status === 'active' ? 'inactive' : 'active';
    
    if (restaurant.status === 'active' && !restaurant.publishedDate) {
      restaurant.publishedDate = new Date();
    }

    await restaurant.save();

    res.status(200).json({
      success: true,
      message: `Restaurant ${restaurant.status === 'active' ? 'activated' : 'deactivated'}`,
      data: restaurant
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};