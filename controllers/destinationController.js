const Destination = require('../models/Destination');
const Hotel = require('../models/Hotel');
const Restaurant = require('../models/Restaurant');
const { Op } = require('sequelize');

// @desc    Get all destinations
// @route   GET /api/destinations
// @access  Public
exports.getDestinations = async (req, res) => {
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

    // Search by name or region
    if (req.query.search) {
      query[Op.or] = [
        { name: { [Op.like]: `%${req.query.search}%` } },
        { region: { [Op.like]: `%${req.query.search}%` } },
      ];
    }

    const destinations = await Destination.findAll({
      where: query,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: destinations.length,
      data: destinations,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single destination with nearby hotels/restaurants
// @route   GET /api/destinations/:id
// @access  Public
exports.getDestination = async (req, res) => {
  try {
    const destination = await Destination.findByPk(req.params.id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found',
      });
    }

    // Only allow viewing inactive destinations if admin
    if (destination.status !== 'active' && !req.admin) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found',
      });
    }

    // Auto-fetch nearby hotels and restaurants based on location
    let nearbyHotels = [];
    let nearbyRestaurants = [];

    if (destination.location && destination.location.region) {
      // Find hotels in same region
      nearbyHotels = await Hotel.findAll({
        where: {
          status: 'active',
          location: {
            [Op.like]: `%${destination.location.region}%`,
          },
        },
        limit: 6,
      });

      // Find restaurants in same region
      nearbyRestaurants = await Restaurant.findAll({
        where: {
          status: 'active',
          location: {
            [Op.like]: `%${destination.location.region}%`,
          },
        },
        limit: 6,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...destination.toJSON(),
        nearbyHotels,
        nearbyRestaurants,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new destination
// @route   POST /api/destinations
// @access  Private (Admin)
exports.createDestination = async (req, res) => {
  try {
    const destination = await Destination.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Destination created successfully',
      data: destination,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update destination
// @route   PUT /api/destinations/:id
// @access  Private (Admin)
exports.updateDestination = async (req, res) => {
  try {
    let destination = await Destination.findByPk(req.params.id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found',
      });
    }

    destination = await destination.update(req.body);

    res.status(200).json({
      success: true,
      message: 'Destination updated successfully',
      data: destination,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete destination
// @route   DELETE /api/destinations/:id
// @access  Private (Admin)
exports.deleteDestination = async (req, res) => {
  try {
    const destination = await Destination.findByPk(req.params.id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found',
      });
    }

    await destination.destroy();

    res.status(200).json({
      success: true,
      message: 'Destination deleted successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Toggle destination status
// @route   PATCH /api/destinations/:id/status
// @access  Private (Admin)
exports.toggleStatus = async (req, res) => {
  try {
    const destination = await Destination.findByPk(req.params.id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found',
      });
    }

    destination.status =
      destination.status === 'active' ? 'inactive' : 'active';

    if (destination.status === 'active' && !destination.publishedDate) {
      destination.publishedDate = new Date();
    }

    await destination.save();

    res.status(200).json({
      success: true,
      message: `Destination ${destination.status === 'active' ? 'activated' : 'deactivated'}`,
      data: destination,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
