const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Destination = sequelize.define(
  'Destination',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Basic Info
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
    },
    region: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM('beach', 'nature', 'cultural', 'wildlife'),
      allowNull: false,
    },

    // Hero Image (Main Image)
    heroImage: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    heroImagePublicId: {
      type: DataTypes.STRING,
    },

    // SECTION 1: Overview
    overview: {
      type: DataTypes.JSON,
      defaultValue: {
        description: '',
        images: [], // Array of image URLs
      },
    },

    // SECTION 2: What to See
    whatToSee: {
      type: DataTypes.JSON,
      defaultValue: {
        description: '',
        highlights: [], // Array of {title, description, image}
        images: [],
      },
    },

    // SECTION 3: Best Time to Visit
    bestTimeToVisit: {
      type: DataTypes.JSON,
      defaultValue: {
        description: '',
        season: '',
        months: '',
        weatherInfo: '',
        images: [],
      },
    },

    // SECTION 4: Things to Do
    thingsToDo: {
      type: DataTypes.JSON,
      defaultValue: {
        description: '',
        activities: [], // Array of {title, description, image}
        images: [],
      },
    },

    // SECTION 5: Travel Tips
    travelTips: {
      type: DataTypes.JSON,
      defaultValue: {
        description: '',
        tips: [], // Array of tip strings
        images: [],
      },
    },

    // SECTION 6: History & Legend
    historyAndLegend: {
      type: DataTypes.JSON,
      defaultValue: {
        description: '',
        historicalFacts: '',
        legends: '',
        images: [],
      },
    },

    // Location for auto-linking hotels/restaurants
    location: {
      type: DataTypes.JSON,
      defaultValue: {
        coordinates: {
          lat: null,
          lng: null,
        },
        nearbyCity: '',
        region: '',
      },
    },

    // SEO
    metaDescription: {
      type: DataTypes.TEXT,
    },
    keywords: {
      type: DataTypes.JSON,
    },

    // Status
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'draft'),
      defaultValue: 'draft',
    },
    publishedDate: {
      type: DataTypes.DATE,
    },

    completeness: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    tableName: 'destinations',
    hooks: {
      beforeSave: (destination) => {
        // Auto-generate slug from name
        if (destination.changed('name')) {
          destination.slug = destination.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
        }
      },
    },
  }
);

module.exports = Destination;
