const AboutPage = require('../models/AboutPage');

// @desc    Get about page content
// @route   GET /api/about-page
// @access  Public
exports.getAboutPage = async (req, res) => {
  try {
    // There should only be ONE about page record
    let about = await AboutPage.findOne();
    
    if (!about) {
      // Create default about page if none exists
      about = await AboutPage.create({
        headerImage: '',
        stats: [
          { icon: '🏖️', value: '1,340km', label: 'Coastline' },
          { icon: '🌴', value: '26', label: 'National Parks' },
          { icon: '🏛️', value: '8', label: 'UNESCO Sites' },
          { icon: '📸', value: '500+', label: 'Photo Spots' }
        ],
        storyTitle: 'Our Story',
        storyParagraph1: 'AboutSL was born from a simple passion: to share the incredible beauty, rich culture, and warm hospitality of Sri Lanka with travelers from around the world. What started as a personal travel blog has grown into a comprehensive tourism platform trusted by thousands of visitors every year.',
        storyParagraph2: 'Sri Lanka, often called the "Pearl of the Indian Ocean," packs an incredible diversity of experiences into a compact island. From the ancient rock fortress of Sigiriya to the misty tea plantations of Nuwara Eliya, from thrilling wildlife safaris in Yala to the colonial charm of Galle Fort – there\'s something magical waiting around every corner.',
        storyParagraph3: 'Our mission is to make it easy for travelers to discover these hidden treasures. We carefully curate every destination, hotel, and restaurant on our platform, ensuring you get authentic, high-quality experiences that showcase the best of Sri Lanka.',
        values: [
          { icon: 'Heart', title: 'Passion', description: 'We love Sri Lanka and want to share its beauty with the world' },
          { icon: 'Shield', title: 'Trust', description: 'All recommendations are verified and quality-assured' },
          { icon: 'Globe', title: 'Sustainability', description: 'Promoting responsible and eco-friendly tourism' },
          { icon: 'Sparkles', title: 'Excellence', description: 'Curating only the best experiences for travelers' }
        ],
        teamMembers: [
          { name: 'ABC', role: 'Founder & CEO', image: '', imagePublicId: '', bio: 'Travel enthusiast with 15+ years exploring Sri Lanka' },
          { name: 'B', role: 'Content Director', image: '', imagePublicId: '', bio: '' },
          { name: 'C', role: 'Head of Partnerships', image: '', imagePublicId: '', bio: '' }
        ]
      });
    }

    res.status(200).json({
      success: true,
      data: about
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update about page content
// @route   PUT /api/about-page
// @access  Private (Admin)
exports.updateAboutPage = async (req, res) => {
  try {
    let about = await AboutPage.findOne();
    
    if (!about) {
      // Create if doesn't exist
      about = await AboutPage.create(req.body);
    } else {
      // Update existing
      about = await about.update(req.body);
    }

    res.status(200).json({
      success: true,
      message: 'About page updated successfully',
      data: about
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};