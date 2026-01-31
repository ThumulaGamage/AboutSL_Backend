const ContactPage = require('../models/ContactPage');

// @desc    Get contact page content
// @route   GET /api/contact-page
// @access  Public
exports.getContactPage = async (req, res) => {
  try {
    // There should only be ONE contact page record
    let contact = await ContactPage.findOne();
    
    if (!contact) {
      // Create default contact page if none exists
      contact = await ContactPage.create({
        headerImage: '',
        email: ['hello@aboutsl.com', 'support@aboutsl.com'],
        phone: ['+94 11 234 5678', '+94 77 123 4567'],
        address: ['42 Galle Road, Colombo 03', 'Sri Lanka'],
        whatsapp: '+94 77 123 4567',
        facebook: '',
        instagram: '',
        twitter: '',
        businessHours: [
          { day: 'Monday - Friday', time: '9:00 AM - 6:00 PM' },
          { day: 'Saturday', time: '10:00 AM - 4:00 PM' },
          { day: 'Sunday', time: 'Closed' }
        ],
        timezone: 'Sri Lanka Standard Time (UTC +5:30)'
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update contact page content
// @route   PUT /api/contact-page
// @access  Private (Admin)
exports.updateContactPage = async (req, res) => {
  try {
    let contact = await ContactPage.findOne();
    
    if (!contact) {
      // Create if doesn't exist
      contact = await ContactPage.create(req.body);
    } else {
      // Update existing
      contact = await contact.update(req.body);
    }

    res.status(200).json({
      success: true,
      message: 'Contact page updated successfully',
      data: contact
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};