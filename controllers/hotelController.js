const Hotel = require('../models/Hotel');
const Destination = require('../models/Destination');
const { Op } = require('sequelize');

// Helper to parse JSON fields
const parseHotelJSON = (hotel) => {
  if (!hotel) return null;
  return hotel.toJSON(); // Model getters will handle parsing
};

// @desc    Get all hotels with nearby destinations populated
// @route   GET /api/hotels
// @access  Public
exports.getHotels = async (req, res) => {
  try {
    let query = {};

    if (!req.admin) {
      query.status = 'active';
    } else if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }

    if (req.query.search) {
      query.name = { [Op.like]: `%${req.query.search}%` };
    }

    const hotels = await Hotel.findAll({ 
      where: query,
      order: [['createdAt', 'DESC']]
    });

    // Parse and populate nearby destinations
    const parsedHotels = await Promise.all(
      hotels.map(async (hotel) => {
        const parsed = parseHotelJSON(hotel);
        
        // Populate nearby destinations with full details
        if (parsed.nearbyDestinations && parsed.nearbyDestinations.length > 0) {
          const destinationIds = parsed.nearbyDestinations.map(nd => nd.destinationId);
          const destinations = await Destination.findAll({
            where: { id: { [Op.in]: destinationIds } },
            attributes: ['id', 'name', 'heroImage', 'category', 'region']
          });

          parsed.nearbyDestinationsDetails = parsed.nearbyDestinations.map(nd => {
            const destination = destinations.find(d => d.id === nd.destinationId);
            return {
              ...nd,
              destination: destination ? destination.toJSON() : null
            };
          });
        }

        return parsed;
      })
    );

    res.status(200).json({
      success: true,
      count: parsedHotels.length,
      data: parsedHotels
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single hotel with nearby destinations
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

    const parsed = parseHotelJSON(hotel);

    // Populate nearby destinations with full details
    if (parsed.nearbyDestinations && parsed.nearbyDestinations.length > 0) {
      const destinationIds = parsed.nearbyDestinations.map(nd => nd.destinationId);
      const destinations = await Destination.findAll({
        where: { id: { [Op.in]: destinationIds } }
      });

      parsed.nearbyDestinationsDetails = parsed.nearbyDestinations.map(nd => {
        const destination = destinations.find(d => d.id === nd.destinationId);
        return {
          ...nd,
          destination: destination ? destination.toJSON() : null
        };
      }).sort((a, b) => a.distance - b.distance); // Sort by distance
    }

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

// @desc    Create new hotel
// @route   POST /api/hotels
// @access  Private (Admin)
exports.createHotel = async (req, res) => {
  try {
    const hotel = await Hotel.create(req.body);
    const parsed = parseHotelJSON(hotel);

    res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      data: parsed
    });
  } catch (error) {
    console.error('Create hotel error:', error);
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
    const parsed = parseHotelJSON(hotel);

    res.status(200).json({
      success: true,
      message: 'Hotel updated successfully',
      data: parsed
    });
  } catch (error) {
    console.error('Update hotel error:', error);
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
    const parsed = parseHotelJSON(hotel);

    res.status(200).json({
      success: true,
      message: `Hotel ${hotel.status === 'active' ? 'activated' : 'deactivated'}`,
      data: parsed
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};