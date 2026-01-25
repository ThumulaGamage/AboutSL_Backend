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
  console.log('🚨 getDestination called! ID:', req.params.id); // ADD THIS LINE
  
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
    console.log('🔍 Looking for places near destination:', parsedDestination.id, parsedDestination.name);

    // Find hotels that have this destination in their nearbyDestinations
    const allHotels = await Hotel.findAll({
      where: {
        status: 'active'
      }
    });

    console.log('🏨 Total active hotels:', allHotels.length);

    const nearbyHotels = allHotels
      .map(hotel => {
        const hotelJSON = hotel.toJSON();
        
        console.log('🔍 Checking hotel:', hotelJSON.name);
        console.log('  nearbyDestinations raw:', hotelJSON.nearbyDestinations);
        console.log('  nearbyDestinations type:', typeof hotelJSON.nearbyDestinations);
        
        // Parse nearbyDestinations if it's a string
        let nearbyDests = hotelJSON.nearbyDestinations;
        if (typeof nearbyDests === 'string') {
          try {
            nearbyDests = JSON.parse(nearbyDests);
            console.log('  Parsed nearbyDestinations:', nearbyDests);
          } catch (e) {
            console.log('  ❌ Failed to parse nearbyDestinations:', e.message);
            nearbyDests = [];
          }
        }

        // Check if this destination is in the hotel's nearbyDestinations
        if (Array.isArray(nearbyDests)) {
          console.log('  Searching for destinationId:', parsedDestination.id);
          const destInfo = nearbyDests.find(nd => {
            console.log('    Comparing:', nd.destinationId, 'with', parsedDestination.id);
            return nd.destinationId === parsedDestination.id;
          });
          
          if (destInfo) {
            console.log('  ✅ MATCH FOUND! Distance:', destInfo.distance, destInfo.unit);
            
            // Parse other JSON fields
            if (hotelJSON.photoGallery && typeof hotelJSON.photoGallery === 'string') {
              try { hotelJSON.photoGallery = JSON.parse(hotelJSON.photoGallery); } catch (e) { hotelJSON.photoGallery = []; }
            }
            if (hotelJSON.amenities && typeof hotelJSON.amenities === 'string') {
              try { hotelJSON.amenities = JSON.parse(hotelJSON.amenities); } catch (e) { hotelJSON.amenities = []; }
            }
            if (hotelJSON.location && typeof hotelJSON.location === 'string') {
              try { hotelJSON.location = JSON.parse(hotelJSON.location); } catch (e) { hotelJSON.location = {}; }
            }
            if (hotelJSON.contact && typeof hotelJSON.contact === 'string') {
              try { hotelJSON.contact = JSON.parse(hotelJSON.contact); } catch (e) { hotelJSON.contact = {}; }
            }

            return {
              ...hotelJSON,
              distanceToDestination: destInfo.distance,
              distanceUnit: destInfo.unit
            };
          } else {
            console.log('  ❌ No match for this destination');
          }
        } else {
          console.log('  ❌ nearbyDestinations is not an array:', nearbyDests);
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => (a.distanceToDestination || 999) - (b.distanceToDestination || 999));

    console.log('✅ Found nearby hotels:', nearbyHotels.length);
    nearbyHotels.forEach(h => console.log('  -', h.name, '(', h.distanceToDestination, h.distanceUnit, ')'));

    // Find restaurants that have this destination in their nearbyDestinations
    const allRestaurants = await Restaurant.findAll({
      where: {
        status: 'active'
      }
    });

    console.log('🍽️ Total active restaurants:', allRestaurants.length);

    const nearbyRestaurants = allRestaurants
      .map(restaurant => {
        const restaurantJSON = restaurant.toJSON();
        
        console.log('🔍 Checking restaurant:', restaurantJSON.name);
        console.log('  nearbyDestinations raw:', restaurantJSON.nearbyDestinations);
        console.log('  nearbyDestinations type:', typeof restaurantJSON.nearbyDestinations);
        
        // Parse nearbyDestinations if it's a string
        let nearbyDests = restaurantJSON.nearbyDestinations;
        if (typeof nearbyDests === 'string') {
          try {
            nearbyDests = JSON.parse(nearbyDests);
            console.log('  Parsed nearbyDestinations:', nearbyDests);
          } catch (e) {
            console.log('  ❌ Failed to parse nearbyDestinations:', e.message);
            nearbyDests = [];
          }
        }

        // Check if this destination is in the restaurant's nearbyDestinations
        if (Array.isArray(nearbyDests)) {
          console.log('  Searching for destinationId:', parsedDestination.id);
          const destInfo = nearbyDests.find(nd => {
            console.log('    Comparing:', nd.destinationId, 'with', parsedDestination.id);
            return nd.destinationId === parsedDestination.id;
          });
          
          if (destInfo) {
            console.log('  ✅ MATCH FOUND! Distance:', destInfo.distance, destInfo.unit);
            
            // Parse other JSON fields
            if (restaurantJSON.photoGallery && typeof restaurantJSON.photoGallery === 'string') {
              try { restaurantJSON.photoGallery = JSON.parse(restaurantJSON.photoGallery); } catch (e) { restaurantJSON.photoGallery = []; }
            }
            if (restaurantJSON.menuHighlights && typeof restaurantJSON.menuHighlights === 'string') {
              try { restaurantJSON.menuHighlights = JSON.parse(restaurantJSON.menuHighlights); } catch (e) { restaurantJSON.menuHighlights = []; }
            }
            if (restaurantJSON.hours && typeof restaurantJSON.hours === 'string') {
              try { restaurantJSON.hours = JSON.parse(restaurantJSON.hours); } catch (e) { restaurantJSON.hours = {}; }
            }
            if (restaurantJSON.location && typeof restaurantJSON.location === 'string') {
              try { restaurantJSON.location = JSON.parse(restaurantJSON.location); } catch (e) { restaurantJSON.location = {}; }
            }
            if (restaurantJSON.contact && typeof restaurantJSON.contact === 'string') {
              try { restaurantJSON.contact = JSON.parse(restaurantJSON.contact); } catch (e) { restaurantJSON.contact = {}; }
            }

            return {
              ...restaurantJSON,
              distanceToDestination: destInfo.distance,
              distanceUnit: destInfo.unit
            };
          } else {
            console.log('  ❌ No match for this destination');
          }
        } else {
          console.log('  ❌ nearbyDestinations is not an array:', nearbyDests);
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => (a.distanceToDestination || 999) - (b.distanceToDestination || 999));

    console.log('✅ Found nearby restaurants:', nearbyRestaurants.length);
    nearbyRestaurants.forEach(r => console.log('  -', r.name, '(', r.distanceToDestination, r.distanceUnit, ')'));

    res.status(200).json({
      success: true,
      data: {
        ...parsedDestination,
        nearbyHotels,
        nearbyRestaurants,
      },
    });
  } catch (error) {
    console.error('❌ Get destination error:', error);
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