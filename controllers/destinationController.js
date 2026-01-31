const Destination = require('../models/Destination');
const Hotel = require('../models/Hotel');
const Restaurant = require('../models/Restaurant');
const { Op } = require('sequelize');

// Helper function to parse JSON fields
const parseDestinationJSON = (destination) => {
  if (!destination) return null;
  
  const parsed = destination.toJSON();
  
  // Parse all JSON fields if they're strings
  const jsonFields = [
    'overview',
    'historyAndLegend',
    'whereIsLocated',
    'howToGo',
    'whatToSee', 
    'bestTimeToVisit',
    'thingsToDo',
    'whereToStay',
    'whereToEat',
    'travelTips',
    'nearbyDestinations',
    'keywords'
  ];
  
  jsonFields.forEach(field => {
    if (parsed[field] && typeof parsed[field] === 'string') {
      try {
        parsed[field] = JSON.parse(parsed[field]);
      } catch (e) {
        console.error(`Error parsing ${field}:`, e);
        parsed[field] = null;
      }
    }
  });
  
  return parsed;
};

// Helper to format destination data before saving
const formatDestinationData = (data) => {
  const formatted = { ...data };
  
  // Ensure JSON fields are objects (Sequelize will stringify them)
  const jsonFields = [
    'overview',
    'historyAndLegend',
    'whereIsLocated',
    'howToGo',
    'whatToSee', 
    'bestTimeToVisit',
    'thingsToDo',
    'whereToStay',
    'whereToEat',
    'travelTips',
    'nearbyDestinations',
    'keywords'
  ];
  
  jsonFields.forEach(field => {
    if (formatted[field]) {
      // If it's a string, try to parse it
      if (typeof formatted[field] === 'string') {
        try {
          formatted[field] = JSON.parse(formatted[field]);
        } catch (e) {
          console.error(`Error parsing ${field}:`, e);
        }
      }
    }
  });
  
  return formatted;
};

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

    // Parse JSON fields for all destinations
    const parsedDestinations = destinations.map(dest => parseDestinationJSON(dest));

    res.status(200).json({
      success: true,
      count: parsedDestinations.length,
      data: parsedDestinations,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single destination with populated relations
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

    // Parse JSON fields
    const parsedDestination = parseDestinationJSON(destination);

    // Populate whereToStay with hotel details
    if (parsedDestination.whereToStay && parsedDestination.whereToStay.hotels && parsedDestination.whereToStay.hotels.length > 0) {
      const hotelIds = parsedDestination.whereToStay.hotels.map(h => h.hotelId);
      const hotels = await Hotel.findAll({
        where: { 
          id: { [Op.in]: hotelIds },
          status: 'active'
        },
        attributes: ['id', 'name', 'slug', 'heroImage', 'category', 'price', 'currency', 'rating', 'reviewCount']
      });

      parsedDestination.whereToStay.hotelsDetails = parsedDestination.whereToStay.hotels
        .map(h => {
          const hotel = hotels.find(hotel => hotel.id === h.hotelId);
          if (!hotel) return null;
          return {
            ...hotel.toJSON(),
            distance: h.distance,
            unit: h.unit
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.distance - b.distance);
    }

    // Populate whereToEat with restaurant details
    if (parsedDestination.whereToEat && parsedDestination.whereToEat.restaurants && parsedDestination.whereToEat.restaurants.length > 0) {
      const restaurantIds = parsedDestination.whereToEat.restaurants.map(r => r.restaurantId);
      const restaurants = await Restaurant.findAll({
        where: { 
          id: { [Op.in]: restaurantIds },
          status: 'active'
        },
        attributes: ['id', 'name', 'slug', 'heroImage', 'cuisine', 'priceRange', 'rating', 'reviewCount']
      });

      parsedDestination.whereToEat.restaurantsDetails = parsedDestination.whereToEat.restaurants
        .map(r => {
          const restaurant = restaurants.find(rest => rest.id === r.restaurantId);
          if (!restaurant) return null;
          return {
            ...restaurant.toJSON(),
            distance: r.distance,
            unit: r.unit
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.distance - b.distance);
    }

    // Populate nearbyDestinations with destination details
    if (parsedDestination.nearbyDestinations && parsedDestination.nearbyDestinations.destinations && parsedDestination.nearbyDestinations.destinations.length > 0) {
      const destinationIds = parsedDestination.nearbyDestinations.destinations.map(d => d.destinationId);
      const nearbyDests = await Destination.findAll({
        where: { 
          id: { [Op.in]: destinationIds },
          status: 'active'
        },
        attributes: ['id', 'name', 'slug', 'heroImage', 'category', 'region']
      });

      parsedDestination.nearbyDestinations.destinationsDetails = parsedDestination.nearbyDestinations.destinations
        .map(d => {
          const dest = nearbyDests.find(destination => destination.id === d.destinationId);
          if (!dest) return null;
          return {
            ...dest.toJSON(),
            distance: d.distance,
            unit: d.unit
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.distance - b.distance);
    }

    res.status(200).json({
      success: true,
      data: parsedDestination,
    });
  } catch (error) {
    console.error('Get destination error:', error);
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
    const formattedData = formatDestinationData(req.body);
    const destination = await Destination.create(formattedData);

    const parsedDestination = parseDestinationJSON(destination);

    res.status(201).json({
      success: true,
      message: 'Destination created successfully',
      data: parsedDestination,
    });
  } catch (error) {
    console.error('Create destination error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
      errors: error.errors?.map(e => ({ field: e.path, message: e.message }))
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

    const formattedData = formatDestinationData(req.body);
    destination = await destination.update(formattedData);

    const parsedDestination = parseDestinationJSON(destination);

    res.status(200).json({
      success: true,
      message: 'Destination updated successfully',
      data: parsedDestination,
    });
  } catch (error) {
    console.error('Update destination error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
      errors: error.errors?.map(e => ({ field: e.path, message: e.message }))
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

    // Parse and return the updated destination
    const parsedDestination = parseDestinationJSON(destination);

    res.status(200).json({
      success: true,
      message: `Destination ${destination.status === 'active' ? 'activated' : 'deactivated'}`,
      data: parsedDestination,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};