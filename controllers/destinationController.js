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
    'whatToSee', 
    'bestTimeToVisit',
    'thingsToDo',
    'travelTips',
    'historyAndLegend',
    'location',
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

    // Parse JSON fields
    const parsedDestination = parseDestinationJSON(destination);

    // Auto-fetch nearby hotels and restaurants based on location
    let nearbyHotels = [];
    let nearbyRestaurants = [];

    if (parsedDestination.location && parsedDestination.location.region) {
      // Find hotels in same region
      nearbyHotels = await Hotel.findAll({
        where: {
          status: 'active',
          location: {
            [Op.like]: `%${parsedDestination.location.region}%`,
          },
        },
        limit: 6,
      });

      // Parse hotel JSON fields
      nearbyHotels = nearbyHotels.map(hotel => {
        const h = hotel.toJSON();
        // Parse amenities if string
        if (h.amenities && typeof h.amenities === 'string') {
          try {
            h.amenities = JSON.parse(h.amenities);
          } catch (e) {
            h.amenities = [];
          }
        }
        // Parse photoGallery if string
        if (h.photoGallery && typeof h.photoGallery === 'string') {
          try {
            h.photoGallery = JSON.parse(h.photoGallery);
          } catch (e) {
            h.photoGallery = [];
          }
        }
        // Parse location if string
        if (h.location && typeof h.location === 'string') {
          try {
            h.location = JSON.parse(h.location);
          } catch (e) {
            h.location = { region: h.location };
          }
        }
        // Parse contact if string
        if (h.contact && typeof h.contact === 'string') {
          try {
            h.contact = JSON.parse(h.contact);
          } catch (e) {
            h.contact = {};
          }
        }
        return h;
      });

      // Find restaurants in same region
      nearbyRestaurants = await Restaurant.findAll({
        where: {
          status: 'active',
          location: {
            [Op.like]: `%${parsedDestination.location.region}%`,
          },
        },
        limit: 6,
      });

      // Parse restaurant JSON fields
      nearbyRestaurants = nearbyRestaurants.map(restaurant => {
        const r = restaurant.toJSON();
        // Parse menuHighlights if string
        if (r.menuHighlights && typeof r.menuHighlights === 'string') {
          try {
            r.menuHighlights = JSON.parse(r.menuHighlights);
          } catch (e) {
            r.menuHighlights = [];
          }
        }
        // Parse hours if string
        if (r.hours && typeof r.hours === 'string') {
          try {
            r.hours = JSON.parse(r.hours);
          } catch (e) {
            r.hours = {};
          }
        }
        // Parse photoGallery if string
        if (r.photoGallery && typeof r.photoGallery === 'string') {
          try {
            r.photoGallery = JSON.parse(r.photoGallery);
          } catch (e) {
            r.photoGallery = [];
          }
        }
        // Parse location if string
        if (r.location && typeof r.location === 'string') {
          try {
            r.location = JSON.parse(r.location);
          } catch (e) {
            r.location = { region: r.location };
          }
        }
        // Parse contact if string
        if (r.contact && typeof r.contact === 'string') {
          try {
            r.contact = JSON.parse(r.contact);
          } catch (e) {
            r.contact = {};
          }
        }
        return r;
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...parsedDestination,
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
const formatDestinationData = (data) => {
  const formatted = { ...data };
  
  // Ensure JSON fields are objects (Sequelize will stringify them)
  const jsonFields = [
    'overview',
    'whatToSee', 
    'bestTimeToVisit',
    'thingsToDo',
    'travelTips',
    'historyAndLegend',
    'location',
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
      // If it's an object, ensure it's properly structured
      if (typeof formatted[field] === 'object') {
        // Sequelize will handle the stringification
      }
    }
  });
  
  return formatted;
};

// Update the createDestination function
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

// Update the updateDestination function
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