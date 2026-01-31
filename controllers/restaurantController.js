const Restaurant = require('../models/Restaurant');
const { Op } = require('sequelize');

// Helper to parse JSON fields
const parseRestaurantJSON = (restaurant) => {
  if (!restaurant) return null;
  return restaurant.toJSON(); // Model getters will handle parsing
};

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
exports.getRestaurants = async (req, res) => {
  try {
    let query = {};

    if (!req.admin) {
      query.status = 'active';
    } else if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.cuisine && req.query.cuisine !== 'all') {
      query.cuisine = { [Op.like]: `%${req.query.cuisine}%` };
    }

    if (req.query.search) {
      query.name = { [Op.like]: `%${req.query.search}%` };
    }

    const restaurants = await Restaurant.findAll({ 
      where: query,
      order: [['createdAt', 'DESC']]
    });

    const parsedRestaurants = restaurants.map(restaurant => parseRestaurantJSON(restaurant));

    res.status(200).json({
      success: true,
      count: parsedRestaurants.length,
      data: parsedRestaurants
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

    const parsed = parseRestaurantJSON(restaurant);

    res.status(200).json({
      success: true,
      data: parsed
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
    const parsed = parseRestaurantJSON(restaurant);

    res.status(201).json({
      success: true,
      message: 'Restaurant created successfully',
      data: parsed
    });
  } catch (error) {
    console.error('Create restaurant error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
      errors: error.errors?.map(e => ({ field: e.path, message: e.message }))
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
    const parsed = parseRestaurantJSON(restaurant);

    res.status(200).json({
      success: true,
      message: 'Restaurant updated successfully',
      data: parsed
    });
  } catch (error) {
    console.error('Update restaurant error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
      errors: error.errors?.map(e => ({ field: e.path, message: e.message }))
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
    const parsed = parseRestaurantJSON(restaurant);

    res.status(200).json({
      success: true,
      message: `Restaurant ${restaurant.status === 'active' ? 'activated' : 'deactivated'}`,
      data: parsed
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};